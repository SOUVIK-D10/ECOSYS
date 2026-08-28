from contextlib import asynccontextmanager
from datetime import datetime, timedelta, timezone
from typing import List

from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import Session, select

from database import create_db_and_tables, get_session
from models import Task, TaskState,Tag

@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    yield

app = FastAPI(title="OASIS Core", lifespan=lifespan)

# ====================================== MIDDLEWARE ====================================================================
# Simple logic for CROS intercepting middleware currently set to allow everything
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Says we allow all origins
    allow_credentials=True, # says yes we allow creds
    allow_methods=["*"], # says we allow all HTTP methods even new ones like QUERY or some unknown
    allow_headers=["*"], # Says yes we allow all headers
)
# ======================================================================================================================

# ================================== Monitoring ========================================================================
@app.get("/health")
def health_check():
    return {"status": "System Online", "infrastructure": "Healthy"}
# ======================================================================================================================

# =========================================== TO-DO List Section =======================================================

@app.post("/tasks/", response_model=Task)
def create_task(
    task: Task, # Takes the body of JSON Payload
    session: Session = Depends(get_session) # Pulls the database session
    ):
    """Ingests a new task via a JSON payload."""
    session.add(task)
    session.commit()
    session.refresh(task)
    return task

@app.patch("/tasks/{task_id}/state", response_model=Task)
def update_task_state(
    task_id: int, # Takes the 'id' of task to be updated 
    new_state: TaskState, 
    session: Session = Depends(get_session)
    ):
    """Shifts a task through its lifecycle states."""
    task = session.get(Task, task_id)
    if not task:
        raise HTTPException(
            status_code=404, 
            detail="Task not found in the grid"
            )
    
    task.state = new_state
    session.add(task)
    session.commit()
    session.refresh(task)
    
    return task

@app.get("/tasks/due_today", response_model=List[Task])
def get_tasks_due_today(session: Session = Depends(get_session)):
    now = datetime.now(timezone.utc)
    start_of_day = now.replace(hour=0, minute=0, second=0, microsecond=0)
    end_of_day = start_of_day + timedelta(days=1)
    
    statement = select(Task).where(
        Task.deadline != None and Task.deadline >= start_of_day,
        Task.deadline != None and Task.deadline < end_of_day,
        Task.state != TaskState.COMPLETED
    )
    return session.exec(statement).all()

@app.get("/tasks/upcoming", response_model=List[Task])
def get_upcoming_tasks(session: Session = Depends(get_session)):
    now = datetime.now(timezone.utc)
    seven_days_later = now + timedelta(days=7)
    
    statement = select(Task).where(
        Task.deadline != None and Task.deadline >= now,
        Task.deadline != None and Task.deadline <= seven_days_later,
        Task.state != TaskState.COMPLETED
    )
    return session.exec(statement).all()

@app.get("/tasks/overdue", response_model=List[Task])
def get_overdue_tasks(session: Session = Depends(get_session)):
    now = datetime.now(timezone.utc)
    
    statement = select(Task).where(
        Task.deadline != None and Task.deadline < now,
        Task.state != TaskState.COMPLETED
    )
    return session.exec(statement).all()

@app.post("/tasks/{task_id}/tags/{tag_name}", response_model=Task)
def assign_tag_to_task(
    task_id: int, 
    tag_name: str, 
    session: Session = Depends(get_session)
    ):
    # Find the task
    task = session.get(Task, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    statement = select(Tag).where(Tag.name == tag_name)
    tag = session.exec(statement).first()
    
    if not tag:
        tag = Tag(name=tag_name)
        session.add(tag)
    
    if tag not in task.tags:
        task.tags.append(tag)
        session.add(task)
        session.commit()
        session.refresh(task)
        
    return task

@app.get("/tags/{tag_name}/tasks", response_model=List[Task])
def get_tasks_by_tag(tag_name: str, session: Session = Depends(get_session)):
    statement = select(Tag).where(Tag.name == tag_name)
    tag = session.exec(statement).first()
    
    if not tag:
        raise HTTPException(status_code=404, detail="Tag not found in the grid")
    
    return tag.tasks

@app.get("/tasks/", response_model=List[Task])
def get_all_active_tasks(session: Session = Depends(get_session)):
    """Fetches every task that is not completed."""
    statement = select(Task).where(Task.state != TaskState.COMPLETED)
    return session.exec(statement).all()
# ======================================================================================================================