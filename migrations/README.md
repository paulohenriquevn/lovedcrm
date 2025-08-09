# SQL Migrations & Seeds System - Loved CRM

## **COMANDOS DISPONÍVEIS:**

### **Migrações:**

```bash
./migrate check       # Ver migrações pendentes
./migrate apply       # Aplicar migrações
./migrate status      # Ver status atual
./migrate init        # Criar banco do zero (⚠️ APAGA TUDO)
```

### **Sistema de Seeds:**

```bash
# Seeds por ambiente
PGPASSWORD=postgres psql -h localhost -p 5434 -U postgres -d saas_test -f seeds/dev/001_seed_base_orgs.sql
PGPASSWORD=postgres psql -h localhost -p 5434 -U postgres -d saas_test -f seeds/dev/002_seed_dev_users.sql

# Seeds de produção (apenas billing plans)
PGPASSWORD=postgres psql -h localhost -p 5434 -U postgres -d saas_test -f seeds/prod/001_seed_production_base.sql

# Seeds de teste (dados mínimos)
PGPASSWORD=postgres psql -h localhost -p 5434 -U postgres -d saas_test -f seeds/test/001_seed_test_users.sql
```

### **Limpeza:**

```bash
./migrate clean       # Limpar dados (mantém schema)
```

## **ESTRUTURA ATUAL (2025-08-09):**

### **🎯 Schema Consolidado:**

- `001_consolidated_schema.sql` - **SCHEMA COMPLETO** com todas as 38 tabelas do CRM

### **🌱 Sistema de Seeds Organizado:**

```
seeds/
├── dev/                          # Desenvolvimento
│   ├── 001_seed_base_orgs.sql   # 3 organizações completas
│   └── 002_seed_dev_users.sql   # 3 usuários com ownership
├── test/                         # Testes E2E
│   └── 001_seed_test_users.sql  # Dados mínimos para testes
└── prod/                         # Produção
    └── 001_seed_production_base.sql # Apenas billing plans
```

### **📚 Histórico Preservado:**

```
legacy_migrations/               # Backup das 14 migrations originais
├── 001_complete_initial_schema.sql
├── 002_crm_tables_schema.sql
├── ...
└── 014_pipeline_performance_index.sql
```

## **COMO ADICIONAR NOVA MIGRAÇÃO:**

### 1. **Criar arquivo numerado:**

```bash
# 002_add_new_feature.sql
```

### 2. **Escrever SQL com tracking obrigatório:**

```sql
-- 002_add_new_feature.sql
-- Description: Add new feature to system

-- Your changes here
ALTER TABLE users ADD COLUMN new_field VARCHAR(100);
CREATE INDEX IF NOT EXISTS idx_users_new_field ON users(new_field);

-- 🚨 OBRIGATÓRIO: Version tracking
INSERT INTO schema_versions (version, description)
VALUES (2, 'Add new feature to system')
ON CONFLICT (version) DO NOTHING;
```

### 3. **Aplicar:**

```bash
./migrate apply
```

## **SISTEMA DE SEEDS - DETALHADO:**

### **🌱 Seeds de Desenvolvimento (dev/):**

**001_seed_base_orgs.sql:**

- 3 organizações completas para desenvolvimento
- IDs fixos para testes determinísticos
- Correção aplicada: sem `owner_id NULL` no INSERT

**002_seed_dev_users.sql:**

- 3 usuários com dados brasileiros realistas
- Senha padrão: `DevPassword123!`
- Ownership automático das organizações
- Correção aplicada: sem coluna `verified_at` inexistente

### **🧪 Seeds de Teste (test/):**

- Dados mínimos para testes E2E
- Usuário padrão: `test@example.com`
- Organização padrão para isolamento

### **🏭 Seeds de Produção (prod/):**

- **APENAS** billing plans (segurança)
- Usuários devem se registrar normalmente
- Setup mínimo e seguro

### **📊 Tracking de Seeds:**

- Tabela `seed_versions` rastreia aplicações
- Versionamento independente por ambiente
- Evita aplicações duplicadas com `ON CONFLICT`

## **VANTAGENS DO SISTEMA:**

### **Para LLMs:**

- **SQL Puro** - linguagem universal, sem abstrações
- **Numeração simples** - 001, 002, 003...
- **Zero dependências** Python/Alembic/Django
- **Idempotente** - seguro aplicar múltiplas vezes

### **Para Desenvolvimento:**

