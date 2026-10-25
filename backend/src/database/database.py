from sqlmodel import create_engine, SQLModel, Session
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent
DB_DIR = BASE_DIR / "db"
DB_DIR.mkdir(parents=True, exist_ok=True)

DB_PATH = DB_DIR / "ecosys.db"
sqlite_url = f"sqlite:///{DB_PATH}"

engine = create_engine(sqlite_url, echo=True)

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

# The Session Generator for FastAPI Dependency Injection
def get_session():
    with Session(engine) as session:
        yield session