"""Unit tests for repositories.base module.

Following CLAUDE.md principles:
- FUNCTIONALITY FIRST: Test success scenarios (2XX) before error scenarios (4XX)
- Focus on what the system DOES, not just what it REJECTS
- Test real usage scenarios with proper repository operations
"""

import pytest
import uuid
from unittest.mock import Mock, MagicMock
from typing import List

from api.repositories.base import SQLRepository, HasId


# Mock model class for testing
class MockEntity:
    """Mock entity class for testing repository."""
    
    # Mock class attributes to simulate SQLAlchemy model
    id = Mock()
    name = Mock()
    is_active = Mock()
    
    def __init__(self, id: uuid.UUID = None, name: str = "test", is_active: bool = True):
        self.id = id or uuid.uuid4()
        self.name = name
        self.is_active = is_active


class TestSQLRepository:
    """Test SQLRepository functionality - FUNCTIONALITY FIRST."""

    @pytest.fixture
    def mock_session(self):
        """Create mock database session."""
        session = Mock()
        session.add = Mock()
        session.commit = Mock()
        session.refresh = Mock()
        session.delete = Mock()
        session.query = Mock()
        return session

    @pytest.fixture
    def repository(self, mock_session):
        """Create repository instance with mock session."""
        return SQLRepository(mock_session, MockEntity)

    def test_repository_initialization_success(self, mock_session):
        """Test repository initializes correctly."""
        # ✅ SUCCESS SCENARIO: Repository initialization works
        repo = SQLRepository(mock_session, MockEntity)
        
        assert repo.session == mock_session
        assert repo.model == MockEntity

    def test_create_entity_success(self, repository, mock_session):
        """Test creating a new entity."""
        # ✅ SUCCESS SCENARIO: Entity creation works correctly
        entity = MockEntity(name="Test Entity")
        
        # Mock refresh to simulate database behavior
        def mock_refresh(obj):
            obj.id = uuid.uuid4()
        mock_session.refresh.side_effect = mock_refresh
        
        result = repository.create(entity)
        
        # Verify session operations
        mock_session.add.assert_called_once_with(entity)
        mock_session.commit.assert_called_once()
        mock_session.refresh.assert_called_once_with(entity)
        
        # Verify result
        assert result == entity
        assert result.name == "Test Entity"

    def test_find_by_id_success(self, repository, mock_session):
        """Test finding entity by ID."""
        # ✅ SUCCESS SCENARIO: Find by ID returns correct entity
        entity_id = uuid.uuid4()
        expected_entity = MockEntity(id=entity_id, name="Found Entity")
        
        # Setup mock query chain
        mock_query = Mock()
        mock_filter = Mock()
        mock_query.filter.return_value = mock_filter
        mock_filter.first.return_value = expected_entity
        mock_session.query.return_value = mock_query
        
        result = repository.find_by_id(entity_id)
        
        # Verify query was constructed correctly
        mock_session.query.assert_called_once_with(MockEntity)
        mock_query.filter.assert_called_once()
        mock_filter.first.assert_called_once()
        
        assert result == expected_entity

    def test_find_by_id_not_found_success(self, repository, mock_session):
        """Test finding entity by ID when not found."""
        # ✅ SUCCESS SCENARIO: Non-existent ID returns None
        entity_id = uuid.uuid4()
        
        # Setup mock query chain to return None
        mock_query = Mock()
        mock_filter = Mock()
        mock_query.filter.return_value = mock_filter
        mock_filter.first.return_value = None
        mock_session.query.return_value = mock_query
        
        result = repository.find_by_id(entity_id)
        
        assert result is None

    def test_find_all_with_pagination_success(self, repository, mock_session):
        """Test finding all entities with pagination."""
        # ✅ SUCCESS SCENARIO: Find all with pagination works correctly
        entities = [
            MockEntity(name="Entity 1"),
            MockEntity(name="Entity 2"),
            MockEntity(name="Entity 3")
        ]
        
        # Setup mock query chain
        mock_query = Mock()
        mock_offset = Mock()
        mock_limit = Mock()
        mock_query.offset.return_value = mock_offset
        mock_offset.limit.return_value = mock_limit
        mock_limit.all.return_value = entities
        mock_session.query.return_value = mock_query
        
        result = repository.find_all(limit=2, offset=1)
        
        # Verify pagination parameters
        mock_query.offset.assert_called_once_with(1)
        mock_offset.limit.assert_called_once_with(2)
        mock_limit.all.assert_called_once()
        
        assert result == entities

    def test_find_all_default_pagination_success(self, repository, mock_session):
        """Test finding all entities with default pagination."""
        # ✅ SUCCESS SCENARIO: Default pagination parameters work
        entities = [MockEntity(name=f"Entity {i}") for i in range(5)]
        
        # Setup mock query chain
        mock_query = Mock()
        mock_offset = Mock()
        mock_limit = Mock()
        mock_query.offset.return_value = mock_offset
        mock_offset.limit.return_value = mock_limit
        mock_limit.all.return_value = entities
        mock_session.query.return_value = mock_query
        
        result = repository.find_all()
        
        # Verify default parameters
        mock_query.offset.assert_called_once_with(0)
        mock_offset.limit.assert_called_once_with(100)
        
        assert result == entities

    def test_update_entity_success(self, repository, mock_session):
        """Test updating an entity."""
        # ✅ SUCCESS SCENARIO: Entity update works correctly
        entity = MockEntity(name="Updated Entity")
        
        result = repository.update(entity)
        
        # Verify session operations
        mock_session.commit.assert_called_once()
        mock_session.refresh.assert_called_once_with(entity)
        
        assert result == entity

    def test_delete_entity_success(self, repository, mock_session):
        """Test deleting an entity."""
        # ✅ SUCCESS SCENARIO: Entity deletion works correctly
        entity = MockEntity(name="To Delete")
        
        repository.delete(entity)
        
        # Verify session operations
        mock_session.delete.assert_called_once_with(entity)
        mock_session.commit.assert_called_once()

    def test_find_by_criteria_success(self, repository, mock_session):
        """Test finding entities by criteria."""
        # ✅ SUCCESS SCENARIO: Find by criteria works correctly
        matching_entities = [
            MockEntity(name="Active Entity", is_active=True)
        ]
        
        # Setup mock query chain that simulates reassignment
        mock_query1 = Mock()
        mock_query2 = Mock()
        mock_final_query = Mock()
        
        # First filter call returns mock_query2, second returns mock_final_query
        mock_query1.filter.return_value = mock_query2
        mock_query2.filter.return_value = mock_final_query
        mock_final_query.all.return_value = matching_entities
        
        mock_session.query.return_value = mock_query1
        
        result = repository.find_by_criteria(name="Active Entity", is_active=True)
        
        # Verify query construction
        mock_session.query.assert_called_once_with(MockEntity)
        assert mock_query1.filter.call_count == 1  # First criteria
        assert mock_query2.filter.call_count == 1  # Second criteria
        mock_final_query.all.assert_called_once()
        
        assert result == matching_entities

    def test_find_by_criteria_nonexistent_field_success(self, repository, mock_session):
        """Test finding entities by criteria with non-existent field."""
        # ✅ SUCCESS SCENARIO: Non-existent fields are ignored gracefully
        entities = [MockEntity(name="Test")]
        
        # Setup mock query chain
        mock_query = Mock()
        mock_filter = Mock()
        mock_query.filter.return_value = mock_filter
        mock_filter.all.return_value = entities
        mock_session.query.return_value = mock_query
        
        # Search with valid and invalid fields
        result = repository.find_by_criteria(name="Test", nonexistent_field="value")
        
        # Should only filter by existing fields
        mock_query.filter.assert_called_once()  # Only for 'name'
        assert result == entities

    def test_find_one_by_criteria_success(self, repository, mock_session):
        """Test finding single entity by criteria."""
        # ✅ SUCCESS SCENARIO: Find one by criteria works correctly
        expected_entity = MockEntity(name="Unique Entity")
        
        # Setup mock query chain
        mock_query = Mock()
        mock_filter = Mock()
        mock_query.filter.return_value = mock_filter
        mock_filter.first.return_value = expected_entity
        mock_session.query.return_value = mock_query
        
        result = repository.find_one_by_criteria(name="Unique Entity")
        
        # Verify query construction
        mock_session.query.assert_called_once_with(MockEntity)
        mock_query.filter.assert_called_once()
        mock_filter.first.assert_called_once()
        
        assert result == expected_entity

    def test_find_one_by_criteria_not_found_success(self, repository, mock_session):
        """Test finding single entity by criteria when not found."""
        # ✅ SUCCESS SCENARIO: Returns None when no match found
        # Setup mock query chain to return None
        mock_query = Mock()
        mock_filter = Mock()
        mock_query.filter.return_value = mock_filter
        mock_filter.first.return_value = None
        mock_session.query.return_value = mock_query
        
        result = repository.find_one_by_criteria(name="Non-existent")
        
        assert result is None

    def test_count_entities_success(self, repository, mock_session):
        """Test counting total entities."""
        # ✅ SUCCESS SCENARIO: Count returns correct number
        expected_count = 42
        
        # Setup mock query chain
        mock_query = Mock()
        mock_query.count.return_value = expected_count
        mock_session.query.return_value = mock_query
        
        result = repository.count()
        
        # Verify query construction
        mock_session.query.assert_called_once_with(MockEntity)
        mock_query.count.assert_called_once()
        
        assert result == expected_count

    def test_exists_entity_found_success(self, repository, mock_session):
        """Test checking if entity exists when it does."""
        # ✅ SUCCESS SCENARIO: Exists returns True for existing entity
        entity_id = uuid.uuid4()
        existing_entity = MockEntity(id=entity_id)
        
        # Setup mock query chain
        mock_query = Mock()
        mock_filter = Mock()
        mock_query.filter.return_value = mock_filter
        mock_filter.first.return_value = existing_entity
        mock_session.query.return_value = mock_query
        
        result = repository.exists(entity_id)
        
        # Verify query construction
        mock_session.query.assert_called_once_with(MockEntity)
        mock_query.filter.assert_called_once()
        mock_filter.first.assert_called_once()
        
        assert result is True

    def test_exists_entity_not_found_success(self, repository, mock_session):
        """Test checking if entity exists when it doesn't."""
        # ✅ SUCCESS SCENARIO: Exists returns False for non-existent entity
        entity_id = uuid.uuid4()
        
        # Setup mock query chain to return None
        mock_query = Mock()
        mock_filter = Mock()
        mock_query.filter.return_value = mock_filter
        mock_filter.first.return_value = None
        mock_session.query.return_value = mock_query
        
        result = repository.exists(entity_id)
        
        assert result is False

    def test_repository_crud_workflow_success(self, repository, mock_session):
        """Test complete CRUD workflow."""
        # ✅ SUCCESS SCENARIO: Full CRUD operations work together
        entity_id = uuid.uuid4()
        
        # Create
        entity = MockEntity(id=entity_id, name="CRUD Test")
        created_entity = repository.create(entity)
        
        # Read
        mock_query = Mock()
        mock_filter = Mock()
        mock_query.filter.return_value = mock_filter
        mock_filter.first.return_value = created_entity
        mock_session.query.return_value = mock_query
        
        found_entity = repository.find_by_id(entity_id)
        
        # Update
        found_entity.name = "Updated CRUD Test"
        updated_entity = repository.update(found_entity)
        
        # Delete
        repository.delete(updated_entity)
        
        # Verify all operations were called
        mock_session.add.assert_called_once()
        assert mock_session.commit.call_count >= 3  # Create, Update, Delete
        mock_session.refresh.assert_called()
        mock_session.delete.assert_called_once()

    def test_repository_with_different_model_types_success(self, mock_session):
        """Test repository works with different model types."""
        # ✅ SUCCESS SCENARIO: Repository is generic and works with any model
        class AnotherMockEntity:
            def __init__(self, id: uuid.UUID = None, description: str = "test"):
                self.id = id or uuid.uuid4()
                self.description = description
        
        repo = SQLRepository(mock_session, AnotherMockEntity)
        
        assert repo.model == AnotherMockEntity
        assert repo.session == mock_session
        
        # Should work with the new model type
        entity = AnotherMockEntity(description="Different model")
        repo.create(entity)
        
        mock_session.add.assert_called_with(entity)