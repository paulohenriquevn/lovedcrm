---
description: 'Cria, atualiza e corrige testes E2E de forma sistemática com troubleshooting completo'
argument-hint: "feature_path ou story_id (ex: 'crm/leads', 'templates', '2.1')"
allowed-tools: ['Read', 'Write', 'Edit', 'MultiEdit', 'LS', 'Bash', 'Grep', 'Glob']
---

# exec-e2e

**🧪 ESPECIALISTA EM TESTES E2E** para sistemas multi-tenant B2B com TROUBLESHOOTING SISTEMÁTICO e PADRÕES RIGOROSOS. Cria, atualiza e corrige testes E2E seguindo a GOLDEN RULE: "FUNCTIONALITY FIRST" com priority 1 para SUCCESS scenarios (2XX) e priority 2 para VALIDATION scenarios (4XX/5XX).

**🎯 METODOLOGIA: EVIDENCE-BASED E2E TESTING**

**PRINCÍPIO FUNDAMENTAL:** Cada teste deve VALIDAR FUNCIONALIDADE REAL que gera VALOR para o usuário final. Implementação baseada em padrões existentes do projeto LovedCRM com isolamento multi-tenant rigoroso e troubleshooting sistemático para falhas comuns.

**Entrada:**
- `feature_path`: Caminho da funcionalidade (ex: "crm/leads", "templates", "auth")  
- `story_id`: ID da história com testes específicos (ex: "2.1", "3.2")

**Saída:**
- **Testes E2E**: Arquivos de teste criados/atualizados seguindo padrões
- **Troubleshooting**: Diagnóstico completo de falhas identificadas
- **Documentação**: Guias de resolução de problemas específicos

**Uso:**
```bash
/exec-e2e "crm/leads"
/exec-e2e "templates" 
/exec-e2e "2.1"
```

---

## 🧠 **ANÁLISE DE PADRÕES DO LOVEDCRM**

### **📊 PADRÕES IDENTIFICADOS NO SISTEMA ATUAL**

**Arquitetura de Testes Consolidada:**
- **26 arquivos de teste** cobrindo toda a API
- **364 testes E2E** com GOLDEN RULE rigorosamente seguida
- **PRIORITY 1**: Tests returning 200, 201, 204 (funcionalidade real)
- **PRIORITY 2**: Validation scenarios (4XX/5XX) para segurança

### **🏗️ ESTRUTURA PADRÃO DE ARQUIVOS**

```python
# Padrão obrigatório identificado no sistema
"""
🎯 [FEATURE] E2E Tests - Following CLAUDE.md GOLDEN RULE

PRIORITY 1: SUCCESS SCENARIOS (2XX) - Real functionality  
PRIORITY 2: Validation and security tests (4XX/5XX)
OBJECTIVE: Verify that [FEATURE] TRULY WORKS
"""
```

### **📋 CLASSES E MÉTODOS PADRÃO**

**Classes Success (PRIORITY 1):**
```python
class Test[Feature]Success:
    """PRIORITY 1: Test successful [feature] flows (2XX responses)."""
    
    def test_[action]_success(self, api_client, authenticated_user):
        """✅ Test successful [action] returns [status] with proper data."""
```

**Classes Validation (PRIORITY 2):**
```python  
class Test[Feature]Validation:
    """PRIORITY 2: Test validation and security scenarios (4XX/5XX)."""
    
    def test_[action]_validation_errors(self, api_client):
        """❌ Test [action] validation returns 422 with proper errors."""
```

### **🔧 FIXTURES PADRÃO OBRIGATÓRIOS**

**Multi-tenancy obrigatório:**
- `authenticated_user`: Usuário com org_id e tokens
- `clean_database`: Cleanup automático entre testes
- `api_client`: HTTP client com headers adequados
- `assert_successful_response()` / `assert_error_response()`

---

## 🚨 **TROUBLESHOOTING SISTEMÁTICO LOVEDCRM**

### **🔴 PROBLEMAS CRÍTICOS IDENTIFICADOS E SOLUÇÕES**

#### **1. DATABASE CONNECTION ISSUES**

**Sintomas:**
```
psycopg2.OperationalError: FATAL: database "saas_test" does not exist
Connection refused on localhost:5434
```

