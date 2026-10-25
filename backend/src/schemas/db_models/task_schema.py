from pydantic import BaseModel
from sqlmodel import SQLModel, Field, Relationship
from typing import List, Optional
from datetime import datetime
from enum import Enum

from schemas.db_models.common_schema import Tag, TagDTO, TaskTagLink

#===================================================================================================
class TaskState(str, Enum):
    NOT_STARTED = "Not Started"
    BACKLOG = "Backlog"
    IN_PROGRESS = "In Progress"
    BLOCKED = "Blocked"
    COMPLETED = "Completed"
# --------------------------------------------------------------------------------------------------
class TaskPriority(int, Enum):
    URGENT = 5
    HIGH = 4
    HIGHER_MID = 3
    LOWER_MID = 2
    LOW = 1
    UNIDENTIFIED = 0
#===================================================================================================

# ===================================== DTOs =======================================================
class CreateTaskDTO(BaseModel):
    title: str
    description: Optional[str] = None
    deadline: Optional[datetime] = None
    priority: Optional[int] = TaskPriority.UNIDENTIFIED
    assignee: Optional[str] = "UNKNOWN"
    project_id: int
#---------------------------------------------------------------------------------------------------
class LightTaskDTO(BaseModel):
    id: int
    title: str
    state: TaskState
    deadline: Optional[datetime] = None
    priority: int
    assignee: str
    project_id: int
#---------------------------------------------------------------------------------------------------
class HeavyTaskDTO(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    state: TaskState
    deadline: Optional[datetime] = None
    assigned_on: datetime
    priority: int
    assigner: str
    assignee: str
    project_id: int
    tags: List[TagDTO] = []
#--------------------------------------------------------------------------------------------------

# ==================================================================================================




#============================= CORE MODELS =========================================================
class Task(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    description: Optional[str] = None
    state: TaskState = Field(default=TaskState.BACKLOG) # Default to Backlog
    deadline: Optional[datetime] = None
    assigned_on: Optional[datetime] = Field(default_factory=datetime.now)
    priority: Optional[int] = Field(default=TaskPriority.UNIDENTIFIED)
    assigner: Optional[str] = "UNKNOWN"
    assignee: Optional[str] = "UNKNOWN"
    project_id: Optional[int] = Field(default=None, foreign_key="project.id")
    is_freezed: bool = Field(default=False)
    project: Optional["Project"] = Relationship(back_populates="tasks")  # type: ignore
    tags: List[Tag] = Relationship(back_populates="tasks", link_model=TaskTagLink)
# --------------------------------------------------------------------------------------------------

# ==================================================================================================