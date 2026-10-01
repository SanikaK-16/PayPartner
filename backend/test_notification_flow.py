from decimal import Decimal

from app.database import SessionLocal
from app.models import Merchant, Notification, Opportunity
from app.services.opportunity_engine import persist_opportunities


TEST_MERCHANT_NAME = "PayPartner Duplicate Test Merchant"


def main():
    db = SessionLocal()

    try:
        # Clean up any previous test merchant.
        existing = (
            db.query(Merchant)
            .filter(Merchant.name == TEST_MERCHANT_NAME)
            .first()
        )

        if existing:
            db.query(Notification).filter(
                Notification.merchant_id == existing.id
            ).delete(synchronize_session=False)

            db.query(Opportunity).filter(
                Opportunity.merchant_id == existing.id
            ).delete(synchronize_session=False)

            db.delete(existing)
            db.commit()

        # Create isolated test merchant.
        merchant = Merchant(
            name=TEST_MERCHANT_NAME,
            business_type="Test Store",
            city="Pune",
        )

        db.add(merchant)
        db.commit()
        db.refresh(merchant)

        test_opportunity = {
            "opportunity_type": "failed_payment_recovery",
            "title": "Failed Payment Recovery",
            "description": (
                "2 failed payments worth ₹2,075.00 may be recoverable."
            ),
            "potential_value": Decimal("2075.00"),
            "priority": "high",
        }

        # First persistence: opportunity should be created.
        first_result = persist_opportunities(
            db=db,
            merchant_id=merchant.id,
            opportunities=[test_opportunity],
        )

        first_opportunities = (
            db.query(Opportunity)
            .filter(Opportunity.merchant_id == merchant.id)
            .all()
        )

        first_notifications = (
            db.query(Notification)
            .filter(Notification.merchant_id == merchant.id)
            .all()
        )

        assert len(first_result) == 1
        assert len(first_opportunities) == 1
        assert len(first_notifications) == 1

        print("First persistence: OK")
        print("First notification count: 1")

        # Second persistence: same opportunity should be updated,
        # not recreated, and no duplicate notification should appear.
        second_result = persist_opportunities(
            db=db,
            merchant_id=merchant.id,
            opportunities=[test_opportunity],
        )

        second_opportunities = (
            db.query(Opportunity)
            .filter(Opportunity.merchant_id == merchant.id)
            .all()
        )

        second_notifications = (
            db.query(Notification)
            .filter(Notification.merchant_id == merchant.id)
            .all()
        )

        assert len(second_result) == 1
        assert len(second_opportunities) == 1
        assert len(second_notifications) == 1

        print("Second persistence: OK")
        print("Opportunity count remains: 1")
        print("Notification count remains: 1")
        print("Duplicate notification prevention: PASSED")

        # Clean up isolated test data.
        db.query(Notification).filter(
            Notification.merchant_id == merchant.id
        ).delete(synchronize_session=False)

        db.query(Opportunity).filter(
            Opportunity.merchant_id == merchant.id
        ).delete(synchronize_session=False)

        db.delete(merchant)
        db.commit()

        print("Test data cleaned up successfully.")

    finally:
        db.close()


if __name__ == "__main__":
    main()
