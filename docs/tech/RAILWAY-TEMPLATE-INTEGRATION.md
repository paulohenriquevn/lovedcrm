# Railway Template Integration Guide

> **Template:** `saas-multi-tenant-base`  
> **Status:** PRONTO PARA USAR  
> **Método:** Template existente + Projeto atual

## Template Disponível

### **Informações do Template:**

- **Code:** `saas-multi-tenant-base`
- **URL:** `https://railway.com/new/template/saas-multi-tenant-base`
- **Tipo:** Multi-service template para SaaS multi-tenant

---

## Como Aplicar ao Projeto Atual

### **Método 1: Via Railway Dashboard (Recomendado)**

```bash
# Passos no Dashboard:
1. Abrir projeto atual no Railway
2. Clicar "+ New" → "Template"
3. Buscar "saas-multi-tenant-base"
4. Configurar variáveis se necessário
5. Clicar "Deploy"
```

### **Método 2: Via URL Direto**

```bash
# Acesso direto:
https://railway.com/new/template/saas-multi-tenant-base
# Selecionar projeto existente como destino
```

### **Método 3: Via Railway CLI**

```bash
# Se disponível via CLI:
railway add template saas-multi-tenant-base
```

---

## O que o Template Adiciona

### **Serviços Esperados:**

- PostgreSQL Database (com SSL)
- Redis Cache (Bitnami)
- Variáveis configuradas automaticamente
- Network interno configurado
- TCP Proxy habilitado (se necessário)

### **Variáveis Cross-Service:**

```bash
# Database
DATABASE_URL=${{database.DATABASE_URL}}
DATABASE_PUBLIC_URL=${{database.DATABASE_PUBLIC_URL}}

# Redis
REDIS_URL=redis://default:${{redis.REDIS_PASSWORD}}@${{redis.RAILWAY_PRIVATE_DOMAIN}}:6379

# Cross-service communication
BACKEND_URL=${{backend.RAILWAY_STATIC_URL}}
FRONTEND_URL=${{frontend.RAILWAY_STATIC_URL}}
```

---

## Integração com Código Atual

### **Backend (FastAPI)**

```python
# api/core/config.py - Verificar se essas variáveis existem:
DATABASE_URL = os.getenv("DATABASE_URL")
REDIS_URL = os.getenv("REDIS_URL")
```

### **Frontend (Next.js)**

```typescript
// Verificar se essas variáveis existem:
NEXT_PUBLIC_API_URL = process.env.NEXT_PUBLIC_API_URL
```

### **Railway.json Atual**

```bash
# Nosso railway.json pode ser:
1. Mantido (se não conflitar)
2. Removido (se template sobrescrever)
3. Ajustado (para complementar template)
```

---

## Checklist Pós-Deploy

### **1. Verificar Serviços Adicionados**

- [ ] PostgreSQL Database criado
- [ ] Redis Cache criado
- [ ] Variáveis de ambiente configuradas
- [ ] Network entre serviços funcionando

### **2. Testar Conexões**

```bash
# Backend - teste de conexão database
python -c "import psycopg2; print('DB OK')"

# Backend - teste de conexão redis
python -c "import redis; print('Redis OK')"
```

### **3. Ajustar Configurações se Necessário**

- [ ] Verificar variáveis no Backend
- [ ] Verificar variáveis no Frontend
- [ ] Testar API endpoints
- [ ] Verificar logs de todos os serviços

### **4. Remover Arquivos Conflitantes**

```bash
# Se template trouxer configurações próprias:
rm railway.json  # Se necessário
```

---

## Troubleshooting

### **Problema: Template não aparece**

```bash
# Verificar se template é público:
https://railway.com/template/saas-multi-tenant-base
```

### **Problema: Conflito de configuração**

```bash
# Template sobrescreve railway.json:
1. Backup atual: mv railway.json railway.json.backup
2. Deploy template
3. Comparar configurações
4. Mesclar se necessário
```

### **Problema: Variáveis não funcionam**

```bash
# Verificar no Dashboard:
1. Service → Variables
2. Confirmar template functions: ${{service.VAR}}
3. Restart serviços se necessário
```

---

## Resultado Esperado

### **Antes do Template:**

```
Projeto Atual:
├── Backend (FastAPI) - nosso código
├── Frontend (Next.js) - nosso código
└── railway.json - nossa config
```

### **Depois do Template:**

```
Projeto Completo:
├── Backend (FastAPI) - nosso código
├── Frontend (Next.js) - nosso código
├── Database (PostgreSQL) - do template
├── Redis (Cache) - do template
└── Variáveis cross-service - do template
```

---

## Vantagens da Integração

- Código preservado - Nosso desenvolvimento mantido
- Infraestrutura completa - Database + Redis + configs
- Configuração automática - Variáveis e network
- Deploy rápido - 1 clique para completar stack
- Best practices - Template pré-configurado
- Escalabilidade - Pronto para produção

---

## Próximos Passos

1. **Deploy do template** no projeto atual
2. **Verificar integração** de todos os serviços
3. **Testar aplicação** completa
4. **Ajustar configurações** se necessário
5. **Commit final** com template integrado

**O template `saas-multi-tenant-base` é a solução perfeita para completar nossa stack!**
