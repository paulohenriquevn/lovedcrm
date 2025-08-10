# TABLES.md - Loved CRM Database Schema

**Sistema:** Multi-tenant CRM para agências digitais brasileiras  
**Tecnologia:** PostgreSQL 16 com Next.js 14 + FastAPI  
**Multi-tenancy:** Isolamento por `organization_id` em todas as tabelas  
**Gerado:** 2025-08-10 - Baseado em 001_consolidated_schema.sql

---

## **📊 RESUMO DO SCHEMA**

- **Total de Tabelas:** 20 tabelas principais
- **Arquitetura:** Multi-tenant com isolamento por organização
- **Principais Funcionalidades:** Autenticação 2FA, CRM Pipeline, Billing, AI, Integrações
- **Performance:** Indexes otimizados para consultas org-scoped

---

## **🏗️ CATEGORIAS FUNCIONAIS**

### **1. 🔐 AUTENTICAÇÃO & USUÁRIOS (5 tabelas)**

### **2. 🏢 MULTI-TENANCY & ORGANIZAÇÕES (3 tabelas)**

### **3. 🎯 CRM CORE (4 tabelas)**

### **4. 💰 BILLING & ASSINATURAS (2 tabelas)**

### **5. 🔧 SISTEMA & INTEGRAÇÕES (4 tabelas)**

### **6. 📈 ANALYTICS & TRACKING (2 tabelas)**

---

## **📋 DETALHAMENTO POR CATEGORIA**

## **1. 🔐 AUTENTICAÇÃO & USUÁRIOS**

### **`users`** - Usuários do sistema

**Propósito:** Gerenciamento completo de usuários com OAuth e 2FA

| Campo                        | Tipo         | Descrição                  |
| ---------------------------- | ------------ | -------------------------- |
| `id`                         | UUID         | PK - Identificador único   |
| `email`                      | VARCHAR(255) | Email único do usuário     |
| `hashed_password`            | TEXT         | Senha hasheada (bcrypt)    |
| `full_name`                  | VARCHAR(255) | Nome completo              |
| `bio`                        | TEXT         | Biografia do usuário       |
| `location`                   | VARCHAR(255) | Localização                |
| `avatar_url`                 | TEXT         | URL do avatar              |
| `phone`                      | VARCHAR(20)  | Telefone                   |
| `timezone`                   | VARCHAR(50)  | Fuso horário (padrão: UTC) |
| `language`                   | VARCHAR(10)  | Idioma (padrão: pt)        |
| `google_id`                  | VARCHAR(255) | ID do Google OAuth         |
| `is_active`                  | BOOLEAN      | Usuário ativo              |
| `is_verified`                | BOOLEAN      | Email verificado           |
| `is_superuser`               | BOOLEAN      | Superusuário               |
| `password_reset_token`       | VARCHAR(255) | Token de reset de senha    |
| `password_reset_expires`     | TIMESTAMPTZ  | Expiração do token         |
| `email_verification_token`   | VARCHAR(255) | Token de verificação       |
| `email_verification_expires` | TIMESTAMPTZ  | Expiração da verificação   |
| `verified_at`                | TIMESTAMPTZ  | Data da verificação        |
| `must_change_password`       | BOOLEAN      | Forçar mudança de senha    |
| `two_factor_secret`          | VARCHAR(255) | Segredo TOTP               |
| `two_factor_enabled`         | BOOLEAN      | 2FA habilitado             |
| `two_factor_backup_codes`    | TEXT[]       | Códigos de backup          |
| `last_login`                 | TIMESTAMPTZ  | Último login               |
| `created_at`                 | TIMESTAMPTZ  | Data de criação            |
| `updated_at`                 | TIMESTAMPTZ  | Última atualização         |

**Indexes:**

- `idx_users_email` - Busca por email
- `idx_users_google_id` - OAuth Google
- `idx_users_created_at` - Ordenação temporal
- `idx_users_password_reset_token` - Reset de senha
- `idx_users_email_verification_token` - Verificação de email

---

### **`user_two_factor`** - 2FA por organização

**Propósito:** Sistema de autenticação de dois fatores organization-scoped

