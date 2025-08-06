# Railway Monorepo Deployment Structure

**Estrutura oficial do Railway para monorepos multi-serviço**

## **Configuração Monorepo (Oficial)**

### **Repositório Único com Múltiplos Serviços**

```
projeto-monorepo/
├── api/                        #  Backend code
├── app/                        #  Frontend code
├── components/                 #  UI components
├── services/                   #  API services
├── railway.toml               #  Main config (can be used by any service)
├── railway.backend.toml       #  Backend-specific config
├── railway.frontend.toml      #  Frontend-specific config
├── Dockerfile                 #  Backend container
└── Dockerfile.frontend        #  Frontend container
```

### **Como Funciona no Railway**

- **Root Directory**: `/` (mesmo para todos os serviços)
- **Watch Paths**: Diferentes por serviço (evita rebuilds desnecessários)
- **Config Files**: Específicos por serviço no Dashboard

## **Estrutura de Serviços**

### **1. Backend Service (FastAPI)**

```toml
# railway.backend.toml
[build]
builder = "NIXPACKS"
watchPatterns = [
  "api/**",
  "migrations/**",
  "tests/**",
  "requirements.txt",
  "Dockerfile"
]

[deploy]
startCommand = "uvicorn api.main:app --host 0.0.0.0 --port $PORT --workers 1"
healthcheckPath = "/health"
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 3
```

**Configuração no Dashboard:**

- **Root Directory**: `/` (root do monorepo)
- **Config File**: `railway.backend.toml`
- **Watch Paths**: Configurados no arquivo (rebuilds apenas quando backend muda)
- **Variáveis de ambiente**: Todas as 35+ variáveis do backend

### **2. Frontend Service (Next.js 14)**

```toml
# railway.frontend.toml
[build]
builder = "DOCKERFILE"
dockerfilePath = "Dockerfile.frontend"
watchPatterns = [
  "app/**",
  "components/**",
  "lib/**",
  "hooks/**",
  "services/**",
  "package.json",
  "Dockerfile.frontend"
]

[deploy]
healthcheckPath = "/api/health"
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 3
```

**Configuração no Dashboard:**

- **Root Directory**: `/` (mesmo root do backend)
- **Config File**: `railway.frontend.toml`
- **Watch Paths**: Configurados no arquivo (rebuilds apenas quando frontend muda)
- **Variáveis de ambiente**: Todas as 22+ variáveis NEXT*PUBLIC*\*
- **Template Functions**:
- `NEXT_PUBLIC_API_URL = "https://${{backend.RAILWAY_STATIC_URL}}"`

### **3. Database Service (PostgreSQL SSL)**

**Configuração via Dashboard apenas:**

- **Imagem**: `ghcr.io/railwayapp-templates/postgres-ssl:16`
- **Variáveis**:
- `POSTGRES_DB = "railway"`
- `POSTGRES_USER = "postgres"`
- `POSTGRES_PASSWORD = "${{secret(16)}}"`
- `SSL_CERT_DAYS = "820"`
- `LOG_TO_STDOUT = "true"`

### **4. Redis Service (Bitnami)**

**Configuração via Dashboard apenas:**

- **Imagem**: `bitnami/redis:7.2.5`
- **Variáveis**:
- `REDIS_PASSWORD = "${{secret(16)}}"`
- `REDIS_AOF_ENABLED = "false"`
- `REDIS_RDB_POLICY = "3600#1 300#100 60#10000"`
- `REDIS_MAXMEMORY_POLICY = "allkeys-lru"`

## **Template Functions Confirmadas**

** Funcionam corretamente:**

```bash
${{secret(32)}}                    # Gera secret de 32 caracteres
${{secret(16)}}                    # Gera secret de 16 caracteres
${{backend.RAILWAY_STATIC_URL}}     # URL estática do backend
${{frontend.RAILWAY_STATIC_URL}}    # URL estática do frontend
${{database.DATABASE_URL}}          # URL completa do PostgreSQL
${{redis.REDIS_PASSWORD}}           # Password gerada do Redis
${{redis.RAILWAY_PRIVATE_DOMAIN}}   # Domínio privado do Redis
```

