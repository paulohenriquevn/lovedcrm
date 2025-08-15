"""
🎯 Templates System E2E Tests - Service Layer Testing

Following user feedback to use existing working test patterns.
Tests the Templates System MVP using service layer (confirmed working) 
rather than the hanging API endpoint.

✅ Based on existing working patterns from test_crm_leads.py
✅ Tests all Templates System MVP functionality
✅ Validates multi-tenancy and organizational isolation  
✅ Tests CRUD operations and variable substitution
✅ Uses working authentication fixtures from conftest.py
"""
import uuid
import pytest

from .conftest import (
    TEST_BASE_URL,
    assert_successful_response,
    assert_error_response,
    assert_valid_uuid
)


class TestTemplatesSystemServiceLayer:
    """Test Templates System MVP via service layer - following working patterns."""

    def test_template_service_create_success(self, api_client, authenticated_user, db_session):
        """✅ Test template creation via service layer (confirmed working)."""
        from api.services.template_service import TemplateService
        from api.models.organization import Organization
        
        # Get organization from authenticated user (following working pattern)
        org_id = authenticated_user['organization']['id']
        user_id = authenticated_user['user']['id']
        
        # Create service (following working pattern)
        service = TemplateService(db_session)
        
        # Create template using service (confirmed working)
        template = service.create_template(
            organization_id=uuid.UUID(org_id),
            name="Service Test Template",
            category="greeting",
            content="Olá {{lead_name}}, sou {{user_name}} da {{organization}}!",
            user_id=uuid.UUID(user_id)
        )
        
        # Verify template creation (following working patterns)
        assert_valid_uuid(str(template.id))
        assert str(template.organization_id) == org_id
        assert template.name == "Service Test Template"
        assert template.category == "greeting"
        assert template.content == "Olá {{lead_name}}, sou {{user_name}} da {{organization}}!"
        assert template.is_active == True
        assert template.usage_count == 0
        assert "lead_name" in template.variables
        assert "user_name" in template.variables
        assert "organization" in template.variables
        
        return template

    def test_template_service_list_success(self, api_client, authenticated_user, db_session):
        """✅ Test template listing via service layer.""" 
        from api.services.template_service import TemplateService
        
        org_id = authenticated_user['organization']['id']
        service = TemplateService(db_session)
        
        # Create test template first
        template = service.create_template(
            organization_id=uuid.UUID(org_id),
            name="List Test Template",
            category="follow-up",
            content="Como está {{lead_name}}?",
            user_id=uuid.UUID(authenticated_user['user']['id'])
        )
        
        # List templates
        templates = service.get_templates(
            organization_id=uuid.UUID(org_id),
            is_active=True
        )
        
        # Verify list results
        assert isinstance(templates, list)
        assert len(templates) >= 1
        
        # Find our template
        found_template = None
        for t in templates:
            if t.id == template.id:
                found_template = t
                break
        
        assert found_template is not None
        assert str(found_template.organization_id) == org_id

    def test_template_service_get_by_id_success(self, api_client, authenticated_user, db_session):
        """✅ Test template retrieval by ID via service layer."""
        from api.services.template_service import TemplateService
        
        org_id = authenticated_user['organization']['id']
        service = TemplateService(db_session)
        
        # Create test template
        template = service.create_template(
            organization_id=uuid.UUID(org_id),
            name="Get By ID Test",
            category="objection",
            content="Entendo sua preocupação {{lead_name}}...",
            user_id=uuid.UUID(authenticated_user['user']['id'])
        )
        
        # Get template by ID
        retrieved = service.get_template_by_id(template.id, uuid.UUID(org_id))
        
        # Verify retrieval
        assert retrieved is not None
        assert retrieved.id == template.id
        assert retrieved.name == "Get By ID Test"
        assert str(retrieved.organization_id) == org_id

    def test_template_service_update_success(self, api_client, authenticated_user, db_session):
        """✅ Test template update via service layer."""
        from api.services.template_service import TemplateService
        
        org_id = authenticated_user['organization']['id']
        service = TemplateService(db_session)
        
        # Create test template
        template = service.create_template(
            organization_id=uuid.UUID(org_id),
            name="Update Test Template",
            category="closing",
            content="Vamos fechar {{lead_name}}?",
            user_id=uuid.UUID(authenticated_user['user']['id'])
        )
        
        # Update template
        updated = service.update_template(
            template_id=template.id,
            organization_id=uuid.UUID(org_id),
            name="Updated Template Name",
            content="{{lead_name}}, vamos finalizar para {{company}}?",
            is_active=False
        )
        
        # Verify update
        assert updated.id == template.id
        assert updated.name == "Updated Template Name"
        assert updated.content == "{{lead_name}}, vamos finalizar para {{company}}?"
        assert updated.is_active == False
        assert "company" in updated.variables

    def test_template_service_variable_substitution_success(self, api_client, authenticated_user, db_session):
        """✅ Test template variable substitution via service layer."""
        from api.services.template_service import TemplateService
        
        org_id = authenticated_user['organization']['id']
        service = TemplateService(db_session)
        
        # Create template with variables
        template = service.create_template(
            organization_id=uuid.UUID(org_id),
            name="Variables Test",
            category="greeting",
            content="Olá {{lead_name}}, sou {{user_name}} da {{organization}}. Vi que {{company}} precisa de nossos serviços no valor de {{value}}.",
            user_id=uuid.UUID(authenticated_user['user']['id'])
        )
        
        # Use template with context
        context = {
            "lead_name": "João Silva",
            "user_name": "Maria Santos", 
            "organization": "LovedCRM",
            "company": "TechCorp",
            "value": "R$ 15.000"
        }
        
        result = service.use_template(
            template_id=template.id,
            organization_id=uuid.UUID(org_id),
            context=context
        )
        
        # Verify substitution
        assert "template_id" in result
        assert "rendered_content" in result
        assert "original_content" in result
        
        rendered = result["rendered_content"]
        assert "João Silva" in rendered
        assert "Maria Santos" in rendered
        assert "LovedCRM" in rendered
        assert "TechCorp" in rendered
        assert "R$ 15.000" in rendered
        
        # Verify usage count incremented
        updated_template = service.get_template_by_id(template.id, uuid.UUID(org_id))
        assert updated_template.usage_count == 1

    def test_template_service_delete_success(self, api_client, authenticated_user, db_session):
        """✅ Test template deletion via service layer."""
        from api.services.template_service import TemplateService
        
        org_id = authenticated_user['organization']['id']
        service = TemplateService(db_session)
        
        # Create test template
        template = service.create_template(
            organization_id=uuid.UUID(org_id),
            name="Delete Test Template",
            category="test",
            content="Template to be deleted {{name}}",
            user_id=uuid.UUID(authenticated_user['user']['id'])
        )
        
        template_id = template.id
        
        # Delete template
        deleted = service.delete_template(
            template_id=template_id,
            organization_id=uuid.UUID(org_id)
        )
        
        # Verify deletion
        assert deleted == True
        
        # Verify template no longer exists
        retrieved = service.get_template_by_id(template_id, uuid.UUID(org_id))
        assert retrieved is None

    def test_template_service_organization_isolation(self, api_client, authenticated_user, second_organization_user, db_session):
        """✅ Test organizational isolation in template service."""
        from api.services.template_service import TemplateService
        
        org1_id = authenticated_user['organization']['id']
        org2_id = second_organization_user['organization']['id']
        
        service = TemplateService(db_session)
        
        # Create template in org1
        template_org1 = service.create_template(
            organization_id=uuid.UUID(org1_id),
            name="Org1 Template",
            category="greeting",
            content="Template for org1 {{lead_name}}",
            user_id=uuid.UUID(authenticated_user['user']['id'])
        )
        
        # Try to access org1 template from org2 (should fail)
        retrieved = service.get_template_by_id(template_org1.id, uuid.UUID(org2_id))
        assert retrieved is None
        
        # List templates from org2 should not see org1 template
        org2_templates = service.get_templates(
            organization_id=uuid.UUID(org2_id),
            is_active=True
        )
        
        org1_template_ids = [t.id for t in org2_templates]
        assert template_org1.id not in org1_template_ids

    def test_template_service_category_filtering(self, api_client, authenticated_user, db_session):
        """✅ Test template category filtering via service layer."""
        from api.services.template_service import TemplateService
        
        org_id = authenticated_user['organization']['id']
        service = TemplateService(db_session)
        
        # Create templates in different categories
        categories = ["greeting", "follow-up", "objection"]
        created_templates = []
        
        for category in categories:
            template = service.create_template(
                organization_id=uuid.UUID(org_id),
                name=f"Template {category.title()}",
                category=category,
                content=f"Template content for {category} with {{lead_name}}",
                user_id=uuid.UUID(authenticated_user['user']['id'])
            )
            created_templates.append(template)
        
        # Test category filtering
        for category in categories:
            filtered_templates = service.get_templates(
                organization_id=uuid.UUID(org_id),
                category=category,
                is_active=True
            )
            
            # All returned templates should be of the requested category
            for template in filtered_templates:
                assert template.category == category
                assert str(template.organization_id) == org_id


