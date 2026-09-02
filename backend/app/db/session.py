"""
Database engine configuration and session provider.
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.app.core.config import DATABASE_URL
from backend.app.models.schema import Base

# connect_args={"check_same_thread": False} is required for SQLite multithreaded requests
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    """Yields a database session per request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_tables():
    """Initializes tables in the SQLite database."""
    Base.metadata.create_all(bind=engine)
