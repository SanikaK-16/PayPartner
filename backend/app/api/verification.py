from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Action
from app.services.verification_engine import verify_failed_payment_recovery

router = APIRouter(
    prefix="/api/actions",
    tags=["Verification"],
)


@router.post("/{action_id}/verify")
def verify_action_endpoint(
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

    if action.execution_status != "completed":
        raise HTTPException(
            status_code=400,
            detail="Action must be completed before verification.",
        )

    result = verify_failed_payment_recovery(
    db=db,
    action_id=action_id,
)

    return result