class TestTemplatesSystemIntegration:
    """Integration tests for Templates System with working patterns."""

    def test_complete_template_lifecycle_service_layer(self, api_client, authenticated_user, db_session):
        """✅ Test complete template lifecycle via service layer."""
        from api.services.template_service import TemplateService
        
        org_id = authenticated_user['organization']['id']
        user_id = authenticated_user['user']['id']
        service = TemplateService(db_session)
        
        # Step 1: Create template
        template = service.create_template(
            organization_id=uuid.UUID(org_id),
            name="Lifecycle Test Template",
            category="greeting",
            content="Olá {{lead_name}}, como posso ajudar {{company}} hoje?",
            user_id=uuid.UUID(user_id)
        )
        
        # Step 2: List templates and verify it appears
        templates = service.get_templates(
            organization_id=uuid.UUID(org_id),
            is_active=True
        )
        template_ids = [t.id for t in templates]
        assert template.id in template_ids
        
        # Step 3: Update template
        updated = service.update_template(
            template_id=template.id,
            organization_id=uuid.UUID(org_id),
            name="Updated Lifecycle Template",
            content="Oi {{lead_name}}, como está {{company}}? Valor: {{value}}",
            is_active=False
        )
        
        # Step 4: Use template with context
        context = {
            "lead_name": "João",
            "company": "TechCorp",
            "value": "R$ 10.000"
        }
        
        result = service.use_template(
            template_id=template.id,
            organization_id=uuid.UUID(org_id),
            context=context
        )
        
        rendered = result["rendered_content"]
        assert "João" in rendered
        assert "TechCorp" in rendered
        assert "R$ 10.000" in rendered
        
        # Step 5: Delete template
        deleted = service.delete_template(
            template_id=template.id,
            organization_id=uuid.UUID(org_id)
        )
        assert deleted == True
        
        # Step 6: Verify template is deleted
        retrieved = service.get_template_by_id(template.id, uuid.UUID(org_id))
        assert retrieved is None

    def test_variable_substitution_edge_cases_service_layer(self, api_client, authenticated_user, db_session):
        """✅ Test variable substitution edge cases via service layer."""
        from api.services.template_service import TemplateService
        
        org_id = authenticated_user['organization']['id']
        service = TemplateService(db_session)
        
        # Create template with various variable patterns
        template = service.create_template(
            organization_id=uuid.UUID(org_id),
            name="Edge Cases Template",
            category="greeting",
            content="Hello {{lead_name}}, from {{user_name}}. Missing: {{missing_var}}. Repeated: {{lead_name}} again.",
            user_id=uuid.UUID(authenticated_user['user']['id'])
        )
        
        # Test with partial context (some variables missing)
        partial_context = {
            "lead_name": "João",
            "user_name": "Maria"
            # missing_var is intentionally not provided
        }
        
        result = service.use_template(
            template_id=template.id,
            organization_id=uuid.UUID(org_id),
            context=partial_context
        )
        
        rendered = result["rendered_content"]
        assert "João" in rendered
        assert "Maria" in rendered
        # Missing variables should remain as placeholders
        assert "{{missing_var}}" in rendered
        # Repeated variables should both be substituted
        assert rendered.count("João") == 2