from datetime import datetime
from decimal import Decimal

from sqlalchemy import ForeignKey, Numeric, String, Text, DateTime
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Verification(Base):
    __tablename__ = "verifications"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True
    )

    merchant_id: Mapped[int] = mapped_column(
        ForeignKey("merchants.id"),
        nullable=False,
        index=True
    )

    action_id: Mapped[int] = mapped_column(
        ForeignKey("actions.id"),
        nullable=False,
        index=True
    )

    outcome_status: Mapped[str] = mapped_column(
        String(30),
        nullable=False
    )

    value_attempted: Mapped[Decimal | None] = mapped_column(
        Numeric(12, 2),
        nullable=True
    )

    value_verified: Mapped[Decimal | None] = mapped_column(
        Numeric(12, 2),
        nullable=True
    )

    evidence: Mapped[str | None] = mapped_column(
        Text,
        nullable=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        default=datetime.utcnow
    )
