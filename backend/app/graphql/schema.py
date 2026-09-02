"""
Strawberry GraphQL Schema: Queries, Mutations, and Authorization Resolvers.
"""
import datetime
from typing import List, Optional
import strawberry
from sqlalchemy.orm import Session
from sqlalchemy import func

from backend.app.core.config import (
    ROLE_ADMIN,
    ROLE_MANAGER,
    ROLE_MEMBER,
    ORDER_MANAGERS,
    COUNTRY_GLOBAL
)
from backend.app.core.security import verify_rbac, verify_rebac, is_in_user_country_scope
from backend.app.models.schema import User, Restaurant, MenuItem, PaymentMethod, Order, OrderItem
from backend.app.graphql.types import (
    UserType,
    RestaurantType,
    MenuItemType,
    PaymentMethodType,
    OrderType,
    OrderItemInput,
    AdminAnalyticsType,
    RegionalMetrics
)

@strawberry.type
class Query:
    @strawberry.field
    def me(self, info: strawberry.Info) -> UserType:
        """Returns the profile of the currently active persona."""
        user = info.context.current_user
        if not user:
            raise Exception("Authentication required. Please provide a valid 'X-User-Id' header.")
        return user

    @strawberry.field
    def users(self, info: strawberry.Info) -> List[UserType]:
        """Returns all available user personas for authentication switching."""
        db: Session = info.context.db
        return db.query(User).all()

    @strawberry.field
    def restaurants(self, info: strawberry.Info, search: Optional[str] = None) -> List[RestaurantType]:
        """
        Fetches restaurants filtered by Re-BAC country boundaries.
        - Global Admin sees all.
        - Regional Managers & Members see restaurants in their assigned country only.
        """
        user = info.context.current_user
        if not user:
            raise Exception("Authentication required. Please send 'X-User-Id' header.")
        
        db: Session = info.context.db
        query = db.query(Restaurant)
        
        # Enforce Re-BAC Regional Isolation
        if user.role != ROLE_ADMIN and user.country != COUNTRY_GLOBAL:
            query = query.filter(Restaurant.country == user.country)

        if search:
            search_term = f"%{search.strip()}%"
            query = query.filter(
                (Restaurant.name.ilike(search_term)) | (Restaurant.cuisine.ilike(search_term))
            )

        return query.all()

    @strawberry.field
    def restaurant(self, info: strawberry.Info, id: int) -> RestaurantType:
        """Fetches a specific restaurant with Re-BAC check."""
        user = info.context.current_user
        if not user:
            raise Exception("Authentication required.")
        
        db: Session = info.context.db
        resto = db.query(Restaurant).filter(Restaurant.id == id).first()
        if not resto:
            raise Exception(f"Restaurant with ID {id} was not found.")

        # Re-BAC boundary check
        verify_rebac(user, resto.country)
        return resto

    @strawberry.field
    def orders(self, info: strawberry.Info, status_filter: Optional[str] = None) -> List[OrderType]:
        """
        Fetches orders filtered by Re-BAC country boundaries.
        """
        user = info.context.current_user
        if not user:
            raise Exception("Authentication required.")

        db: Session = info.context.db
        query = db.query(Order)

        # Enforce Re-BAC: Managers and Members only see their country's orders
        if user.role != ROLE_ADMIN and user.country != COUNTRY_GLOBAL:
            query = query.filter(Order.country == user.country)

        if status_filter:
            query = query.filter(Order.status == status_filter)

        return query.order_by(Order.created_at.desc()).all()

    @strawberry.field
    def payment_methods(self, info: strawberry.Info) -> List[PaymentMethodType]:
        """
        Fetches configured payment methods for the user's regional scope.
        """
        user = info.context.current_user
        if not user:
            raise Exception("Authentication required.")

        db: Session = info.context.db
        query = db.query(PaymentMethod)

        if user.role != ROLE_ADMIN and user.country != COUNTRY_GLOBAL:
            query = query.filter(PaymentMethod.country == user.country)

        return query.all()

    @strawberry.field
    def admin_analytics(self, info: strawberry.Info) -> AdminAnalyticsType:
        """
        Executive analytics dashboard summary (Admin Only).
        """
        user = info.context.current_user
        verify_rbac(user, [ROLE_ADMIN], action="view executive analytics")

        db: Session = info.context.db
        total_users = db.query(User).count()
        total_orders = db.query(Order).count()
        total_pending = db.query(Order).filter(Order.status == "PENDING_PAYMENT").count()
        total_paid = db.query(Order).filter(Order.status == "PAID").count()
        total_cancelled = db.query(Order).filter(Order.status == "CANCELLED").count()

        # Regional Breakdown
        regional_stats = []
        for country, currency in [("India", "INR"), ("America", "USD")]:
            cnt = db.query(Order).filter(Order.country == country).count()
            gmv = db.query(func.sum(Order.total_amount)).filter(
                Order.country == country,
                Order.status == "PAID"
            ).scalar() or 0.0
            resto_cnt = db.query(Restaurant).filter(Restaurant.country == country).count()
            regional_stats.append(
                RegionalMetrics(
                    country=country,
                    total_orders=cnt,
                    total_gmv=round(float(gmv), 2),
                    currency=currency,
                    active_restaurants=resto_cnt
                )
            )

        return AdminAnalyticsType(
            total_users=total_users,
            total_orders=total_orders,
            total_pending=total_pending,
            total_paid=total_paid,
            total_cancelled=total_cancelled,
            regional_metrics=regional_stats
        )


