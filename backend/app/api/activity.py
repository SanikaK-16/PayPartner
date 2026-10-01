from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Action, AuditLog, Opportunity, Verification


router = APIRouter(
    prefix="/api/activity",
    tags=["Activity"],
)


@router.get("/merchant/{merchant_id}")
def get_merchant_activity(
    merchant_id: int,
    event_type: str | None = Query(default=None),
    status: str | None = Query(default=None),
    db: Session = Depends(get_db),
):
    activities = []

    # ---------------------------------------------------------
    # 1. Explicit audit log events
    # ---------------------------------------------------------
    audit_logs = (
        db.query(AuditLog)
        .filter(AuditLog.merchant_id == merchant_id)
        .order_by(AuditLog.created_at.desc())
        .all()
    )

    for log in audit_logs:
        activity_status = "completed"

        activity = {
            "id": f"audit-{log.id}",
            "event_type": log.event_type,
            "message": log.message,
            "status": activity_status,
            "timestamp": log.created_at.isoformat(),
            "action_id": log.action_id,
            "opportunity_id": None,
        }

        if event_type and activity["event_type"] != event_type:
            continue

        if status and activity["status"] != status:
            continue

        activities.append(activity)

    # ---------------------------------------------------------
    # 2. Action lifecycle events
    # ---------------------------------------------------------
    actions = (
        db.query(Action)
        .filter(Action.merchant_id == merchant_id)
        .order_by(Action.id.desc())
        .all()
    )

    for action in actions:
        opportunity = (
            db.query(Opportunity)
            .filter(Opportunity.id == action.opportunity_id)
            .first()
        )

        activity_status = action.execution_status

        activity = {
            "id": f"action-{action.id}",
            "event_type": "action",
            "message": action.description,
            "status": activity_status,
            "timestamp": action.created_at.isoformat(),
            "action_id": action.id,
            "opportunity_id": action.opportunity_id,
        }

        if event_type and activity["event_type"] != event_type:
            continue

        if status and activity["status"] != status:
            continue

        activities.append(activity)

        # -----------------------------------------------------
        # 3. Verification lifecycle event
        # -----------------------------------------------------
        verification = (
            db.query(Verification)
            .filter(Verification.action_id == action.id)
            .order_by(Verification.id.desc())
            .first()
        )

        if verification:
            verification_status = verification.outcome_status

            verification_message = (
                f"Verification completed: "
                f"₹{verification.value_verified or 0:.2f} "
                f"verified impact."
            )

            verification_activity = {
                "id": f"verification-{verification.id}",
                "event_type": "verification",
                "message": verification_message,
                "status": verification_status,
                "timestamp": verification.created_at.isoformat(),
                "action_id": action.id,
                "opportunity_id": action.opportunity_id,
            }

            if event_type and verification_activity["event_type"] != event_type:
                continue

            if status and verification_activity["status"] != status:
                continue

            activities.append(verification_activity)

    # ---------------------------------------------------------
    # Sort combined activity feed
    # ---------------------------------------------------------
    activities.sort(
        key=lambda item: (
            item["timestamp"] is not None,
            item["timestamp"] or "",
        ),
        reverse=True,
    )

    return {
        "merchant_id": merchant_id,
        "count": len(activities),
        "activities": activities,
    }
