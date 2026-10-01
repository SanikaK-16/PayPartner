from app.database import SessionLocal
from app.services.recovery_simulator import (
    simulate_payment_recovery,
)

db = SessionLocal()

try:
    result = simulate_payment_recovery(
        db=db,
        merchant_id=1,
        recovery_count=8,
    )

    print("Recovery simulation:")
    print("Transactions recovered:", result["recovered_count"])
    print("Value recovered:", result["recovered_value"])

finally:
    db.close()