| Campo               | Tipo        | Descrição                            |
| ------------------- | ----------- | ------------------------------------ |
| `id`                | UUID        | PK - Identificador único             |
| `user_id`           | UUID        | FK - Referência ao usuário           |
| `organization_id`   | UUID        | FK - Referência à organização        |
| `secret_key`        | VARCHAR(32) | Chave secreta Base32 para TOTP       |
| `backup_codes`      | JSONB       | Array de códigos de backup hasheados |
| `backup_codes_used` | JSONB       | Códigos de backup já utilizados      |
| `is_enabled`        | BOOLEAN     | 2FA habilitado para esta org         |
| `confirmed_at`      | TIMESTAMPTZ | Data de confirmação do 2FA           |
| `last_used_at`      | TIMESTAMPTZ | Último uso do 2FA                    |
| `created_at`        | TIMESTAMPTZ | Data de criação                      |
| `updated_at`        | TIMESTAMPTZ | Última atualização                   |

**Constraints:**

- `uq_user_two_factor_user_org` - Um 2FA por usuário por organização

**Indexes:**

- `ix_user_two_factor_user_org` - Busca por usuário/org
- `ix_user_two_factor_organization_id` - Busca por organização
- `ix_user_two_factor_enabled` - 2FA habilitados por org

---

### **`user_preferences`** - Preferências por organização

**Propósito:** Configurações personalizadas do usuário organization-scoped

| Campo                   | Tipo        | Descrição                          |
| ----------------------- | ----------- | ---------------------------------- |
| `id`                    | UUID        | PK - Identificador único           |
| `user_id`               | UUID        | FK - Referência ao usuário         |
| `organization_id`       | UUID        | FK - Referência à organização      |
| `theme`                 | VARCHAR(20) | Tema (system/light/dark)           |
| `language`              | VARCHAR(10) | Idioma da interface                |
| `timezone`              | VARCHAR(50) | Fuso horário                       |
| `date_format`           | VARCHAR(20) | Formato de data                    |
| `time_format`           | VARCHAR(10) | Formato de hora (12h/24h)          |
| `email_notifications`   | BOOLEAN     | Notificações por email             |
| `push_notifications`    | BOOLEAN     | Notificações push                  |
| `sms_notifications`     | BOOLEAN     | Notificações SMS                   |
| `email_marketing`       | BOOLEAN     | Emails de marketing                |
| `email_product_updates` | BOOLEAN     | Atualizações de produto            |
| `email_security_alerts` | BOOLEAN     | Alertas de segurança               |
| `email_billing_alerts`  | BOOLEAN     | Alertas de cobrança                |
| `email_team_activity`   | BOOLEAN     | Atividade da equipe                |
| `dashboard_layout`      | VARCHAR(20) | Layout do dashboard                |
| `items_per_page`        | VARCHAR(10) | Itens por página                   |
| `show_onboarding`       | BOOLEAN     | Mostrar onboarding                 |
| `show_tips`             | BOOLEAN     | Mostrar dicas                      |
| `profile_visibility`    | VARCHAR(20) | Visibilidade do perfil             |
| `activity_status`       | BOOLEAN     | Status de atividade                |
| `quiet_hours`           | JSONB       | Configuração de horário silencioso |
| `custom_settings`       | JSONB       | Configurações customizadas         |
| `created_at`            | TIMESTAMPTZ | Data de criação                    |
| `updated_at`            | TIMESTAMPTZ | Última atualização                 |

**Constraints:**

- `uq_user_preferences_user_org` - Uma preferência por usuário por org

**Indexes:**

- `ix_user_preferences_user_id` - Busca por usuário
- `ix_user_preferences_organization_id` - Busca por organização
- `ix_user_preferences_user_org` - Busca combinada
- `ix_user_preferences_theme` - Busca por tema
- `ix_user_preferences_language` - Busca por idioma

---

### **`user_sessions`** - Sessões ativas

**Propósito:** Gerenciamento de sessões de usuário com refresh tokens