**Diagnóstico:**
```bash
# Verificar status do banco de teste
docker ps | grep postgres
netstat -tulnp | grep 5434
```

**Solução Automática:**
```bash
# Restart database services
cd migrations/
./migrate init  # Recriar banco do zero
./migrate apply # Aplicar schema
```

#### **2. AUTHENTICATION TOKEN ISSUES**

**Sintomas:**
```
401 Unauthorized
403 Forbidden - Missing X-Org-Id header
Invalid or expired token
```

**Diagnóstico:**
```python
# Debug no conftest.py identificado:
if TEST_RECAPTCHA_ENABLED:
    login_data["recaptcha_token"] = TEST_RECAPTCHA_BYPASS_TOKEN
```

**Solução:**
```python
# Fixture correta (padrão do sistema):
headers = {
    'Authorization': f"Bearer {authenticated_user['tokens']['access_token']}",
    'X-Org-Id': authenticated_user['organization']['id']
}
```

#### **3. MULTI-TENANT ISOLATION FAILURES**

**Sintomas:**
```
Cross-organization data leakage
Organization ID mismatch
Tests passing data between organizations
```

**Diagnóstico:**
```python
# Verificar isolation obrigatório:
assert data['organization_id'] == authenticated_user['organization']['id']
```

**Solução:**
```python
# Pattern obrigatório identificado:
def test_cross_org_isolation(self, authenticated_user, second_organization_user):
    # Org1 não pode ver dados da Org2
    assert org1_data != org2_data
```

#### **4. TEST ENVIRONMENT INCONSISTENCIES**

**Sintomas:**
```
Tests pass locally but fail in CI
Flaky tests with timing issues
Data contamination between tests
```

**Solução Sistemática:**
```yaml
Environment Validation (obrigatório):
  - Database: TEST_DATABASE_URL=postgresql://postgres:postgres@localhost:5434/saas_test
  - Headers: X-Org-Id sempre presente
  - Cleanup: clean_database fixture em todos os testes
  - Isolation: Unique test data com UUIDs
```

### **⚡ COMMANDS DE TROUBLESHOOTING RÁPIDO**

```bash
# Health check completo do ambiente E2E
make test-verify                    # Verificar ambiente
docker ps | grep postgres          # Status do banco
npm run typecheck                   # Verificar TypeScript

# Database reset completo
cd migrations/ && ./migrate init && ./migrate apply

# Test específico com debug
DATABASE_HOST=localhost DATABASE_PORT=5434 DATABASE_NAME=saas_test DATABASE_USER=postgres DATABASE_PASSWORD=postgres python3 -m pytest tests/e2e/api/test_[feature].py::Test[Feature]Success::test_[action]_success -v -s

# Verificar serviços rodando
ps aux | grep -E "(uvicorn|pytest|postgres)"
```

---

## 🏗️ **TEMPLATES DE CRIAÇÃO AUTOMÁTICA**

### **📝 TEMPLATE COMPLETO PARA NOVA FEATURE**

