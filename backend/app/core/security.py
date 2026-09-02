"""
Security and Access Control Layer
Implements Role-Based Access Control (RBAC) and Relational-Based Access Control (Re-BAC).
"""
from typing import List, Optional
from backend.app.core.config import ROLE_ADMIN, COUNTRY_GLOBAL

class AuthorizationError(Exception):
    """Base exception for authorization failures."""
    pass

class RBACForbiddenError(AuthorizationError):
    """Raised when user role lacks required permissions for an operation."""
    def __init__(self, action: str, current_role: str, allowed_roles: List[str]):
        super().__init__(
            f"RBAC Permission Denied: Action '{action}' requires one of [{', '.join(allowed_roles)}]. Current role: '{current_role}'."
        )

class ReBACBoundaryError(AuthorizationError):
    """Raised when a user attempts cross-country access outside their regional boundary."""
    def __init__(self, user_country: str, target_country: str):
        super().__init__(
            f"Re-BAC Relational Access Denied: User in region '{user_country}' cannot access or mutate resources in region '{target_country}'."
        )

class AuthenticationRequiredError(AuthorizationError):
    """Raised when session header is absent or invalid."""
    def __init__(self, message: str = "Authentication required. Please provide a valid 'X-User-Id' header."):
        super().__init__(message)


def verify_rbac(user, allowed_roles: List[str], action: str = "this operation"):
    """
    Validates that the authenticated user possesses one of the required roles.
    """
    if not user:
        raise AuthenticationRequiredError()
    if user.role not in allowed_roles:
        raise RBACForbiddenError(action=action, current_role=user.role, allowed_roles=allowed_roles)


def verify_rebac(user, target_country: str):
    """
    Enforces regional / country-level data isolation (Re-BAC).
    - Admins with Global scope can access all countries.
    - Managers and Members can only access data belonging to their assigned country.
    """
    if not user:
        raise AuthenticationRequiredError()
    if user.role == ROLE_ADMIN or user.country == COUNTRY_GLOBAL:
        return True
    if user.country.strip().lower() != target_country.strip().lower():
        raise ReBACBoundaryError(user_country=user.country, target_country=target_country)
    return True


def is_in_user_country_scope(user, country: str) -> bool:
    """
    Returns True if the target country is within the user's data visibility scope.
    """
    if not user:
        return False
    if user.role == ROLE_ADMIN or user.country == COUNTRY_GLOBAL:
        return True
    return user.country.strip().lower() == country.strip().lower()