| Campo              | Tipo         | Descrição                    |
| ------------------ | ------------ | ---------------------------- |
| `id`               | UUID         | PK - Identificador único     |
| `user_id`          | UUID         | FK - Referência ao usuário   |
| `organization_id`  | UUID         | FK - Contexto organizacional |
| `session_token`    | VARCHAR(255) | Token de sessão único        |
| `refresh_token`    | VARCHAR(255) | Token de refresh único       |
| `ip_address`       | INET         | Endereço IP da sessão        |
| `user_agent`       | TEXT         | User agent do navegador      |
| `device_info`      | JSONB        | Informações do dispositivo   |
| `is_active`        | BOOLEAN      | Sessão ativa                 |
| `expires_at`       | TIMESTAMPTZ  | Data de expiração            |
| `last_activity_at` | TIMESTAMPTZ  | Última atividade             |
| `created_at`       | TIMESTAMPTZ  | Data de criação              |
| `updated_at`       | TIMESTAMPTZ  | Última atualização           |

**Indexes:**

- `idx_user_sessions_user_id` - Busca por usuário
- `idx_user_sessions_session_token` - Busca por token
- `idx_user_sessions_expires_at` - Limpeza de sessões expiradas

---

### **`schema_versions`** - Controle de migrações

**Propósito:** Rastreamento de versões do schema de banco

| Campo         | Tipo        | Descrição             |
| ------------- | ----------- | --------------------- |
| `version`     | INTEGER     | PK - Número da versão |
| `applied_at`  | TIMESTAMPTZ | Data de aplicação     |
| `description` | TEXT        | Descrição da migração |

---

## **2. 🏢 MULTI-TENANCY & ORGANIZAÇÕES**

### **`organizations`** - Organizações (tenants)

**Propósito:** Core do sistema multi-tenant - cada organização é um tenant isolado

| Campo                 | Tipo         | Descrição                        |
| --------------------- | ------------ | -------------------------------- |
| `id`                  | UUID         | PK - Identificador único         |
| `name`                | VARCHAR(255) | Nome da organização              |
| `slug`                | VARCHAR(100) | Slug único para URLs             |
| `description`         | TEXT         | Descrição da organização         |
| `website`             | VARCHAR(255) | Site da organização              |
| `logo_url`            | TEXT         | URL do logo                      |
| `industry`            | VARCHAR(100) | Setor de atuação                 |
| `company_size`        | VARCHAR(50)  | Tamanho da empresa               |
| `owner_id`            | UUID         | FK - Proprietário da organização |
| `is_active`           | BOOLEAN      | Organização ativa                |
| `is_verified`         | BOOLEAN      | Organização verificada           |
| `subscription_status` | VARCHAR(50)  | Status da assinatura             |
| `trial_ends_at`       | TIMESTAMPTZ  | Fim do período trial             |
| `settings`            | JSONB        | Configurações da organização     |
| `created_at`          | TIMESTAMPTZ  | Data de criação                  |
| `updated_at`          | TIMESTAMPTZ  | Última atualização               |

**Indexes:**

- `idx_organizations_slug` - Busca por slug único
- `idx_organizations_owner_id` - Busca por proprietário
- `idx_organizations_created_at` - Ordenação temporal

---

### **`organization_members`** - Membros das organizações

**Propósito:** Relacionamento many-to-many entre usuários e organizações com roles

| Campo             | Tipo              | Descrição                         |
| ----------------- | ----------------- | --------------------------------- |
| `id`              | UUID              | PK - Identificador único          |
| `organization_id` | UUID              | FK - Referência à organização     |
| `user_id`         | UUID              | FK - Referência ao usuário        |
| `role`            | organization_role | Papel (owner/admin/member/viewer) |
| `permissions`     | JSONB             | Permissões específicas            |
| `is_active`       | BOOLEAN           | Membro ativo                      |
| `joined_at`       | TIMESTAMPTZ       | Data de entrada                   |
| `created_at`      | TIMESTAMPTZ       | Data de criação                   |
| `updated_at`      | TIMESTAMPTZ       | Última atualização                |

**Constraints:**

- `UNIQUE(organization_id, user_id)` - Um usuário por organização

**Indexes:**

