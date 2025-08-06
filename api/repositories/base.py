"""Simple base repository for basic CRUD operations."""
from typing import Any, Generic, List, Optional, Protocol, Type, TypeVar
from uuid import UUID

from sqlalchemy.orm import Session


class HasId(Protocol):
    """Protocol for entities with id attribute."""

    id: UUID


T = TypeVar("T", bound=HasId)


class SQLRepository(Generic[T]):
    """Simple SQL repository with basic CRUD operations."""

    def __init__(self, session: Session, model: Type[T]):
        """Initialize repository with database session and model type."""
        self.session = session
        self.model = model

    def create(self, entity: T) -> T:
        """Create a new entity."""
        self.session.add(entity)
        self.session.commit()
        self.session.refresh(entity)
        return entity

    def find_by_id(self, entity_id: UUID) -> Optional[T]:
        """Find entity by ID."""
        return self.session.query(self.model).filter(self.model.id == entity_id).first()  # type: ignore

    def find_all(self, limit: int = 100, offset: int = 0) -> List[T]:
        """Find all entities with pagination."""
        return self.session.query(self.model).offset(offset).limit(limit).all()

    def update(self, entity: T) -> T:
        """Update an entity."""
        self.session.commit()
        self.session.refresh(entity)
        return entity

    def delete(self, entity: T) -> None:
        """Delete an entity."""
        self.session.delete(entity)
        self.session.commit()

    def find_by_criteria(self, **criteria: Any) -> List[T]:
        """Find entities by criteria."""
        query = self.session.query(self.model)
        for field, value in criteria.items():
            if hasattr(self.model, field):
                query = query.filter(getattr(self.model, field) == value)
        return query.all()

    def find_one_by_criteria(self, **criteria: Any) -> Optional[T]:
        """Find single entity by criteria."""
        query = self.session.query(self.model)
        for field, value in criteria.items():
            if hasattr(self.model, field):
                query = query.filter(getattr(self.model, field) == value)
        return query.first()

    def count(self) -> int:
        """Count total entities."""
        return self.session.query(self.model).count()

    def exists(self, entity_id: UUID) -> bool:
        """Check if entity exists."""
        return self.session.query(self.model).filter(self.model.id == entity_id).first() is not None  # type: ignore
