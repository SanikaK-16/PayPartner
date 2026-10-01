from decimal import Decimal

from sqlalchemy.orm import Session

from app.models import Action, Transaction, Verification

from app.services.audit_service import create_audit_log
from app.services.notification_service import create_notification

def verify_failed_payment_recovery(
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

    if action.execution_status != "completed":
        raise ValueError(
            "Action must be completed before verification."
        )

    target_transaction_ids = action.target_transaction_ids or []

    if not target_transaction_ids:
        raise ValueError(
            "Action has no targeted transaction IDs for verification."
        )

    targeted_transactions = (
        db.query(Transaction)
        .filter(
            Transaction.merchant_id == action.merchant_id,
            Transaction.id.in_(target_transaction_ids),
        )
        .all()
    )

    if len(targeted_transactions) != len(target_transaction_ids):
        raise ValueError(
            "One or more targeted transactions were not found for this merchant."
        )

    attempted_value = action.requested_value or Decimal("0.00")

    targeted_value = sum(
        (
            transaction.amount
            for transaction in targeted_transactions
        ),
        Decimal("0.00"),
    )

    unresolved_value = sum(
        (
            transaction.amount
            for transaction in targeted_transactions
            if transaction.status == "failed"
        ),
        Decimal("0.00"),
    )

    verified_value = targeted_value - unresolved_value

    if verified_value < Decimal("0.00"):
        verified_value = Decimal("0.00")

    if verified_value > attempted_value:
        verified_value = attempted_value

    if verified_value == Decimal("0.00"):
        outcome_status = "no_impact"
    elif verified_value < attempted_value:
        outcome_status = "partial_impact"
    else:
        outcome_status = "full_impact"

    verification = Verification(
        merchant_id=action.merchant_id,
        action_id=action.id,
        outcome_status=outcome_status,
        value_attempted=attempted_value,
        value_verified=verified_value,
        evidence=(
            "Verified against the exact transaction IDs targeted by this action. "
            f"₹{verified_value:.2f} recovered; "
            f"₹{unresolved_value:.2f} remains unresolved."
        ),
    )

    db.add(verification)
    db.commit()
    db.refresh(verification)

    create_audit_log(
        db=db,
        merchant_id=action.merchant_id,
        action_id=action.id,
        event_type="impact_verified",
        message=(
            f"Impact verification completed. "
            f"Outcome: {outcome_status}. "
            f"Attempted: ₹{attempted_value:.2f}. "
            f"Verified: ₹{verified_value:.2f}. "
            f"Remaining: ₹{unresolved_value:.2f}."
        ),
    )

    if outcome_status == "full_impact":
        notification_title = "Impact Verified"
        notification_message = (
            f"₹{verified_value:.2f} verified from the "
            f"₹{attempted_value:.2f} action."
        )

    elif outcome_status == "partial_impact":
        notification_title = "Partial Impact Verified"
        notification_message = (
            f"₹{verified_value:.2f} verified from the "
            f"₹{attempted_value:.2f} attempted. "
            f"₹{unresolved_value:.2f} remains unresolved."
        )

    else:
        notification_title = "No Impact Verified"
        notification_message = (
            f"The ₹{attempted_value:.2f} action produced "
            "no verified impact. PayPartner can consider replanning."
        )

    create_notification(
        db=db,
        merchant_id=action.merchant_id,
        notification_type="verification",
        title=notification_title,
        message=notification_message,
    )

    return {
        "verification_id": verification.id,
        "action_id": action.id,
        "outcome_status": outcome_status,
        "value_attempted": attempted_value,
        "value_verified": verified_value,
        "failed_value_remaining": unresolved_value,
        "target_transaction_ids": target_transaction_ids,
    }
