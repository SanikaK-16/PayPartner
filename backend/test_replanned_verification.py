from datetime import datetime
from decimal import Decimal

from app.database import SessionLocal
from app.models import (
    Action,
    AuditLog,
    Notification,
    Opportunity,
    Transaction,
    Verification,
)
from app.services.action_engine import (
    create_action,
    execute_failed_payment_recovery,
)
from app.services.verification_engine import verify_failed_payment_recovery


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
        source_key="test_replanned_verification",
        title="Temporary Replanned Verification Test",
        description="Temporary opportunity used only for verification testing.",
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
        description="Temporary replanned recovery verification test.",
        requested_value=Decimal("250.00"),
        policy_status="allowed",
        target_transaction_ids=[transaction.id],
    )

    # ---------------------------------------------------------
    # EXECUTE
    # ---------------------------------------------------------

    action = execute_failed_payment_recovery(
        db=db,
        action_id=action.id,
    )

    if action.execution_status != "completed":
        raise AssertionError(
            "Expected replanned action execution to complete."
        )

    # ---------------------------------------------------------
    # VERIFY
    # ---------------------------------------------------------

    result = verify_failed_payment_recovery(
        db=db,
        action_id=action.id,
    )

    print("Replanned action verification:")
    print("Verification ID:", result["verification_id"])
    print("Action ID:", result["action_id"])
    print("Outcome:", result["outcome_status"])
    print("Value attempted:", result["value_attempted"])
    print("Value verified:", result["value_verified"])
    print(
        "Failed value remaining:",
        result["failed_value_remaining"],
    )

    if result["action_id"] != action.id:
        raise AssertionError(
            "Verification returned the wrong action ID."
        )

    if result["outcome_status"] != "no_impact":
        raise AssertionError(
            "Expected no_impact because the temporary transaction "
            "remains failed."
        )

    if result["value_verified"] != Decimal("0.00"):
        raise AssertionError(
            "Expected verified value to be 0.00."
        )

    # ---------------------------------------------------------
    # CLEANUP
    # ---------------------------------------------------------

    action_id = action.id
    verification_id = result["verification_id"]
    opportunity_id = opportunity.id
    transaction_id = transaction.id

    # Delete verification first.
    db.query(Verification).filter(
        Verification.id == verification_id
    ).delete(synchronize_session=False)

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

    print("\nReplanned verification test: PASSED")
    print("Cleanup: PASSED")

finally:
    db.close()
