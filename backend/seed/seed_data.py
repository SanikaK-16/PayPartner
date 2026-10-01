import sys
from pathlib import Path

sys.path.append(str(Path(__file__).resolve().parents[1]))

from datetime import datetime, timedelta
from decimal import Decimal

from app.database import Base, SessionLocal, engine
from app.models import (
    Action,
    AuditLog,
    Benefit,
    Customer,
    Merchant,
    Opportunity,
    Policy,
    Product,
    Transaction,
    Verification,
)

def seed_merchant():
    db = SessionLocal()

    try:
        merchant = (
            db.query(Merchant)
            .filter(Merchant.name == "Ramesh General Store")
            .first()
        )

        if merchant:
            print(f"Merchant already exists: {merchant.id} - {merchant.name}")
            return merchant.id

        merchant = Merchant(
            name="Ramesh General Store",
            business_type="Grocery",
            city="Pune",
        )

        db.add(merchant)
        db.commit()
        db.refresh(merchant)

        print(f"Merchant created: {merchant.id} - {merchant.name}")
        return merchant.id

    finally:
        db.close()

def seed_policy(merchant_id: int):
    db = SessionLocal()

    try:
        existing_policy = (
            db.query(Policy)
            .filter(Policy.merchant_id == merchant_id)
            .first()
        )

        if existing_policy:
            print(f"Policy already exists for merchant: {merchant_id}")
            return

        policy = Policy(
            merchant_id=merchant_id,
            automatic_recovery=True,
            automatic_messaging=True,
            max_discount_percent=Decimal("10.00"),
            campaign_limit=Decimal("1000.00"),
            approval_above_limit=True,
        )

        db.add(policy)
        db.commit()

        print(f"Policy created for merchant: {merchant_id}")

    finally:
        db.close()


def seed_benefits(merchant_id):
    db = SessionLocal()

    existing_benefits = (
        db.query(Benefit)
        .filter(Benefit.merchant_id == merchant_id)
        .count()
    )

    if existing_benefits > 0:
        print(f"Benefits already exist for merchant: {merchant_id}")
        db.close()
        return

    benefits = [
        Benefit(
            merchant_id=merchant_id,
            name="Merchant Growth Bonus",
            description=(
                "Eligible merchants can receive a ₹500 growth benefit."
            ),
            benefit_type="cash_benefit",
            value=Decimal("500.00"),
            status="eligible",
        ),
        Benefit(
            merchant_id=merchant_id,
            name="Digital Payment Incentive",
            description=(
                "Eligible merchants can receive a ₹300 digital payment incentive."
            ),
            benefit_type="incentive",
            value=Decimal("300.00"),
            status="eligible",
        ),
        Benefit(
            merchant_id=merchant_id,
            name="Already Used Benefit",
            description=(
                "This merchant benefit has already been claimed."
            ),
            benefit_type="cash_benefit",
            value=Decimal("250.00"),
            status="claimed",
        ),
    ]

    db.add_all(benefits)
    db.commit()

    print(f"Benefits created: {len(benefits)}")
    db.close()


def seed_products(merchant_id: int):
    db = SessionLocal()

    try:
        existing_count = (
            db.query(Product)
            .filter(Product.merchant_id == merchant_id)
            .count()
        )

        if existing_count > 0:
            print(f"Products already exist for merchant: {merchant_id}")
            return

        products = [
            Product(
                merchant_id=merchant_id,
                name="Aashirvaad Atta 5kg",
                category="Staples",
            ),
            Product(
                merchant_id=merchant_id,
                name="Tata Salt 1kg",
                category="Staples",
            ),
            Product(
                merchant_id=merchant_id,
                name="Amul Milk 1L",
                category="Dairy",
            ),
            Product(
                merchant_id=merchant_id,
                name="Parle-G Biscuits",
                category="Snacks",
            ),
            Product(
                merchant_id=merchant_id,
                name="Coca-Cola 750ml",
                category="Beverages",
            ),
            Product(
                merchant_id=merchant_id,
                name="Maggi 2-Minute Noodles",
                category="Snacks",
            ),
        ]

        db.add_all(products)
        db.commit()

        print(f"Products created: {len(products)}")

    finally:
        db.close()

