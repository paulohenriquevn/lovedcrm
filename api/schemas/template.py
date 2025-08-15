"""Template Schemas.

Pydantic schemas for Message Template API with validation.
"""

from datetime import datetime
from typing import Any, Dict, List, Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class TemplateBase(BaseModel):
    """Base template schema with common fields."""

    name: str = Field(..., min_length=1, max_length=255, description="Template name")
    category: str = Field(default="general", max_length=100, description="Template category")
    content: str = Field(..., min_length=1, description="Template content with variables")


class TemplateCreate(TemplateBase):
    """Schema for creating new template."""

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "name": "Saudação Inicial",
                "category": "greeting",
                "content": "Olá {{lead_name}}! Obrigado pelo interesse em nossos serviços. Como posso ajudar você hoje?",
            }
        }
    )


class TemplateUpdate(BaseModel):
    """Schema for updating existing template."""

    name: Optional[str] = Field(None, min_length=1, max_length=255)
    category: Optional[str] = Field(None, max_length=100)
    content: Optional[str] = Field(None, min_length=1)
    is_active: Optional[bool] = None

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "name": "Saudação Atualizada",
                "content": "Olá {{lead_name}}! Que bom receber seu contato sobre {{company}}.",
            }
        }
    )


class TemplateResponse(TemplateBase):
    """Schema for template response."""

    id: UUID
    organization_id: UUID
    variables: List[str]
    is_active: bool
    usage_count: int
    created_by_id: Optional[UUID] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class TemplateUseRequest(BaseModel):
    """Schema for using template with variable substitution."""

    context: Dict[str, Any] = Field(
        ...,
        description="Variables context for substitution",
        examples=[
            {
                "lead_name": "João Silva",
                "company": "Agência XYZ",
                "value": "R$ 15.000",
                "phone": "+55 11 99999-9999",
            }
        ],
    )


class TemplateUseResponse(BaseModel):
    """Schema for template usage response."""

    template_id: UUID
    rendered_content: str
    original_content: str
    variables_used: List[str]

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "template_id": "123e4567-e89b-12d3-a456-426614174000",
                "rendered_content": "Olá João Silva! Obrigado pelo interesse em nossos serviços.",
                "original_content": "Olá {{lead_name}}! Obrigado pelo interesse em nossos serviços.",
                "variables_used": ["lead_name"],
            }
        }
    )


class TemplateListResponse(BaseModel):
    """Schema for paginated template list."""

    templates: List[TemplateResponse]
    total: int
    page: int
    page_size: int
    has_next: bool
    has_prev: bool
