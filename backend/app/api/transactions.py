from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Customer, Product, Transaction


router = APIRouter(
    prefix="/api/transactions",
    tags=["Transactions"],
)


@router.get("/merchant/{merchant_id}")
def get_merchant_transactions(
    merchant_id: int,
    status: str | None = Query(default=None),
    db: Session = Depends(get_db),
):
    allowed_statuses = {"success", "failed"}

    if status is not None and status not in allowed_statuses:
        raise HTTPException(
            status_code=400,
            detail="Status must be either 'success' or 'failed'.",
        )

    query = (
        db.query(Transaction)
        .filter(Transaction.merchant_id == merchant_id)
    )

    if status is not None:
        query = query.filter(Transaction.status == status)

    transactions = (
        query
        .order_by(Transaction.created_at.desc())
        .all()
    )

    transaction_data = []

    for transaction in transactions:
        customer_name = None
        product_name = None

        if transaction.customer_id is not None:
            customer = (
                db.query(Customer)
                .filter(
                    Customer.id == transaction.customer_id,
                    Customer.merchant_id == merchant_id,
                )
                .first()
            )

            if customer:
                customer_name = customer.name

        if transaction.product_id is not None:
            product = (
                db.query(Product)
                .filter(
                    Product.id == transaction.product_id,
                    Product.merchant_id == merchant_id,
                )
                .first()
            )

            if product:
                product_name = product.name

        transaction_data.append(
            {
                "id": transaction.id,
                "amount": float(transaction.amount),
                "status": transaction.status,
                "payment_method": transaction.payment_method,
                "customer": customer_name,
                "product": product_name,
                "created_at": (
                    transaction.created_at.isoformat()
                    if transaction.created_at
                    else None
                ),
            }
        )

    return {
        "merchant_id": merchant_id,
        "count": len(transaction_data),
        "transactions": transaction_data,
    }
