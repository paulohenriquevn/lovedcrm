# Troubleshooting - SAAS Mode Configuration

> **Documentação para Resolução de Problemas Comuns do Sistema B2B/B2C**  
> **Data:** 2025-08-04  
> **Status:** Documentado e Testado

## 📋 Índice

- [Menu Teams Não Aparece em Modo B2B](#menu-teams-não-aparece-em-modo-b2b)
- [Google OAuth Callback Validation Error](#google-oauth-callback-validation-error)
- [E2E Tests com SAAS Mode](#e2e-tests-com-saas-mode)
- [Configurações de Environment Variables](#configurações-de-environment-variables)

---

## Menu Teams Não Aparece em Modo B2B

### 🔴 Problema

O menu "Teams" não aparece na navegação lateral quando o sistema está configurado como `SAAS_MODE=B2B`.

### 🕵️ Diagnóstico

```bash
# Verificar configuração do backend
docker exec saas-api-dev python -c "from api.core.config import settings; print(f'Backend SAAS_MODE: {settings.SAAS_MODE}')"

# Verificar configuração do frontend
docker exec saas-frontend-dev sh -c "echo 'Frontend NEXT_PUBLIC_SAAS_MODE:' \$NEXT_PUBLIC_SAAS_MODE"
```

### ✅ Solução

**Causa**: O frontend precisa da variável `NEXT_PUBLIC_SAAS_MODE` para que o hook `useSaasMode()` funcione corretamente.

**Correção no `docker-compose.yml`**:

```yaml
# No serviço frontend, adicionar:
environment:
  # Outras variáveis...

  # SAAS Mode Configuration (CRITICAL - Frontend needs this to show/hide Teams menu)
  NEXT_PUBLIC_SAAS_MODE: "B2B"
```

**Reiniciar containers**:

```bash
make dev-stop
make dev-start
```

### 🧪 Validação

```bash
# Teste do hook useSaasMode
docker exec saas-frontend-dev node -e "
const mode = process.env.NEXT_PUBLIC_SAAS_MODE || 'B2C';
console.log('Mode:', mode);
console.log('Teams menu visible:', mode === 'B2B');
"
```

**Resultado esperado**: `Teams menu visible: true`

---

## Google OAuth Callback Validation Error

### 🔴 Problema

Erro de validação no endpoint `/auth/google/callback`:

```
{'type': 'missing', 'loc': ('response', 'user'), 'msg': 'Field required'}
{'type': 'missing', 'loc': ('response', 'organization'), 'msg': 'Field required'}
```

### 🕵️ Diagnóstico

O endpoint estava retornando apenas um objeto `Token` quando deveria retornar `OAuthResponse` completo.

### ✅ Solução

**Arquivo**: `/api/routers/auth.py`

**Mudanças realizadas**:

1. **Return Type Annotation**:

```python
# ANTES
async def google_callback(...) -> Token:

# DEPOIS
async def google_callback(...) -> OAuthResponse:
```

2. **Import Adicionado**:

```python
from ..schemas.auth import (
    # ... outros imports
    OrganizationSummary,  # ← Adicionado
)
```

3. **Return Statement Corrigido**:

```python
# ANTES
token_response = Token(**tokens)
return token_response

# DEPOIS
token_response = Token(**tokens)
_set_auth_cookies(response, token_response)

return OAuthResponse(
    user=UserResponse.model_validate(user),
    organization=OrganizationSummary(
        id=str(organization.id),
        name=organization.name,
        slug=organization.slug,
    ),
    access_token=tokens["access_token"],
    refresh_token=tokens["refresh_token"],
    token_type=tokens["token_type"],
)
```

### 🧪 Validação

```bash
# Verificar estrutura do endpoint
docker exec saas-api-dev python -c "
from api.schemas.auth import OAuthResponse
print('OAuthResponse fields:', list(OAuthResponse.model_fields.keys()))
"
```

**Resultado esperado**: `['user', 'organization', 'access_token', 'refresh_token', 'token_type']`

---

## E2E Tests com SAAS Mode

### 🔴 Problema

Testes E2E falhando devido às diferentes configurações de SAAS_MODE (B2B vs B2C).

### ✅ Solução

**Estratégia**: Container único com testes condicionais usando `pytest.mark.skipif`.

**Implementação**:

```python
# Função de detecção de modo
def is_api_in_b2b_mode():
    """Detect if API is running in B2B mode by testing registration behavior."""
    # ... código de detecção

# Decorador para testes específicos
@pytest.mark.skipif(not is_api_in_b2b_mode(), reason="B2B mode only - API is in B2C mode")
def test_b2b_specific_feature(self, api_client, authenticated_user):
    # Teste específico para B2B
    pass

@pytest.mark.skipif(is_api_in_b2b_mode(), reason="B2C mode only - API is in B2B mode")
def test_b2c_specific_feature(self, api_client, authenticated_user):
    # Teste específico para B2C
    pass
```

**Configuração no `docker-compose.test.yml`**:

```yaml
api-test:
  environment:
    SAAS_MODE: B2C # Modo padrão para testes
```

### 🧪 Execução dos Testes

```bash
# Testes E2E com modo B2C (padrão)
npm run test:e2e:api

# Para testar modo B2B, alterar docker-compose.test.yml:
# SAAS_MODE: B2B
```

---

## Configurações de Environment Variables

### 📝 Tabela de Variáveis SAAS Mode

| Variável                | Serviço  | Valor          | Descrição                  |
| ----------------------- | -------- | -------------- | -------------------------- |
| `SAAS_MODE`             | Backend  | `B2B` ou `B2C` | Controla lógica do backend |
| `NEXT_PUBLIC_SAAS_MODE` | Frontend | `B2B` ou `B2C` | Controla UI do frontend    |

### 🔧 Arquivos de Configuração

**Docker Compose (Development)**:

```yaml
# docker-compose.yml
services:
  api:
    environment:
      SAAS_MODE: "B2B"

  frontend:
    environment:
      NEXT_PUBLIC_SAAS_MODE: "B2B"
```

**Docker Compose (Testing)**:

```yaml
# docker-compose.test.yml
services:
  api-test:
    environment:
      SAAS_MODE: B2C # Padrão para testes
```

**Environment Files**:

```bash
# .env.local
NEXT_PUBLIC_SAAS_MODE=B2B

# .env.example
SAAS_MODE=B2C
NEXT_PUBLIC_SAAS_MODE=B2C
```

### ⚠️ Pontos Críticos

1. **Sincronização**: Backend e frontend devem ter o mesmo modo configurado
2. **Restart Required**: Mudanças nas variáveis requerem restart dos containers
3. **Testing**: Testes devem ser executados com o modo apropriado
4. **Production**: Railway deve ter as variáveis corretas configuradas

### 🧪 Script de Verificação

```bash
#!/bin/bash
# scripts/check-saas-mode.sh

echo "🔧 Checking SAAS Mode Configuration..."

# Backend
BACKEND_MODE=$(docker exec saas-api-dev python -c "from api.core.config import settings; print(settings.SAAS_MODE)" 2>/dev/null)
echo "Backend SAAS_MODE: $BACKEND_MODE"

# Frontend
FRONTEND_MODE=$(docker exec saas-frontend-dev sh -c 'echo $NEXT_PUBLIC_SAAS_MODE' 2>/dev/null)
echo "Frontend NEXT_PUBLIC_SAAS_MODE: $FRONTEND_MODE"

# Validation
if [ "$BACKEND_MODE" = "$FRONTEND_MODE" ]; then
    echo "✅ Modes are synchronized"
else
    echo "❌ Mode mismatch detected!"
    exit 1
fi
```

---

## 📚 Recursos Adicionais

- **[CLAUDE.md](../CLAUDE.md)** - Documentação principal do sistema
- **[Multi-Tenancy Guide](MULTI-TENANCY-GUIDE.md)** - Guia completo de multi-tenancy
- **[useSaasMode Hook](../hooks/use-saas-mode.ts)** - Implementação do hook
- **[Admin Navigation](../components/layout/admin-navigation.tsx)** - Componente de navegação

---

## 🔄 Changelog

**2025-08-04**:

- ✅ Documentado problema do menu Teams em modo B2B
- ✅ Documentado fix para Google OAuth callback validation
- ✅ Documentado estratégia de testes E2E com SAAS Mode
- ✅ Criado script de verificação de configuração

---

**💡 Dica**: Para debug rápido, use `make status` para verificar se todos os serviços estão rodando corretamente.
