from datetime import datetime
from decimal import Decimal
from statistics import median

from sqlalchemy.orm import Session

from app.models import Benefit, Customer, Opportunity, Transaction
from app.services.notification_service import create_notification

def find_failed_payment_opportunity(
    db: Session,
    merchant_id: int,
):
    failed_transactions = (
        db.query(Transaction)
        .filter(
            Transaction.merchant_id == merchant_id,
            Transaction.status == "failed",
        )
        .all()
    )

    if not failed_transactions:
        return None

    total_value = sum(
        (transaction.amount for transaction in failed_transactions),
        Decimal("0.00"),
    )

    return {
        "opportunity_type": "failed_payment_recovery",
        "title": "Failed Payment Recovery",
        "description": (
            f"{len(failed_transactions)} failed payments "
            f"worth ₹{total_value} may be recoverable."
        ),
        "potential_value": total_value,
        "priority": "high",
        "failed_transaction_count": len(failed_transactions),
    }

def find_repeat_customer_opportunities(
    db: Session,
    merchant_id: int,
):
    customers = (
        db.query(Customer)
        .filter(Customer.merchant_id == merchant_id)
        .all()
    )

    opportunities = []

    for customer in customers:
        transactions = (
            db.query(Transaction)
            .filter(
                Transaction.merchant_id == merchant_id,
                Transaction.customer_id == customer.id,
                Transaction.status == "success",
            )
            .order_by(Transaction.created_at)
            .all()
        )

        if len(transactions) < 2:
            continue

        purchase_dates = [
            transaction.created_at
            for transaction in transactions
        ]

        intervals = [
            (
                purchase_dates[index] - purchase_dates[index - 1]
            ).total_seconds() / 86400
            for index in range(1, len(purchase_dates))
        ]

        intervals = [
            interval
            for interval in intervals
            if interval > 0
        ]

        if not intervals:
            continue

        expected_interval = median(intervals)

        last_purchase = purchase_dates[-1]
        days_since_last_purchase = (
            datetime.now() - last_purchase
        ).days

        days_overdue = (
            days_since_last_purchase - expected_interval
        )

        if days_overdue < 7:
            continue

        average_order_value = sum(
            (
                transaction.amount
                for transaction in transactions
            ),
            Decimal("0.00"),
        ) / len(transactions)

        opportunities.append(
            {
                "opportunity_type": "repeat_customer",
                "customer_id": customer.id,
                "customer_name": customer.name,
                "title": "Repeat Customer Opportunity",
                "description": (
                    f"{customer.name} usually purchases every "
                    f"{expected_interval:.0f} days and is now "
                    f"{days_overdue:.0f} days overdue."
                ),
                "expected_interval_days": expected_interval,
                "days_since_last_purchase": days_since_last_purchase,
                "days_overdue": days_overdue,
                "average_order_value": average_order_value,
                "priority": "medium",
            }
        )

    return opportunities


def find_sales_pattern_opportunity(
    db: Session,
    merchant_id: int,
):
    successful_transactions = (
        db.query(Transaction)
        .filter(
            Transaction.merchant_id == merchant_id,
            Transaction.status == "success",
        )
        .all()
    )

    if len(successful_transactions) < 10:
        return None

    day_sales = {}

    for transaction in successful_transactions:
        day = transaction.created_at.strftime("%A")

        if day not in day_sales:
            day_sales[day] = {
                "sales": Decimal("0.00"),
                "transactions": 0,
            }

        day_sales[day]["sales"] += transaction.amount
        day_sales[day]["transactions"] += 1

    if not day_sales:
        return None

    average_daily_sales = (
        sum(
            data["sales"]
            for data in day_sales.values()
        )
        / len(day_sales)
    )

    weakest_day = min(
        day_sales,
        key=lambda day: day_sales[day]["sales"],
    )

    weakest_sales = day_sales[weakest_day]["sales"]

    if average_daily_sales == 0:
        return None

    decline_percent = (
        (average_daily_sales - weakest_sales)
        / average_daily_sales
    ) * 100

    if decline_percent < 10:
        return None

    return {
        "opportunity_type": "sales_pattern",
        "title": "Sales Pattern Opportunity",
        "description": (
            f"{weakest_day} sales are "
            f"{decline_percent:.0f}% below the average "
            f"daily sales level."
        ),
        "potential_value": average_daily_sales - weakest_sales,
        "priority": "medium",
        "weakest_day": weakest_day,
        "weakest_day_sales": weakest_sales,
        "average_daily_sales": average_daily_sales,
        "decline_percent": decline_percent,
    }

def find_all_opportunities(
    db: Session,
    merchant_id: int,
):
    opportunities = []

    failed_payment = find_failed_payment_opportunity(
        db,
        merchant_id,
    )

    if failed_payment:
        opportunities.append(failed_payment)

    repeat_customers = find_repeat_customer_opportunities(
        db,
        merchant_id,
    )

    opportunities.extend(repeat_customers)

    sales_pattern = find_sales_pattern_opportunity(
        db,
        merchant_id,
    )

    if sales_pattern:
        opportunities.append(sales_pattern)

    benefit_opportunities = find_benefit_opportunities(
        db,
        merchant_id,
    )

    opportunities.extend(benefit_opportunities)


    # Calculate dynamic priority for every opportunity.
    opportunities = [
        calculate_priority_score(opportunity)
        for opportunity in opportunities
    ]

    # Highest score appears first.
    opportunities.sort(
        key=lambda opportunity: opportunity["priority_score"],
        reverse=True,
    )

    return opportunities

