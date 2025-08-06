# SQL Migrations - Tudo organizado em uma pasta

## **COMANDOS DISPONÍVEIS:**

### **Migrações:**

```bash
./migrate check       # Ver migrações pendentes
./migrate apply       # Aplicar migrações
./migrate status      # Ver status
./migrate init        # Criar banco do zero (DEV)
```

### **Dados:**

```bash
./migrate test-setup  # Carregar dados de teste (E2E)
./migrate dev-seeds   # Carregar seeds de desenvolvimento
./migrate clean       # Limpar dados (mantém schema)
```

### **Como adicionar evolução:**

#### 1. **Criar arquivo SQL:**

```bash
# 002_add_user_age.sql
```

#### 2. **Escrever SQL puro:**

```sql
-- 002_add_user_age.sql
-- Add age field to users

ALTER TABLE users ADD COLUMN age INTEGER;
CREATE INDEX IF NOT EXISTS idx_users_age ON users(age);

-- Record migration (SEMPRE no final)
INSERT INTO schema_versions (version, description)
VALUES (2, 'Add age field to users');
```

#### 3. **Aplicar:**

```bash
./migrate apply
```

## **VANTAGENS para LLM:**

### **Alembic (complexo):**

```python
def upgrade():
    op.add_column('users', sa.Column('age', sa.Integer()))
    op.create_index('idx_users_age', 'users', ['age'])
```

### **Nosso sistema (simples):**

```sql
ALTER TABLE users ADD COLUMN age INTEGER;
CREATE INDEX idx_users_age ON users(age);
INSERT INTO schema_versions VALUES (2, 'Add age field');
```

## **Exemplos de evolução:**

### **Adicionar campo:**

```sql
-- migrations/003_add_user_bio.sql
ALTER TABLE users ADD COLUMN bio TEXT;
INSERT INTO schema_versions VALUES (3, 'Add bio field');
```

### **Criar tabela:**

```sql
-- 004_create_posts.sql
CREATE TABLE posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    content TEXT,
    user_id UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_posts_user_id ON posts(user_id);
INSERT INTO schema_versions VALUES (4, 'Create posts table');
```

### **Alterar campo:**

```sql
-- 005_expand_user_email.sql
ALTER TABLE users ALTER COLUMN email TYPE VARCHAR(500);
INSERT INTO schema_versions VALUES (5, 'Expand email field size');
```

## **Regras OBRIGATÓRIAS:**

1. **Arquivos numerados:** `001_`, `002_`, `003_`...
2. **SQL puro:** Sem Python, sem complexidade
3. **SEMPRE terminar com:** `INSERT INTO schema_versions` (CRÍTICO!)
4. **Idempotente:** Use `IF NOT EXISTS` quando possível
5. **Uma evolução por arquivo:** Cada arquivo = uma mudança

### **REGRA CRÍTICA - VERSION TRACKING:**

**TODA migration DEVE terminar com:**

```sql
-- Record migration version (CRITICAL - always include this!)
INSERT INTO schema_versions (version, description)
VALUES (X, 'Description of changes')
ON CONFLICT (version) DO NOTHING;
```

**SEM ISSO:** Sistema fica com "Database needs updates" forever
**COM ISSO:** Sistema reconhece migration como aplicada

## **Para LLM:**

**Pergunta:** "Adicione campo birth_date na tabela users"

**Resposta:**

```sql
-- 006_add_birth_date.sql
ALTER TABLE users ADD COLUMN birth_date DATE;
INSERT INTO schema_versions VALUES (6, 'Add birth_date to users');
```

**Aplicar:**

```bash
./migrate apply
```

**Pronto!**

## **Arquivos na pasta (CONSOLIDADA - 2025-08-03):**

### **Migrações numeradas:**

- `001_complete_initial_schema.sql` - **CONSOLIDATED:** Schema completo (users, orgs, invites, billing)
- `002_...` - Próximas evoluções (futuras)

### **Migrations Legacy (Backup):**

- `legacy/001_initial_schema.sql` - Schema inicial original
- `legacy/002_add_timestamps_to_organization_members.sql`
- `legacy/003_add_password_reset_and_email_verification_fields.sql`
- `legacy/004_create_organization_invites.sql`
- `legacy/005_create_billing_tables.sql`
- `legacy/006_add_must_change_password_field.sql`

### **Scripts utilitários:**

- `migrate` - Script principal
- `test-setup.sql` - Dados para testes E2E
- `dev-seeds.sql` - Seeds de desenvolvimento
- `common-seeds.sql` - Dados base comuns
- `clean-db.sql` - Limpar dados

### **Documentação:**

- `README.md` - Este guia
- `TEMPLATE_migration.sql` - Template para novas migrations

> **NOTA IMPORTANTE:** As migrations foram consolidadas para simplificar novos deployments. O schema agora é criado em uma única migration otimizada que inclui todas as funcionalidades essenciais.

## **TROUBLESHOOTING**

### **Problema: "Database needs updates" não sai**

**CAUSA:** Migration sem version tracking
**SOLUÇÃO:**

```sql
-- Adicione no final da migration:
INSERT INTO schema_versions (version, description)
VALUES (X, 'Description')
ON CONFLICT (version) DO NOTHING;
```

**COMO CORRIGIR:**

```bash
# 1. Identifique a migration problemática
./migrate status

# 2. Edite o arquivo e adicione version tracking
# 3. Re-aplique
./migrate apply
```

### **Problema: Erros "column already exists"**

**CAUSA:** Migration aplicada mas não registrada
**SOLUÇÃO:** Normal - apenas registre a versão

```sql
-- Execute apenas:
INSERT INTO schema_versions (version, description)
VALUES (X, 'Description')
ON CONFLICT (version) DO NOTHING;
```

### **Problema: Migration não encontrada**

**VERIFICAR:**

1. Arquivo numerado corretamente? (`001_`, `002_`)
2. Está na pasta `migrations/`?
3. Tem permissão de execução para `./migrate`?

## **Por que é melhor:**

- **TUDO EM UMA PASTA** - organização perfeita
- **SQL PURO** - linguagem universal
- **ZERO dependências** Python
- **Numeração simples** - 1, 2, 3...
- **Scripts completos** - migrações + dados + testes
- **LLM friendly** - qualquer LLM domina SQL
- **HOT UPDATES** - aplicar sem restart (2s vs 45s)
