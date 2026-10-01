from sqlalchemy.orm import Session

from app.models import (
    Action,
    AuditLog,
    Policy,
    Verification,
)


def build_merchant_context(
    db: Session,
    merchant_id: int,
    base_context: dict,
) -> dict:
    """
    Build a compact merchant context for the AI.

    The database is the source of truth.
    This service only retrieves and structures existing facts.
    """

    policy = (
        db.query(Policy)
        .filter(Policy.merchant_id == merchant_id)
        .first()
    )

    actions = (
        db.query(Action)
        .filter(Action.merchant_id == merchant_id)
        .order_by(Action.created_at.desc())
        .limit(10)
        .all()
    )

    verifications = (
        db.query(Verification)
        .filter(Verification.merchant_id == merchant_id)
        .order_by(Verification.created_at.desc())
        .limit(10)
        .all()
    )

    audit_logs = (
        db.query(AuditLog)
        .filter(AuditLog.merchant_id == merchant_id)
        .order_by(AuditLog.created_at.desc())
        .limit(10)
        .all()
    )

    context = dict(base_context)

    context["merchant_policy"] = None

    if policy:
        context["merchant_policy"] = {
            "automatic_recovery": policy.automatic_recovery,
            "automatic_messaging": policy.automatic_messaging,
            "max_discount_percent": float(
                policy.max_discount_percent
            ),
            "campaign_limit": float(
                policy.campaign_limit
            ),
            "approval_above_limit": policy.approval_above_limit,
        }

    context["recent_actions"] = [
        {
            "id": action.id,
            "opportunity_id": action.opportunity_id,
            "action_type": action.action_type,
            "description": action.description,
            "requested_value": (
                float(action.requested_value)
                if action.requested_value is not None
                else None
            ),
            "policy_status": action.policy_status,
            "execution_status": action.execution_status,
            "target_transaction_ids": action.target_transaction_ids,
            "created_at": action.created_at.isoformat(),
        }
        for action in actions
    ]

    context["recent_verifications"] = [
        {
            "id": verification.id,
            "action_id": verification.action_id,
            "outcome_status": verification.outcome_status,
            "value_attempted": (
                float(verification.value_attempted)
                if verification.value_attempted is not None
                else None
            ),
            "value_verified": (
                float(verification.value_verified)
                if verification.value_verified is not None
                else None
            ),
            "evidence": verification.evidence,
            "created_at": verification.created_at.isoformat(),
        }
        for verification in verifications
    ]

    context["recent_audit_history"] = [
        {
            "id": log.id,
            "action_id": log.action_id,
            "event_type": log.event_type,
            "message": log.message,
            "created_at": log.created_at.isoformat(),
        }
        for log in audit_logs
    ]

    return context
