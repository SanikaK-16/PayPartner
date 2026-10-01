from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.models import Customer, Transaction


router = APIRouter(
    prefix="/api/customers",
    tags=["Customers"],
)


@router.get("/merchant/{merchant_id}")
def get_merchant_customers(
    merchant_id: int,
    db: Session = Depends(get_db),
):
    customers = (
        db.query(Customer)
        .filter(Customer.merchant_id == merchant_id)
        .order_by(Customer.id.asc())
        .all()
    )

    customer_data = []

    for customer in customers:
        transaction_summary = (
            db.query(
                func.count(Transaction.id),
                func.coalesce(func.sum(Transaction.amount), 0),
            )
            .filter(
                Transaction.merchant_id == merchant_id,
                Transaction.customer_id == customer.id,
                Transaction.status == "success",
            )
            .first()
        )

        transaction_count = transaction_summary[0] or 0
        total_purchase_value = transaction_summary[1] or 0

        customer_data.append(
            {
                "id": customer.id,
                "name": customer.name,
                "phone": customer.phone,
                "transaction_count": transaction_count,
                "total_purchase_value": float(total_purchase_value),
            }
        )

    return {
        "merchant_id": merchant_id,
        "count": len(customer_data),
        "customers": customer_data,
    }
