from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Policy


router = APIRouter(
    prefix="/api/policies",
    tags=["Policies"],
)


class UpdatePolicyRequest(BaseModel):
    automatic_recovery: bool
    automatic_messaging: bool
    max_discount_percent: Decimal = Field(
        ge=0,
        le=100,
    )
    campaign_limit: Decimal = Field(
        ge=0,
    )
    approval_above_limit: bool


@router.get("/merchant/{merchant_id}")
def get_merchant_policy(
    merchant_id: int,
    db: Session = Depends(get_db),
):
    policy = (
        db.query(Policy)
        .filter(Policy.merchant_id == merchant_id)
        .first()
    )

    if policy is None:
        raise HTTPException(
            status_code=404,
            detail="Policy not found for this merchant.",
        )

    return {
        "merchant_id": merchant_id,
        "policy": {
            "id": policy.id,
            "automatic_recovery": policy.automatic_recovery,
            "automatic_messaging": policy.automatic_messaging,
            "max_discount_percent": float(
                policy.max_discount_percent
            ),
            "campaign_limit": float(
                policy.campaign_limit
            ),
            "approval_above_limit": policy.approval_above_limit,
        },
    }


@router.put("/merchant/{merchant_id}")
def update_merchant_policy(
    merchant_id: int,
    request: UpdatePolicyRequest,
    db: Session = Depends(get_db),
):
    policy = (
        db.query(Policy)
        .filter(Policy.merchant_id == merchant_id)
        .first()
    )

    if policy is None:
        raise HTTPException(
            status_code=404,
            detail="Policy not found for this merchant.",
        )

    policy.automatic_recovery = request.automatic_recovery
    policy.automatic_messaging = request.automatic_messaging
    policy.max_discount_percent = request.max_discount_percent
    policy.campaign_limit = request.campaign_limit
    policy.approval_above_limit = request.approval_above_limit

    db.commit()
    db.refresh(policy)

    return {
        "merchant_id": merchant_id,
        "message": "Merchant policy updated successfully.",
        "policy": {
            "id": policy.id,
            "automatic_recovery": policy.automatic_recovery,
            "automatic_messaging": policy.automatic_messaging,
            "max_discount_percent": float(
                policy.max_discount_percent
            ),
            "campaign_limit": float(
                policy.campaign_limit
            ),
            "approval_above_limit": policy.approval_above_limit,
        },
    }
