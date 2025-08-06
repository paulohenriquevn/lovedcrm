# Testes Unitários da API

Este diretório contém a suíte completa de testes unitários para todos os módulos da API, seguindo os princípios definidos no CLAUDE.md.

## 🎯 Filosofia dos Testes

### FUNCTIONALITY FIRST

- ✅ **SUCCESS SCENARIOS (2XX) PRIMEIRO**: Testamos o que o sistema FAZ antes do que rejeita
- ✅ **FOCO NA FUNCIONALIDADE**: Verificamos que features REALMENTE FUNCIONAM
- ✅ **CENÁRIOS REAIS**: Simulamos usuários reais usando recursos reais

### Estrutura dos Testes

```
tests/unit/
├── conftest.py                    # Fixtures e mocks globais
├── core/                          # Testes dos módulos core
│   ├── test_config.py            # Configurações e validação
│   ├── test_database.py          # Sessões e health checks
│   ├── test_middleware.py        # Middleware de segurança e logging
│   └── test_security.py          # JWT, hash de senhas, tokens
├── models/                        # Testes dos modelos SQLAlchemy
│   ├── test_billing.py           # Plans e subscriptions
│   ├── test_organization.py      # Organizations e memberships
│   ├── test_organization_invite.py # Sistema de convites
│   └── test_user.py              # Modelo de usuário
├── repositories/                  # Testes das camadas de dados
│   ├── test_base.py              # Repository base (CRUD genérico)
│   └── test_organization_repository.py # Repository multi-tenant
├── schemas/                       # Testes de validação Pydantic
│   └── test_auth.py              # Schemas de autenticação
└── services/                      # Testes da lógica de negócio
    ├── test_auth_simple.py       # Autenticação e registro
    └── test_organization_service.py # Gestão de organizações
```

## 🧪 Cobertura de Testes

### Core Modules (100% Critical Coverage)

- **Config**: Validação de configurações, ambientes, rate limits, billing
- **Security**: JWT tokens, hash de senhas, geração de tokens
- **Database**: Sessões, health checks, pool de conexões
- **Middleware**: Headers de segurança, correlation IDs, logging

### Models (100% Functionality Coverage)

- **User**: Criação, OAuth, verificação, timestamps
- **Organization**: Multi-tenancy, memberships, roles
- **Billing**: Plans, subscriptions, features
- **OrganizationInvite**: Workflow completo de convites

### Repositories (100% CRUD Coverage)

- **Base Repository**: CRUD genérico, paginação, queries
- **Organization Repository**: Operações multi-tenant, memberships

### Services (100% Business Logic Coverage)

- **Auth Service**: Registro com auto-criação de org, autenticação
- **Organization Service**: Gestão multi-tenant de organizações

### Schemas (100% Validation Coverage)

- **Auth Schemas**: Login, registro, tokens, OAuth

## 🚀 Executando os Testes

### Executar Todos os Testes Unitários

```bash
# Via pytest direto
python -m pytest tests/unit/ -v

# Via npm script (se configurado)
npm run test:unit

# Com cobertura
python -m pytest tests/unit/ --cov=api --cov-report=html
```

### Executar Testes Específicos

```bash
# Testes de um módulo específico
python -m pytest tests/unit/core/ -v
python -m pytest tests/unit/models/ -v
python -m pytest tests/unit/services/ -v

# Teste de um arquivo específico
python -m pytest tests/unit/core/test_security.py -v

# Teste de uma classe específica
python -m pytest tests/unit/services/test_auth_simple.py::TestSimpleAuthService -v

# Teste de um método específico
python -m pytest tests/unit/core/test_security.py::TestPasswordHashing::test_get_password_hash_creates_valid_hash -v
```

### Executar com Diferentes Níveis de Verbosidade

```bash
# Verbose (mostra cada teste)
python -m pytest tests/unit/ -v

# Extra verbose (mostra prints)
python -m pytest tests/unit/ -vv -s

# Quiet (apenas falhas)
python -m pytest tests/unit/ -q

# Com timing
python -m pytest tests/unit/ --durations=10
```

## 🎨 Padrões dos Testes

### Estrutura de Classe de Teste

