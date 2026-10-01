from sqlalchemy.orm import Session

from app.models import Notification


def create_notification(
    db: Session,
    merchant_id: int,
    notification_type: str,
    title: str,
    message: str,
):
    notification = Notification(
        merchant_id=merchant_id,
        type=notification_type,
        title=title,
        message=message,
        is_read=False,
    )

    db.add(notification)
    db.commit()
    db.refresh(notification)

    return notification
