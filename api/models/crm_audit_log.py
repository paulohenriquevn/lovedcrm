"""
CRM Audit Log Model
Sistema de auditoria com isolamento organizacional
"""

from datetime import datetime
from enum import Enum
from ipaddress import IPv4Address, IPv6Address
from typing import Dict, Any, Optional, Union
from uuid import UUID, uuid4

from sqlalchemy import (
    Column,
    DateTime,
    ForeignKey,
    String,
    Text,
    UUID as SQLAlchemyUUID,
    CheckConstraint
)
from sqlalchemy.dialects.postgresql import INET, JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from api.core.database import Base


class AuditAction(str, Enum):
    """Audit log actions"""
    INSERT = "INSERT"
    UPDATE = "UPDATE"
    DELETE = "DELETE"


class AuditLog(Base):
    """
    Audit Log model for tracking data changes
    
    Tracks all data modifications with organization isolation
    All audit logs are scoped to organization_id
    """
    __tablename__ = "audit_logs"
    
    # Primary key
    id: UUID = Column(SQLAlchemyUUID(as_uuid=True), primary_key=True, default=uuid4)
    
    # Organizational isolation (CRITICAL)
    organization_id: UUID = Column(
        SQLAlchemyUUID(as_uuid=True),
        ForeignKey("organizations.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    
    # Record information
    table_name: str = Column(String(50), nullable=False, index=True)
    record_id: UUID = Column(SQLAlchemyUUID(as_uuid=True), nullable=False, index=True)
    action: AuditAction = Column(String(20), nullable=False, index=True)
    
    # Change tracking
    old_values: Optional[Dict[str, Any]] = Column(JSONB, nullable=True)
    new_values: Optional[Dict[str, Any]] = Column(JSONB, nullable=True)
    
    # User and session information
    user_id: Optional[UUID] = Column(
        SQLAlchemyUUID(as_uuid=True),
        ForeignKey("users.id"),
        nullable=True,
        index=True
    )
    ip_address: Optional[Union[IPv4Address, IPv6Address]] = Column(INET, nullable=True)
    user_agent: Optional[str] = Column(Text, nullable=True)
    
    # Timestamp
    created_at: datetime = Column(
        DateTime(timezone=True),
        nullable=False,
        default=func.now(),
        index=True
    )
    
    # Table constraints
    __table_args__ = (
        CheckConstraint(
            action.in_([
                AuditAction.INSERT.value,
                AuditAction.UPDATE.value,
                AuditAction.DELETE.value
            ]),
            name='audit_logs_action_check'
        ),
        {'extend_existing': True}
    )
    
    # Relationships
    organization = relationship("Organization", back_populates="audit_logs")
    user = relationship("User", backref="audit_logs")
    
    def __repr__(self):
        return f"<AuditLog(id={self.id}, table='{self.table_name}', action='{self.action}', record_id={self.record_id}, org_id={self.organization_id})>"
    
    @property
    def is_insert(self) -> bool:
        """Check if this is an INSERT action"""
        return self.action == AuditAction.INSERT
    
    @property
    def is_update(self) -> bool:
        """Check if this is an UPDATE action"""
        return self.action == AuditAction.UPDATE
    
    @property
    def is_delete(self) -> bool:
        """Check if this is a DELETE action"""
        return self.action == AuditAction.DELETE
    
    @property
    def has_user(self) -> bool:
        """Check if audit log has associated user"""
        return self.user_id is not None
    
    @property
    def has_ip_address(self) -> bool:
        """Check if audit log has IP address"""
        return self.ip_address is not None
    
    @property
    def has_user_agent(self) -> bool:
        """Check if audit log has user agent"""
        return bool(self.user_agent)
    
    @property
    def changed_fields(self) -> list:
        """Get list of fields that were changed in UPDATE actions"""
        if not self.is_update or not self.new_values:
            return []
        return list(self.new_values.keys())
    
    @property
    def change_count(self) -> int:
        """Get number of fields changed"""
        return len(self.changed_fields)
    
    def get_field_change(self, field_name: str) -> Optional[Dict[str, Any]]:
        """Get before/after values for a specific field"""
        if not self.is_update:
            return None
        
        result = {}
        if self.old_values and field_name in self.old_values:
            result['old'] = self.old_values[field_name]
        if self.new_values and field_name in self.new_values:
            result['new'] = self.new_values[field_name]
        
        return result if result else None
    
    def get_summary(self) -> str:
        """Get human-readable summary of the audit log"""
        if self.is_insert:
            return f"Created {self.table_name} record {self.record_id}"
        elif self.is_update:
            field_count = self.change_count
            return f"Updated {field_count} field(s) in {self.table_name} record {self.record_id}"
        elif self.is_delete:
            return f"Deleted {self.table_name} record {self.record_id}"
        else:
            return f"Unknown action {self.action} on {self.table_name} record {self.record_id}"
    
    @classmethod
    def create_insert_log(
        cls,
        organization_id: UUID,
        table_name: str,
        record_id: UUID,
        new_values: Dict[str, Any],
        user_id: Optional[UUID] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None
    ) -> "AuditLog":
        """Factory method for INSERT audit logs"""
        return cls(
            organization_id=organization_id,
            table_name=table_name,
            record_id=record_id,
            action=AuditAction.INSERT,
            old_values=None,
            new_values=new_values,
            user_id=user_id,
            ip_address=ip_address,
            user_agent=user_agent
        )
    
    @classmethod
    def create_update_log(
        cls,
        organization_id: UUID,
        table_name: str,
        record_id: UUID,
        old_values: Dict[str, Any],
        new_values: Dict[str, Any],
        user_id: Optional[UUID] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None
    ) -> "AuditLog":
        """Factory method for UPDATE audit logs"""
        return cls(
            organization_id=organization_id,
            table_name=table_name,
            record_id=record_id,
            action=AuditAction.UPDATE,
            old_values=old_values,
            new_values=new_values,
            user_id=user_id,
            ip_address=ip_address,
            user_agent=user_agent
        )
    
    @classmethod
    def create_delete_log(
        cls,
        organization_id: UUID,
        table_name: str,
        record_id: UUID,
        old_values: Dict[str, Any],
        user_id: Optional[UUID] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None
    ) -> "AuditLog":
        """Factory method for DELETE audit logs"""
        return cls(
            organization_id=organization_id,
            table_name=table_name,
            record_id=record_id,
            action=AuditAction.DELETE,
            old_values=old_values,
            new_values=None,
            user_id=user_id,
            ip_address=ip_address,
            user_agent=user_agent
        )
    
    @classmethod
    def log_lead_stage_change(
        cls,
        organization_id: UUID,
        lead_id: UUID,
        old_stage: str,
        new_stage: str,
        user_id: UUID,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None
    ) -> "AuditLog":
        """Specialized method for lead stage changes"""
        return cls.create_update_log(
            organization_id=organization_id,
            table_name="leads",
            record_id=lead_id,
            old_values={"stage": old_stage},
            new_values={"stage": new_stage},
            user_id=user_id,
            ip_address=ip_address,
            user_agent=user_agent
        )
    
    @classmethod
    def log_communication_creation(
        cls,
        organization_id: UUID,
        communication_id: UUID,
        channel: str,
        direction: str,
        user_id: Optional[UUID] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None
    ) -> "AuditLog":
        """Specialized method for communication creation"""
        return cls.create_insert_log(
            organization_id=organization_id,
            table_name="communications",
            record_id=communication_id,
            new_values={
                "channel": channel,
                "direction": direction
            },
            user_id=user_id,
            ip_address=ip_address,
            user_agent=user_agent
        )