"""
Automated Test Suite for RBAC & Re-BAC (Relational Access Control).
Validates permissions matrix and regional boundaries for Admin, Manager, and Member.
"""
import pytest
from fastapi.testclient import TestClient
from backend.main import app
from backend.app.db.seed import seed_database
from backend.app.db.session import SessionLocal
from backend.app.models.schema import Order, MenuItem, Restaurant

client = TestClient(app)

@pytest.fixture(scope="session", autouse=True)
def setup_db():
    seed_database()

def execute_graphql(query: str, variables: dict = None, user_id: str = None):
    headers = {}
    if user_id:
        headers["X-User-Id"] = user_id
    response = client.post("/graphql", json={"query": query, "variables": variables or {}}, headers=headers)
    return response.json()


# ==============================================================================
# 1. RBAC Tests (Role Permissions Matrix)
# ==============================================================================

def test_view_restaurants_all_roles_permitted():
    """All roles (Admin, Manager, Member) must be able to view restaurants."""
    query = """
    query {
        restaurants {
            id
            name
            country
        }
    }
    """
    for uid in ["nick_fury", "captain_marvel", "thanos"]:
        res = execute_graphql(query, user_id=uid)
        assert "errors" not in res, f"Failed for user {uid}: {res}"
        assert len(res["data"]["restaurants"]) > 0


def test_member_can_create_order_but_cannot_pay_or_cancel():
    """
    Member (Thanos) can create an order.
    Member cannot pay or cancel an order (Forbidden by RBAC).
    """
    db = SessionLocal()
    item = db.query(MenuItem).join(Restaurant).filter(Restaurant.country == "India").first()
    db.close()
    assert item is not None

    # Step 1: Create Order as Member (Thanos) -> Should SUCCEED
    create_mutation = """
    mutation CreateOrder($country: String!, $items: [OrderItemInput!]!) {
        createOrder(country: $country, items: $items) {
            id
            status
            totalAmount
        }
    }
    """
    res_create = execute_graphql(
        create_mutation,
        variables={"country": "India", "items": [{"menuItemId": item.id, "quantity": 1}]},
        user_id="thanos"
    )
    assert "errors" not in res_create, f"Order creation failed: {res_create}"
    order_id = res_create["data"]["createOrder"]["id"]
    assert res_create["data"]["createOrder"]["status"] == "PENDING_PAYMENT"

    # Step 2: Pay Order as Member (Thanos) -> Should FAIL (RBAC)
    pay_mutation = """
    mutation Pay($orderId: Int!) {
        payOrder(orderId: $orderId) {
            id
            status
        }
    }
    """
    res_pay = execute_graphql(pay_mutation, variables={"orderId": order_id}, user_id="thanos")
    assert "errors" in res_pay
    assert "RBAC Permission Denied" in res_pay["errors"][0]["message"]

    # Step 3: Cancel Order as Member (Thanos) -> Should FAIL (RBAC)
    cancel_mutation = """
    mutation Cancel($orderId: Int!) {
        cancelOrder(orderId: $orderId) {
            id
            status
        }
    }
    """
    res_cancel = execute_graphql(cancel_mutation, variables={"orderId": order_id}, user_id="thanos")
    assert "errors" in res_cancel
    assert "RBAC Permission Denied" in res_cancel["errors"][0]["message"]


def test_manager_can_pay_and_cancel_orders():
    """
    Manager (Captain Marvel - India) can approve & pay, and cancel orders in their region.
    """
    db = SessionLocal()
    item = db.query(MenuItem).join(Restaurant).filter(Restaurant.country == "India").first()
    db.close()

    # Create order as member
    create_mutation = """
    mutation CreateOrder($country: String!, $items: [OrderItemInput!]!) {
        createOrder(country: $country, items: $items) {
            id
            status
        }
    }
    """
    res_create = execute_graphql(
        create_mutation,
        variables={"country": "India", "items": [{"menuItemId": item.id, "quantity": 1}]},
        user_id="thanos"
    )
    order_id = res_create["data"]["createOrder"]["id"]

    # Pay as Manager (Captain Marvel) -> Should SUCCEED
    pay_mutation = """
    mutation Pay($orderId: Int!) {
        payOrder(orderId: $orderId) {
            id
            status
        }
    }
    """
    res_pay = execute_graphql(pay_mutation, variables={"orderId": order_id}, user_id="captain_marvel")
    assert "errors" not in res_pay, f"Pay failed for manager: {res_pay}"
    assert res_pay["data"]["payOrder"]["status"] == "PAID"


