from app.database import SessionLocal
from app.services.opportunity_engine import (
    find_all_opportunities,
    persist_opportunities,
)

db = SessionLocal()

try:
    merchant_id = 1

    opportunities = find_all_opportunities(
        db,
        merchant_id,
    )

    persisted = persist_opportunities(
        db,
        merchant_id,
        opportunities,
    )

    print(f"Opportunities found: {len(opportunities)}")
    print(f"Opportunities persisted: {len(persisted)}")

    for opportunity in persisted:
        print(
            opportunity.id,
            "|",
            opportunity.source_key,
            "|",
            opportunity.priority,
            "|",
            opportunity.title,
        )

finally:
    db.close()
