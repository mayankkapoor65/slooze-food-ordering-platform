"""
Strawberry GraphQL Output and Input Types.
"""
from typing import List, Optional
import strawberry
from sqlalchemy.orm import Session
from backend.app.models.schema import User, Restaurant, MenuItem, PaymentMethod, Order, OrderItem

@strawberry.type
class UserType:
    id: str
    name: str
    role: str
    country: str
    avatar_url: Optional[str]


@strawberry.type
class MenuItemType:
    id: int
    restaurant_id: int
    name: str
    category: str
    price: float
    currency: str
    description: Optional[str]
    dietary_tag: str
    image_url: Optional[str]


@strawberry.type
class RestaurantType:
    id: int
    name: str
    cuisine: str
    country: str
    rating: float
    delivery_time: str
    image_url: Optional[str]

    @strawberry.field
    def menu_items(self, info: strawberry.Info) -> List[MenuItemType]:
        db: Session = info.context.db
        return db.query(MenuItem).filter(MenuItem.restaurant_id == self.id).all()


@strawberry.type
class PaymentMethodType:
    id: int
    country: str
    method_type: str
    details: str


@strawberry.type
class OrderItemType:
    id: int
    menu_item_id: int
    quantity: int
    price: float

    @strawberry.field
    def menu_item(self, info: strawberry.Info) -> Optional[MenuItemType]:
        db: Session = info.context.db
        return db.query(MenuItem).filter(MenuItem.id == self.menu_item_id).first()


@strawberry.type
class OrderType:
    id: int
    user_id: str
    country: str
    status: str
    total_amount: float
    currency: str
    created_at: str
    payment_method_id: Optional[int]

    @strawberry.field
    def user(self, info: strawberry.Info) -> Optional[UserType]:
        db: Session = info.context.db
        return db.query(User).filter(User.id == self.user_id).first()

    @strawberry.field
    def payment_method(self, info: strawberry.Info) -> Optional[PaymentMethodType]:
        if not self.payment_method_id:
            return None
        db: Session = info.context.db
        return db.query(PaymentMethod).filter(PaymentMethod.id == self.payment_method_id).first()

    @strawberry.field
    def items(self, info: strawberry.Info) -> List[OrderItemType]:
        db: Session = info.context.db
        return db.query(OrderItem).filter(OrderItem.order_id == self.id).all()


@strawberry.type
class RegionalMetrics:
    country: str
    total_orders: int
    total_gmv: float
    currency: str
    active_restaurants: int


@strawberry.type
class AdminAnalyticsType:
    total_users: int
    total_orders: int
    total_pending: int
    total_paid: int
    total_cancelled: int
    regional_metrics: List[RegionalMetrics]


@strawberry.input
class OrderItemInput:
    menu_item_id: int
    quantity: int
