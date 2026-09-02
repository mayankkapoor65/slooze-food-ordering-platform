"""
Core application configuration and settings.
"""
import os

PROJECT_NAME = "Slooze Food Ordering System"
API_PREFIX = "/graphql"

# Database Configuration
if os.getenv("VERCEL"):
    DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:////tmp/food_ordering.db")
else:
    DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./food_ordering.db")

# Roles & Access Scopes
ROLE_ADMIN = "ADMIN"
ROLE_MANAGER = "MANAGER"
ROLE_MEMBER = "MEMBER"

ALL_ROLES = [ROLE_ADMIN, ROLE_MANAGER, ROLE_MEMBER]
ORDER_MANAGERS = [ROLE_ADMIN, ROLE_MANAGER]

COUNTRY_INDIA = "India"
COUNTRY_AMERICA = "America"
COUNTRY_GLOBAL = "Global"

VALID_COUNTRIES = [COUNTRY_INDIA, COUNTRY_AMERICA]