def seed_customers(merchant_id: int):
    db = SessionLocal()

    try:
        existing_count = (
            db.query(Customer)
            .filter(Customer.merchant_id == merchant_id)
            .count()
        )

        if existing_count > 0:
            print(f"Customers already exist for merchant: {merchant_id}")
            return

        customers = [
            Customer(
                merchant_id=merchant_id,
                name="Amit Sharma",
                phone="9876543210",
            ),
            Customer(
                merchant_id=merchant_id,
                name="Priya Patil",
                phone="9876543211",
            ),
            Customer(
                merchant_id=merchant_id,
                name="Rahul Joshi",
                phone="9876543212",
            ),
            Customer(
                merchant_id=merchant_id,
                name="Sneha Kulkarni",
                phone="9876543213",
            ),
            Customer(
                merchant_id=merchant_id,
                name="Vikas Deshmukh",
                phone="9876543214",
            ),
            Customer(
                merchant_id=merchant_id,
                name="Neha Shah",
                phone="9876543215",
            ),
            Customer(
                merchant_id=merchant_id,
                name="Rohan Mehta",
                phone="9876543216",
            ),
            Customer(
                merchant_id=merchant_id,
                name="Pooja More",
                phone="9876543217",
            ),
            Customer(
                merchant_id=merchant_id,
                name="Kunal Gupta",
                phone="9876543218",
            ),
            Customer(
                merchant_id=merchant_id,
                name="Meera Joshi",
                phone="9876543219",
            ),
        ]

        db.add_all(customers)
        db.commit()

        print(f"Customers created: {len(customers)}")

    finally:
        db.close()

