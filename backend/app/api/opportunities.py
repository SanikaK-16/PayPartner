from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Opportunity
from app.services.opportunity_engine import (
    find_all_opportunities,
    persist_opportunities,
)


router = APIRouter(
    prefix="/api/opportunities",
    tags=["Opportunities"],
)


@router.get("/merchant/{merchant_id}")
def get_merchant_opportunities(
    merchant_id: int,
    db: Session = Depends(get_db),
):
    
    # Refresh opportunities from the merchant's current business data.
    current_opportunities = find_all_opportunities(
        db,
        merchant_id,
    )

    persist_opportunities(
        db,
        merchant_id,
        current_opportunities,
    )

    opportunities = (
        db.query(Opportunity)
        .filter(Opportunity.merchant_id == merchant_id)
        .order_by(Opportunity.id.asc())
        .all()
    )

    if not opportunities:
        raise HTTPException(
            status_code=404,
            detail="No opportunities found for this merchant.",
        )

    return {
        "merchant_id": merchant_id,
        "count": len(opportunities),
        "opportunities": [
            {
                "id": opportunity.id,
                "type": opportunity.opportunity_type,
                "source_key": opportunity.source_key,
                "title": opportunity.title,
                "description": opportunity.description,
                "potential_value": (
                    float(opportunity.potential_value)
                    if opportunity.potential_value is not None
                    else 0.0
                ),
                "priority": opportunity.priority,
                "status": opportunity.status,
            }
            for opportunity in opportunities
        ],
    }

@router.get("/merchant/{merchant_id}/{opportunity_id}")
def get_opportunity_detail(
    merchant_id: int,
    opportunity_id: int,
    db: Session = Depends(get_db),
):
    opportunity = (
        db.query(Opportunity)
        .filter(
            Opportunity.id == opportunity_id,
            Opportunity.merchant_id == merchant_id,
        )
        .first()
    )

    if not opportunity:
        raise HTTPException(
            status_code=404,
            detail="Opportunity not found for this merchant.",
        )

    return {
        "merchant_id": merchant_id,
        "opportunity": {
            "id": opportunity.id,
            "type": opportunity.opportunity_type,
            "source_key": opportunity.source_key,
            "title": opportunity.title,
            "description": opportunity.description,
            "potential_value": (
                float(opportunity.potential_value)
                if opportunity.potential_value is not None
                else 0.0
            ),
            "priority": opportunity.priority,
            "status": opportunity.status,
        },
    }
