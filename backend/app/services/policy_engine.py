from decimal import Decimal

from sqlalchemy.orm import Session

from app.models import Policy


def get_merchant_policy(
    db: Session,
    merchant_id: int,
):
    return (
        db.query(Policy)
        .filter(Policy.merchant_id == merchant_id)
        .first()
    )


def check_automatic_recovery(
    db: Session,
    merchant_id: int,
):
    policy = get_merchant_policy(
        db,
        merchant_id,
    )

    if policy is None:
        return {
            "allowed": False,
            "reason": "No merchant policy found.",
        }

    if policy.automatic_recovery:
        return {
            "allowed": True,
            "reason": "Automatic recovery is enabled by merchant policy.",
        }

    return {
        "allowed": False,
        "reason": "Automatic recovery is disabled by merchant policy.",
    }

def check_automatic_messaging(
    db: Session,
    merchant_id: int,
):
    policy = get_merchant_policy(
        db,
        merchant_id,
    )

    if policy is None:
        return {
            "allowed": False,
            "reason": "No merchant policy found.",
        }

    if policy.automatic_messaging:
        return {
            "allowed": True,
            "reason": "Automatic messaging is enabled by merchant policy.",
        }

    return {
        "allowed": False,
        "reason": "Automatic messaging is disabled by merchant policy.",
    }

def check_discount_limit(
    db: Session,
    merchant_id: int,
    requested_discount_percent: Decimal,
):
    policy = get_merchant_policy(
        db,
        merchant_id,
    )

    if policy is None:
        return {
            "allowed": False,
            "reason": "No merchant policy found.",
        }

    if requested_discount_percent <= policy.max_discount_percent:
        return {
            "allowed": True,
            "reason": (
                f"Requested discount of "
                f"{requested_discount_percent}% is within "
                f"the merchant limit of "
                f"{policy.max_discount_percent}%."
            ),
        }

    return {
        "allowed": False,
        "reason": (
            f"Requested discount of "
            f"{requested_discount_percent}% exceeds "
            f"the merchant limit of "
            f"{policy.max_discount_percent}%."
        ),
    }

def check_campaign_budget(
    db: Session,
    merchant_id: int,
    requested_budget: Decimal,
):
    policy = get_merchant_policy(
        db,
        merchant_id,
    )

    if policy is None:
        return {
            "allowed": False,
            "requires_approval": False,
            "reason": "No merchant policy found.",
        }

    if requested_budget <= policy.campaign_limit:
        return {
            "allowed": True,
            "requires_approval": False,
            "reason": (
                f"Campaign budget of ₹{requested_budget:.2f} "
                f"is within the merchant limit of "
                f"₹{policy.campaign_limit:.2f}."
            ),
        }

    if policy.approval_above_limit:
        return {
            "allowed": False,
            "requires_approval": True,
            "reason": (
                f"Campaign budget of ₹{requested_budget:.2f} "
                f"exceeds the merchant limit of "
                f"₹{policy.campaign_limit:.2f}. "
                f"Merchant approval is required."
            ),
        }

    return {
        "allowed": False,
        "requires_approval": False,
        "reason": (
            f"Campaign budget of ₹{requested_budget:.2f} "
            f"exceeds the merchant limit of "
            f"₹{policy.campaign_limit:.2f}."
        ),
    }