def seed_transactions(merchant_id: int):
    db = SessionLocal()

    try:
        existing_count = (
            db.query(Transaction)
            .filter(Transaction.merchant_id == merchant_id)
            .count()
        )

        if existing_count > 0:
            print(f"Transactions already exist for merchant: {merchant_id}")
            return

        # Product IDs for merchant 1 will be resolved dynamically below.
        products = (
            db.query(Product)
            .filter(Product.merchant_id == merchant_id)
            .order_by(Product.id)
            .all()
        )

        customers = (
            db.query(Customer)
            .filter(Customer.merchant_id == merchant_id)
            .order_by(Customer.id)
            .all()
        )

        if len(products) < 6 or len(customers) < 10:
            raise ValueError(
                "Required products or customers are missing before seeding transactions."
            )

        product_map = {product.name: product.id for product in products}
        customer_map = {customer.name: customer.id for customer in customers}

        now = datetime.now()

        transactions = []

        # Historical successful transactions.
        historical_data = [
            ("Amit Sharma", "Aashirvaad Atta 5kg", 320, 25),
            ("Amit Sharma", "Tata Salt 1kg", 45, 22),
            ("Amit Sharma", "Amul Milk 1L", 62, 18),
            ("Priya Patil", "Parle-G Biscuits", 30, 21),
            ("Priya Patil", "Maggi 2-Minute Noodles", 72, 17),
            ("Priya Patil", "Coca-Cola 750ml", 45, 14),
            ("Rahul Joshi", "Aashirvaad Atta 5kg", 320, 20),
            ("Rahul Joshi", "Amul Milk 1L", 62, 16),
            ("Rahul Joshi", "Parle-G Biscuits", 30, 12),
            ("Sneha Kulkarni", "Tata Salt 1kg", 45, 19),
            ("Sneha Kulkarni", "Aashirvaad Atta 5kg", 320, 15),
            ("Vikas Deshmukh", "Coca-Cola 750ml", 45, 16),
            ("Vikas Deshmukh", "Maggi 2-Minute Noodles", 72, 11),
            ("Neha Shah", "Amul Milk 1L", 62, 13),
            ("Neha Shah", "Parle-G Biscuits", 30, 10),
            ("Rohan Mehta", "Aashirvaad Atta 5kg", 320, 51),
            ("Pooja More", "Tata Salt 1kg", 45, 56),
            ("Kunal Gupta", "Coca-Cola 750ml", 45, 7),
            ("Meera Joshi", "Maggi 2-Minute Noodles", 72, 6),
        ]

        for customer_name, product_name, amount, days_ago in historical_data:
            transactions.append(
                Transaction(
                    merchant_id=merchant_id,
                    customer_id=customer_map[customer_name],
                    product_id=product_map[product_name],
                    amount=Decimal(str(amount)),
                    status="success",
                    payment_method="UPI",
                    created_at=now - timedelta(
                        days=days_ago,
                        hours=(len(transactions) * 3) % 12,
                    ),
                )
            )

        # Recent successful transactions.
        recent_data = [
            ("Amit Sharma", "Aashirvaad Atta 5kg", 320, 2),
            ("Priya Patil", "Parle-G Biscuits", 30, 2),
            ("Rahul Joshi", "Amul Milk 1L", 62, 3),
            ("Sneha Kulkarni", "Tata Salt 1kg", 45, 4),
            ("Vikas Deshmukh", "Coca-Cola 750ml", 45, 5),
            ("Neha Shah", "Amul Milk 1L", 62, 6),
            ("Rohan Mehta", "Aashirvaad Atta 5kg", 320, 34),
            ("Pooja More", "Tata Salt 1kg", 45, 39),
        ]

        for customer_name, product_name, amount, days_ago in recent_data:
            transactions.append(
                Transaction(
                    merchant_id=merchant_id,
                    customer_id=customer_map[customer_name],
                    product_id=product_map[product_name],
                    amount=Decimal(str(amount)),
                    status="success",
                    payment_method="UPI",
                    created_at=now - timedelta(
                        days=days_ago,
                        hours=(len(transactions) * 3) % 12,
                    ),
                )
            )

        # Failed payments — deliberately included for the recovery workflow.
        failed_payments = [
            250, 180, 320, 150, 275, 200, 300, 175, 225,
            150, 250, 180, 275, 200, 150, 300, 620
        ]

        failed_customers = [
            "Amit Sharma",
            "Priya Patil",
            "Rahul Joshi",
            "Sneha Kulkarni",
            "Vikas Deshmukh",
            "Neha Shah",
            "Rohan Mehta",
            "Pooja More",
            "Kunal Gupta",
            "Meera Joshi",
            "Amit Sharma",
            "Priya Patil",
            "Rahul Joshi",
            "Sneha Kulkarni",
            "Vikas Deshmukh",
            "Neha Shah",
            "Rohan Mehta",
        ]

        failed_products = [
            "Aashirvaad Atta 5kg",
            "Tata Salt 1kg",
            "Amul Milk 1L",
            "Parle-G Biscuits",
            "Coca-Cola 750ml",
            "Maggi 2-Minute Noodles",
            "Aashirvaad Atta 5kg",
            "Tata Salt 1kg",
            "Amul Milk 1L",
            "Parle-G Biscuits",
            "Coca-Cola 750ml",
            "Maggi 2-Minute Noodles",
            "Aashirvaad Atta 5kg",
            "Tata Salt 1kg",
            "Amul Milk 1L",
            "Parle-G Biscuits",
            "Coca-Cola 750ml",
        ]

        for index, amount in enumerate(failed_payments):
            transactions.append(
                Transaction(
                    merchant_id=merchant_id,
                    customer_id=customer_map[failed_customers[index]],
                    product_id=product_map[failed_products[index]],
                    amount=Decimal(str(amount)),
                    status="failed",
                    payment_method="UPI",
                    created_at=now - timedelta(hours=index + 1),
                )
            )

        db.add_all(transactions)
        db.commit()

        print(f"Transactions created: {len(transactions)}")

    finally:
        db.close()


if __name__ == "__main__":
    merchant_id = seed_merchant()
    seed_policy(merchant_id)
    seed_benefits(merchant_id)
    seed_products(merchant_id)
    seed_customers(merchant_id)
    seed_transactions(merchant_id)