- `idx_organization_members_org_id` - Busca por organização
- `idx_organization_members_user_id` - Busca por usuário
- `idx_organization_members_role` - Busca por role na organização

---

### **`organization_invites`** - Convites para organizações

**Propósito:** Sistema de convites para entrada em organizações

| Campo             | Tipo              | Descrição                                            |
| ----------------- | ----------------- | ---------------------------------------------------- |
| `id`              | UUID              | PK - Identificador único                             |
| `organization_id` | UUID              | FK - Organização de destino                          |
| `invited_by_id`   | UUID              | FK - Quem enviou o convite                           |
| `email`           | VARCHAR(255)      | Email do convidado                                   |
| `invited_name`    | VARCHAR(100)      | Nome do convidado                                    |
| `role`            | organization_role | Role proposto                                        |
| `status`          | invite_status     | Status (pending/accepted/rejected/expired/cancelled) |
| `message`         | TEXT              | Mensagem personalizada                               |
| `token`           | VARCHAR(255)      | Token único do convite                               |
| `is_active`       | BOOLEAN           | Convite ativo                                        |
| `metadata`        | JSONB             | Metadados adicionais                                 |
| `created_at`      | TIMESTAMPTZ       | Data de criação                                      |
| `updated_at`      | TIMESTAMPTZ       | Última atualização                                   |
| `expires_at`      | TIMESTAMPTZ       | Data de expiração (7 dias)                           |
| `accepted_at`     | TIMESTAMPTZ       | Data de aceitação                                    |
| `responded_at`    | TIMESTAMPTZ       | Data de resposta                                     |

**Indexes:**

- `idx_organization_invites_org_id` - Busca por organização
- `idx_organization_invites_email` - Busca por email
- `idx_organization_invites_token` - Busca por token
- `idx_organization_invites_status` - Busca por status

---

## **3. 🎯 CRM CORE**

### **`leads`** - Leads do CRM (core do sistema)

**Propósito:** Núcleo do sistema CRM - armazena todos os leads do pipeline

| Campo                  | Tipo          | Descrição                                                      |
| ---------------------- | ------------- | -------------------------------------------------------------- |
| `id`                   | UUID          | PK - Identificador único                                       |
| `organization_id`      | UUID          | FK - Isolamento multi-tenant                                   |
| `name`                 | VARCHAR(255)  | Nome do lead                                                   |
| `email`                | VARCHAR(255)  | Email do lead                                                  |
| `phone`                | VARCHAR(50)   | Telefone do lead                                               |
| `company`              | VARCHAR(255)  | Empresa do lead                                                |
| `position`             | VARCHAR(255)  | Cargo na empresa                                               |
| `stage`                | VARCHAR(50)   | Estágio no pipeline (lead/contact/proposal/negotiation/closed) |
| `source`               | VARCHAR(100)  | Fonte do lead (web/email/phone/referral/etc)                   |
| `priority`             | lead_priority | Prioridade (low/medium/high/urgent)                            |
| `estimated_value`      | DECIMAL(12,2) | Valor estimado do negócio                                      |
| `actual_value`         | DECIMAL(15,2) | Valor real fechado                                             |
| `is_closed`            | BOOLEAN       | Lead fechado                                                   |
| `is_won`               | BOOLEAN       | Lead ganho (se fechado)                                        |
| `is_favorite`          | BOOLEAN       | Lead marcado como favorito                                     |
| `assigned_user_id`     | UUID          | FK - Usuário responsável                                       |
| `last_contact_at`      | TIMESTAMPTZ   | Último contato realizado                                       |
| `last_contact_channel` | VARCHAR(20)   | Canal do último contato                                        |
| `notes`                | TEXT          | Observações sobre o lead                                       |
| `tags`                 | TEXT[]        | Tags categóricas                                               |
| `lead_metadata`        | JSONB         | Metadados estruturados                                         |
| `created_at`           | TIMESTAMPTZ   | Data de criação                                                |
| `updated_at`           | TIMESTAMPTZ   | Última atualização                                             |
| `closed_at`            | TIMESTAMPTZ   | Data de fechamento                                             |

**Indexes Otimizados para Pipeline:**