```python
"""
🎯 [FEATURE_NAME] E2E Tests - Following CLAUDE.md GOLDEN RULE

PRIORITY 1: SUCCESS SCENARIOS (2XX) - Real functionality
PRIORITY 2: Validation and security tests (4XX/5XX)
OBJECTIVE: Verify that [FEATURE_NAME] TRULY WORKS

Test Coverage:
- ✅ CRUD operations with organization isolation
- ✅ Multi-tenant security validation
- ✅ [Feature-specific functionality]
"""
import uuid
import pytest
import time

from .conftest import (
    TEST_BASE_URL,
    assert_successful_response,
    assert_error_response,
    assert_valid_uuid
)


class Test[Feature]Success:
    """PRIORITY 1: Test successful [feature] flows (2XX responses)."""

    def test_create_[entity]_success(self, api_client, authenticated_user):
        """✅ Test creating new [entity] returns 201 with proper data."""
        headers = {
            'Authorization': f"Bearer {authenticated_user['tokens']['access_token']}",
            'X-Org-Id': authenticated_user['organization']['id']
        }
        
        [entity]_data = {
            "[field1]": "Test Value",
            "[field2]": "test@example.com",
            # Adicionar campos específicos da feature
        }
        
        response = api_client.post(
            f"{TEST_BASE_URL}/[endpoint]/",
            json=[entity]_data,
            headers=headers
        )
        
        assert_successful_response(response, 201)
        data = response.json()
        
        # Validações específicas (padrão identificado)
        assert_valid_uuid(data['id'])
        assert data['organization_id'] == authenticated_user['organization']['id']
        assert data['[field1]'] == [entity]_data['[field1]']
        
        return data

    def test_list_[entities]_success(self, api_client, authenticated_user):
        """✅ Test listing [entities] with pagination and org isolation."""
        headers = {
            'Authorization': f"Bearer {authenticated_user['tokens']['access_token']}",
            'X-Org-Id': authenticated_user['organization']['id']
        }
        
        response = api_client.get(
            f"{TEST_BASE_URL}/[endpoint]/?page=1&page_size=10",
            headers=headers
        )
        
        assert_successful_response(response, 200)
        data = response.json()
        
        # Validar estrutura de paginação (padrão do sistema)
        assert '[entities]' in data or 'data' in data
        assert 'total_count' in data
        assert 'page' in data
        assert 'page_size' in data

    def test_get_[entity]_by_id_success(self, api_client, authenticated_user):
        """✅ Test getting specific [entity] by ID."""
        headers = {
            'Authorization': f"Bearer {authenticated_user['tokens']['access_token']}",
            'X-Org-Id': authenticated_user['organization']['id']
        }
        
        # Criar [entity] para testar
        created_[entity] = self.test_create_[entity]_success(api_client, authenticated_user)
        
        response = api_client.get(
            f"{TEST_BASE_URL}/[endpoint]/{created_[entity]['id']}",
            headers=headers
        )
        
        assert_successful_response(response, 200)
        data = response.json()
        
        assert data['id'] == created_[entity]['id']
        assert data['organization_id'] == authenticated_user['organization']['id']

    def test_update_[entity]_success(self, api_client, authenticated_user):
        """✅ Test updating existing [entity]."""
        headers = {
            'Authorization': f"Bearer {authenticated_user['tokens']['access_token']}",
            'X-Org-Id': authenticated_user['organization']['id']
        }
        
        # Criar [entity] para atualizar
        created_[entity] = self.test_create_[entity]_success(api_client, authenticated_user)
        
        update_data = {
            "[field1]": "Updated Value",
            # Campos para atualização
        }
        
        response = api_client.put(
            f"{TEST_BASE_URL}/[endpoint]/{created_[entity]['id']}",
            json=update_data,
            headers=headers
        )
        
        assert_successful_response(response, 200)
        data = response.json()
        
        assert data['[field1]'] == update_data['[field1]']
        assert data['organization_id'] == authenticated_user['organization']['id']

    def test_delete_[entity]_success(self, api_client, authenticated_user):
        """✅ Test deleting [entity]."""
        headers = {
            'Authorization': f"Bearer {authenticated_user['tokens']['access_token']}",
            'X-Org-Id': authenticated_user['organization']['id']
        }
        
        # Criar [entity] para deletar
        created_[entity] = self.test_create_[entity]_success(api_client, authenticated_user)
        
        response = api_client.delete(
            f"{TEST_BASE_URL}/[endpoint]/{created_[entity]['id']}",
            headers=headers
        )
        
        assert_successful_response(response, 204)


class Test[Feature]Validation:
    """PRIORITY 2: Test validation and security scenarios (4XX/5XX)."""

    def test_create_[entity]_validation_errors(self, api_client, authenticated_user):
        """❌ Test [entity] creation validation returns 422 with proper errors."""
        headers = {
            'Authorization': f"Bearer {authenticated_user['tokens']['access_token']}",
            'X-Org-Id': authenticated_user['organization']['id']
        }
        
        # Dados inválidos para testar validação
        invalid_data = {
            # Campos obrigatórios ausentes ou inválidos
            "[field1]": "",  # Campo vazio
            "[field2]": "invalid-format",  # Formato inválido
        }
        
        response = api_client.post(
            f"{TEST_BASE_URL}/[endpoint]/",
            json=invalid_data,
            headers=headers
        )
        
        assert_error_response(response, 422)
        
        data = response.json()
        assert 'detail' in data
        # Verificar mensagens de validação específicas

    def test_[entity]_access_without_auth_fails(self, api_client):
        """❌ Test accessing [entity] without authentication returns 401."""
        response = api_client.get(f"{TEST_BASE_URL}/[endpoint]/")
        assert_error_response(response, 401)

    def test_[entity]_access_without_org_header_fails(self, api_client, authenticated_user):
        """❌ Test accessing [entity] without X-Org-Id header returns 403."""
        headers = {
            'Authorization': f"Bearer {authenticated_user['tokens']['access_token']}"
            # X-Org-Id missing intentionally
        }
        
        response = api_client.get(
            f"{TEST_BASE_URL}/[endpoint]/",
            headers=headers
        )
        
        assert_error_response(response, 403)


class Test[Feature]MultiTenantIsolation:
    """CRITICAL: Test multi-tenant isolation for [feature]."""

    def test_[entities]_cross_organization_isolation_success(
        self, api_client, authenticated_user, second_organization_user
    ):
        """✅ Test [entities] are completely isolated between organizations."""
        
        # Org1 headers
        org1_headers = {
            'Authorization': f"Bearer {authenticated_user['tokens']['access_token']}",
            'X-Org-Id': authenticated_user['organization']['id']
        }
        
        # Org2 headers  
        org2_headers = {
            'Authorization': f"Bearer {second_organization_user['tokens']['access_token']}",
            'X-Org-Id': second_organization_user['organization']['id']
        }
        
        # Criar [entity] na Org1
        [entity]_data = {"[field1]": "Org1 Data"}
        org1_response = api_client.post(
            f"{TEST_BASE_URL}/[endpoint]/",
            json=[entity]_data,
            headers=org1_headers
        )
        assert_successful_response(org1_response, 201)
        
        # Org2 não deve ver dados da Org1
        org2_response = api_client.get(
            f"{TEST_BASE_URL}/[endpoint]/",
            headers=org2_headers
        )
        assert_successful_response(org2_response, 200)
        
        org2_data = org2_response.json()
        # Verificar isolamento completo
        org1_[entity]_id = org1_response.json()['id']
        org2_[entity]_ids = [item['id'] for item in org2_data.get('[entities]', [])]
        
        assert org1_[entity]_id not in org2_[entity]_ids, "Cross-org data leakage detected!"


class Test[Feature]SystemIntegration:
    """Integration tests for complete [feature] workflows."""

    def test_complete_[entity]_lifecycle(self, api_client, authenticated_user):
        """✅ Test complete [entity] CRUD lifecycle end-to-end."""
        headers = {
            'Authorization': f"Bearer {authenticated_user['tokens']['access_token']}",
            'X-Org-Id': authenticated_user['organization']['id']
        }
        
        # 1. Create [entity]
        create_data = {
            "[field1]": "Lifecycle Test",
            "[field2]": "test@lifecycle.com"
        }
        create_response = api_client.post(
            f"{TEST_BASE_URL}/[endpoint]/",
            json=create_data,
            headers=headers
        )
        assert_successful_response(create_response, 201)
        [entity] = create_response.json()
        
        # 2. Read [entity]
        get_response = api_client.get(
            f"{TEST_BASE_URL}/[endpoint]/{[entity]['id']}",
            headers=headers
        )
        assert_successful_response(get_response, 200)
        assert get_response.json()['id'] == [entity]['id']
        
        # 3. Update [entity]
        update_data = {"[field1]": "Updated Lifecycle"}
        update_response = api_client.put(
            f"{TEST_BASE_URL}/[endpoint]/{[entity]['id']}",
            json=update_data,
            headers=headers
        )
        assert_successful_response(update_response, 200)
        
        # 4. Delete [entity]
        delete_response = api_client.delete(
            f"{TEST_BASE_URL}/[endpoint]/{[entity]['id']}",
            headers=headers
        )
        assert_successful_response(delete_response, 204)
        
        # 5. Verify deletion
        get_deleted_response = api_client.get(
            f"{TEST_BASE_URL}/[endpoint]/{[entity]['id']}",
            headers=headers
        )
        assert_error_response(get_deleted_response, 404)
```

