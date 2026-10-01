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
        source_key="test_replan_stop_guard",
        title="Temporary Stop Guard Test",
        description="Temporary opportunity used only for stop-guard testing.",
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
    # CREATE + EXECUTE ACTION
    # ---------------------------------------------------------

    action = create_action(
        db=db,
        merchant_id=1,
        opportunity_id=opportunity.id,
        action_type="failed_payment_recovery",
        description="Temporary no-impact stop-guard test.",
        requested_value=Decimal("250.00"),
        policy_status="allowed",
        target_transaction_ids=[transaction.id],
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

    if verification_result["outcome_status"] != "no_impact":
        raise AssertionError(
            "Expected no_impact verification result."
        )

    # ---------------------------------------------------------
    # REPLAN / STOP GUARD
    # ---------------------------------------------------------

    result = replan_failed_payment_recovery(
        db=db,
        action_id=action.id,
    )

    print("\nReplan stop-guard result:")
    print("Replan required:", result["replan_required"])
    print(
        "Reason:",
        result.get("stop_reason", result.get("reason")),
    )

    if "remaining_value" in result:
        print(
            "Remaining value:",
            result["remaining_value"],
        )

    if result["replan_required"]:
        raise AssertionError(
            "Stop guard failed: replanning should not be required "
            "after no verified impact."
        )

    if "stop_reason" not in result:
        raise AssertionError(
            "Expected a stop_reason for no-impact recovery."
        )

    # ---------------------------------------------------------
    # CLEANUP
    # ---------------------------------------------------------

    action_id = action.id
    opportunity_id = opportunity.id
    transaction_id = transaction.id

    db.query(Verification).filter(
        Verification.action_id == action_id
    ).delete(synchronize_session=False)

    db.query(AuditLog).filter(
        AuditLog.action_id == action_id
    ).delete(synchronize_session=False)

    db.query(Notification).filter(
        Notification.merchant_id == 1,
        ~Notification.id.in_(existing_notification_ids),
    ).delete(synchronize_session=False)

    db.flush()

    db.query(Action).filter(
        Action.id == action_id
    ).delete(synchronize_session=False)

    db.flush()

    db.query(Transaction).filter(
        Transaction.id == transaction_id
    ).delete(synchronize_session=False)

    db.flush()

    db.query(Opportunity).filter(
        Opportunity.id == opportunity_id
    ).delete(synchronize_session=False)

    db.commit()

    print("\nStop-guard test: PASSED")
    print("Cleanup: PASSED")

finally:
    db.close()
