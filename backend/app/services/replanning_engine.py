from decimal import Decimal

from sqlalchemy.orm import Session

from app.models import Action, Policy, Transaction, Verification
from app.services.action_engine import create_action
from app.services.policy_engine import check_automatic_recovery
from app.services.audit_service import create_audit_log
from app.services.notification_service import create_notification

def replan_failed_payment_recovery(
    db: Session,
    action_id: int,
):
    action = (
        db.query(Action)
        .filter(Action.id == action_id)
        .first()
    )

    if action is None:
        raise ValueError("Action not found.")

    verification = (
        db.query(Verification)
        .filter(Verification.action_id == action_id)
        .order_by(Verification.id.desc())
        .first()
    )

    if verification is None:
        raise ValueError("No verification result found for this action.")

    recovery_attempts = (
        db.query(Action)
        .filter(
            Action.merchant_id == action.merchant_id,
            Action.opportunity_id == action.opportunity_id,
            Action.action_type.in_(
                [
                    "failed_payment_recovery",
                    "failed_payment_recovery_replan",
                ]
            ),
        )
        .count()
    )

    max_automatic_attempts = 2

    policy = (
        db.query(Policy)
        .filter(Policy.merchant_id == action.merchant_id)
        .first()
    )

    if policy is None:
        return {
            "replan_required": False,
            "reason": "No merchant policy found.",
        }

    # Full impact means there is nothing left to replan.
    if verification.outcome_status == "full_impact":
        return {
            "replan_required": False,
            "reason": "Target impact was fully verified.",
        }

    # No impact means the system should stop instead of endlessly retrying.
    if verification.outcome_status == "no_impact":
        return {
            "replan_required": False,
            "stop_reason": (
                "No additional impact was verified. "
                "Automatic recovery has been stopped."
            ),
            "remaining_value": verification.value_attempted,
        }

    # Partial impact means some targeted transactions remain unresolved.
    if verification.outcome_status == "partial_impact":

        previous_target_ids = action.target_transaction_ids or []

        unresolved_transactions = (
            db.query(Transaction)
            .filter(
                Transaction.merchant_id == action.merchant_id,
                Transaction.id.in_(previous_target_ids),
                Transaction.status == "failed",
            )
            .all()
        )

        unresolved_target_ids = [
            transaction.id
            for transaction in unresolved_transactions
        ]

        unresolved_value = sum(
            (
                transaction.amount
                for transaction in unresolved_transactions
            ),
            Decimal("0.00"),
        )

        if not unresolved_target_ids or unresolved_value <= Decimal("0.00"):
            return {
                "replan_required": False,
                "reason": "No unresolved failed transactions remain.",
                "remaining_value": Decimal("0.00"),
            }

        if recovery_attempts >= max_automatic_attempts:
            return {
                "replan_required": False,
                "stop_reason": (
                    "Maximum automatic recovery attempts reached. "
                    "Further action requires merchant approval."
                ),
                "remaining_value": unresolved_value,
            }

        policy_result = check_automatic_recovery(
            db,
            action.merchant_id,
        )

        if not policy_result["allowed"]:
            return {
                "replan_required": False,
                "approval_required": True,
                "stop_reason": (
                    "Merchant policy does not allow automatic recovery. "
                    "Merchant approval is required."
                ),
                "policy_reason": policy_result["reason"],
                "remaining_value": unresolved_value,
            }

        replanned_action = create_action(
            db=db,
            merchant_id=action.merchant_id,
            opportunity_id=action.opportunity_id,
            action_type="failed_payment_recovery_replan",
            description=(
                "Replanned recovery action for unresolved "
                "failed payments."
            ),
            requested_value=unresolved_value,
            policy_status="allowed",
            target_transaction_ids=unresolved_target_ids,
        )


        create_audit_log(
            db=db,
            merchant_id=action.merchant_id,
            action_id=replanned_action.id,
            event_type="replan_created",
            message=(
                f"Replanned recovery action created for "
                f"₹{unresolved_value:.2f} remaining unresolved value."
            ),
        )

        create_notification(
            db=db,
            merchant_id=action.merchant_id,
            notification_type="action",
            title="PayPartner Replanned Recovery",
            message=(
                f"₹{unresolved_value:.2f} remains unresolved. "
                "Merchant policy allows another automatic recovery attempt."
            ),
        )

        return {
            "replan_required": True,
            "approval_required": False,
            "replanned_action_id": replanned_action.id,
            "reason": (
                "Partial impact was verified. Merchant policy "
                "allows another automatic recovery attempt for "
                "the remaining unresolved value."
            ),
            "policy_reason": policy_result["reason"],
            "remaining_value": unresolved_value,
            "target_transaction_ids": unresolved_target_ids,
        }

    return {
        "replan_required": False,
        "reason": "No replanning rule applies.",
    }
