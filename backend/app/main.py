from fastapi import FastAPI

from app.database import Base, engine

from app.models import (
    Merchant,
    Transaction,
    Customer,
    Product,
    Benefit,
    Policy,
    Opportunity,
    Action,
    Verification,
    AuditLog,
    Notification,
)

from app.api.opportunities import router as opportunities_router
from app.api.actions import router as actions_router
from app.api.verification import router as verification_router
from app.api.replanning import router as replanning_router
from app.api.ask import router as ask_router
from app.api.activity import router as activity_router
from app.api.overview import router as overview_router
from app.api.transactions import router as transactions_router
from app.api.customers import router as customers_router
from app.api.policies import router as policies_router
from app.api.notifications import router as notifications_router

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="PayPartner Backend",
    description="Backend API for PayPartner - Autonomous AI Business Partner for Paytm Merchants",
    version="0.1.0",
)

app.include_router(opportunities_router)
app.include_router(actions_router)
app.include_router(verification_router)
app.include_router(replanning_router)
app.include_router(ask_router)
app.include_router(activity_router)
app.include_router(overview_router)
app.include_router(transactions_router)
app.include_router(customers_router)
app.include_router(policies_router)
app.include_router(notifications_router)

@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "PayPartner Backend",
    }