---

## 🚀 **PROCESSO DE EXECUÇÃO**

### **FASE 1: ANÁLISE E DIAGNÓSTICO (2-3 min)**

```yaml
Step 1.1: Feature Analysis
  - Identify feature type: CRUD, Integration, Workflow
  - Analyze existing endpoints and data models
  - Check current test coverage gaps
  - Identify multi-tenant requirements

Step 1.2: Environment Validation  
  - Verify database connectivity
  - Check test environment health
  - Validate authentication systems
  - Confirm services are running

Step 1.3: Troubleshooting Scan
  - Detect common failure patterns
  - Identify authentication issues
  - Check multi-tenant isolation
  - Validate database schema alignment
```

### **FASE 2: TEST CREATION/UPDATE (5-10 min)**

```yaml  
Step 2.1: Template Selection
  - Choose appropriate test template
  - Customize for specific feature
  - Apply LovedCRM patterns
  - Ensure GOLDEN RULE compliance

Step 2.2: Test Implementation
  - Implement Success scenarios (Priority 1)
  - Add Validation scenarios (Priority 2)  
  - Include Multi-tenant isolation tests
  - Add Integration/Lifecycle tests

Step 2.3: Fixtures and Helpers
  - Configure authentication fixtures
  - Setup data cleanup mechanisms
  - Add feature-specific helpers
  - Ensure proper error handling
```

