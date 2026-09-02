"""
Database Seeder for Slooze Full-Stack Application.
Populates standard employee personas, regional restaurants, menu items, payment channels, and initial orders.
"""
import datetime
from backend.app.db.session import SessionLocal, init_tables
from backend.app.models.schema import User, Restaurant, MenuItem, PaymentMethod, Order, OrderItem

def seed_database():
    init_tables()
    db = SessionLocal()
    try:
        # Only seed if no users exist
        if db.query(User).count() > 0:
            print("Database already contains data. Skipping seeding.")
            return

        print("--> Populating fresh seed dataset for Slooze Food Ordering...")

        # 1. Employee Personas (Matching Problem Statement Requirements)
        users = [
            User(
                id="nick_fury",
                name="Nick Fury",
                role="ADMIN",
                country="Global",
                avatar_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop"
            ),
            User(
                id="captain_marvel",
                name="Captain Marvel",
                role="MANAGER",
                country="India",
                avatar_url="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop"
            ),
            User(
                id="captain_america",
                name="Captain America",
                role="MANAGER",
                country="America",
                avatar_url="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop"
            ),
            User(
                id="thanos",
                name="Thanos",
                role="MEMBER",
                country="India",
                avatar_url="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop"
            ),
            User(
                id="thor",
                name="Thor",
                role="MEMBER",
                country="India",
                avatar_url="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop"
            ),
            User(
                id="travis",
                name="Travis",
                role="MEMBER",
                country="America",
                avatar_url="https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop"
            ),
        ]
        db.add_all(users)
        db.commit()

        # 2. Regional Restaurants
        # India Restaurants
        r_in_1 = Restaurant(
            name="The Spice Pavilion",
            cuisine="Awadhi & Mughlai Specialties",
            country="India",
            rating=4.9,
            delivery_time="20-30 min",
            image_url="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop"
        )
        r_in_2 = Restaurant(
            name="Dakshin Coastal Kitchen",
            cuisine="South Indian & Chettinad",
            country="India",
            rating=4.7,
            delivery_time="25-35 min",
            image_url="https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=800&auto=format&fit=crop"
        )

        # America Restaurants
        r_us_1 = Restaurant(
            name="Gotham Smokehouse & Grill",
            cuisine="Artisanal Burgers & BBQ",
            country="America",
            rating=4.8,
            delivery_time="15-25 min",
            image_url="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop"
        )
        r_us_2 = Restaurant(
            name="Liberty Slice Pizzeria",
            cuisine="Wood-Fired Neapolitan & Pasta",
            country="America",
            rating=4.9,
            delivery_time="20-30 min",
            image_url="https://images.unsplash.com/photo-1579684947550-22e945225d9a?w=800&auto=format&fit=crop"
        )

        db.add_all([r_in_1, r_in_2, r_us_1, r_us_2])
        db.commit()

        # 3. Menu Items
        # Menu for The Spice Pavilion (India)
        items_spice_pavilion = [
            MenuItem(
                restaurant_id=r_in_1.id,
                name="Dum Pukht Chicken Biryani",
                category="Rice Specialties",
                price=380.0,
                currency="INR",
                dietary_tag="NON_VEG",
                description="Fragrant long-grain aged basmati layered with tender chicken, saffron, and slow-cooked in a sealed clay handi.",
                image_url="https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=500&auto=format&fit=crop"
            ),
            MenuItem(
                restaurant_id=r_in_1.id,
                name="Tandoori Malai Paneer Tikka",
                category="Starters",
                price=290.0,
                currency="INR",
                dietary_tag="VEG",
                description="Charcoal-smoked cottage cheese cubes marinated with cream, cardamom, and gentle green herbs.",
                image_url="https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?w=500&auto=format&fit=crop"
            ),
            MenuItem(
                restaurant_id=r_in_1.id,
                name="Butter Garlic Naan",
                category="Breads",
                price=85.0,
                currency="INR",
                dietary_tag="VEG",
                description="Fluffy tandoor-baked flatbread infused with minced garlic and brushed with melted clarified butter.",
                image_url="https://images.unsplash.com/photo-1601050690597-df056fb4ce78?w=500&auto=format&fit=crop"
            ),
            MenuItem(
                restaurant_id=r_in_1.id,
                name="Kesar Mango Lassi",
                category="Beverages",
                price=140.0,
                currency="INR",
                dietary_tag="VEG",
                description="Thick churned artisan yogurt with Alphonso mango reduction, garnished with pistachios and saffron strands.",
                image_url="https://images.unsplash.com/photo-1546173159-315724a31696?w=500&auto=format&fit=crop"
            ),
        ]

        # Menu for Dakshin Coastal Kitchen (India)
        items_dakshin = [
            MenuItem(
                restaurant_id=r_in_2.id,
                name="Ghee Roast Masala Dosa",
                category="South Classics",
                price=190.0,
                currency="INR",
                dietary_tag="VEG",
                description="Crispy golden fermented crepe cooked in pure country ghee, served with spiced potato bhaji and coconut chutneys.",
                image_url="https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=500&auto=format&fit=crop"
            ),
            MenuItem(
                restaurant_id=r_in_2.id,
                name="Chettinad Pepper Chicken Fry",
                category="Starters",
                price=340.0,
                currency="INR",
                dietary_tag="NON_VEG",
                description="Wok-tossed boneless chicken with fresh crushed Malabar black peppercorns, curry leaves, and shallots.",
                image_url="https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=500&auto=format&fit=crop"
            ),
            MenuItem(
                restaurant_id=r_in_2.id,
                name="Madras Filter Kaapi",
                category="Beverages",
                price=70.0,
                currency="INR",
                dietary_tag="VEG",
                description="Traditional freshly brewed chicory-blended decoction frothed with hot rich milk in brass dabarah.",
                image_url="https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=500&auto=format&fit=crop"
            ),
        ]

        # Menu for Gotham Smokehouse (America)
        items_gotham = [
            MenuItem(
                restaurant_id=r_us_1.id,
                name="The Prime Black Angus Burger",
                category="Burgers",
                price=16.50,
                currency="USD",
                dietary_tag="NON_VEG",
                description="Hand-pressed prime angus beef patty, aged sharp Vermont cheddar, caramelized onion relish on a brioche bun.",
                image_url="https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&auto=format&fit=crop"
            ),
            MenuItem(
                restaurant_id=r_us_1.id,
                name="Smoked Hickory Pulled Pork Sliders",
                category="Burgers",
                price=14.00,
                currency="USD",
                dietary_tag="NON_VEG",
                description="14-hour applewood smoked pork shoulder tossed in tangy BBQ glaze, topped with crisp slaw on toasted mini brioche.",
                image_url="https://images.unsplash.com/photo-1521305916504-4a1121188589?w=500&auto=format&fit=crop"
            ),
            MenuItem(
                restaurant_id=r_us_1.id,
                name="Truffle Parmesan Hand-Cut Fries",
                category="Sides",
                price=6.50,
                currency="USD",
                dietary_tag="VEG",
                description="Crispy Idaho Russet potato fries tossed in black truffle oil, freshly grated pecorino cheese, and parsley.",
                image_url="https://images.unsplash.com/photo-1576107232684-1279f3908594?w=500&auto=format&fit=crop"
            ),
            MenuItem(
                restaurant_id=r_us_1.id,
                name="Salted Caramel Fudge Milkshake",
                category="Beverages",
                price=7.00,
                currency="USD",
                dietary_tag="VEG",
                description="Thick handcrafted shake made with Madagascar vanilla bean gelato, sea salt caramel swirl, and chocolate fudge.",
                image_url="https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=500&auto=format&fit=crop"
            ),
        ]

        # Menu for Liberty Slice Pizzeria (America)
        items_liberty = [
            MenuItem(
                restaurant_id=r_us_2.id,
                name="Artisanal Spicy Pepperoni Pizza",
                category="Pizzas",
                price=19.50,
                currency="USD",
                dietary_tag="NON_VEG",
                description="San Marzano tomato base, fresh buffalo mozzarella, cup-and-char cured pepperoni drizzled with chili hot honey.",
                image_url="https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?w=500&auto=format&fit=crop"
            ),
            MenuItem(
                restaurant_id=r_us_2.id,
                name="Classic Margherita DOC",
                category="Pizzas",
                price=17.00,
                currency="USD",
                dietary_tag="VEG",
                description="Slow-fermented sourdough, organic plum tomato reduction, fior di latte mozzarella, and fresh sweet basil leaves.",
                image_url="https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500&auto=format&fit=crop"
            ),
            MenuItem(
                restaurant_id=r_us_2.id,
                name="Wild Mushroom Truffle Risotto",
                category="Pasta & Bowls",
                price=18.00,
                currency="USD",
                dietary_tag="VEG",
                description="Creamy Carnaroli arborio rice simmered with porcini and cremini mushrooms, finished with parmigiano reggiano.",
                image_url="https://images.unsplash.com/photo-1633964913295-ceb43826e7c9?w=500&auto=format&fit=crop"
            ),
        ]

        db.add_all(items_spice_pavilion + items_dakshin + items_gotham + items_liberty)
        db.commit()

        # 4. Regional Payment Methods
        pm_india = PaymentMethod(
            country="India",
            method_type="Corporate UPI AutoPay",
            details="slooze.enterprise@hdfcbank"
        )
        pm_america = PaymentMethod(
            country="America",
            method_type="Corporate Amex Centurion",
            details="Amex (*7704) - Exp 08/29"
        )
        db.add_all([pm_india, pm_america])
        db.commit()

        # 5. Initial Sample Orders (Demonstrating Re-BAC & Order Lifecycle)
        # Order 1: India - Created by Thanos (Member) -> Status: PENDING_PAYMENT
        now = datetime.datetime.now(datetime.timezone.utc)
        order_in_1 = Order(
            user_id="thanos",
            country="India",
            status="PENDING_PAYMENT",
            total_amount=520.0,
            currency="INR",
            created_at=(now - datetime.timedelta(hours=3)).isoformat()
        )
        db.add(order_in_1)
        db.commit()

        item_biryani = db.query(MenuItem).filter(MenuItem.name == "Dum Pukht Chicken Biryani").first()
        item_lassi = db.query(MenuItem).filter(MenuItem.name == "Kesar Mango Lassi").first()
        if item_biryani and item_lassi:
            db.add(OrderItem(order_id=order_in_1.id, menu_item_id=item_biryani.id, quantity=1, price=380.0))
            db.add(OrderItem(order_id=order_in_1.id, menu_item_id=item_lassi.id, quantity=1, price=140.0))

        # Order 2: America - Created by Travis (Member), Approved by Captain America (Manager) -> Status: PAID
        order_us_1 = Order(
            user_id="travis",
            country="America",
            status="PAID",
            total_amount=30.0,
            currency="USD",
            payment_method_id=pm_america.id,
            created_at=(now - datetime.timedelta(hours=1)).isoformat()
        )
        db.add(order_us_1)
        db.commit()

        item_burger = db.query(MenuItem).filter(MenuItem.name == "The Prime Black Angus Burger").first()
        item_shake = db.query(MenuItem).filter(MenuItem.name == "Salted Caramel Fudge Milkshake").first()
        item_fries = db.query(MenuItem).filter(MenuItem.name == "Truffle Parmesan Hand-Cut Fries").first()
        if item_burger and item_shake and item_fries:
            db.add(OrderItem(order_id=order_us_1.id, menu_item_id=item_burger.id, quantity=1, price=16.50))
            db.add(OrderItem(order_id=order_us_1.id, menu_item_id=item_shake.id, quantity=1, price=7.00))
            db.add(OrderItem(order_id=order_us_1.id, menu_item_id=item_fries.id, quantity=1, price=6.50))

        db.commit()
        print("--> Database seeding complete.")
    except Exception as exc:
        db.rollback()
        print(f"Error seeding database: {exc}")
        raise exc
    finally:
        db.close()
