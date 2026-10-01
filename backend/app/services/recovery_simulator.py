from sqlalchemy.orm import Session

from app.models import Transaction
from app.services.opportunity_engine import (
    find_all_opportunities,
    persist_opportunities,
)


def simulate_payment_recovery(
    db: Session,
    merchant_id: int,
    recovery_count: int = 8,
):
    failed_transactions = (
        db.query(Transaction)
        .filter(
            Transaction.merchant_id == merchant_id,
            Transaction.status == "failed",
        )
        .order_by(Transaction.created_at.asc())
        .all()
    )

    recovered = failed_transactions[:recovery_count]

    for transaction in recovered:
        transaction.status = "success"

    db.commit()

    # Refresh persisted opportunities after transaction outcomes change.
    # This keeps the opportunity layer synchronized with the
    # transaction database.
    updated_opportunities = find_all_opportunities(
        db=db,
        merchant_id=merchant_id,
    )

    persist_opportunities(
        db=db,
        merchant_id=merchant_id,
        opportunities=updated_opportunities,
    )

    return {
        "recovered_count": len(recovered),
        "recovered_value": sum(
            transaction.amount
            for transaction in recovered
        ),
        "remaining_failed_payments": sum(
            1
            for transaction in failed_transactions
            if transaction.status == "failed"
        ),
    }