```python
class TestModuleName:
    """Test ModuleName functionality - FUNCTIONALITY FIRST."""

    @pytest.fixture
    def setup_data(self):
        """Setup test data."""
        return {"key": "value"}

    def test_functionality_success(self, setup_data):
        """Test functionality works correctly."""
        # ✅ SUCCESS SCENARIO: Description of what works
        result = function_under_test(setup_data)

        assert result.expected_field == "expected_value"
        assert result.is_working is True

    def test_functionality_error_scenario(self):
        """Test functionality handles errors correctly."""
        # ❌ ERROR SCENARIO: Description of error case
        with pytest.raises(ExpectedException):
            function_under_test(invalid_data)
```

### Nomenclatura dos Testes

- **SUCCESS**: `test_[functionality]_success`
- **ERROR**: `test_[functionality]_[error_type]_error`
- **EDGE CASE**: `test_[functionality]_[edge_case]_success`

### Comentários nos Testes

```python
# ✅ SUCCESS SCENARIO: Descrição do que funciona
# ❌ ERROR SCENARIO: Descrição do erro esperado
# 🔍 EDGE CASE: Descrição do caso extremo
```

## 🏗️ Mocks e Fixtures

### Fixtures Globais (conftest.py)

- `mock_db_session`: Mock da sessão de banco
- `mock_user_data`: Dados de usuário para testes
- `mock_organization_data`: Dados de organização
- `mock_jwt_payload`: Payload JWT válido
- `mock_settings`: Configurações mockadas

### Padrões de Mock

```python
# Mock de sessão de banco
@pytest.fixture
def mock_db_session():
    session = Mock()
    session.add = Mock()
    session.commit = Mock()
    session.query = Mock()
    return session

# Mock de query chain
mock_query = Mock()
mock_filter = Mock()
mock_query.filter.return_value = mock_filter
mock_filter.first.return_value = expected_result
mock_db_session.query.return_value = mock_query
```

## 🔍 Multi-Tenancy Testing

### Cenários Multi-Tenant Testados

- ✅ **Isolamento de dados**: Org A não acessa dados da Org B
- ✅ **Auto-criação de org**: Registro cria organização automaticamente
- ✅ **Context org_id**: Todas operações incluem org_id
- ✅ **Roles e permissões**: Owner, admin, member
- ✅ **Membership management**: Convites, remoção, atualização

### Exemplo de Teste Multi-Tenant

```python
def test_multi_tenant_isolation_success(self):
    """Test data isolation between organizations."""
    # ✅ SUCCESS SCENARIO: Organizations are properly isolated
    org1_id = uuid.uuid4()
    org2_id = uuid.uuid4()
    user_id = uuid.uuid4()

    # User in org1 should not access org2 data
    result = service.get_org_data(user_id, org1_id)
    assert result.organization_id == org1_id

    # Verify isolation
    with pytest.raises(HTTPException) as exc:
        service.get_org_data(user_id, org2_id)
    assert exc.value.status_code == 403
```

## 📊 Métricas de Qualidade

### Coverage Targets

- **Statements**: > 90%
- **Branches**: > 85%
- **Functions**: > 95%
- **Classes**: > 90%

### Critérios de Sucesso

- ✅ Todos os testes passam
- ✅ Cobertura acima dos targets
- ✅ Zero warnings de pytest
- ✅ Tempos de execução < 30s
- ✅ Mocks apropriados (sem calls reais)

## 🚨 Troubleshooting

### Problemas Comuns

**Import Errors**:

```bash
# Certifique-se de que o PYTHONPATH está correto
export PYTHONPATH="${PYTHONPATH}:$(pwd)"
python -m pytest tests/unit/
```

**Mock Errors**:

```python
# Use patch no local correto
@patch('api.services.auth_simple.get_password_hash')  # ✅ Correto
@patch('api.core.security.get_password_hash')         # ❌ Incorreto
```

**Async/Await**:

```python
# Para testes async, use pytest-asyncio
@pytest.mark.asyncio
async def test_async_function():
    result = await async_function()
    assert result is not None
```

## 🎯 Próximos Passos

### Extensões Planejadas

- [ ] Testes de performance/load
- [ ] Testes de concorrência
- [ ] Testes de migração de dados
- [ ] Testes de backup/restore
- [ ] Integration tests com banco real

### Melhorias Contínuas

- [ ] Paralelização de testes
- [ ] Test data builders
- [ ] Property-based testing
- [ ] Mutation testing
- [ ] Visual regression testing
