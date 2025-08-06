# Production Migrations Guide - Railway PostgreSQL

Complete guide for applying migrations in production on Railway, based on real experience with project `ca4e5687`.

## Overview

**System:** Multi-Tenant SaaS with PostgreSQL on Railway  
**Method:** SQL Migrations without Alembic (pure SQL + shell script)  
**Connection:** Railway TCP Proxy for external access  
**Control:** `schema_versions` table for tracking

## Migration Architecture

### Estrutura de Arquivos (CONSOLIDADA - 2025-08-03)

```
migrations/
├── migrate                              # Shell script principal
├── 001_complete_initial_schema.sql     # CONSOLIDATED: Todos os schemas (users, orgs, invites, billing)
├── legacy/                              # Migrations originais (backup)
│   ├── 001_initial_schema.sql
│   ├── 002_add_timestamps_to_organization_members.sql
│   ├── 003_add_password_reset_and_email_verification_fields.sql
│   ├── 004_create_organization_invites.sql
│   ├── 005_create_billing_tables.sql
│   └── 006_add_must_change_password_field.sql
├── common-seeds.sql                     # Dados base
├── dev-seeds.sql                        # Dados de desenvolvimento
└── TEMPLATE_migration.sql               # Template para novas migrations
```

**IMPORTANTE:** As migrations foram consolidadas em uma única migration otimizada para novos deployments. As migrations originais estão preservadas em `legacy/` para referência.

### Sistema de Versionamento

Cada migration **DEVE** terminar com:

```sql
-- Registrar migration aplicada
INSERT INTO schema_versions (version, description, applied_at)
VALUES (X, 'Descrição da migration', NOW());
```

** CRÍTICO:** Sem este INSERT, a migration não será rastreada e ficará "Database needs updates" permanentemente.

## Configuração de Conexão Railway

### Pré-Requisitos

1. **TCP Proxy Configurado**

   ```
   Railway Dashboard -> Project -> Service -> Settings -> Networking -> TCP Proxy
   Status: Enabled
   Endpoint: gondola.proxy.rlwy.net:54886
   ```

2. **Credenciais de Produção**
   ```bash
   HOST: gondola.proxy.rlwy.net
   PORT: 54886
   USER: postgres
   PASSWORD: gdLKoeCiMKduNBFVHPXjvLrcWPYsQyks
   DATABASE: railway
   ```

### Makefile Commands

O projeto inclui comandos make otimizados para produção:

```bash
# Comandos principais
make db-prod-migration-status    # Ver migrations aplicadas
make db-prod-migration-apply     # Aplicar todas as migrations pendentes
make connect-db-prod            # Conexão interativa psql

# Comandos auxiliares
make db-prod-status             # Health check completo
make check-db-prod              # Status de todo o sistema
```

## Processo de Migration em Produção

### Passo 1: Verificar Estado Atual

```bash
# 1. Verificar status das migrations
make db-prod-migration-status

# Output esperado:
#  Checking schema_versions table...
#  Current migrations applied:
#  version | description                           | applied_at
# ---------+---------------------------------------+---------------------
#        1 | Initial database schema               | 2025-01-XX XX:XX:XX
#        2 | Add timestamps to organization members| 2025-01-XX XX:XX:XX
#        ...
```

### Passo 2: Validar Migrations Localmente

```bash
# 1. Testar migrations no ambiente local primeiro
cd migrations
./migrate status    # Ver status local
./migrate check     # Ver migrations pendentes
./migrate apply     # Aplicar localmente (ambiente de teste)
```

### Passo 3: Aplicar em Produção

```bash
# ATENÇÃO: Este comando aplica em PRODUÇÃO!
make db-prod-migration-apply

# Output esperado:
#  Production Migration Apply
# ============================
#
#   WARNING: This will apply migrations to PRODUCTION database!
#
#  Database Connection:
#    Host: gondola.proxy.rlwy.net:54886
#    Database: railway
#
#  Applying ALL migrations individually...
#  Applying migrations/001_initial_schema.sql...
#  Applying migrations/002_add_timestamps_to_organization_members.sql...
# ...
#  Migrations applied successfully!
```

### Passo 4: Verificar Resultado

```bash
# 1. Verificar que todas as migrations foram aplicadas
make db-prod-migration-status

# 2. Verificar integridade do sistema
make check-db-prod
```

## Experiência Real - Projeto ca4e5687

### Histórico de Migrations Aplicadas

Durante a implementação real, foram aplicadas **6 migrations**:

1. **001_initial_schema.sql**
   - Criação de tabelas principais: users, organizations, organization_members
   - Schema base multi-tenant
   - **Status:** Aplicada com sucesso

2. **002_add_timestamps_to_organization_members.sql**
   - Adição de created_at, updated_at na tabela organization_members
   - **Status:** Aplicada com sucesso

3. **003_add_password_reset_and_email_verification_fields.sql**
   - Campos para reset de senha e verificação de email
   - **Status:** Aplicada com sucesso

4. **004_create_organization_invites.sql**
   - Sistema de convites de membros para organizações
   - **Status:** Aplicada com sucesso

5. **005_create_billing_tables.sql**
   - Tabelas de billing (subscriptions, payments, etc)
   - **Status:** Aplicada com alguns warnings (colunas já existiam)

6. **006_add_must_change_password_field.sql**
   - Campo must_change_password na tabela users
   - **Status:** Aplicada com sucesso

### Problemas Encontrados e Soluções

#### 1. **Erro de Conexão Inicial**

**Problema:**

```
Connection URL should point to the Railway TCP proxy
```

**Causa:** TCP Proxy não estava configurado no Railway

**Solução:**

1. Railway Dashboard -> Project -> Service -> Settings -> Networking
2. Ativar TCP Proxy
3. Usar endpoint fornecido: `gondola.proxy.rlwy.net:54886`