- `idx_leads_organization_id` - Isolamento multi-tenant
- `idx_leads_org_stage` - Pipeline views por organização
- `idx_leads_org_stage_updated` - Pipeline ordenado por atualização
- `idx_leads_org_assigned_user` - Leads por responsável
- `idx_leads_org_search` - Busca por nome/email/telefone
- `idx_leads_org_source` - Relatórios por fonte
- `idx_leads_org_priority` - Filtragem por prioridade

---

### **`communications`** - Histórico de comunicações

**Propósito:** Timeline completo de interações com cada lead

| Campo             | Tipo         | Descrição                                |
| ----------------- | ------------ | ---------------------------------------- |
| `id`              | UUID         | PK - Identificador único                 |
| `organization_id` | UUID         | FK - Isolamento multi-tenant             |
| `lead_id`         | UUID         | FK - Lead relacionado                    |
| `channel`         | VARCHAR(20)  | Canal (email/whatsapp/phone/meeting/sms) |
| `direction`       | VARCHAR(10)  | Direção (inbound/outbound)               |
| `subject`         | VARCHAR(500) | Assunto da comunicação                   |
| `content`         | TEXT         | Conteúdo da mensagem                     |
| `comm_metadata`   | JSONB        | Metadados estruturados                   |
| `attachments`     | JSONB        | Anexos da comunicação                    |
| `external_id`     | VARCHAR(255) | ID de sistema externo                    |
| `status`          | VARCHAR(20)  | Status (delivered/read/failed/etc)       |
| `sent_at`         | TIMESTAMPTZ  | Data de envio                            |
| `created_at`      | TIMESTAMPTZ  | Data de criação                          |
| `updated_at`      | TIMESTAMPTZ  | Última atualização                       |

**Indexes:**

- `idx_communications_organization_id` - Isolamento multi-tenant
- `idx_communications_lead_id` - Timeline por lead
- `idx_communications_channel` - Relatórios por canal
- `idx_communications_external_id` - Integração com sistemas externos
- `idx_communications_sent_at` - Ordenação temporal
- `idx_communications_created_at` - Performance de inserção

---

### **`message_templates`** - Templates de mensagem

**Propósito:** Automação de comunicações com templates reutilizáveis

| Campo             | Tipo         | Descrição                          |
| ----------------- | ------------ | ---------------------------------- |
| `id`              | UUID         | PK - Identificador único           |
| `organization_id` | UUID         | FK - Isolamento multi-tenant       |
| `name`            | VARCHAR(255) | Nome do template                   |
| `category`        | VARCHAR(100) | Categoria (follow-up/proposal/etc) |
| `content`         | TEXT         | Conteúdo do template               |
| `variables`       | JSONB        | Variáveis do template              |
| `is_active`       | BOOLEAN      | Template ativo                     |
| `usage_count`     | INTEGER      | Contador de uso                    |
| `created_by_id`   | UUID         | FK - Criado por usuário            |
| `created_at`      | TIMESTAMPTZ  | Data de criação                    |
| `updated_at`      | TIMESTAMPTZ  | Última atualização                 |

**Indexes:**

- `idx_message_templates_org_id` - Busca por organização
- `idx_message_templates_category` - Templates por categoria

---

### **`ai_summaries`** - Resumos gerados por IA

**Propósito:** Análise automatizada de conversas com IA

| Campo              | Tipo         | Descrição                    |
| ------------------ | ------------ | ---------------------------- |
| `id`               | UUID         | PK - Identificador único     |
| `organization_id`  | UUID         | FK - Isolamento multi-tenant |
| `conversation_id`  | UUID         | ID da conversa analisada     |
| `lead_id`          | UUID         | FK - Lead relacionado        |
| `summary`          | TEXT         | Resumo gerado pela IA        |
| `sentiment`        | VARCHAR(20)  | Análise de sentimento        |
| `next_actions`     | TEXT[]       | Próximas ações sugeridas     |
| `confidence_score` | DECIMAL(3,2) | Confiança da IA (0.00-1.00)  |
| `model_used`       | VARCHAR(50)  | Modelo de IA utilizado       |
| `tokens_used`      | INTEGER      | Tokens consumidos            |
| `created_at`       | TIMESTAMPTZ  | Data da análise              |