### **FASE 3: VALIDATION E TROUBLESHOOTING (3-5 min)**

```yaml
Step 3.1: Test Execution
  - Run new/updated tests
  - Verify all scenarios pass
  - Check multi-tenant isolation
  - Validate error handling

Step 3.2: Troubleshooting Resolution
  - Diagnose any failures automatically
  - Apply known fixes from playbook
  - Update environment if needed
  - Document new patterns found

Step 3.3: Documentation Update
  - Update test documentation
  - Record new troubleshooting patterns
  - Update failure resolution guides
  - Confirm test coverage metrics
```

---

## 📋 **AUTOMATION FEATURES**

### **🤖 AUTO-DETECTION AND FIXING**

```python
# Auto-fix patterns identificados no sistema:

def auto_fix_database_connection():
    """Automatically fix database connection issues."""
    commands = [
        "cd migrations/",
        "./migrate status",  # Check current state
        "./migrate apply",   # Apply missing migrations
    ]
    return commands

def auto_fix_authentication_issues():
    """Automatically fix authentication token issues."""
    return {
        "missing_headers": {
            'Authorization': f"Bearer {token}",
            'X-Org-Id': f"{org_id}"
        },
        "fixture_pattern": "authenticated_user fixture required"
    }

def auto_fix_multi_tenant_isolation():
    """Ensure proper multi-tenant isolation in tests."""
    return {
        "validation": "assert data['organization_id'] == user['organization']['id']",
        "cross_org_test": "second_organization_user fixture needed"
    }
```

### **📊 COVERAGE ANALYSIS**

```yaml
Auto Coverage Check:
  - Success Scenarios: Count 2XX response tests
  - Validation Scenarios: Count 4XX/5XX response tests  
  - Multi-tenant Tests: Verify cross-org isolation
  - Integration Tests: Check end-to-end workflows
  - Gap Analysis: Identify missing test patterns
```

---

## 🎯 **OUTPUT TEMPLATE**

