# Troubleshooting: CORS Proxy Issues - CRM Endpoints

**Data:** 2025-01-08  
**Problema:** Endpoints CRM retornando erro CORS enquanto outros endpoints funcionavam normalmente  
**Status:** ✅ **RESOLVIDO**

---

## 🚨 Problema Identificado

### **Sintomas**

- Endpoint `/api/users/me` funcionava perfeitamente (200 OK via proxy localhost:3000)
- Endpoint `/api/crm/leads` falhava com erro CORS:
  ```
  Access to fetch at 'http://192.168.2.111:8000/crm/leads/?page=1&page_size=100&stage=lead'
  (redirected from 'http://localhost:3000/api/crm/leads?page=1&page_size=100&stage=lead')
  from origin 'http://localhost:3000' has been blocked by CORS policy:
  Response to preflight request doesn't pass access control check:
  No 'Access-Control-Allow-Origin' header is present on the requested resource.
  ```

### **Análise Inicial Incorreta** ❌

- ✅ CORS configuração estava correta em `api/main.py`
- ✅ Backend estava funcionando corretamente
- ✅ Middleware de organização estava OK
- ❌ **Erro**: Focamos no backend quando o problema estava no frontend

### **Root Cause** ✅

**Problema estava na configuração do proxy Next.js em `next.config.js`**

---

## 🔍 Processo de Debugging

### **Step 1: Investigação Backend (Incorreta)**

```bash
# Testamos CORS diretamente no backend
curl -v -X OPTIONS "http://192.168.2.111:8000/crm/leads/" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: Authorization,X-Org-Id" \
  -H "Origin: http://localhost:3000"

# Resultado: Backend estava OK
```

### **Step 2: Análise do Erro**

- Requisição sendo redirecionada de `localhost:3000` → `192.168.2.111:8000`
- Endpoint funcionando: `/api/users/me` (proxy OK)
- Endpoint falhando: `/api/crm/leads` (bypass do proxy)

### **Step 3: Investigação Next.js Proxy** ✅

```javascript
// next.config.js - Configuração problemática
{
  source: '/api/crm/leads/:path*',
  destination: `${backendUrl}/crm/leads/:path*`,
}
```

**Problema:** `:path*` não faz match com a rota raiz `/api/crm/leads` (sem parâmetros)

---

## ✅ Solução Aplicada

### **Correção no `next.config.js`**

```javascript
// ANTES (não funcionava)
{
  source: '/api/crm/leads/:path*',
  destination: `${backendUrl}/crm/leads/:path*`,
}

// DEPOIS (funcionando)
{
  source: '/api/crm/leads',
  destination: `${backendUrl}/crm/leads/`,
},
{
  source: '/api/crm/leads/:path*',
  destination: `${backendUrl}/crm/leads/:path*`,
},
```

### **Por que funcionou:**

1. **Rota específica primeiro**: `/api/crm/leads` (exato match)
2. **Rota parametrizada depois**: `/api/crm/leads/:path*` (sub-rotas)
3. **Ordem importa**: Regras mais específicas devem vir primeiro

---

## 📋 Lições Aprendidas

### **1. Debugging Strategy**

- ✅ **Sempre comparar** endpoints funcionando vs. não funcionando
- ✅ **Verificar proxy Next.js** quando há redirecionamento direto para backend
- ❌ **Não assumir** que problema está no backend quando outros endpoints funcionam

### **2. Next.js Rewrites Pattern**

```javascript
// Padrão para rotas com sub-paths
{
  source: '/api/feature',           // Rota raiz (exato)
  destination: `${backend}/feature/`,
},
{
  source: '/api/feature/:path*',    // Sub-rotas
  destination: `${backend}/feature/:path*`,
},
```

### **3. Identificação Rápida**

**Se outros endpoints funcionam mas um específico falha com CORS:**

1. ✅ Verificar `next.config.js` rewrites primeiro
2. ✅ Comparar padrões entre working/non-working
3. ✅ Testar se `:path*` faz match com rota desejada

---

## 🛠️ Como Evitar No Futuro

### **Template para Novos Endpoints**

Sempre que adicionar novo router CRM, seguir padrão:

```javascript
// next.config.js - Adicionar ambas as regras
{
  source: '/api/crm/[novo-endpoint]',
  destination: `${backendUrl}/crm/[novo-endpoint]/`,
},
{
  source: '/api/crm/[novo-endpoint]/:path*',
  destination: `${backendUrl}/crm/[novo-endpoint]/:path*`,
},
```

### **Checklist de Troubleshooting CORS**

1. [ ] Outros endpoints funcionam?
2. [ ] Request vai para localhost:3000 ou diretamente para backend?
3. [ ] Existe rewrite rule específica para a rota?
4. [ ] `:path*` faz match com a URL sendo testada?
5. [ ] Ordem das regras está correta (específica → geral)?

---

## 📝 Arquivos Modificados

### **next.config.js**

```javascript
// Localização: linha ~55-62
{
  source: '/api/crm/leads',
  destination: `${backendUrl}/crm/leads/`,
},
{
  source: '/api/crm/leads/:path*',
  destination: `${backendUrl}/crm/leads/:path*`,
},
```

---

**Resolução:** ✅ **SUCESSO**  
**Tempo total:** ~30 minutos  
**Reinicialização necessária:** Next.js server restart após mudanças no `next.config.js`