**Indexes:**

- `idx_ai_summaries_organization_id` - Busca por organização
- `idx_ai_summaries_conversation_id` - Busca por conversa
- `idx_ai_summaries_lead_id` - Resumos por lead
- `idx_ai_summaries_created_at` - Ordenação temporal

---

## **4. 💰 BILLING & ASSINATURAS**

### **`plans`** - Planos de assinatura

**Propósito:** Definição de planos disponíveis no sistema

| Campo         | Tipo         | Descrição                   |
| ------------- | ------------ | --------------------------- |
| `id`          | UUID         | PK - Identificador único    |
| `name`        | VARCHAR(100) | Nome do plano               |
| `slug`        | VARCHAR(50)  | Slug único do plano         |
| `price_cents` | INTEGER      | Preço em centavos           |
| `features`    | JSONB        | Array de features incluídas |
| `is_active`   | BOOLEAN      | Plano disponível            |
| `created_at`  | TIMESTAMPTZ  | Data de criação             |
| `updated_at`  | TIMESTAMPTZ  | Última atualização          |

**Planos Padrão:**

- **Básico** (R$ 0): user_management, basic_dashboard, up_to_100_leads, email_support
- **Profissional** (R$ 29): unlimited_leads, advanced_reports, api_access, integrations

---

### **`organization_subscriptions`** - Assinaturas das organizações

**Propósito:** Gerenciamento de assinaturas ativas com integração Stripe

| Campo                    | Tipo         | Descrição                  |
| ------------------------ | ------------ | -------------------------- |
| `id`                     | UUID         | PK - Identificador único   |
| `organization_id`        | UUID         | FK - Organização assinante |
| `plan_id`                | UUID         | FK - Plano contratado      |
| `stripe_subscription_id` | VARCHAR(255) | ID da assinatura no Stripe |
| `stripe_customer_id`     | VARCHAR(255) | ID do customer no Stripe   |
| `status`                 | VARCHAR(50)  | Status da assinatura       |
| `is_active`              | BOOLEAN      | Assinatura ativa           |
| `current_period_start`   | TIMESTAMPTZ  | Início do período atual    |
| `current_period_end`     | TIMESTAMPTZ  | Fim do período atual       |
| `is_trial`               | BOOLEAN      | Em período trial           |
| `trial_end`              | TIMESTAMPTZ  | Fim do trial               |
| `created_at`             | TIMESTAMPTZ  | Data de criação            |
| `updated_at`             | TIMESTAMPTZ  | Última atualização         |

**Constraints:**

- `UNIQUE(organization_id)` - Uma assinatura por organização

**Indexes:**

- `idx_organization_subscriptions_org_id` - Busca por organização
- `idx_organization_subscriptions_plan_id` - Relatórios por plano
- `idx_organization_subscriptions_stripe_subscription_id` - Integração Stripe

---

## **5. 🔧 SISTEMA & INTEGRAÇÕES**

### **`api_keys`** - Chaves de API

**Propósito:** Gerenciamento de chaves para integração externa

| Campo             | Tipo         | Descrição                     |
| ----------------- | ------------ | ----------------------------- |
| `id`              | UUID         | PK - Identificador único      |
| `organization_id` | UUID         | FK - Organização proprietária |
| `name`            | VARCHAR(255) | Nome da chave                 |
| `key_hash`        | VARCHAR(255) | Hash da chave                 |
| `prefix`          | VARCHAR(20)  | Prefixo identificador         |
| `permissions`     | JSONB        | Array de permissões           |
| `scopes`          | JSONB        | Escopo de acesso              |
| `last_used_at`    | TIMESTAMPTZ  | Último uso                    |
| `usage_count`     | INTEGER      | Contador de uso               |
| `rate_limit`      | INTEGER      | Limite de requisições         |
| `is_active`       | BOOLEAN      | Chave ativa                   |
| `expires_at`      | TIMESTAMPTZ  | Data de expiração             |
| `created_by_id`   | UUID         | FK - Criado por usuário       |
| `created_at`      | TIMESTAMPTZ  | Data de criação               |
| `updated_at`      | TIMESTAMPTZ  | Última atualização            |