```markdown
# E2E TESTS: [FEATURE] - SYSTEMATIC CREATION/UPDATE

## 📊 Test Analysis Summary

**Feature**: [Feature Name]
**Type**: [CRUD/Integration/Workflow] 
**Endpoints**: [X] endpoints analyzed
**Existing Tests**: [Y] tests found
**Gaps Identified**: [Z] missing scenarios

---

## 🧪 **TESTS CREATED/UPDATED**

### ✅ PRIORITY 1: SUCCESS SCENARIOS (2XX)

- **test_create_[entity]_success**: ✅ Created - 201 response validation
- **test_list_[entities]_success**: ✅ Created - Pagination + org isolation
- **test_get_[entity]_by_id_success**: ✅ Created - Individual entity retrieval
- **test_update_[entity]_success**: ✅ Created - Entity modification
- **test_delete_[entity]_success**: ✅ Created - Entity deletion

### ❌ PRIORITY 2: VALIDATION SCENARIOS (4XX/5XX)

- **test_create_[entity]_validation_errors**: ✅ Created - 422 validation
- **test_[entity]_access_without_auth_fails**: ✅ Created - 401 unauthorized  
- **test_[entity]_access_without_org_header_fails**: ✅ Created - 403 forbidden

### 🔒 MULTI-TENANT ISOLATION TESTS

- **test_[entities]_cross_organization_isolation**: ✅ Created - Critical isolation
- **test_[entity]_org_id_validation**: ✅ Created - Organization binding

### 🔄 INTEGRATION TESTS

- **test_complete_[entity]_lifecycle**: ✅ Created - Full CRUD workflow

---

## 🚨 **TROUBLESHOOTING RESOLVED**

### Issues Found and Fixed:

1. **Database Connection**: ✅ RESOLVED
   ```bash
   ./migrate apply  # Applied missing migrations
   ```

2. **Authentication Headers**: ✅ RESOLVED  
   ```python
   # Added required headers pattern:
   headers = {
       'Authorization': f"Bearer {token}",
       'X-Org-Id': f"{org_id}"  
   }
   ```

3. **Multi-tenant Isolation**: ✅ RESOLVED
   ```python
   # Added organization validation:
   assert data['organization_id'] == user['organization']['id']
   ```

---

## 📈 **COVERAGE METRICS**

```yaml
Test Coverage Analysis:
  ✅ Success Scenarios: [X]/[X] (100%)
  ✅ Validation Scenarios: [Y]/[Y] (100%) 
  ✅ Multi-tenant Tests: [Z]/[Z] (100%)
  ✅ Integration Tests: [W]/[W] (100%)
  
Overall Coverage: [XX]% COMPLETE
```

---

## 🎯 **EXECUTION RESULTS**

### Test Execution Summary:
```bash
DATABASE_HOST=localhost DATABASE_PORT=5434 DATABASE_NAME=saas_test \
python3 -m pytest tests/e2e/api/test_[feature].py -v

# Results:
✅ [X] tests PASSED
❌ [Y] tests FAILED  
⏸️ [Z] tests SKIPPED

Total: [XX] tests executed in [Y]s
```

### Environment Validation:
- ✅ Database: Connected and ready
- ✅ Authentication: Tokens working
- ✅ Multi-tenancy: Isolation verified
- ✅ Services: All systems operational

---

## 📋 **MAINTENANCE GUIDES**

### Quick Troubleshooting Commands:
```bash
# Health check
make test-verify

# Database reset
cd migrations/ && ./migrate init && ./migrate apply

# Run specific test with debug
DATABASE_HOST=localhost DATABASE_PORT=5434 DATABASE_NAME=saas_test \
python3 -m pytest tests/e2e/api/test_[feature].py::Test[Feature]Success::test_create_[entity]_success -v -s
```

### Common Patterns to Watch:
- All tests must use `authenticated_user` fixture
- All endpoints must validate `organization_id`
- All responses must follow expected status codes
- All tests must cleanup data with `clean_database`

---

**✅ E2E TESTS SYSTEMATIC CREATION COMPLETE - READY FOR PRODUCTION**
```

---

## 🎉 **INTEGRATION WITH WORKFLOW**

### **🔗 DEPENDENCIES**

- **CLAUDE.md**: GOLDEN RULE compliance rigorosamente seguido
- **conftest.py**: Fixtures padrão para autenticação e multi-tenancy
- **Environment**: Banco de teste + serviços rodando

### **📋 OUTPUTS GARANTIDOS**  

- **Testes Funcionais**: 100% baseados em funcionalidade real
- **Troubleshooting**: Diagnóstico automático de falhas comuns
- **Documentation**: Guias de manutenção e resolução de problemas
- **Coverage**: Métricas completas de cobertura de testes

---

**🧪 EXEC-E2E: CRIAÇÃO SISTEMÁTICA DE TESTES COM 99.9% DE CONFIABILIDADE**

Este agente implementa **TESTES E2E ROBUSTOS** que validam **FUNCIONALIDADE REAL** seguindo **GOLDEN RULE** com **troubleshooting automático** e **multi-tenant compliance** garantido.