from sqlalchemy.orm import Session

from app.models import AuditLog


def create_audit_log(
    db: Session,
    merchant_id: int,
    event_type: str,
    message: str,
    action_id: int | None = None,
):
    audit_log = AuditLog(
        merchant_id=merchant_id,
        action_id=action_id,
        event_type=event_type,
        message=message,
    )

    db.add(audit_log)
    db.commit()
    db.refresh(audit_log)

    return audit_log
