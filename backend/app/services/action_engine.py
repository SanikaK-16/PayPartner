from decimal import Decimal

from sqlalchemy.orm import Session

from app.models import Action, Opportunity
from app.services.paytm_mock import recover_failed_payments

from app.services.audit_service import create_audit_log
from app.services.notification_service import create_notification

def create_action(
    db: Session,
    merchant_id: int,
    opportunity_id: int,
    action_type: str,
    description: str,
    requested_value: Decimal | None,
    policy_status: str,
    target_transaction_ids: list[int] | None = None,
):
    opportunity = (
        db.query(Opportunity)
        .filter(
            Opportunity.id == opportunity_id,
            Opportunity.merchant_id == merchant_id,
        )
        .first()
    )

    if opportunity is None:
        raise ValueError(
            "Opportunity not found for this merchant."
        )

    action = Action(
        merchant_id=merchant_id,
        opportunity_id=opportunity_id,
        action_type=action_type,
        description=description,
        requested_value=requested_value,
        policy_status=policy_status,
        execution_status="pending",
        target_transaction_ids=target_transaction_ids,
    )

    db.add(action)
    db.commit()
    db.refresh(action)

    create_audit_log(
        db=db,
        merchant_id=merchant_id,
        action_id=action.id,
        event_type="action_created",
        message=(
            f"Action created: {action_type}. "
            f"Policy status: {policy_status}."
        ),
    )

    return action


def execute_failed_payment_recovery(
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

    if action.policy_status != "allowed":
        raise ValueError(
            "Action cannot execute because policy did not allow it."
        )

    if action.execution_status == "completed":
        return action

    result = recover_failed_payments(
        merchant_id=action.merchant_id,
        amount=action.requested_value or Decimal("0.00"),
    )

    if result["status"] == "executed":
        action.execution_status = "completed"
    else:
        action.execution_status = "failed"

    db.commit()
    db.refresh(action)

    create_audit_log(
        db=db,
        merchant_id=action.merchant_id,
        action_id=action.id,
        event_type="action_executed",
        message=(
            f"Action executed: {action.action_type}. "
            f"Execution status: {action.execution_status}."
        ),
    )

    if action.execution_status == "completed":
        notification_title = "Action Executed"
        notification_message = (
            f"{action.description} "
            f"Requested value: ₹{action.requested_value or Decimal('0.00'):.2f}."
        )
    else:
        notification_title = "Action Failed"
        notification_message = (
            f"{action.description} "
            "The action could not be completed."
        )

    create_notification(
        db=db,
        merchant_id=action.merchant_id,
        notification_type="action",
        title=notification_title,
        message=notification_message,
    )

    return action
