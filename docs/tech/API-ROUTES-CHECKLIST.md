# 📋 API Routes Checklist - NEVER FORGET AGAIN!

**🚨 REGRA CRÍTICA**: Toda nova API route precisa de **DUAS configurações obrigatórias**

## ✅ Checklist Obrigatório para Novas APIs

Quando criar uma nova API route no backend:

### 1. Criar a rota no backend

- [ ] Router em `api/routers/your_new_router.py`
- [ ] Service em `api/services/your_new_service.py`
- [ ] Schemas em `api/schemas/your_new_schema.py`
- [ ] Registrar router em `api/main.py`

### 2. 🔴 CRÍTICO: Adicionar no next.config.js (Routing Padronizado)

- [ ] **ANTES da regra genérica** `/api/:path*`
- [ ] **SEMPRE usar `:path*`** (nunca `:endpoint*` ou variações)
- [ ] **Escolher padrão correto**:
  - **PADRÃO A** (maioria): `'/api/your-api/:path*' → '${backendUrl}/your-api/:path*'`
  - **PADRÃO B** (endpoints específicos): `'/api/your-endpoint:path*' → '${backendUrl}/your-endpoint/'`

### 3. 🔴 CRÍTICO: Adicionar no BaseService (Headers Multi-tenant)

- [ ] Abrir `services/base.ts`
- [ ] Adicionar `/api/your-api/` em `ORG_REQUIRED_ENDPOINTS`
- [ ] **CRUCIAL para X-Org-Id header automático**

### 4. Testar a integração

- [ ] Backend funcionando: `curl http://localhost:8000/api/your-api/endpoint`
- [ ] Frontend funcionando: testar via browser/Postman
- [ ] **Verificar X-Org-Id sendo enviado automaticamente**
- [ ] Verificar no Network tab que request vai para localhost, não IP

## 📖 Template para next.config.js

```javascript
// ADICIONAR ANTES da regra genérica /api/:path*
{
  source: '/api/your-new-api/:path*',
  destination: `${backendUrl}/api/your-new-api/:path*`,
},
```

## 🚨 Sintomas de Rota Faltando

Se você vir estes erros, provavelmente esqueceu de adicionar a rota:

- ❌ `Missing X-Org-Id header for organization context`
- ❌ `404 Not Found` para chamadas da API
- ❌ `Failed to connect` ou timeout
- ❌ CORS errors

## 🔍 Como Verificar se Rota Está Funcionando

1. **Verificar logs do Next.js**:

   ```bash
   npm run dev
   # Procurar por: "🚂 Rewrite rules:"
   ```

2. **Testar endpoint diretamente**:

   ```bash
   curl http://localhost:3000/api/your-api/test-endpoint
   ```

3. **Verificar no Network tab do DevTools**

## 📝 Histórico de Rotas Adicionadas

Mantenha este histórico atualizado:

- `/api/auth` - Autenticação (original)
- `/api/users` - Usuários (original)
- `/api/organizations` - Organizações (original)
- `/api/members` - Membros (original)
- `/api/billing` - Billing (original)
- `/api/admin` - Admin (original)
- `/api/crm` - **CRM/Leads (adicionado 2025-08-06)** ✅
  - **Correção aplicada**: BaseService + next.config.js (2025-08-06) ✅

## 🔧 Histórico de Correções de Configuração

### 2025-08-06: CRM Endpoints Fix

**Problema**: `Missing X-Org-Id header for organization context`
**Causa Raiz**: `/api/crm/` não estava em BaseService `ORG_REQUIRED_ENDPOINTS`
**Solução Aplicada**:

1. ✅ Adicionado `/api/crm/` em `services/base.ts` → `ORG_REQUIRED_ENDPOINTS`
2. ✅ Verificado next.config.js routing: `/api/crm/:path*` → `${backendUrl}/api/crm/:path*`
3. ✅ Testado: Backend responde corretamente, headers enviados automaticamente

## 🎯 Próximas APIs Planejadas

Quando implementar estas, NÃO ESQUECER do next.config.js:

- [ ] `/api/timeline` - Timeline de interações
- [ ] `/api/voip` - Chamadas VoIP
- [ ] `/api/whatsapp` - WhatsApp Business API
- [ ] `/api/ai` - AI/GPT summaries
- [ ] `/api/reports` - Relatórios e dashboards

## 🔧 Script de Validação (Futuro)

Podemos criar um script que valida se todas as rotas backend têm correspondência no next.config.js:

```bash
# TODO: Implementar script de validação
./scripts/validate-api-routes.sh
```

---

**💡 LEMBRETE**: Sempre que criar uma nova API route, volte neste documento e atualize o checklist!
