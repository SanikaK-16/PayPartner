from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Merchant, Notification

router = APIRouter(
    prefix="/api/notifications",
    tags=["Notifications"],
)


@router.get("/merchant/{merchant_id}")
def get_notifications(
    merchant_id: int,
    db: Session = Depends(get_db),
):
    merchant = (
        db.query(Merchant)
        .filter(Merchant.id == merchant_id)
        .first()
    )

    if merchant is None:
        raise HTTPException(
            status_code=404,
            detail="Merchant not found.",
        )

    notifications = (
        db.query(Notification)
        .filter(Notification.merchant_id == merchant_id)
        .order_by(Notification.created_at.desc())
        .all()
    )

    unread_count = sum(
        1 for notification in notifications
        if not notification.is_read
    )

    return {
        "merchant_id": merchant_id,
        "unread_count": unread_count,
        "notifications": [
            {
                "id": notification.id,
                "type": notification.type,
                "title": notification.title,
                "message": notification.message,
                "status": "read" if notification.is_read else "unread",
                "created_at": notification.created_at,
            }
            for notification in notifications
        ],
    }


@router.put("/{notification_id}/read")
def mark_notification_as_read(
    notification_id: int,
    db: Session = Depends(get_db),
):
    notification = (
        db.query(Notification)
        .filter(Notification.id == notification_id)
        .first()
    )

    if notification is None:
        raise HTTPException(
            status_code=404,
            detail="Notification not found.",
        )

    notification.is_read = True
    db.commit()
    db.refresh(notification)

    return {
        "id": notification.id,
        "status": "read",
    }


@router.put("/merchant/{merchant_id}/read-all")
def mark_all_notifications_as_read(
    merchant_id: int,
    db: Session = Depends(get_db),
):
    merchant = (
        db.query(Merchant)
        .filter(Merchant.id == merchant_id)
        .first()
    )

    if merchant is None:
        raise HTTPException(
            status_code=404,
            detail="Merchant not found.",
        )

    updated_count = (
        db.query(Notification)
        .filter(
            Notification.merchant_id == merchant_id,
            Notification.is_read.is_(False),
        )
        .update(
            {Notification.is_read: True},
            synchronize_session=False,
        )
    )

    db.commit()

    return {
        "merchant_id": merchant_id,
        "updated_count": updated_count,
        "status": "all_read",
    }
