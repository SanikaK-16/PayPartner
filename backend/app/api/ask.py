from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Merchant, Opportunity, Transaction
from app.services.ai_service import generate_merchant_response
from app.services.context_service import build_merchant_context

router = APIRouter(
    prefix="/api",
    tags=["Ask PayPartner"],
)


class AskRequest(BaseModel):
    merchant_id: int
    message: str


def detect_intent(message: str) -> str:
    """
    Deterministically classify the merchant's request.

    The LLM is not responsible for structured intent classification.
    """

    text = message.lower().strip()

    if any(
        phrase in text
        for phrase in [
            "how is my business",
            "how is my business doing",
            "business doing",
            "business performance",
            "today's business",
            "business today",
        ]
    ):
        return "business_overview"

    if any(
        phrase in text
        for phrase in [
            "what should i focus",
            "what should i do",
            "what should i work",
            "what do i focus",
            "what is most important",
            "where should i focus",
            "recommend",
        ]
    ):
        return "opportunity_recommendation"

    if any(
        phrase in text
        for phrase in [
            "failed payment",
            "failed payments",
            "payment failed",
            "payments failing",
            "why are my payments",
        ]
    ):
        return "failed_payment_analysis"

    if any(
        phrase in text
        for phrase in [
            "opportunities",
            "opportunity",
            "what opportunities",
            "show me opportunities",
            "available opportunities",
        ]
    ):
        return "opportunity_list"

    return "business_overview"


@router.post("/ask")
def ask_paypartner(
    request: AskRequest,
    db: Session = Depends(get_db),
):
    if not request.message.strip():
        raise HTTPException(
            status_code=400,
            detail="Message is required.",
        )

    merchant = (
        db.query(Merchant)
        .filter(Merchant.id == request.merchant_id)
        .first()
    )

    if merchant is None:
        raise HTTPException(
            status_code=404,
            detail="Merchant not found.",
        )

    failed_transactions = (
        db.query(Transaction)
        .filter(
            Transaction.merchant_id == request.merchant_id,
            Transaction.status == "failed",
        )
        .all()
    )

    failed_payment_count = len(failed_transactions)

    failed_payment_value = sum(
        (
            transaction.amount
            for transaction in failed_transactions
        ),
        0,
    )

    opportunities = (
        db.query(Opportunity)
        .filter(
            Opportunity.merchant_id == request.merchant_id,
            Opportunity.status == "open",
        )
        .order_by(Opportunity.id.asc())
        .all()
    )

    total_potential_value = sum(
        (
            opportunity.potential_value or 0
            for opportunity in opportunities
        ),
        0,
    )

    intent = detect_intent(request.message)

    business_context = {
        "merchant": {
            "id": merchant.id,
            "name": merchant.name,
            "business_type": merchant.business_type,
            "city": merchant.city,
        },
        "current_transaction_facts": {
            "failed_payment_count": failed_payment_count,
            "failed_payment_value": float(
                failed_payment_value
            ),
        },
        "opportunities": {
            "count": len(opportunities),
            "total_potential_value": float(
                total_potential_value
            ),
            "items": [
                {
                    "id": opportunity.id,
                    "type": opportunity.opportunity_type,
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
        },
    }

    business_context = build_merchant_context(
        db=db,
        merchant_id=request.merchant_id,
        base_context=business_context,
    )

    try:
        answer = generate_merchant_response(
            merchant_message=request.message,
            business_context=business_context,
        )
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"AI response generation failed: {str(exc)}",
        )

    return {
        "merchant_id": request.merchant_id,
        "message": request.message,
        "answer": answer,
        "intent": intent,
        "related_opportunities": [
            {
                "id": opportunity.id,
                "type": opportunity.opportunity_type,
                "title": opportunity.title,
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
