# Slooze Take-Home Challenge — Full-Stack Food Ordering Platform

A full-stack, enterprise-grade food ordering web application with **Role-Based Access Control (RBAC)** and a **Relational Access Control Model (Re-BAC)** for country-level regional data isolation.

Built with **Next.js (App Router)**, **FastAPI**, **Strawberry GraphQL**, **SQLAlchemy**, and **SQLite**.

---

## 🌟 Key Features & Problem Scope

Nick Fury is a business owner (Admin) with 5 regional employees across **India** and **America**:
- **Nick Fury**: Business Owner & Administrator (Global Scope) — Password: `Fury@Admin99`
- **Captain Marvel**: Regional Manager (India) — Password: `Marvel@India77`
- **Captain America**: Regional Manager (America) — Password: `Cap@America88`
- **Thanos**: Team Member (India) — Password: `Thanos@India01`
- **Thor**: Team Member (India) — Password: `Thor@India02`
- **Travis**: Team Member (America) — Password: `Travis@America03`

### 🎯 Role-Based Access Control (RBAC) Matrix

| S.No | Function / Operation | Admin (Nick Fury) | Manager (Capt. Marvel / Capt. America) | Member (Thanos / Thor / Travis) |
| :--- | :--- | :---: | :---: | :---: |
| 1 | **View restaurants & menu items** | ✅ Yes | ✅ Yes | ✅ Yes |
| 2 | **Create an order (add food items)** | ✅ Yes | ✅ Yes | ✅ Yes |
| 3 | **Place order (checkout & pay)** | ✅ Yes | ✅ Yes | ❌ No *(Requires Manager/Admin)* |
| 4 | **Cancel order** | ✅ Yes | ✅ Yes | ❌ No *(Requires Manager/Admin)* |
| 5 | **Update corporate payment method** | ✅ Yes | ❌ No *(Admin exclusive)* | ❌ No *(Admin exclusive)* |

---

### 🌐 Bonus Objective: Relational Access Model (Re-BAC)

In addition to role permissions, the platform enforces strict **country boundary isolation**:
* **Regional Isolation**: Managers and Members from India can only view, create, pay for, and cancel orders and restaurants in **India**. They are blocked from accessing or mutating resources belonging to America.
* **American Isolation**: Managers and Members from America are strictly restricted to **America** data and features.
* **Global Oversight**: Nick Fury (Admin) retains global visibility and authority across all countries.

---

## 🛠️ Technology Stack

* **Frontend**: Next.js 16 (React 19, TypeScript), Tailwind CSS, Apollo Client GraphQL.
* **Backend**: Python 3.10+, FastAPI, Strawberry GraphQL, SQLAlchemy 2.0.
* **Database**: SQLite (`food_ordering.db`), auto-seeded with realistic regional restaurants, dishes, dietary tags, and sample orders.
* **Testing & Quality Assurance**: Automated test suite powered by `pytest` validating RBAC permissions and Re-BAC isolation boundaries.

---

## 🚀 Quick Start & Local Execution

We provide a **unified runner script** (`run.py`) at the root of the repository. Running it will automatically initialize the Python virtual environment, install backend dependencies, install frontend node modules, run the automated test suite, and launch both dev servers concurrently.

### Prerequisites
* **Python 3.10+** installed
* **Node.js 18+** & **NPM** installed

### Launch Command
From the root directory:
```bash
python run.py
```

* **Frontend Application UI**: [http://localhost:3000](http://localhost:3000)
* **Backend GraphQL Playground**: [http://localhost:8000/graphql](http://localhost:8000/graphql)
* **Backend Health Check**: [http://localhost:8000/health](http://localhost:8000/health)

---

## 🧪 Running Automated Tests

A dedicated test suite validates the full authorization matrix:
```bash
# Run tests with pytest
backend\.venv\Scripts\pytest -v
```

### Test Coverage Breakdown:
1. `test_view_restaurants_all_roles_permitted`: Confirms all personas can view restaurant listings.
2. `test_member_can_create_order_but_cannot_pay_or_cancel`: Confirms members can create orders but checkout and cancel mutations are rejected with 403 Forbidden.
3. `test_manager_can_pay_and_cancel_orders`: Confirms regional managers can approve and cancel orders in their region.
4. `test_payment_method_mutation_restricted_to_admin`: Confirms only Admin can update payment gateways.
5. `test_rebac_restaurant_visibility_isolation`: Confirms India accounts only query Indian restaurants, and US accounts only query US restaurants.
6. `test_rebac_cross_country_order_creation_blocked`: Confirms cross-country order creation attempts are rejected.
7. `test_rebac_cross_country_order_payment_blocked`: Confirms cross-country payment attempts are rejected.

---

## 📚 Documentation & Architecture

For in-depth architectural details, database schema ER diagrams, and a copy-pasteable GraphQL API query collection with header instructions, see [ARCHITECTURE.md](./ARCHITECTURE.md).
