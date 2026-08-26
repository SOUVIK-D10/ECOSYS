from sqlmodel import Field, SQLModel
from typing import Optional
from datetime import datetime

class Project(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True)
    status: str = Field(default="active")
    target_completion: Optional[datetime] = None

class Task(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    project_id: int = Field(foreign_key="project.id")
    title: str
    deadline: Optional[datetime] = None
    is_completed: bool = Field(default=False)

class InfraStatus(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    service_name: str
    health_endpoint: str
    last_ping_status: str = Field(default="unknown")