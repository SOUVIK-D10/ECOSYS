from sqlmodel import create_engine, SQLModel, Session

sqlite_file_name = "db/database.db"
sqlite_url = f"sqlite:///{sqlite_file_name}"

engine = create_engine(sqlite_url, echo=True)

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

# The Session Generator for FastAPI Dependency Injection
def get_session():
    with Session(engine) as session:
        yield session