from app.database import SessionLocal
from app.models import Transaction

db = SessionLocal()

try:
    ids = [117,118,119,120,121,122,123,124,125,127,128,129,130,131,132]

    transactions = (
        db.query(Transaction)
        .filter(
            Transaction.merchant_id == 1,
            Transaction.id.in_(ids),
        )
        .all()
    )

    for transaction in transactions:
        transaction.status = "failed"

    db.commit()

    print(f"Restored {len(transactions)} transactions to failed.")
finally:
    db.close()