**Indexes:**

- `idx_api_keys_org_id` - Busca por organização
- `idx_api_keys_prefix` - Identificação rápida da chave

---

### **`webhooks`** - Webhooks de integração

**Propósito:** Sistema de webhooks para notificações externas

| Campo               | Tipo         | Descrição                     |
| ------------------- | ------------ | ----------------------------- |
| `id`                | UUID         | PK - Identificador único      |
| `organization_id`   | UUID         | FK - Organização proprietária |
| `name`              | VARCHAR(255) | Nome do webhook               |
| `url`               | VARCHAR(500) | URL de destino                |
| `events`            | JSONB        | Array de eventos monitorados  |
| `secret`            | VARCHAR(255) | Segredo para validação        |
| `headers`           | JSONB        | Headers customizados          |
| `is_active`         | BOOLEAN      | Webhook ativo                 |
| `last_triggered_at` | TIMESTAMPTZ  | Último disparo                |
| `success_count`     | INTEGER      | Sucessos                      |
| `failure_count`     | INTEGER      | Falhas                        |
| `created_by_id`     | UUID         | FK - Criado por usuário       |
| `created_at`        | TIMESTAMPTZ  | Data de criação               |
| `updated_at`        | TIMESTAMPTZ  | Última atualização            |

**Indexes:**

- `idx_webhooks_org_id` - Busca por organização
- `idx_webhooks_active` - Webhooks ativos por organização

---

### **`background_jobs`** - Fila de jobs

**Propósito:** Sistema de processamento assíncrono de tarefas

| Campo             | Tipo         | Descrição                                 |
| ----------------- | ------------ | ----------------------------------------- |
| `id`              | UUID         | PK - Identificador único                  |
| `organization_id` | UUID         | FK - Contexto organizacional              |
| `job_type`        | VARCHAR(100) | Tipo do job                               |
| `payload`         | JSONB        | Dados do job                              |
| `status`          | VARCHAR(50)  | Status (pending/running/completed/failed) |
| `priority`        | INTEGER      | Prioridade (0 = alta)                     |
| `max_retries`     | INTEGER      | Tentativas máximas                        |
| `retry_count`     | INTEGER      | Tentativas realizadas                     |
| `scheduled_at`    | TIMESTAMPTZ  | Agendado para execução                    |
| `started_at`      | TIMESTAMPTZ  | Início da execução                        |
| `completed_at`    | TIMESTAMPTZ  | Fim da execução                           |
| `result`          | JSONB        | Resultado da execução                     |
| `error_message`   | TEXT         | Mensagem de erro                          |
| `created_at`      | TIMESTAMPTZ  | Data de criação                           |
| `updated_at`      | TIMESTAMPTZ  | Última atualização                        |

**Indexes:**

- `idx_background_jobs_status` - Fila de execução
- `idx_background_jobs_org_id` - Jobs por organização

---

### **`seed_versions`** - Controle de seeds

**Propósito:** Rastreamento de seeds aplicados por ambiente

| Campo         | Tipo        | Descrição                |
| ------------- | ----------- | ------------------------ |
| `version`     | INTEGER     | Número da versão         |
| `environment` | VARCHAR(20) | Ambiente (dev/test/prod) |
| `applied_at`  | TIMESTAMPTZ | Data de aplicação        |
| `description` | TEXT        | Descrição do seed        |

**Constraints:**

- `PRIMARY KEY (version, environment)` - Versionamento por ambiente

---

## **6. 📈 ANALYTICS & TRACKING**

### **`calendar_events`** - Eventos de calendário

**Propósito:** Integração com calendários e agendamento

