# Railway Template - Multi-Service Deployment Instructions

> **Status:** CORRIGIDO - Estrutura válida para Railway  
> **Método:** Manual Dashboard Setup (Railway não suporta multi-service via JSON)

## IMPORTANTE: Railway Templates via JSON

**NÃO FUNCIONA:**

- Estrutura `"project"` + `"services"` array no railway.json
- Campo `"tcpProxies"` no railway.json
- Template functions `${{RAILWAY_TCP_PROXY_DOMAIN}}`

**FUNCIONA:**

- railway.json para **serviço único** (backend)
- Configuração multi-service via **Railway Dashboard**
- TCP proxy configurado **manualmente via UI**

---

## Setup Multi-Service Correto

### **1. Backend Service (via railway.json)**

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "watchPatterns": ["api/**", "migrations/**", "requirements.txt"]
  },
  "deploy": {
    "startCommand": "uvicorn api.main:app --host 0.0.0.0 --port $PORT",
    "healthcheckPath": "/health"
  }
}
```

### **2. Frontend Service (via Dashboard)**

**Manual Setup:**

- **Source:** Same repository
- **Root Directory:** `/`
- **Build:** Dockerfile
- **Dockerfile Path:** `Dockerfile.frontend`
- **Watch Patterns:** `app/**,components/**,package.json`

### **3. Database Service (via Dashboard)**

**Manual Setup:**

- **Image:** `ghcr.io/railwayapp-templates/postgres-ssl:16`
- **TCP Proxy:** Enable na UI (Settings -> Networking -> TCP Proxy)
- **Port:** 5432
- **Variables:**
  ```
  POSTGRES_DB=railway
  POSTGRES_USER=postgres
  POSTGRES_PASSWORD=${{secret(16)}}
  ```

### **4. Redis Service (via Dashboard)**

**Manual Setup:**

- **Image:** `bitnami/redis:7.2.5`
- **Variables:**
  ```
  REDIS_PASSWORD=${{secret(16)}}
  REDIS_AOF_ENABLED=false
  ```

---

## **Template Deploy Instructions**

### **Passo 1: Deploy Backend**

```bash
# Deploy via Railway Button ou Git
railway deploy
```

### **Passo 2: Adicionar Serviços via Dashboard**

1. **Add Service** -> **Deploy from Docker Image**
2. **Configure cada serviço manualmente**
3. **Set environment variables**
4. **Enable TCP Proxy para database**

### **Passo 3: Configurar Variáveis Cross-Service**

```bash
# Backend variables
DATABASE_URL=${{database.DATABASE_URL}}
REDIS_URL=redis://default:${{redis.REDIS_PASSWORD}}@${{redis.RAILWAY_PRIVATE_DOMAIN}}:6379
ALLOWED_ORIGINS=https://${{frontend.RAILWAY_STATIC_URL}}

# Frontend variables
NEXT_PUBLIC_API_URL=https://${{backend.RAILWAY_STATIC_URL}}
```

---

## **One-Click Deploy Alternativo**

Como Railway não suporta true one-click multi-service via JSON, **alternativas:**

### **Opção 1: Railway Template via UI**

1. Criar projeto completo no Dashboard
2. **Project Settings -> Create Template**
3. Railway gera template automático
4. Publicar no Marketplace

### **Opção 2: Docker Compose (Railway Metro)**

```yaml
# docker-compose.yml para Railway Metro
version: "3.8"
services:
  backend:
    build: .
    environment:
      - DATABASE_URL=${{database.DATABASE_URL}}
  frontend:
    build:
      dockerfile: Dockerfile.frontend
  database:
    image: ghcr.io/railwayapp-templates/postgres-ssl:16
  redis:
    image: bitnami/redis:7.2.5
```

### **Opção 3: Script de Setup**

```bash
#!/bin/bash
# setup-railway.sh
railway service create backend --repo https://github.com/user/repo
railway service create frontend --repo https://github.com/user/repo
railway add postgresql
railway add redis
```

---

## **Configuração TCP Proxy (Manual)**

** TCP Proxy NÃO pode ser configurado via railway.json**

### **Setup via Dashboard:**

1. **Database Service -> Settings -> Networking**
2. **Enable TCP Proxy**
3. **Port:** 5432
4. **Railway gera automaticamente:**
   - `RAILWAY_TCP_PROXY_DOMAIN`
   - `RAILWAY_TCP_PROXY_PORT`

### **Usar nas Conexões:**

```python
# Conexão externa (desenvolvimento)
DATABASE_PUBLIC_URL = f"postgresql://{user}:{pass}@{tcp_domain}:{tcp_port}/{db}"

# Conexão interna (produção)
DATABASE_URL = f"postgresql://{user}:{pass}@{private_domain}:5432/{db}"
```

---

## **Referências Oficiais**

- **Templates:** https://docs.railway.com/guides/templates
- **Config as Code:** https://docs.railway.com/guides/config-as-code
- **TCP Proxy:** https://docs.railway.com/reference/tcp-proxy
- **Multi-Service:** https://docs.railway.com/guides/monorepo

---

## **Conclusão**

**Railway atual não suporta true one-click multi-service templates via JSON.**

**Para deploy completo:**

1.  Use railway.json para backend
2.  Configure outros serviços via Dashboard
3.  Enable TCP proxy manualmente
4.  Use template functions para cross-service communication

**Resultado:** Setup funcional, mas requer configuração manual de 3-4 serviços.
