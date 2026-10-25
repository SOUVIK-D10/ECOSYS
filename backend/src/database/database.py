import os
from sqlmodel import create_engine, SQLModel, Session

# Fallback to local SQLite if DATABASE_URL is not set
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./oasis.db")

# Render uses 'postgres://', SQLAlchemy 2.0 / SQLModel expects 'postgresql://'
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# SQLite needs connect_args, Postgres does not
engine_args = {}
if "sqlite" in DATABASE_URL:
    engine_args["connect_args"] = {"check_same_thread": False}

engine = create_engine(DATABASE_URL, echo=True, **engine_args)

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

# The Session Generator for FastAPI Dependency Injection
def get_session():
    with Session(engine) as session:
        yield session