from decimal import Decimal

from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import (
    Action,
    Customer,
    Opportunity,
    Transaction,
    Verification,
)


router = APIRouter(
    prefix="/api/overview",
    tags=["Overview"],
)


@router.get("/merchant/{merchant_id}")
def get_merchant_overview(
    merchant_id: int,
    db: Session = Depends(get_db),
):
    # -----------------------------
    # Transaction metrics
    # -----------------------------

    total_transactions = (
        db.query(func.count(Transaction.id))
        .filter(Transaction.merchant_id == merchant_id)
        .scalar()
        or 0
    )

    successful_transactions = (
        db.query(func.count(Transaction.id))
        .filter(
            Transaction.merchant_id == merchant_id,
            Transaction.status == "success",
        )
        .scalar()
        or 0
    )

    failed_transactions = (
        db.query(func.count(Transaction.id))
        .filter(
            Transaction.merchant_id == merchant_id,
            Transaction.status == "failed",
        )
        .scalar()
        or 0
    )

    failed_value = (
        db.query(func.coalesce(func.sum(Transaction.amount), 0))
        .filter(
            Transaction.merchant_id == merchant_id,
            Transaction.status == "failed",
        )
        .scalar()
        or Decimal("0.00")
    )

    sales = (
        db.query(func.coalesce(func.sum(Transaction.amount), 0))
        .filter(
            Transaction.merchant_id == merchant_id,
            Transaction.status == "success",
        )
        .scalar()
        or Decimal("0.00")
    )

    # -----------------------------
    # Opportunity metrics
    # -----------------------------

    active_opportunities = (
        db.query(func.count(Opportunity.id))
        .filter(
            Opportunity.merchant_id == merchant_id,
            Opportunity.status == "open",
        )
        .scalar()
        or 0
    )

    potential_opportunity_value = (
        db.query(func.coalesce(func.sum(Opportunity.potential_value), 0))
        .filter(
            Opportunity.merchant_id == merchant_id,
            Opportunity.status == "open",
        )
        .scalar()
        or Decimal("0.00")
    )

    # -----------------------------
    # Verified impact
    # -----------------------------
    #
    # Relationship:
    # Opportunity -> Action -> Verification
    #
    # We take the maximum verified value for each opportunity
    # to avoid double-counting repeated attempts for the same
    # opportunity in this prototype.
    #

    verified_rows = (
        db.query(
            Opportunity.id.label("opportunity_id"),
            func.max(
                Verification.value_verified
            ).label("verified_value"),
        )
        .join(
            Action,
            Action.opportunity_id == Opportunity.id,
        )
        .join(
            Verification,
            Verification.action_id == Action.id,
        )
        .filter(
            Opportunity.merchant_id == merchant_id,
            Action.merchant_id == merchant_id,
            Verification.merchant_id == merchant_id,
        )
        .group_by(Opportunity.id)
        .all()
    )

    verified_impact = sum(
        (
            row.verified_value or Decimal("0.00")
            for row in verified_rows
        ),
        Decimal("0.00"),
    )

    # -----------------------------
    # Customer metrics
    # -----------------------------

    customer_count = (
        db.query(func.count(Customer.id))
        .filter(Customer.merchant_id == merchant_id)
        .scalar()
        or 0
    )

    # -----------------------------
    # Return dashboard data
    # -----------------------------

    return {
        "merchant_id": merchant_id,
        "overview": {
            "total_transactions": total_transactions,
            "successful_transactions": successful_transactions,
            "failed_transactions": failed_transactions,
            "failed_value": float(failed_value),
            "sales": float(sales),
            "active_opportunities": active_opportunities,
            "potential_opportunity_value": float(
                potential_opportunity_value
            ),
            "verified_impact": float(verified_impact),
            "customer_count": customer_count,
        },
    }
