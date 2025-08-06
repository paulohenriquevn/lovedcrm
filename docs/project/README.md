# Project Agent Outputs

Esta pasta contém os outputs sequenciais dos agentes do sistema DevSolo Docs.

## **Workflow Sequencial**

Cada agente lê os outputs dos agentes anteriores e cria seu próprio output:

1. **01-vision.md** - AGENTE_01_VISIONARIO
   - Input: User prompt + template docs
   - Output: Vision statement híbrida B2B+B2C

2. **02-prd.md** - AGENTE_02_PRODUCT_MANAGER
   - Input: 01-vision.md
   - Output: Product Requirements Document

3. **03-tech.md** - AGENTE_03_TECH_ARCHITECT
   - Input: 01-vision.md + 02-prd.md
   - Output: Technical architecture

4. **04-database.md** - AGENTE_04_DATABASE_ARCHITECT
   - Input: 02-prd.md + 03-tech.md
   - Output: Database schema design

5. **05-apis.md** - AGENTE_05_API_ARCHITECT
   - Input: 03-tech.md + 04-database.md
   - Output: API endpoint specifications

6. **06-performance.md** - AGENTE_06_PERFORMANCE_OPTIMIZER
   - Input: 03-tech.md + 05-apis.md
   - Output: Performance optimization plan

7. **07-ux-interfaces.md** - AGENTE_07_UI_UX_DESIGNER
   - Input: 02-prd.md + 03-tech.md
   - Output: UX design and interfaces

8. **08-roadmap.md** - AGENTE_08_ROADMAP_STRATEGIST
   - Input: All previous outputs (01-07)
   - Output: Implementation roadmap

9. **10-documentation.md** - AGENTE_10_DOCUMENTATION_CURATOR
   - Input: All previous outputs (01-08)
   - Output: Consolidated documentation

10. **11-research.md** - AGENTE_11_RESEARCH_SPECIALIST
    - Input: Complex feature identified + relevant outputs
    - Output: Research and implementation guide

## **Custom Slash Commands**

Execute via Claude Code:

```bash
/project:agente-01-visionario "Seu problema/ideia aqui"
/project:agente-02-product-manager
/project:agente-03-tech-architect
# ... etc
```

## **Template Hybrid B2B+B2C**

Todos os agentes têm conhecimento da capacidade híbrida nativa do template:

- Personal organizations (B2C experience)
- Shared organizations (B2B experience)
- Same codebase serves both contexts