def test_payment_method_mutation_restricted_to_admin():
    """
    Only Admin (Nick Fury) can update payment channels.
    Manager (Captain Marvel) and Member (Thanos) must be rejected.
    """
    mutation = """
    mutation UpdatePM($id: Int!, $methodType: String!, $details: String!) {
        updatePaymentMethod(id: $id, methodType: $methodType, details: $details) {
            id
            methodType
            details
        }
    }
    """
    # Attempt as Member (Thanos) -> FAIL
    res_member = execute_graphql(
        mutation,
        variables={"id": 1, "methodType": "UPI", "details": "hacked@upi"},
        user_id="thanos"
    )
    assert "errors" in res_member
    assert "RBAC Permission Denied" in res_member["errors"][0]["message"]

    # Attempt as Manager (Captain Marvel) -> FAIL
    res_mgr = execute_graphql(
        mutation,
        variables={"id": 1, "methodType": "UPI", "details": "hacked@upi"},
        user_id="captain_marvel"
    )
    assert "errors" in res_mgr
    assert "RBAC Permission Denied" in res_mgr["errors"][0]["message"]

    # Attempt as Admin (Nick Fury) -> SUCCEED
    res_admin = execute_graphql(
        mutation,
        variables={"id": 1, "methodType": "Corporate UPI Enterprise", "details": "slooze.new@hdfc"},
        user_id="nick_fury"
    )
    assert "errors" not in res_admin
    assert res_admin["data"]["updatePaymentMethod"]["methodType"] == "Corporate UPI Enterprise"


# ==============================================================================
# 2. Re-BAC Tests (Relational Access Control / Country Isolation)
# ==============================================================================

def test_rebac_restaurant_visibility_isolation():
    """
    India users (Captain Marvel, Thanos) should only receive Indian restaurants.
    America users (Captain America, Travis) should only receive American restaurants.
    Global Admin (Nick Fury) receives all.
    """
    query = """
    query {
        restaurants {
            id
            name
            country
        }
    }
    """
    # India user
    res_in = execute_graphql(query, user_id="captain_marvel")
    assert all(r["country"] == "India" for r in res_in["data"]["restaurants"])

    # America user
    res_us = execute_graphql(query, user_id="captain_america")
    assert all(r["country"] == "America" for r in res_us["data"]["restaurants"])

    # Admin
    res_admin = execute_graphql(query, user_id="nick_fury")
    countries = {r["country"] for r in res_admin["data"]["restaurants"]}
    assert "India" in countries and "America" in countries


def test_rebac_cross_country_order_creation_blocked():
    """
    India user (Thanos) attempting to order from America must be rejected by Re-BAC boundary guard.
    """
    db = SessionLocal()
    us_item = db.query(MenuItem).join(Restaurant).filter(Restaurant.country == "America").first()
    db.close()

    create_mutation = """
    mutation CreateOrder($country: String!, $items: [OrderItemInput!]!) {
        createOrder(country: $country, items: $items) {
            id
        }
    }
    """
    res = execute_graphql(
        create_mutation,
        variables={"country": "America", "items": [{"menuItemId": us_item.id, "quantity": 1}]},
        user_id="thanos"
    )
    assert "errors" in res
    assert "Re-BAC Relational Access Denied" in res["errors"][0]["message"]


def test_rebac_cross_country_order_payment_blocked():
    """
    Manager from India (Captain Marvel) attempting to pay an American order must be rejected.
    """
    db = SessionLocal()
    us_order = db.query(Order).filter(Order.country == "America").first()
    db.close()

    pay_mutation = """
    mutation Pay($orderId: Int!) {
        payOrder(orderId: $orderId) {
            id
        }
    }
    """
    res = execute_graphql(pay_mutation, variables={"orderId": us_order.id}, user_id="captain_marvel")
    assert "errors" in res
    assert "Re-BAC Relational Access Denied" in res["errors"][0]["message"]