## **Configuração de Variáveis**

### **Backend Service (via Dashboard)**

```bash
# Core Settings
APP_NAME = "SaaS Starter"
ENVIRONMENT = "production"
SECRET_KEY = "${{secret(32)}}"

# Database & Cache
DATABASE_URL = "${{database.DATABASE_URL}}"
REDIS_URL = "redis://default:${{redis.REDIS_PASSWORD}}@${{redis.RAILWAY_PRIVATE_DOMAIN}}:6379"

# CORS
ALLOWED_ORIGINS = "https://${{frontend.RAILWAY_STATIC_URL}}"

# ... (todas as outras 35+ variáveis)
```

### **Frontend Service (via Dashboard)**

```bash
# Core Settings
NODE_ENV = "production"
PORT = "${{RAILWAY_PORT}}"

# API Connection
NEXT_PUBLIC_API_URL = "https://${{backend.RAILWAY_STATIC_URL}}"

# App Info
NEXT_PUBLIC_APP_NAME = "SaaS Starter"
NEXT_PUBLIC_ENVIRONMENT = "production"

# ... (todas as outras 22+ variáveis NEXT_PUBLIC_*)
```

## **Deploy Process**

### **1. Deploy Backend**

```bash
# Backend usa railway.toml automaticamente
git push origin main
# Railway detecta mudanças e faz deploy do backend
```

### **2. Deploy Frontend**

```bash
# Frontend usa railway.frontend.toml configurado no Dashboard
# Triggers automáticos ou manuais via Dashboard
```

### **3. Database & Redis**

```bash
# Configurados via Dashboard
# Auto-start quando outros serviços necessitam
```

## **Configuração no Railway Dashboard**

### **Setup Monorepo - Passo a Passo:**

#### **1. Backend Service**

1. **Create Service** -> Connect to repository
2. **Settings -> General**:
   - **Root Directory**: `/`
3. **Settings -> Config as Code**:
   - **Config File**: `railway.backend.toml`
4. **Variables**: Adicionar todas as 35+ variáveis do backend

#### **2. Frontend Service**

1. **Create Service** -> Connect to same repository
2. **Settings -> General**:
   - **Root Directory**: `/` (mesmo do backend)
3. **Settings -> Config as Code**:
   - **Config File**: `railway.frontend.toml`
4. **Variables**: Adicionar todas as 22+ variáveis NEXT*PUBLIC*\*

#### **3. Database Service**

1. **Add Database** -> PostgreSQL
2. **Variables**: Configurar manualmente no Dashboard

#### **4. Redis Service**

1. **Add Service** -> Deploy from Docker Image
2. **Image**: `bitnami/redis:7.2.5`
3. **Variables**: Configurar manualmente no Dashboard

### **Vantagens da Estrutura Monorepo:**

**Código centralizado** - Um repositório para tudo  
 **Deploys independentes** - Watch paths previnem rebuilds desnecessários  
 **Configuração flexível** - Arquivo específico por serviço  
 **Template functions** - Comunicação automática entre serviços  
 **Manutenção simplificada** - Uma base de código

## **Benefícios da Nova Estrutura**

**Compatibilidade oficial** com Railway  
 **Separação clara** de responsabilidades  
 **Template functions** funcionando corretamente  
 **Configuração flexível** via Dashboard + arquivo  
 **Deploy independente** de cada serviço  
 **Documentação clara** da estrutura

## **Problemas Resolvidos**

- Estrutura `[[services]]` incorreta -> Estrutura oficial
- Configuração mista em um arquivo -> Separação adequada
- Sintaxe não suportada -> Sintaxe oficial Railway

Esta estrutura segue 100% os padrões oficiais do Railway e garante compatibilidade total com a plataforma.
