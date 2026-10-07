from pydantic import BaseModel
from sqlmodel import SQLModel, Field, Relationship
from typing import List, Optional
from datetime import datetime
from enum import Enum

from schemas.db_models.common_schema import Tag, TagDTO, ProjectTagLink
from schemas.db_models.task_schema import LightTaskDTO, Task

#===================================================================================================
class ProjectState(str, Enum):
    NOT_STARTED = "Not Started"
    BACKLOG = "Backlog"
    IN_PROGRESS = "In Progress"
    BLOCKED = "Blocked"
    COMPLETED = "Completed"
    CANCEL = "Cancel"
# --------------------------------------------------------------------------------------------------
class ProjectPriority(int, Enum):
    URGENT = 5
    HIGH = 4
    HIGHER_MID = 3
    LOWER_MID = 2
    LOW = 1
    UNIDENTIFIED = 0
#===================================================================================================

# ===================================== DTOs =======================================================
class CreateProjectDTO(BaseModel):
    title: str
    description: Optional[str] = None
    deadline: Optional[datetime] = None
    priority: Optional[int] = ProjectPriority.UNIDENTIFIED
    assignee: Optional[str] = "UNKNOWN"
#---------------------------------------------------------------------------------------------------
class LightProjectDTO(BaseModel):
    id: int
    title: str
    state: ProjectState
    deadline: Optional[datetime] = None
    priority: int
    assignee: str
#---------------------------------------------------------------------------------------------------
class HeavyProjectDTO(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    state: ProjectState
    deadline: Optional[datetime] = None
    assigned_on: datetime
    priority: int
    assigner: str
    assignee: str
    tasks: List[LightTaskDTO] = []
    tags: List[TagDTO] = []
#===================================================================================================


class Project(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    title: str
    description: Optional[str] = None
    state: ProjectState = Field(default=ProjectState.BACKLOG) # Default to Backlog
    deadline: Optional[datetime] = None
    assigned_on: Optional[datetime] = Field(default_factory=datetime.now)
    priority: Optional[int] = Field(default=ProjectPriority.UNIDENTIFIED)
    assigner: Optional[str] = "UNKNOWN"
    assignee: Optional[str] = "UNKNOWN"
    tags: List[Tag] = Relationship(back_populates="projects", link_model=ProjectTagLink)
    tasks: List[Task] = Relationship(back_populates="project",
                                    #  link_model=ProjectTaskLink
                                    )

