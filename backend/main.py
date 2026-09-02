"""
FastAPI Server Entrypoint.
Mounts GraphQL Router with Context Resolver and CORS Middleware.
"""
from contextlib import asynccontextmanager
from typing import Optional
from fastapi import FastAPI, Header
from fastapi.middleware.cors import CORSMiddleware
from strawberry.fastapi import BaseContext, GraphQLRouter
from sqlalchemy.orm import Session

from backend.app.core.config import PROJECT_NAME, API_PREFIX
from backend.app.db.session import SessionLocal
from backend.app.db.seed import seed_database
from backend.app.models.schema import User
from backend.app.graphql.schema import schema

class AppContext(BaseContext):
    def __init__(self, db: Session, current_user: Optional[User]):
        super().__init__()
        self.db = db
        self.current_user = current_user

async def custom_context_getter(
    x_user_id: Optional[str] = Header(None, alias="X-User-Id")
) -> AppContext:
    """Extracts DB session and current authenticated user from header."""
    db = SessionLocal()
    current_user = None
    try:
        if x_user_id:
            current_user = db.query(User).filter(User.id == x_user_id.strip()).first()
        yield AppContext(db=db, current_user=current_user)
    finally:
        db.close()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize and seed database on startup
    seed_database()
    yield

app = FastAPI(
    title=PROJECT_NAME,
    description="Full-stack Role-Based & Relational-Access Food Ordering System",
    version="2.0.0",
    lifespan=lifespan
)

# CORS configuration allowing local Next.js client & GraphiQL
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

graphql_app = GraphQLRouter(schema, context_getter=custom_context_getter)
app.include_router(graphql_app, prefix=API_PREFIX)

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": PROJECT_NAME, "version": "2.0.0"}
