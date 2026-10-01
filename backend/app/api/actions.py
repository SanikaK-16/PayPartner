from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Action, Opportunity, Transaction
from app.services.policy_engine import (
    check_automatic_messaging,
    check_automatic_recovery,
)
from app.services.action_engine import (
    create_action as create_action_service,
    execute_failed_payment_recovery,
)
from app.services.audit_service import create_audit_log

router = APIRouter(
    prefix="/api/actions",
    tags=["Actions"],
)


class CreateActionRequest(BaseModel):
    merchant_id: int
    opportunity_id: int
    action_type: str
    description: str
    requested_value: Decimal | None = None


@router.post("")
def create_action(
    request: CreateActionRequest,
    db: Session = Depends(get_db),
):
    opportunity = (
        db.query(Opportunity)
        .filter(
            Opportunity.id == request.opportunity_id,
            Opportunity.merchant_id == request.merchant_id,
        )
        .first()
    )

    if not opportunity:
        raise HTTPException(
            status_code=404,
            detail="Opportunity not found for this merchant.",
        )

    if request.action_type == "failed_payment_recovery":
        policy_result = check_automatic_recovery(
            db,
            request.merchant_id,
        )

    elif request.action_type == "customer_messaging":
        policy_result = check_automatic_messaging(
            db,
            request.merchant_id,
        )

    else:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported action type: {request.action_type}",
        )

    if policy_result["allowed"]:
        policy_status = "allowed"
    else:
        policy_status = "approval_required"


    create_audit_log(
        db=db,
        merchant_id=request.merchant_id,
        event_type="policy_checked",
        message=(
            f"Policy checked for {request.action_type}. "
            f"Result: {policy_status}. "
            f"Reason: {policy_result['reason']}"
        ),
    )

    target_transaction_ids = None

    if request.action_type == "failed_payment_recovery":
        failed_transactions = (
            db.query(Transaction)
            .filter(
                Transaction.merchant_id == request.merchant_id,
                Transaction.status == "failed",
            )
            .order_by(Transaction.created_at.asc())
            .all()
        )

        target_transaction_ids = [
            transaction.id
            for transaction in failed_transactions
        ]

        targeted_value = sum(
            (
                transaction.amount
                for transaction in failed_transactions
            ),
            Decimal("0.00"),
        )

        requested_value = request.requested_value or Decimal("0.00")

        if requested_value > targeted_value:
            raise HTTPException(
                status_code=400,
                detail=(
                    "Requested recovery value cannot exceed "
                    "the value of targeted failed transactions."
                ),
            )

    action = create_action_service(
        db=db,
        merchant_id=request.merchant_id,
        opportunity_id=request.opportunity_id,
        action_type=request.action_type,
        description=request.description,
        requested_value=request.requested_value,
        policy_status=policy_status,
        target_transaction_ids=target_transaction_ids,
    )

    return {
        "merchant_id": action.merchant_id,
        "action": {
            "id": action.id,
            "opportunity_id": action.opportunity_id,
            "action_type": action.action_type,
            "description": action.description,
            "requested_value": (
                float(action.requested_value)
                if action.requested_value is not None
                else 0.0
            ),
            "target_transaction_ids": action.target_transaction_ids,
            "policy_status": action.policy_status,
            "execution_status": action.execution_status,
        },
        "policy": {
            "allowed": policy_result["allowed"],
            "reason": policy_result["reason"],
        },
    }


@router.post("/{action_id}/execute")
def execute_action(
    action_id: int,
    db: Session = Depends(get_db),
):
    action = (
        db.query(Action)
        .filter(Action.id == action_id)
        .first()
    )

    if not action:
        raise HTTPException(
            status_code=404,
            detail="Action not found.",
        )

    if action.action_type not in (
        "failed_payment_recovery",
        "failed_payment_recovery_replan",
    ):
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported action type: {action.action_type}",
        )

    if action.policy_status != "allowed":
        raise HTTPException(
            status_code=403,
            detail=(
                "Action cannot be executed automatically. "
                "Merchant approval is required."
            ),
        )

    if action.execution_status == "completed":
        raise HTTPException(
            status_code=400,
            detail="Action has already been executed.",
        )

    result = execute_failed_payment_recovery(
        db=db,
        action_id=action_id,
    )

    return {
        "merchant_id": action.merchant_id,
        "action": {
            "id": action.id,
            "opportunity_id": action.opportunity_id,
            "action_type": action.action_type,
            "execution_status": action.execution_status,
        },
        "result": result,
    }