def calculate_priority_score(opportunity):
    potential_value = opportunity.get(
        "potential_value",
        Decimal("0.00"),
    )

    if potential_value is None:
        potential_value = Decimal("0.00")

    opportunity_type = opportunity.get(
        "opportunity_type"
    )

    # Impact score
    if potential_value >= Decimal("3000"):
        impact_score = 5
    elif potential_value >= Decimal("1000"):
        impact_score = 4
    elif potential_value >= Decimal("300"):
        impact_score = 3
    elif potential_value > Decimal("0"):
        impact_score = 2
    else:
        impact_score = 1

    # Urgency score
    if opportunity_type == "failed_payment_recovery":
        urgency_score = 5

    elif opportunity_type == "repeat_customer":
        days_overdue = opportunity.get(
            "days_overdue",
            0,
        )

        if days_overdue >= 21:
            urgency_score = 4
        elif days_overdue >= 14:
            urgency_score = 3
        else:
            urgency_score = 2

    elif opportunity_type == "sales_pattern":
        decline_percent = opportunity.get(
            "decline_percent",
            0,
        )

        if decline_percent >= 50:
            urgency_score = 4
        elif decline_percent >= 25:
            urgency_score = 3
        else:
            urgency_score = 2

    else:
        urgency_score = 1

    # Feasibility score
    # Current prototype assumes detected opportunities
    # have a possible action path.
    feasibility_score = 4

    total_score = (
        impact_score
        + urgency_score
        + feasibility_score
    )

    if total_score >= 12:
        priority = "high"
    elif total_score >= 9:
        priority = "medium"
    else:
        priority = "low"

    opportunity["priority_score"] = total_score
    opportunity["priority"] = priority

    return opportunity


def find_benefit_opportunities(
    db: Session,
    merchant_id: int,
):
    benefits = (
        db.query(Benefit)
        .filter(
            Benefit.merchant_id == merchant_id,
            Benefit.status == "eligible",
        )
        .all()
    )

    opportunities = []

    for benefit in benefits:
        value = benefit.value or Decimal("0.00")

        opportunities.append(
            {
                "opportunity_type": "merchant_benefit",
                "benefit_id": benefit.id,
                "title": "Merchant Benefit Opportunity",
                "description": (
                    f"{benefit.name} is available. "
                    f"Potential benefit value: ₹{value:.2f}."
                ),
                "benefit_name": benefit.name,
                "potential_value": value,
                "priority": "medium",
            }
        )

    return opportunities

def persist_opportunities(
    db: Session,
    merchant_id: int,
    opportunities: list[dict],
):
    persisted_opportunities = []
    new_opportunities = []

    for opportunity in opportunities:
        opportunity_type = opportunity["opportunity_type"]

        if opportunity_type == "failed_payment_recovery":
            source_key = "failed_payment_recovery"

        elif opportunity_type == "repeat_customer":
            source_key = (
                f"repeat_customer:"
                f"{opportunity['customer_id']}"
            )

        elif opportunity_type == "sales_pattern":
            source_key = "sales_pattern"

        elif opportunity_type == "merchant_benefit":
            source_key = (
                f"merchant_benefit:"
                f"{opportunity['benefit_id']}"
            )

        else:
            continue

        existing = (
            db.query(Opportunity)
            .filter(
                Opportunity.merchant_id == merchant_id,
                Opportunity.source_key == source_key,
            )
            .first()
        )

        if existing:
            existing.title = opportunity["title"]
            existing.description = opportunity["description"]
            existing.potential_value = opportunity.get(
                "potential_value"
            )
            existing.priority = opportunity["priority"]

            persisted_opportunities.append(existing)

        else:
            new_opportunity = Opportunity(
                merchant_id=merchant_id,
                opportunity_type=opportunity_type,
                source_key=source_key,
                title=opportunity["title"],
                description=opportunity["description"],
                potential_value=opportunity.get(
                    "potential_value"
                ),
                priority=opportunity["priority"],
                status="open",
            )

            db.add(new_opportunity)
            persisted_opportunities.append(new_opportunity)
            new_opportunities.append(new_opportunity)

    db.commit()

    for opportunity in persisted_opportunities:
        db.refresh(opportunity)

    # Create notifications only for genuinely new opportunities.
    for opportunity in new_opportunities:
        potential_value = opportunity.potential_value

        if potential_value is not None:
            message = (
                f"{opportunity.description} "
                f"Review the opportunity in Today’s Business."
            )
        else:
            message = (
                f"{opportunity.description} "
                f"Review the opportunity in Today’s Business."
            )

        create_notification(
            db=db,
            merchant_id=merchant_id,
            notification_type="opportunity",
            title=f"New Opportunity: {opportunity.title}",
            message=message,
        )

    return persisted_opportunities