- **Tudo em uma pasta** - organização perfeita
- **Seeds organizados** - dev/test/prod separados
- **Histórico preservado** - legacy_migrations/ como backup
- **Hot updates** - aplicar sem restart (2s vs 45s)

### **Para Produção:**

- **Schema consolidado** - deploy em uma única migração
- **Seeds seguros** - produção apenas com dados essenciais
- **Rastreamento completo** - schema_versions + seed_versions

## **EXEMPLOS DE EVOLUÇÃO:**

### **Adicionar campo:**

```sql
-- 002_add_user_bio.sql
ALTER TABLE users ADD COLUMN bio TEXT;
INSERT INTO schema_versions VALUES (2, 'Add bio field to users');
```

### **Criar nova tabela:**

```sql
-- 003_create_notifications.sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_notifications_org_user ON notifications(organization_id, user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = false;

INSERT INTO schema_versions VALUES (3, 'Create notifications system');
```

### **Adicionar seed para nova funcionalidade:**

```sql
-- seeds/dev/003_seed_notifications.sql
INSERT INTO notifications (organization_id, user_id, title, content)
VALUES
('01010101-0101-0101-0101-010101010101', '11111111-1111-1111-1111-111111111111',
 'Bem-vindo ao CRM', 'Sua conta foi configurada com sucesso!');

INSERT INTO seed_versions (version, description, environment)
VALUES (3, 'Development notifications', 'dev')
ON CONFLICT (version, environment) DO NOTHING;
```

## **REGRAS OBRIGATÓRIAS:**

### **📏 Para Migrations:**

1. **Numeração sequencial:** `001_`, `002_`, `003_`...
2. **SQL puro:** Sem abstrações, sem Python
3. **SEMPRE incluir version tracking:**
   ```sql
   INSERT INTO schema_versions (version, description)
   VALUES (X, 'Description') ON CONFLICT (version) DO NOTHING;
   ```
4. **Idempotente:** Use `IF NOT EXISTS`, `ON CONFLICT` quando possível
5. **Uma mudança por arquivo:** Atomic changes

### **🌱 Para Seeds:**

1. **Organização por ambiente:** dev/test/prod separados
2. **Versionamento:** Sempre usar `seed_versions` table
3. **IDs determinísticos:** UUIDs fixos para dev/test
4. **Segurança em prod:** Apenas dados essenciais
5. **Conflito seguro:** `ON CONFLICT ... DO NOTHING`

## **TROUBLESHOOTING:**

### **🚨 "Database needs updates" permanente:**

**CAUSA:** Migration sem version tracking
**SOLUÇÃO:** Adicionar ao final da migration:

```sql
INSERT INTO schema_versions (version, description)
VALUES (X, 'Description') ON CONFLICT (version) DO NOTHING;
```

### **❌ "Column already exists":**

**CAUSA:** Migration aplicada mas não registrada (normal)
**SOLUÇÃO:** Apenas registrar versão:

```sql
INSERT INTO schema_versions (version, description)
VALUES (X, 'Description') ON CONFLICT (version) DO NOTHING;
```

### **🔍 Seeds não aplicando:**

**VERIFICAR:**

1. Path correto: `seeds/environment/file.sql`
2. Tabela `seed_versions` existe na migration principal
3. Comando psql com parâmetros corretos

### **🗃️ Migration não encontrada:**

**VERIFICAR:**

1. Numeração sequencial (`001_`, `002_`)
2. Arquivo na pasta `migrations/`
3. Permissão de execução: `chmod +x migrate`

## **HISTÓRICO DE CONSOLIDAÇÃO:**

**🔄 2025-08-09:** Sistema completamente consolidado e limpo:

- ✅ 14 migrations legacy → 1 migration consolidada
- ✅ Seeds organizados por ambiente (dev/test/prod)
- ✅ Sistema de versionamento duplo (schema + seeds)
- ✅ Todos os testes passando após limpeza
- ✅ Arquivos obsoletos removidos

**📊 Resultado:**

- **Antes:** 23 arquivos misturados na pasta migrations
- **Depois:** 4 arquivos essenciais + estrutura organizada
- **Benefício:** Deploy mais rápido, manutenção mais simples, seeds organizados

## **PARA LLM - COMANDO RÁPIDO:**

**Usuário:** "Adicione tabela X com campo Y"

**Resposta:**

```sql
-- 00X_add_table_x.sql
CREATE TABLE x (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    y VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_x_organization_id ON x(organization_id);
INSERT INTO schema_versions VALUES (X, 'Add table x with field y');
```

**Aplicar:** `./migrate apply`

**✅ Pronto!**