@strawberry.type
class Mutation:
    @strawberry.mutation
    def create_order(self, info: strawberry.Info, country: str, items: List[OrderItemInput]) -> OrderType:
        """
        Creates a new food order in PENDING_PAYMENT status.
        RBAC: All roles (Admin, Manager, Member) can create orders.
        Re-BAC: Users can only create orders for restaurants within their assigned country.
        """
        user = info.context.current_user
        if not user:
            raise Exception("Authentication required.")

        # Re-BAC validation: Country must match user's assigned country
        verify_rebac(user, country)

        if not items:
            raise Exception("An order must contain at least one menu item.")

        db: Session = info.context.db
        total_amount = 0.0
        currency = None
        order_items_to_create = []

        for item_input in items:
            menu_item = db.query(MenuItem).filter(MenuItem.id == item_input.menu_item_id).first()
            if not menu_item:
                raise Exception(f"Item ID {item_input.menu_item_id} does not exist.")

            # Validate menu item belongs to restaurant in the requested country
            restaurant = db.query(Restaurant).filter(Restaurant.id == menu_item.restaurant_id).first()
            if not restaurant or restaurant.country.lower() != country.lower():
                raise Exception(
                    f"Cross-region item conflict: '{menu_item.name}' belongs to {restaurant.country if restaurant else 'Unknown'}, not {country}."
                )

            if currency is None:
                currency = menu_item.currency
            elif currency != menu_item.currency:
                raise Exception("Mixed currency items cannot be combined in one order.")

            item_subtotal = menu_item.price * item_input.quantity
            total_amount += item_subtotal

            order_items_to_create.append(
                OrderItem(
                    menu_item_id=menu_item.id,
                    quantity=item_input.quantity,
                    price=menu_item.price
                )
            )

        now = datetime.datetime.now(datetime.timezone.utc).isoformat()
        new_order = Order(
            user_id=user.id,
            country=country,
            status="PENDING_PAYMENT",
            total_amount=round(total_amount, 2),
            currency=currency or "USD",
            created_at=now,
            items=order_items_to_create
        )

        db.add(new_order)
        db.commit()
        db.refresh(new_order)
        return new_order

    @strawberry.mutation
    def pay_order(self, info: strawberry.Info, order_id: int) -> OrderType:
        """
        Approves and marks an order as PAID using the region's configured payment method.
        RBAC: Admin & Manager Only (Members cannot checkout/pay).
        Re-BAC: Order must belong to the Manager's assigned country.
        """
        user = info.context.current_user
        # RBAC Check: Only Admin and Manager
        verify_rbac(user, ORDER_MANAGERS, action="checkout & pay for order")

        db: Session = info.context.db
        order = db.query(Order).filter(Order.id == order_id).first()
        if not order:
            raise Exception(f"Order #{order_id} not found.")

        # Re-BAC Check
        verify_rebac(user, order.country)

        if order.status != "PENDING_PAYMENT":
            raise Exception(f"Order #{order_id} cannot be paid because its current status is '{order.status}'.")

        payment_method = db.query(PaymentMethod).filter(PaymentMethod.country == order.country).first()
        if not payment_method:
            raise Exception(f"No corporate payment method is registered for {order.country}. Contact the Administrator.")

        order.status = "PAID"
        order.payment_method_id = payment_method.id
        db.commit()
        db.refresh(order)
        return order

    @strawberry.mutation
    def cancel_order(self, info: strawberry.Info, order_id: int) -> OrderType:
        """
        Cancels an existing order.
        RBAC: Admin & Manager Only (Members cannot cancel orders).
        Re-BAC: Order must belong to the Manager's assigned country.
        """
        user = info.context.current_user
        # RBAC Check: Only Admin and Manager
        verify_rbac(user, ORDER_MANAGERS, action="cancel order")

        db: Session = info.context.db
        order = db.query(Order).filter(Order.id == order_id).first()
        if not order:
            raise Exception(f"Order #{order_id} not found.")

        # Re-BAC Check
        verify_rebac(user, order.country)

        if order.status == "CANCELLED":
            raise Exception(f"Order #{order_id} is already cancelled.")

        order.status = "CANCELLED"
        db.commit()
        db.refresh(order)
        return order

    @strawberry.mutation
    def update_payment_method(self, info: strawberry.Info, id: int, method_type: str, details: str) -> PaymentMethodType:
        """
        Updates corporate payment channel configuration.
        RBAC: Admin Only (Managers & Members are forbidden).
        """
        user = info.context.current_user
        # RBAC Check: Exclusively ADMIN
        verify_rbac(user, [ROLE_ADMIN], action="update corporate payment method")

        db: Session = info.context.db
        pm = db.query(PaymentMethod).filter(PaymentMethod.id == id).first()
        if not pm:
            raise Exception(f"Payment Method #{id} not found.")

        pm.method_type = method_type.strip()
        pm.details = details.strip()
        db.commit()
        db.refresh(pm)
        return pm


schema = strawberry.Schema(query=Query, mutation=Mutation)
