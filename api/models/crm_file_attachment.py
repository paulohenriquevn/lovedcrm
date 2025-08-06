"""
CRM File Attachment Model
Gerenciamento de arquivos e mídias com isolamento organizacional
"""

from datetime import datetime
from enum import Enum
from typing import Dict, Any, Optional
from uuid import UUID, uuid4

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
    UUID as SQLAlchemyUUID
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from api.core.database import Base


class StorageType(str, Enum):
    """Storage backend types"""
    MINIO = "minio"
    RAILWAY_VOLUME = "railway_volume"
    AWS_S3 = "aws_s3"
    LOCAL_DISK = "local_disk"


class FileAttachment(Base):
    """
    File Attachment model for media and documents
    
    Manages file storage with organization isolation
    All attachments are scoped to organization_id
    """
    __tablename__ = "file_attachments"
    
    # Primary key
    id: UUID = Column(SQLAlchemyUUID(as_uuid=True), primary_key=True, default=uuid4)
    
    # Organizational isolation (CRITICAL)
    organization_id: UUID = Column(
        SQLAlchemyUUID(as_uuid=True),
        ForeignKey("organizations.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    
    # Communication association (optional - files can exist without communication)
    communication_id: Optional[UUID] = Column(
        SQLAlchemyUUID(as_uuid=True),
        ForeignKey("communications.id", ondelete="CASCADE"),
        nullable=True,
        index=True
    )
    
    # File information
    filename: str = Column(String(500), nullable=False)
    original_filename: Optional[str] = Column(String(500), nullable=True)
    file_size: Optional[int] = Column(Integer, nullable=True)  # Size in bytes
    content_type: Optional[str] = Column(String(100), nullable=True)  # MIME type
    
    # Storage details
    storage_path: str = Column(Text, nullable=False)
    storage_type: StorageType = Column(
        String(20),
        nullable=False,
        default=StorageType.MINIO,
        index=True
    )
    is_encrypted: bool = Column(Boolean, nullable=False, default=True)
    
    # File metadata
    file_metadata: Dict[str, Any] = Column(JSONB, nullable=False, default=dict)
    
    # Timestamp
    created_at: datetime = Column(
        DateTime(timezone=True),
        nullable=False,
        default=func.now(),
        index=True
    )
    
    # Relationships
    organization = relationship("Organization", back_populates="file_attachments")
    communication = relationship("Communication", back_populates="file_attachments")
    
    def __repr__(self):
        return f"<FileAttachment(id={self.id}, filename='{self.filename}', size={self.file_size}, org_id={self.organization_id})>"
    
    @property
    def is_image(self) -> bool:
        """Check if file is an image"""
        if not self.content_type:
            return False
        return self.content_type.startswith('image/')
    
    @property
    def is_video(self) -> bool:
        """Check if file is a video"""
        if not self.content_type:
            return False
        return self.content_type.startswith('video/')
    
    @property
    def is_audio(self) -> bool:
        """Check if file is audio"""
        if not self.content_type:
            return False
        return self.content_type.startswith('audio/')
    
    @property
    def is_document(self) -> bool:
        """Check if file is a document"""
        if not self.content_type:
            return False
        document_types = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'text/plain',
            'text/csv'
        ]
        return self.content_type in document_types
    
    @property
    def file_extension(self) -> Optional[str]:
        """Get file extension from filename"""
        if not self.filename:
            return None
        parts = self.filename.split('.')
        return parts[-1].lower() if len(parts) > 1 else None
    
    @property
    def display_name(self) -> str:
        """Get display name for the file"""
        return self.original_filename or self.filename
    
    @property
    def is_large_file(self) -> bool:
        """Check if file is considered large (>10MB)"""
        if not self.file_size:
            return False
        return self.file_size > 10 * 1024 * 1024  # 10MB in bytes
    
    @property
    def size_mb(self) -> Optional[float]:
        """Get file size in MB"""
        if not self.file_size:
            return None
        return round(self.file_size / (1024 * 1024), 2)
    
    @property
    def size_display(self) -> str:
        """Get human-readable file size"""
        if not self.file_size:
            return "Unknown size"
        
        size = self.file_size
        units = ['B', 'KB', 'MB', 'GB']
        unit_index = 0
        
        while size >= 1024 and unit_index < len(units) - 1:
            size = size / 1024
            unit_index += 1
        
        return f"{size:.1f} {units[unit_index]}"
    
    def update_metadata(self, new_metadata: Dict[str, Any]):
        """Update file metadata"""
        if not self.file_metadata:
            self.file_metadata = {}
        self.file_metadata.update(new_metadata)
    
    def add_processing_info(self, processing_data: Dict[str, Any]):
        """Add file processing information to metadata"""
        if not self.file_metadata:
            self.file_metadata = {}
        if 'processing' not in self.file_metadata:
            self.file_metadata['processing'] = {}
        self.file_metadata['processing'].update(processing_data)
    
    def mark_as_processed(self, processor: str, result: Dict[str, Any]):
        """Mark file as processed by specific processor"""
        if not self.file_metadata:
            self.file_metadata = {}
        if 'processed_by' not in self.file_metadata:
            self.file_metadata['processed_by'] = {}
        
        self.file_metadata['processed_by'][processor] = {
            'result': result,
            'timestamp': datetime.utcnow().isoformat()
        }
    
    def set_thumbnail_path(self, thumbnail_path: str):
        """Set thumbnail path for images/videos"""
        self.update_metadata({
            'thumbnail_path': thumbnail_path,
            'has_thumbnail': True
        })
    
    @classmethod
    def create_from_upload(
        cls,
        organization_id: UUID,
        filename: str,
        storage_path: str,
        file_size: int,
        content_type: str,
        original_filename: Optional[str] = None,
        communication_id: Optional[UUID] = None,
        storage_type: StorageType = StorageType.MINIO,
        is_encrypted: bool = True,
        metadata: Optional[Dict[str, Any]] = None
    ) -> "FileAttachment":
        """Factory method for file uploads"""
        return cls(
            organization_id=organization_id,
            communication_id=communication_id,
            filename=filename,
            original_filename=original_filename or filename,
            file_size=file_size,
            content_type=content_type,
            storage_path=storage_path,
            storage_type=storage_type,
            is_encrypted=is_encrypted,
            file_metadata=metadata or {}
        )
    
    @classmethod
    def create_whatsapp_media(
        cls,
        organization_id: UUID,
        communication_id: UUID,
        filename: str,
        storage_path: str,
        content_type: str,
        file_size: Optional[int] = None,
        whatsapp_media_id: Optional[str] = None,
        storage_type: StorageType = StorageType.MINIO
    ) -> "FileAttachment":
        """Factory method for WhatsApp media files"""
        metadata = {
            'source': 'whatsapp',
            'whatsapp_media_id': whatsapp_media_id
        }
        
        return cls(
            organization_id=organization_id,
            communication_id=communication_id,
            filename=filename,
            original_filename=filename,
            file_size=file_size,
            content_type=content_type,
            storage_path=storage_path,
            storage_type=storage_type,
            is_encrypted=True,
            metadata=metadata
        )
    
    @classmethod
    def create_email_attachment(
        cls,
        organization_id: UUID,
        communication_id: UUID,
        filename: str,
        storage_path: str,
        content_type: str,
        file_size: int,
        original_filename: Optional[str] = None,
        email_attachment_id: Optional[str] = None,
        storage_type: StorageType = StorageType.MINIO
    ) -> "FileAttachment":
        """Factory method for email attachments"""
        metadata = {
            'source': 'email',
            'email_attachment_id': email_attachment_id
        }
        
        return cls(
            organization_id=organization_id,
            communication_id=communication_id,
            filename=filename,
            original_filename=original_filename or filename,
            file_size=file_size,
            content_type=content_type,
            storage_path=storage_path,
            storage_type=storage_type,
            is_encrypted=True,
            metadata=metadata
        )