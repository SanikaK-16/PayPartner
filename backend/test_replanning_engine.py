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
from app.services.replanning_engine import replan_failed_payment_recovery
from app.services.verification_engine import verify_failed_payment_recovery


db = SessionLocal()

try:
    # Preserve existing notification IDs.
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
        source_key="test_replanning_engine",
        title="Temporary Replanning Test",
        description="Temporary opportunity used only for replanning tests.",
        potential_value=Decimal("1000.00"),
        priority="high",
        status="open",
    )

    db.add(opportunity)
    db.commit()
    db.refresh(opportunity)

    # ---------------------------------------------------------
    # TEMPORARY TRANSACTIONS
    # ---------------------------------------------------------

    failed_transaction = Transaction(
        merchant_id=1,
        customer_id=None,
        product_id=None,
        amount=Decimal("250.00"),
        status="failed",
        payment_method="UPI",
        created_at=datetime.utcnow(),
    )

    successful_transaction = Transaction(
        merchant_id=1,
        customer_id=None,
        product_id=None,
        amount=Decimal("750.00"),
        status="success",
        payment_method="UPI",
        created_at=datetime.utcnow(),
    )

    db.add_all([
        failed_transaction,
        successful_transaction,
    ])

    db.commit()

    db.refresh(failed_transaction)
    db.refresh(successful_transaction)

    target_transaction_ids = [
        failed_transaction.id,
        successful_transaction.id,
    ]

    # ---------------------------------------------------------
    # CREATE ORIGINAL ACTION
    # ---------------------------------------------------------

    action = create_action(
        db=db,
        merchant_id=1,
        opportunity_id=opportunity.id,
        action_type="failed_payment_recovery",
        description="Temporary partial-impact replanning test.",
        requested_value=Decimal("1000.00"),
        policy_status="allowed",
        target_transaction_ids=target_transaction_ids,
    )

    action = execute_failed_payment_recovery(
        db=db,
        action_id=action.id,
    )

    # ---------------------------------------------------------
    # VERIFY
    # ---------------------------------------------------------

    verification_result = verify_failed_payment_recovery(
        db=db,
        action_id=action.id,
    )

    print("Verification result:")
    print("Action:", verification_result["action_id"])
    print("Outcome:", verification_result["outcome_status"])
    print("Value attempted:", verification_result["value_attempted"])
    print("Value verified:", verification_result["value_verified"])
    print(
        "Failed value remaining:",
        verification_result["failed_value_remaining"],
    )

    if verification_result["outcome_status"] != "partial_impact":
        raise AssertionError(
            "Expected partial_impact verification result."
        )

    # ---------------------------------------------------------
    # REPLAN
    # ---------------------------------------------------------

    result = replan_failed_payment_recovery(
        db=db,
        action_id=action.id,
    )

    print("\nReplanning result:")
    print("Replan required:", result["replan_required"])
    print("Reason:", result.get("reason", result.get("stop_reason")))

    if "remaining_value" in result:
        print("Remaining value:", result["remaining_value"])

    if not result["replan_required"]:
        raise AssertionError(
            "Expected replanning to be required."
        )

    if "replanned_action_id" not in result:
        raise AssertionError(
            "Expected a replanned action to be created."
        )

    replanned_action_id = result["replanned_action_id"]

    print(
        "Replanned action:",
        replanned_action_id,
    )

    # ---------------------------------------------------------
    # CLEANUP
    # ---------------------------------------------------------

    original_action_id = action.id
    opportunity_id = opportunity.id

    # Delete verification records.
    db.query(Verification).filter(
        Verification.action_id.in_([
            original_action_id,
            replanned_action_id,
        ])
    ).delete(synchronize_session=False)

    # Delete audit logs for these actions.
    db.query(AuditLog).filter(
        AuditLog.action_id.in_([
            original_action_id,
            replanned_action_id,
        ])
    ).delete(synchronize_session=False)

    # Delete only notifications created during this test.
    db.query(Notification).filter(
        Notification.merchant_id == 1,
        ~Notification.id.in_(existing_notification_ids),
    ).delete(synchronize_session=False)

    db.flush()

    # Delete replanned action first.
    db.query(Action).filter(
        Action.id == replanned_action_id
    ).delete(synchronize_session=False)

    db.flush()

    # Delete original action.
    db.query(Action).filter(
        Action.id == original_action_id
    ).delete(synchronize_session=False)

    db.flush()

    # Delete temporary transactions.
    db.query(Transaction).filter(
        Transaction.id.in_([
            failed_transaction.id,
            successful_transaction.id,
        ])
    ).delete(synchronize_session=False)

    db.flush()

    # Delete temporary opportunity.
    db.query(Opportunity).filter(
        Opportunity.id == opportunity_id
    ).delete(synchronize_session=False)

    db.commit()

    print("\nReplanning test: PASSED")
    print("Cleanup: PASSED")

finally:
    db.close()
