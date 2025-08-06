# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
e este projeto adere ao [Versionamento Semântico](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] - 2025-01-06

### Adicionado [STORY 1.1]

**Pipeline CRM Kanban Brasileiro**
- ✨ **Pipeline de vendas visual** com 5 estágios específicos para agências brasileiras: Lead → Contato → Proposta → Negociação → Fechado
- 🎯 **Interface Kanban interativa** para gerenciar leads com drag & drop entre estágios
- 📊 **Estatísticas do pipeline** mostrando contadores por estágio e taxa de conversão
- 🔍 **Busca de leads** por nome, email ou telefone
- 💰 **Valores estimados** em reais (BRL) com formatação brasileira
- 🏷️ **Sistema de tags** para categorizar leads
- 📱 **Interface responsiva** otimizada para desktop e mobile

**APIs CRM Completas**
- 🔗 **5 endpoints REST** para gerenciamento completo de leads:
  - Criar e listar leads com paginação
  - Buscar leads com filtros avançados
  - Estatísticas do pipeline em tempo real
  - CRUD completo de leads individuais
  - Movimentação entre estágios com histórico
- 🔒 **Isolamento organizacional** garantindo que cada agência vê apenas seus próprios dados
- ⚡ **Performance otimizada** com índices de banco específicos para multi-tenancy
- 📝 **Documentação API** completa no Swagger/OpenAPI

**Arquitetura e Segurança**
- 🛡️ **Multi-tenancy rigoroso** com validação de contexto organizacional em todas operações
- 🔐 **Autenticação obrigatória** via JWT tokens para todos endpoints CRM
- 🏗️ **Clean Architecture** com separação Repository → Service → Router
- 📊 **Logging estruturado** para auditoria e debugging
- ⚙️ **Configuração flexível** via variáveis de ambiente

### Detalhes Técnicos [STORY 1.1]

**Backend (FastAPI + SQLAlchemy)**
- Modelo `Lead` com pipeline stages como enum
- Repository pattern com filtros organizacionais automáticos
- Service layer com business logic e error handling
- Router com validação Pydantic e documentação OpenAPI
- Migrations SQL customizadas para performance

**Frontend (Next.js 14 + React)**
- Hook `useOrgContext` para contexto organizacional
- Service `crmLeadsService` extendendo BaseService com headers automáticos
- Componente `PipelineKanban` com estado local e sincronização API
- Updates otimistas com fallback em caso de erro
- Estados de loading, error e empty implementados

**Database (PostgreSQL)**
- Tabela `leads` com FK `organization_id` e check constraints
- Índices compostos para queries por organização + estágio
- Suporte a JSONB para tags e metadados flexíveis
- Triggers para updated_at automático

### Segurança [STORY 1.1]

- 🔒 **Validação organizacional obrigatória**: Todos endpoints verificam se usuário pertence à organização dos dados solicitados
- 🛡️ **Headers de contexto seguros**: X-Org-Id validado contra JWT token para prevenir data leakage
- 🔐 **Queries filtradas por padrão**: Impossível acessar dados de outras organizações via repository layer
- 📊 **Audit logging**: Todas operações CRM são logadas com contexto do usuário e organização
- ⚡ **Rate limiting**: Endpoints protegidos contra abuse via slowapi

---

## Como Ler Este Changelog

- **Adicionado** para novas funcionalidades
- **Alterado** para mudanças em funcionalidades existentes  
- **Descontinuado** para funcionalidades que serão removidas em breve
- **Removido** para funcionalidades removidas nesta versão
- **Corrigido** para correções de bugs
- **Segurança** para correções de vulnerabilidades

### Formato das Entradas

```
### Categoria [STORY X.Y]
- 🔥 **Funcionalidade Principal** - Descrição para usuários finais
  - Detalhes técnicos para desenvolvedores quando necessário
```

### Versionamento

- **MAJOR**: Mudanças incompatíveis na API
- **MINOR**: Novas funcionalidades mantendo compatibilidade
- **PATCH**: Correções de bugs mantendo compatibilidade

---

*Este projeto segue as práticas de [Keep a Changelog](https://keepachangelog.com/) e [Conventional Commits](https://www.conventionalcommits.org/)*