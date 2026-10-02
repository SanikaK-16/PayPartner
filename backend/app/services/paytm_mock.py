from decimal import Decimal

from sqlalchemy.orm import Session

from app.models import Transaction


def recover_failed_payments(
    db: Session,
    merchant_id: int,
    target_transaction_ids: list[int],
    amount: Decimal,
):
    transactions = (
        db.query(Transaction)
        .filter(
            Transaction.merchant_id == merchant_id,
            Transaction.id.in_(target_transaction_ids),
            Transaction.status == "failed",
        )
        .all()
    )

    recovered_value = sum(
        (transaction.amount for transaction in transactions),
        Decimal("0.00"),
    )

    for transaction in transactions:
        transaction.status = "success"

    db.commit()

    return {
        "status": "executed",
        "merchant_id": merchant_id,
        "amount_attempted": recovered_value,
        "amount_verified_candidate": recovered_value,
        "target_transaction_ids": target_transaction_ids,
        "integration": "mock_paytm",
        "message": "Failed payment recovery simulated successfully.",
    }