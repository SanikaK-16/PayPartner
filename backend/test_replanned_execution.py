from datetime import datetime
from decimal import Decimal

from app.database import SessionLocal
from app.models import Action, AuditLog, Notification, Opportunity, Transaction
from app.services.action_engine import (
    create_action,
    execute_failed_payment_recovery,
)


db = SessionLocal()

try:
    # Preserve existing notifications.
    existing_notification_ids = {
        notification.id
        for notification in db.query(Notification)
        .filter(Notification.merchant_id == 1)
        .all()
    }

    # ---------------------------------------------------------
    # TEMPORARY OPPORTUNITY
    # ---------------------------------------------------------

    opportunity = Opportunity(
        merchant_id=1,
        opportunity_type="failed_payment_recovery",
        source_key="test_replanned_execution",
        title="Temporary Replanned Execution Test",
        description="Temporary opportunity used only for execution testing.",
        potential_value=Decimal("250.00"),
        priority="high",
        status="open",
    )

    db.add(opportunity)
    db.commit()
    db.refresh(opportunity)

    # ---------------------------------------------------------
    # TEMPORARY FAILED TRANSACTION
    # ---------------------------------------------------------

    transaction = Transaction(
        merchant_id=1,
        customer_id=None,
        product_id=None,
        amount=Decimal("250.00"),
        status="failed",
        payment_method="UPI",
        created_at=datetime.utcnow(),
    )

    db.add(transaction)
    db.commit()
    db.refresh(transaction)

    # ---------------------------------------------------------
    # CREATE REPLANNED ACTION
    # ---------------------------------------------------------

    action = create_action(
        db=db,
        merchant_id=1,
        opportunity_id=opportunity.id,
        action_type="failed_payment_recovery_replan",
        description="Temporary replanned recovery execution test.",
        requested_value=Decimal("250.00"),
        policy_status="allowed",
        target_transaction_ids=[transaction.id],
    )

    print("Created replanned action:")
    print("Action ID:", action.id)
    print("Initial status:", action.execution_status)

    # ---------------------------------------------------------
    # EXECUTE
    # ---------------------------------------------------------

    result = execute_failed_payment_recovery(
        db=db,
        action_id=action.id,
    )

    print("\nReplanned action execution:")
    print("Action ID:", result.id)
    print("Status:", result.execution_status)
    print("Amount attempted:", result.requested_value)

    if result.execution_status != "completed":
        raise AssertionError(
            "Expected replanned action execution to complete."
        )

    # ---------------------------------------------------------
    # CLEANUP
    # ---------------------------------------------------------

    action_id = action.id
    opportunity_id = opportunity.id
    transaction_id = transaction.id

    # Delete audit logs belonging to this action.
    db.query(AuditLog).filter(
        AuditLog.action_id == action_id
    ).delete(synchronize_session=False)

    # Delete notifications created by this test only.
    db.query(Notification).filter(
        Notification.merchant_id == 1,
        ~Notification.id.in_(existing_notification_ids),
    ).delete(synchronize_session=False)

    db.flush()

    # Delete action.
    db.query(Action).filter(
        Action.id == action_id
    ).delete(synchronize_session=False)

    db.flush()

    # Delete temporary transaction.
    db.query(Transaction).filter(
        Transaction.id == transaction_id
    ).delete(synchronize_session=False)

    db.flush()

    # Delete temporary opportunity.
    db.query(Opportunity).filter(
        Opportunity.id == opportunity_id
    ).delete(synchronize_session=False)

    db.commit()

    print("\nReplanned execution test: PASSED")
    print("Cleanup: PASSED")

finally:
    db.close()
