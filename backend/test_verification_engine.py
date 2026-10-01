from datetime import datetime
from decimal import Decimal

from app.database import SessionLocal
from app.models import Action, AuditLog, Notification, Transaction, Verification
from app.services.action_engine import create_action, execute_failed_payment_recovery
from app.services.verification_engine import verify_failed_payment_recovery


db = SessionLocal()

try:
    # Record existing notification IDs so we only remove notifications
    # created by this test.
    existing_notification_ids = {
        notification.id
        for notification in db.query(Notification)
        .filter(Notification.merchant_id == 1)
        .all()
    }

    # Create an isolated temporary failed transaction.
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

    # Create an isolated action targeting only this transaction.
    action = create_action(
        db=db,
        merchant_id=1,
        opportunity_id=1,
        action_type="failed_payment_recovery",
        description="Temporary verification test action.",
        requested_value=Decimal("250.00"),
        policy_status="allowed",
        target_transaction_ids=[transaction.id],
    )

    # Execute the action.
    action = execute_failed_payment_recovery(
        db=db,
        action_id=action.id,
    )

    # Verify the action.
    result = verify_failed_payment_recovery(
        db=db,
        action_id=action.id,
    )

    print("Verification result:")
    print("Action:", result["action_id"])
    print("Outcome:", result["outcome_status"])
    print("Value attempted:", result["value_attempted"])
    print("Value verified:", result["value_verified"])
    print("Failed value remaining:", result["failed_value_remaining"])

    # ---------------------------------------------------------
    # TEST CLEANUP
    # ---------------------------------------------------------

    verification_id = result["verification_id"]
    action_id = action.id
    transaction_id = transaction.id

    # Delete verification first.
    db.query(Verification).filter(
        Verification.id == verification_id
    ).delete(synchronize_session=False)

    # Delete audit logs belonging only to this test action.
    db.query(AuditLog).filter(
        AuditLog.action_id == action_id
    ).delete(synchronize_session=False)

    # Delete notifications created by this test.
    db.query(Notification).filter(
        Notification.merchant_id == 1,
        ~Notification.id.in_(existing_notification_ids)
    ).delete(synchronize_session=False)

    db.flush()

    # Delete the action after its dependent rows are gone.
    db.query(Action).filter(
        Action.id == action_id
    ).delete(synchronize_session=False)

    db.flush()

    # Delete the temporary transaction.
    db.query(Transaction).filter(
        Transaction.id == transaction_id
    ).delete(synchronize_session=False)

    db.commit()

    print("Cleanup: PASSED")

finally:
    db.close()
