import sys
import os

# Add root directory to sys.path so backend module can be imported
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.main import app
from backend.app.db.seed import seed_database

# Ensure database tables and seed personas are initialized
try:
    seed_database()
except Exception as e:
    print(f"Serverless startup DB init note: {e}")
