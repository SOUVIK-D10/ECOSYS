from fastapi import FastAPI
from contextlib import asynccontextmanager
from database import create_db_and_tables

@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    yield

app = FastAPI(title="Project Manager API", lifespan=lifespan)

@app.get("/health")
def health_check():
    return {"status": "System Online", "infrastructure": "Healthy"}