from app.database import SessionLocal
from app.models import Action


db = SessionLocal()

try:
    action = (
        db.query(Action)
        .filter(Action.id == 3)
        .first()
    )

    if action is None:
        print("Action 3 not found.")
    else:
        print("Action 3 status:")
        print(f"Action ID: {action.id}")
        print(f"Execution status: {action.execution_status}")
        print(f"Policy status: {action.policy_status}")
        print(f"Requested value: ₹{action.requested_value:.2f}")

finally:
    db.close()
