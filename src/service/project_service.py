from datetime import datetime, timedelta, timezone
from typing import List, Optional
from fastapi import HTTPException
from sqlmodel import  Session, select, col

from schemas.db_models.common_schema import Tag
from schemas.db_models.project_schema import CreateProjectDTO, Project, ProjectState
from schemas.db_models.task_schema import TaskState
from service import task_service



class ProjectService:
    def __init__(self, session: Session):
        self.session = session

    def create_project(self, project_dto: CreateProjectDTO) -> "Project":
        project = Project.model_validate(project_dto)
        project.assigned_on = datetime.now(timezone.utc)
        project.state = ProjectState.NOT_STARTED
        if(project.deadline != None and datetime.now(timezone.utc) >= project.deadline):
            raise HTTPException(status_code=400, detail="Deadline cannot be in the past or present or null")
        self.session.add(project)
        self.session.commit()
        self.session.refresh(project)
        return project
    
    def update_project(self, project_id: int, project_dto: CreateProjectDTO) -> "Project":
        project = self.session.get(Project, project_id)
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        if(project.deadline != None and datetime.now(timezone.utc) >= project.deadline):
            raise HTTPException(status_code=400, detail="Deadline cannot be in the past or present or null")
        update_data = project_dto.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(project, key, value)
        self.session.add(project)
        self.session.commit()
        self.session.refresh(project)
    
        return project

    def update_project_state(self, project_id: int, new_state: "ProjectState") -> "Project":
        project = self.session.get(Project, project_id)
        if not project:
            raise HTTPException(status_code=404, detail="Project not found in the grid")
        if(project.state == ProjectState.CANCEL and new_state != ProjectState.CANCEL):
            for task in project.tasks:
                task.is_freezed=False
                self.session.add(task)
        project.state = new_state
        if(project.state == ProjectState.COMPLETED):
            for task in project.tasks:
                task.state = TaskState.COMPLETED
                self.session.add(task)
        if(project.state == ProjectState.CANCEL):
            for task in project.tasks:
                task.is_freezed=True
                self.session.add(task)
        self.session.add(project)
        self.session.commit()
        self.session.refresh(project)
        return project

    def get_projects_due_today(self) -> List["Project"]:
        now = datetime.now(timezone.utc)
        start_of_day = now.replace(hour=0, minute=0, second=0, microsecond=0)
        end_of_day = start_of_day + timedelta(days=1)
        
        statement = select(Project).where(
            col(Project.deadline) >= start_of_day,
            col(Project.deadline) < end_of_day,
            Project.state != ProjectState.COMPLETED
        )
        return list(self.session.exec(statement).all())

    def get_upcoming_projects(self) -> List["Project"]:
        now = datetime.now(timezone.utc)
        seven_days_later = now + timedelta(days=7)
        
        statement = select(Project).where(
            col(Project.deadline) >= now,
            col(Project.deadline) <= seven_days_later,
            Project.state != ProjectState.COMPLETED
        )
        return list(self.session.exec(statement).all())

    def get_overdue_projects(self) -> List["Project"]:
        now = datetime.now(timezone.utc)
        statement = select(Project).where(
            col(Project.deadline) < now,
            Project.state != ProjectState.COMPLETED
        )
        return list(self.session.exec(statement).all())

    def get_all_completed_projects(self) -> List["Project"]:
        statement = select(Project).where(Project.state == ProjectState.COMPLETED)
        return list(self.session.exec(statement).all())

    def assign_tag_to_project(self, project_id: int, tag_name: str) -> "Project":
        project = self.session.get(Project, project_id)
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        statement = select(Tag).where(Tag.name == tag_name)
        tag = self.session.exec(statement).first()
        
        if not tag:
            tag = Tag(name=tag_name)
            self.session.add(tag)
            self.session.flush()

        if tag not in project.tags:
            project.tags.append(tag)
            self.session.add(project)
            self.session.commit()
            self.session.refresh(project)
            
        return project

    def get_projects_by_tag(self, tag_name: str) -> List["Project"]:
        statement = select(Tag).where(Tag.name == tag_name)
        tag = self.session.exec(statement).first()
        if not tag:
            raise HTTPException(status_code=404, detail="Tag not found in the grid")
        return list(tag.projects)

    def get_all_active_projects(self) -> List["Project"]:
        statement = select(Project).where(Project.state != ProjectState.COMPLETED)
        return list(self.session.exec(statement).all())

    def get_project_by_id(self, project_id: int) ->"Project":
        statement = select(Project).where(Project.id == project_id)
        project = self.session.exec(statement).first()
        
        if not project:
            raise HTTPException(status_code=404, detail="Project not found in the grid")
            
        return project
    
    def delete_project(self, project_id: int) -> None:
        project = self.session.get(Project, project_id)

        if not project:
            raise HTTPException(status_code=404, detail="Project not found in the grid")
        for task in project.tasks:
            task_service.TaskService(self.session).delete_task(task.id or 0)
        self.session.delete(project)
        self.session.commit()