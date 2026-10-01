from decimal import Decimal

from app.database import SessionLocal
from app.services.action_engine import (
    create_action,
    execute_failed_payment_recovery,
)

db = SessionLocal()

try:
    action = create_action(
        db=db,
        merchant_id=1,
        opportunity_id=1,
        action_type="failed_payment_recovery",
        description="Recover eligible failed payments.",
        requested_value=Decimal("4200"),
        policy_status="allowed",
    )

    print("Action created:")
    print("ID:", action.id)
    print("Execution:", action.execution_status)

    action = execute_failed_payment_recovery(
        db=db,
        action_id=action.id,
    )

    print("\nAction executed:")
    print("ID:", action.id)
    print("Execution:", action.execution_status)

finally:
    db.close()
