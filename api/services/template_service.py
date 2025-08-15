"""Template Service.

Business logic for Message Template management with organizational isolation.
"""

import logging
import re
from typing import Any, Dict, List, Optional
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from api.models.message_template import MessageTemplate

logger = logging.getLogger(__name__)


class TemplateService:
    """Service for Template business logic with organizational scope."""

    def __init__(self, db: Session):
        """Initialize the Template Service."""
        self.db = db

    def get_templates(
        self, organization_id: UUID, category: Optional[str] = None, is_active: bool = True
    ) -> List[MessageTemplate]:
        """Get organization templates with optional filtering."""
        try:
            query = self.db.query(MessageTemplate).filter(
                MessageTemplate.organization_id == organization_id,
                MessageTemplate.is_active == is_active,
            )

            if category:
                query = query.filter(MessageTemplate.category == category)

            templates = query.order_by(MessageTemplate.usage_count.desc()).all()

            logger.info(
                "Retrieved templates for organization",
                extra={
                    "organization_id": str(organization_id),
                    "category": category,
                    "count": len(templates),
                },
            )

            return templates

        except Exception as e:
            logger.error(
                "Failed to retrieve templates",
                extra={
                    "organization_id": str(organization_id),
                    "category": category,
                    "error": str(e),
                },
                exc_info=True,
            )
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to retrieve templates",
            )

    def get_template_by_id(
        self, template_id: UUID, organization_id: UUID
    ) -> Optional[MessageTemplate]:
        """Get template by ID with organization validation."""
        try:
            template = (
                self.db.query(MessageTemplate)
                .filter(
                    MessageTemplate.id == template_id,
                    MessageTemplate.organization_id == organization_id,
                )
                .first()
            )

            if template:
                logger.info(
                    "Template retrieved successfully",
                    extra={
                        "template_id": str(template_id),
                        "organization_id": str(organization_id),
                    },
                )

            return template

        except Exception as e:
            logger.error(
                "Failed to retrieve template by ID",
                extra={
                    "template_id": str(template_id),
                    "organization_id": str(organization_id),
                    "error": str(e),
                },
                exc_info=True,
            )
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to retrieve template",
            )

    def create_template(
        self,
        organization_id: UUID,
        name: str,
        category: str,
        content: str,
        user_id: Optional[UUID] = None,
    ) -> MessageTemplate:
        """Create new template with organization isolation."""
        try:
            # Extract variables from content
            variables = self._extract_variables(content)

            template = MessageTemplate(
                organization_id=organization_id,
                name=name,
                category=category,
                content=content,
                variables=variables,
                created_by_id=user_id,
            )

            self.db.add(template)
            self.db.commit()
            self.db.refresh(template)

            logger.info(
                "Template created successfully",
                extra={
                    "template_id": str(template.id),
                    "organization_id": str(organization_id),
                    "template_name": name,
                    "category": category,
                },
            )

            return template

        except Exception as e:
            self.db.rollback()
            logger.error(
                "Failed to create template",
                extra={
                    "organization_id": str(organization_id),
                    "template_name": name,
                    "category": category,
                    "error": str(e),
                },
                exc_info=True,
            )
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create template",
            )

    def update_template(
        self,
        template_id: UUID,
        organization_id: UUID,
        name: Optional[str] = None,
        category: Optional[str] = None,
        content: Optional[str] = None,
        is_active: Optional[bool] = None,
    ) -> MessageTemplate:
        """Update template with organization validation."""
        try:
            template = self.get_template_by_id(template_id, organization_id)
            if not template:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND, detail="Template not found"
                )

            # Update fields if provided
            if name is not None:
                template.name = name
            if category is not None:
                template.category = category
            if content is not None:
                template.content = content
                # Re-extract variables from new content
                template.variables = self._extract_variables(content)
            if is_active is not None:
                template.is_active = is_active

            self.db.commit()
            self.db.refresh(template)

            logger.info(
                "Template updated successfully",
                extra={"template_id": str(template_id), "organization_id": str(organization_id)},
            )

            return template

        except HTTPException:
            raise
        except Exception as e:
            self.db.rollback()
            logger.error(
                "Failed to update template",
                extra={
                    "template_id": str(template_id),
                    "organization_id": str(organization_id),
                    "error": str(e),
                },
                exc_info=True,
            )
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update template",
            )

    def delete_template(self, template_id: UUID, organization_id: UUID) -> bool:
        """Delete template with organization validation."""
        try:
            template = self.get_template_by_id(template_id, organization_id)
            if not template:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND, detail="Template not found"
                )

            self.db.delete(template)
            self.db.commit()

            logger.info(
                "Template deleted successfully",
                extra={"template_id": str(template_id), "organization_id": str(organization_id)},
            )

            return True

        except HTTPException:
            raise
        except Exception as e:
            self.db.rollback()
            logger.error(
                "Failed to delete template",
                extra={
                    "template_id": str(template_id),
                    "organization_id": str(organization_id),
                    "error": str(e),
                },
                exc_info=True,
            )
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to delete template",
            )

    def substitute_variables(self, template: MessageTemplate, context: Dict[str, Any]) -> str:
        """Replace template variables with actual values."""
        try:
            content = template.content

            # Extract all {{variable}} patterns
            pattern = r"\{\{(\w+)\}\}"
            matches = re.findall(pattern, content)

            for variable in matches:
                if variable in context and context[variable] is not None:
                    placeholder = f"{{{{{variable}}}}}"
                    value = str(context[variable])
                    content = content.replace(placeholder, value)
                # If variable not found, leave placeholder intact for graceful fallback

            logger.debug(
                "Variables substituted in template",
                extra={
                    "template_id": str(template.id),
                    "variables_found": len(matches),
                    "variables_substituted": sum(1 for var in matches if var in context),
                },
            )

            return content

        except Exception as e:
            logger.error(
                "Failed to substitute variables",
                extra={
                    "template_id": str(template.id),
                    "context_keys": list(context.keys()),
                    "error": str(e),
                },
                exc_info=True,
            )
            # Return original content if substitution fails
            return template.content

    def increment_usage(self, template_id: UUID, organization_id: UUID) -> bool:
        """Increment template usage count with org validation."""
        try:
            template = (
                self.db.query(MessageTemplate)
                .filter(
                    MessageTemplate.id == template_id,
                    MessageTemplate.organization_id == organization_id,
                )
                .first()
            )

            if template:
                template.usage_count += 1
                self.db.commit()

                logger.info(
                    "Template usage incremented",
                    extra={
                        "template_id": str(template_id),
                        "organization_id": str(organization_id),
                        "new_usage_count": template.usage_count,
                    },
                )
                return True

            return False

        except Exception as e:
            self.db.rollback()
            logger.error(
                "Failed to increment template usage",
                extra={
                    "template_id": str(template_id),
                    "organization_id": str(organization_id),
                    "error": str(e),
                },
                exc_info=True,
            )
            return False

    def use_template(
        self, template_id: UUID, organization_id: UUID, context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Use template with variable substitution + increment usage."""
        try:
            # Get template with org validation
            template = self.get_template_by_id(template_id, organization_id)
            if not template:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND, detail="Template not found"
                )

            # Substitute variables
            rendered_content = self.substitute_variables(template, context)

            # Increment usage count
            self.increment_usage(template_id, organization_id)

            result = {
                "template_id": str(template_id),
                "rendered_content": rendered_content,
                "original_content": template.content,
                "variables_used": template.variables,
            }

            logger.info(
                "Template used successfully",
                extra={
                    "template_id": str(template_id),
                    "organization_id": str(organization_id),
                    "context_provided": list(context.keys()),
                },
            )

            return result

        except HTTPException:
            raise
        except Exception as e:
            logger.error(
                "Failed to use template",
                extra={
                    "template_id": str(template_id),
                    "organization_id": str(organization_id),
                    "error": str(e),
                },
                exc_info=True,
            )
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to use template"
            )

    def _extract_variables(self, content: str) -> List[str]:
        """Extract variable names from template content."""
        try:
            pattern = r"\{\{(\w+)\}\}"
            variables = list(set(re.findall(pattern, content)))

            logger.debug(
                "Variables extracted from content",
                extra={"content_length": len(content), "variables_found": variables},
            )

            return variables

        except Exception as e:
            logger.error(
                "Failed to extract variables",
                extra={
                    "content": content[:100] + "..." if len(content) > 100 else content,
                    "error": str(e),
                },
                exc_info=True,
            )
            return []
