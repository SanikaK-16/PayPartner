from decimal import Decimal

from app.database import SessionLocal
from app.models import Transaction


DEMO_TRANSACTION_IDS = [
    117,
    118,
    119,
    120,
    121,
    122,
    123,
    124,
    125,
    127,
    128,
    129,
    130,
    131,
    132,
]

EXPECTED_TOTAL = Decimal("3700.00")


db = SessionLocal()

try:
    transactions = (
        db.query(Transaction)
        .filter(
            Transaction.merchant_id == 1,
            Transaction.id.in_(DEMO_TRANSACTION_IDS),
        )
        .order_by(Transaction.id.asc())
        .all()
    )

    actual_ids = {transaction.id for transaction in transactions}
    expected_ids = set(DEMO_TRANSACTION_IDS)

    if actual_ids != expected_ids:
        missing = sorted(expected_ids - actual_ids)
        unexpected = sorted(actual_ids - expected_ids)

        raise RuntimeError(
            f"Demo transaction validation failed. "
            f"Missing IDs: {missing}. "
            f"Unexpected IDs: {unexpected}. "
            f"No transactions were modified."
        )

    actual_total = sum(
        (transaction.amount for transaction in transactions),
        Decimal("0.00"),
    )

    if actual_total != EXPECTED_TOTAL:
        raise RuntimeError(
            f"Demo transaction total validation failed. "
            f"Expected ₹{EXPECTED_TOTAL}, "
            f"found ₹{actual_total}. "
            f"No transactions were modified."
        )

    for transaction in transactions:
        transaction.status = "failed"

    db.commit()

    print(
        f"Demo restored successfully: "
        f"{len(transactions)} failed transactions, "
        f"total ₹{actual_total}."
    )

finally:
    db.close()