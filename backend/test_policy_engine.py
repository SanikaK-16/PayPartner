from decimal import Decimal

from app.database import SessionLocal
from app.services.policy_engine import (
    check_automatic_messaging,
    check_automatic_recovery,
    check_campaign_budget,
    check_discount_limit,
)

db = SessionLocal()

try:
    recovery = check_automatic_recovery(
        db,
        merchant_id=1,
    )

    messaging = check_automatic_messaging(
        db,
        merchant_id=1,
    )

    discount_allowed = check_discount_limit(
        db,
        merchant_id=1,
        requested_discount_percent=Decimal("10"),
    )

    discount_blocked = check_discount_limit(
        db,
        merchant_id=1,
        requested_discount_percent=Decimal("15"),
    )

    budget_allowed = check_campaign_budget(
        db,
        merchant_id=1,
        requested_budget=Decimal("800"),
    )

    budget_approval = check_campaign_budget(
        db,
        merchant_id=1,
        requested_budget=Decimal("1500"),
    )

    print("Automatic recovery:")
    print(recovery)

    print("\nAutomatic messaging:")
    print(messaging)

    print("\n10% discount:")
    print(discount_allowed)

    print("\n15% discount:")
    print(discount_blocked)

    print("\n₹800 campaign:")
    print(budget_allowed)

    print("\n₹1500 campaign:")
    print(budget_approval)

finally:
    db.close()
