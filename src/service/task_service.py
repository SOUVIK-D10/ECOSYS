from datetime import datetime, timedelta, timezone
from typing import List, Optional
from fastapi import HTTPException
from sqlmodel import  Session, select, col

from schemas.db_models.common_schema import Tag
from schemas.db_models.task_schema import Task, TaskState


class TaskService:
    def __init__(self, session: Session):
        self.session = session

    def create_task(self, task_dto) -> "Task":
        task = Task.model_validate(task_dto)
        self.session.add(task)
        self.session.commit()
        self.session.refresh(task)
        return task

    def update_task_state(self, task_id: int, new_state: "TaskState") -> "Task":
        task = self.session.get(Task, task_id)
        if not task:
            raise HTTPException(status_code=404, detail="Task not found in the grid")
        
        task.state = new_state
        self.session.add(task)
        self.session.commit()
        self.session.refresh(task)
        return task

    def get_tasks_due_today(self) -> List["Task"]:
        now = datetime.now(timezone.utc)
        start_of_day = now.replace(hour=0, minute=0, second=0, microsecond=0)
        end_of_day = start_of_day + timedelta(days=1)
        
        statement = select(Task).where(
            col(Task.deadline) >= start_of_day,
            col(Task.deadline) < end_of_day,
            Task.state != TaskState.COMPLETED
        )
        return list(self.session.exec(statement).all())

    def get_upcoming_tasks(self) -> List["Task"]:
        now = datetime.now(timezone.utc)
        seven_days_later = now + timedelta(days=7)
        
        statement = select(Task).where(
            col(Task.deadline) >= now,
            col(Task.deadline) <= seven_days_later,
            Task.state != TaskState.COMPLETED
        )
        return list(self.session.exec(statement).all())

    def get_overdue_tasks(self) -> List["Task"]:
        now = datetime.now(timezone.utc)
        statement = select(Task).where(
            col(Task.deadline) < now,
            Task.state != TaskState.COMPLETED
        )
        return list(self.session.exec(statement).all())

    def get_all_completed_tasks(self) -> List["Task"]:
        statement = select(Task).where(Task.state == TaskState.COMPLETED)
        return list(self.session.exec(statement).all())

    def assign_tag_to_task(self, task_id: int, tag_name: str) -> "Task":
        task = self.session.get(Task, task_id)
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")
        
        statement = select(Tag).where(Tag.name == tag_name)
        tag = self.session.exec(statement).first()
        
        if not tag:
            tag = Tag(name=tag_name)
            self.session.add(tag)
            self.session.flush()

        if tag not in task.tags:
            task.tags.append(tag)
            self.session.add(task)
            self.session.commit()
            self.session.refresh(task)
            
        return task

    def get_tasks_by_tag(self, tag_name: str) -> List["Task"]:
        statement = select(Tag).where(Tag.name == tag_name)
        tag = self.session.exec(statement).first()
        if not tag:
            raise HTTPException(status_code=404, detail="Tag not found in the grid")
        return list(tag.tasks)

    def get_all_active_tasks(self) -> List["Task"]:
        statement = select(Task).where(Task.state != TaskState.COMPLETED)
        return list(self.session.exec(statement).all())

    def get_task_by_id(self, task_id: int) ->"Task":
        statement = select(Task).where(Task.id == task_id)
        task = self.session.exec(statement).first()
        
        if not task:
            raise HTTPException(status_code=404, detail="Task not found in the grid")
            
        return task