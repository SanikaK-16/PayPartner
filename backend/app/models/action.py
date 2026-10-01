from datetime import datetime
from decimal import Decimal
from sqlalchemy import JSON, Column
from sqlalchemy import ForeignKey, Numeric, String, Text, DateTime
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Action(Base):
    __tablename__ = "actions"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True
    )

    merchant_id: Mapped[int] = mapped_column(
        ForeignKey("merchants.id"),
        nullable=False,
        index=True
    )

    opportunity_id: Mapped[int] = mapped_column(
        ForeignKey("opportunities.id"),
        nullable=False,
        index=True
    )

    action_type: Mapped[str] = mapped_column(
        String(50),
        nullable=False
    )

    description: Mapped[str] = mapped_column(
        Text,
        nullable=False
    )

    requested_value: Mapped[Decimal | None] = mapped_column(
        Numeric(12, 2),
        nullable=True
    )

    policy_status: Mapped[str] = mapped_column(
        String(30),
        nullable=False
    )

    execution_status: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
        default="pending"
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        default=datetime.utcnow
    )

    target_transaction_ids = Column(JSON, nullable=True)