#### 2. **Warning na Migration 005**

**Problema:**

```sql
ERROR:  column "stripe_subscription_id" of relation "organizations" already exists
ERROR:  column "subscription_status" of relation "organizations" already exists
```

**Causa:** Colunas já existiam de migrations anteriores

**Solução:**

- Migration continuou normalmente
- Warnings são aceitáveis para migrations que fazem `ALTER TABLE IF NOT EXISTS`
- Version tracking funcionou corretamente

#### 3. **"Database needs updates" Permanente**

**Problema:** Após aplicar migrations, status continuava "needs updates"

**Causa:** Migration sem `INSERT INTO schema_versions`

**Solução:** Verificar que toda migration termina com:

```sql
INSERT INTO schema_versions (version, description, applied_at)
VALUES (X, 'Migration description', NOW());
```

## Melhores Práticas

### 1. **Sempre Validar Localmente Primeiro**

```bash
# NUNCA aplique em produção sem testar localmente
cd migrations
./migrate apply    # Teste local primeiro
```

### 2. **Backup Antes de Migration Crítica**

```bash
# Para migrations que fazem DROP ou ALTER significativo
make connect-db-prod
# No psql:
\copy (SELECT * FROM critical_table) TO 'backup_critical_table.csv' CSV HEADER;
```

### 3. **Monitoring Durante Migration**

```bash
# Em terminal separado, monitore logs durante migration
railway logs --service backend

# Ou monitore conexões ativas
make connect-db-prod
# No psql:
SELECT * FROM pg_stat_activity WHERE state = 'active';
```

### 4. **Rollback Strategy**

Para migrations reversíveis, prepare scripts de rollback:

```sql
-- 007_add_new_column.sql
ALTER TABLE users ADD COLUMN new_field VARCHAR(255);
INSERT INTO schema_versions (version, description) VALUES (7, 'Add new field');

-- 007_rollback.sql
ALTER TABLE users DROP COLUMN new_field;
DELETE FROM schema_versions WHERE version = 7;
```

## Troubleshooting

### Connection Issues

```bash
# Teste de conectividade básica
telnet gondola.proxy.rlwy.net 54886

# Teste via psql diretamente
PGPASSWORD=gdLKoeCiMKduNBFVHPXjvLrcWPYsQyks psql -h gondola.proxy.rlwy.net -p 54886 -U postgres -d railway -c "SELECT version();"
```

### Migration Stuck

```bash
# Ver migrations em processo
make connect-db-prod
# No psql:
SELECT * FROM pg_stat_activity WHERE query LIKE '%migration%';

# Cancelar migration problemática (cuidado!)
SELECT pg_cancel_backend(pid) FROM pg_stat_activity WHERE query LIKE '%problematic_query%';
```

### Schema Version Inconsistency

```bash
# Ver status da tabela schema_versions
make connect-db-prod
# No psql:
SELECT version, description, applied_at FROM schema_versions ORDER BY version;

# Corrigir version tracking manualmente (se necessário)
INSERT INTO schema_versions (version, description, applied_at)
VALUES (X, 'Manually added missing version', NOW());
```

## Monitoramento Pós-Migration

### Health Checks Automáticos

```bash
# Verificar que aplicação continua funcionando
curl -f https://backend-production-fd50.up.railway.app/health
curl -f https://frontend-production-c57a.up.railway.app/

# Verificar logs para erros
railway logs --service backend | grep -i error
```

### Validação de Dados

```sql
-- Verificar integridade referencial
SELECT
    conname,
    pg_get_constraintdef(oid)
FROM pg_constraint
WHERE contype = 'f';

-- Verificar counts de tabelas principais
SELECT
    schemaname,
    tablename,
    n_tup_ins as inserts,
    n_tup_upd as updates,
    n_tup_del as deletes
FROM pg_stat_user_tables
ORDER BY schemaname, tablename;
```

## Checklist de Migration em Produção

### Pré-Migration

- [ ] Migration testada localmente
- [ ] TCP Proxy configurado no Railway
- [ ] Backup realizado (se necessário)
- [ ] Notificação de time (se migration demorada)
- [ ] Monitoring preparado

### Durante Migration

- [ ] `make db-prod-migration-apply` executado
- [ ] Logs monitorados em tempo real
- [ ] Aplicação funcionando durante migration
- [ ] Sem erros críticos nos logs

### Pós-Migration

- [ ] `make db-prod-migration-status` confirma success
- [ ] Health checks passando
- [ ] Funcionalidades críticas testadas
- [ ] Performance não degradada
- [ ] Logs limpos de erros relacionados

## Comandos de Referência Rápida

```bash
# Status e verificação
make db-prod-migration-status      # Ver migrations aplicadas
make db-prod-status               # Health check do banco
make check-db-prod                # Status completo do sistema

# Aplicação de migrations
make db-prod-migration-apply      # Aplicar todas as pendentes

# Debug e investigação
make connect-db-prod              # Conectar via psql interativo
railway logs --service backend   # Ver logs do backend
railway status                   # Status geral do projeto
```

## Referências

- **Railway TCP Proxy:** [Documentação oficial](https://docs.railway.app/develop/services#tcp-proxy)
- **PostgreSQL Migrations:** [Best Practices](https://www.postgresql.org/docs/current/ddl-alter.html)
- **Projeto Railway:** https://railway.com/project/ca4e5687-7c67-4a44-aef9-581ec085cc81
- **Database Service:** https://railway.com/project/ca4e5687-7c67-4a44-aef9-581ec085cc81/service/53ff784d-3543-40d6-b4bd-b3d861005772

---

** Lembrete:** Migrations em produção são operações críticas. Sempre teste localmente primeiro e tenha um plano de rollback preparado.