| Campo               | Tipo         | Descrição                     |
| ------------------- | ------------ | ----------------------------- |
| `id`                | UUID         | PK - Identificador único      |
| `organization_id`   | UUID         | FK - Isolamento multi-tenant  |
| `lead_id`           | UUID         | FK - Lead relacionado         |
| `title`             | VARCHAR(255) | Título do evento              |
| `description`       | TEXT         | Descrição do evento           |
| `start_time`        | TIMESTAMPTZ  | Início do evento              |
| `end_time`          | TIMESTAMPTZ  | Fim do evento                 |
| `external_event_id` | VARCHAR(255) | ID no calendário externo      |
| `calendar_provider` | VARCHAR(50)  | Provedor (google/outlook/etc) |
| `user_id`           | UUID         | FK - Usuário responsável      |
| `created_at`        | TIMESTAMPTZ  | Data de criação               |
| `updated_at`        | TIMESTAMPTZ  | Última atualização            |

**Indexes:**

- `idx_calendar_events_org_id` - Busca por organização
- `idx_calendar_events_lead_id` - Eventos por lead
- `idx_calendar_events_user_id` - Eventos por usuário

---

### **`lead_activities`** - Log de atividades

**Propósito:** Auditoria completa de mudanças nos leads

| Campo             | Tipo         | Descrição                      |
| ----------------- | ------------ | ------------------------------ |
| `id`              | UUID         | PK - Identificador único       |
| `organization_id` | UUID         | FK - Isolamento multi-tenant   |
| `lead_id`         | UUID         | FK - Lead modificado           |
| `activity_type`   | VARCHAR(100) | Tipo de atividade              |
| `description`     | TEXT         | Descrição da mudança           |
| `old_value`       | TEXT         | Valor anterior                 |
| `new_value`       | TEXT         | Novo valor                     |
| `user_id`         | UUID         | FK - Usuário que fez a mudança |
| `created_at`      | TIMESTAMPTZ  | Data da atividade              |

**Indexes:**

- `idx_lead_activities_org_id` - Atividades por organização
- `idx_lead_activities_lead_id` - Histórico por lead
- `idx_lead_activities_type` - Relatórios por tipo de atividade

---

## **🔗 RELACIONAMENTOS PRINCIPAIS**

### **Hierarquia Multi-Tenant:**

```
organizations (1) ←→ (N) organization_members (N) ←→ (1) users
organizations (1) ←→ (N) leads
organizations (1) ←→ (N) communications
organizations (1) ←→ (1) organization_subscriptions
```

### **Pipeline CRM:**

```
leads (1) ←→ (N) communications
leads (1) ←→ (N) lead_activities
leads (1) ←→ (N) ai_summaries
leads (1) ←→ (N) calendar_events
```

### **Sistema de Auth:**

```
users (1) ←→ (N) user_two_factor (N) ←→ (1) organizations
users (1) ←→ (N) user_preferences (N) ←→ (1) organizations
users (1) ←→ (N) user_sessions
```

---

## **⚡ PERFORMANCE & INDEXES**

### **Estratégia de Indexação:**

- **Multi-tenancy First:** Todos os indexes começam com `organization_id`
- **Pipeline Optimized:** Indexes específicos para consultas do Kanban
- **Search Friendly:** Indexes compostos para busca de leads
- **Temporal Queries:** Indexes em campos de data para relatórios

### **Indexes Críticos:**

- `idx_leads_org_stage_updated` - Performance do pipeline Kanban
- `idx_communications_lead_id` - Timeline de interações
- `idx_organization_members_role` - Controle de acesso
- `idx_user_sessions_expires_at` - Limpeza automática

---

## **🛡️ SEGURANÇA & COMPLIANCE**

### **Multi-tenancy Security:**

- Isolamento obrigatório por `organization_id`
- Middleware de validação em todas as queries
- Indexes otimizados para filtragem organizacional

### **Autenticação:**

- Sistema 2FA organization-scoped
- OAuth Google integrado
- Session management com refresh tokens
- Password reset com tokens temporários

### **Auditoria:**

- Log completo em `lead_activities`
- Tracking de uso em `api_keys`
- Monitoramento de webhooks
- Versionamento de schema e seeds

---

**🎯 Este schema representa um CRM completo e robusto, com 20 tabelas interconectadas que suportam desde autenticação até análise por IA, mantendo isolamento multi-tenant rigoroso em todas as operações.**
