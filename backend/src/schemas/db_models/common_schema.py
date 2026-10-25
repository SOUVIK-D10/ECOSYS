from pydantic import BaseModel
from sqlmodel import SQLModel, Field, Relationship
from typing import List, Optional
from datetime import datetime

# from schemas.db_models.project_schema import Project
# from schemas.db_models.task_schema import  Task

class TagDTO(BaseModel):
    name: str
    def __str__(self):
        return self.name
    

#============================= LINKS & JOINS MODELS ================================================

class ProjectTagLink(SQLModel, table=True):
    project_id: Optional[int] = Field(default=None, foreign_key="project.id", primary_key=True)
    tag_id: Optional[int] = Field(default=None, foreign_key="tag.id", primary_key=True)

class TaskTagLink(SQLModel, table=True):
    task_id: Optional[int] = Field(default=None, foreign_key="task.id", primary_key=True)
    tag_id: Optional[int] = Field(default=None, foreign_key="tag.id", primary_key=True)

#===================================================================================================

class Tag(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True, unique=True) # e.g., "frontend", "api"
    tasks: List["Task"] = Relationship(back_populates="tags", link_model=TaskTagLink)  # type: ignore
    projects: List["Project"] = Relationship(back_populates="tags", link_model=ProjectTagLink) # type: ignore
    def __str__(self):
        return self.name