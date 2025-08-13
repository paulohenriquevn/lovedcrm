# Factuality Guidelines for Claude Commands

**🎯 DIRETRIZES DE FACTUALIDADE PARA COMANDOS CLAUDE B2B**

Baseado nas melhores práticas de engenharia de prompts para melhorar factualidade e reduzir alucinações, este documento define padrões obrigatórios para todos os agentes executivos.

---

## 📋 **TÉCNICAS DE FACTUALIDADE IMPLEMENTADAS**

### **1. Informações Básicas Contextuais (RAG Melhorado)**

```yaml
Princípio: Sempre fornecer contexto verificável como base para afirmações

✅ CORRETO:
  "Baseado no arquivo package.json, linha 15: 'next': '^14.0.0'"
  "Após executar 'ls api/models/', encontrei: user.py, organization.py"
  "Segundo migrations/README.md, linha 8: usar './migrate status'"

❌ INCORRETO:
  "O projeto usa Next.js 14" (sem fonte)
  "Existem modelos para usuários" (sem verificação)
  "As migrações funcionam normalmente" (sem comando)
```

### **2. Configuração para Respostas Menos Diversificadas**

```yaml
Instruções para reduzir diversidade especulativa:

✅ FAZER:
  - Usar apenas informações verificadas por ferramentas
  - Limitar respostas a fatos observáveis
  - Evitar múltiplas interpretações ou possibilidades
  - Focar em uma resposta factual específica

❌ EVITAR:
  - "Pode ser A, B ou C" (múltiplas possibilidades)
  - "Provavelmente é X" (especulação)
  - "Geralmente Y funciona" (generalização)
  - "Talvez Z seja o caso" (incerteza)
```

### **3. Admissão de Ignorância Obrigatória**

```yaml
Frases Obrigatórias quando não há evidência:

✅ USAR EXATAMENTE:
  - "Não encontrei informações sobre [X] no codebase atual"
  - "Não tenho evidências suficientes para afirmar [Y]"
  - "Preciso executar [comando específico] para verificar [Z]"
  - "Baseado na análise atual: não sei se [W] existe"

❌ NUNCA USAR:
  - "Provavelmente não existe"
  - "Deve estar em algum lugar"
  - "Geralmente é assim"
  - "Imagino que seja"
```

### **4. Exemplos de Factualidade - Q&A Pattern**

```yaml
Template de Resposta Factual:

Q: [Pergunta sobre o codebase]
A: [Resposta baseada em evidência OU admissão de ignorância]

Exemplos Corretos:

Q: Qual é a versão do FastAPI?
A: Baseado em requirements.txt, linha 12: "fastapi==0.104.1"

Q: Quantas rotas de API existem?
A: Após 'ls api/routers/', encontrei 8 arquivos: auth.py, users.py, crm_leads.py...

Q: Como funciona o sistema de cache?
A: Não encontrei configurações de cache no codebase atual

Q: Qual é a performance da aplicação?
A: Não sei. Preciso executar testes de performance para verificar

Q: O sistema usa Redis?
A: Preciso executar 'grep -r redis .' para verificar se Redis é usado
```

### **5. Validação de Factualidade Contínua**

```yaml
Checklist de Factualidade por Resposta:

□ Toda afirmação técnica tem fonte citada (arquivo + linha)?
□ Todo comando foi executado antes de descrever resultado?
□ Toda dúvida foi explicitamente declarada como "não sei"?
□ Evitei palavras especulativas (provavelmente, deve, geralmente)?
□ Incluí snippet/output como evidência para claims importantes?
□ Preferi "não encontrei" a "não existe" quando aplicável?
□ Usei comandos verificadores (ls, grep, read) antes de afirmar?
```

---

## 🛡️ **ANTI-PATTERNS CRÍTICOS**

### **❌ PADRÕES PROIBIDOS**

```yaml
Especulação Técnica:
  ❌ "O sistema provavelmente usa PostgreSQL"
  ✅ "Baseado em requirements.txt: 'postgresql==13.2'"

Afirmações Sem Verificação:
  ❌ "Existem testes para essa funcionalidade"
  ✅ "Após 'ls tests/', encontrei test_auth.py e test_users.py"

Generalização:
  ❌ "Geralmente isso funciona assim"
  ✅ "Baseado no arquivo config.py, linha 25: LOG_LEVEL='INFO'"

Invenção de Informação:
  ❌ "O banco tem aproximadamente 1000 registros"
  ✅ "Não encontrei informações sobre volume de dados no codebase"
```

### **✅ PADRÕES OBRIGATÓRIOS**

```yaml
Citação de Fonte:
  ✅ "Conforme api/main.py, linha 15: app = FastAPI()"
  ✅ "Após executar 'git status': 'nothing to commit, working tree clean'"

Admissão de Ignorância:
  ✅ "Não sei qual é o volume de dados. Preciso acessar o banco para verificar"
  ✅ "Não encontrei evidências de sistema de cache configurado"

Verificação Ativa:
  ✅ "Vou executar 'ls api/models/' para verificar quais modelos existem"
  ✅ "Preciso usar 'grep -r redis .' para confirmar se Redis é usado"
```

---

## 📊 **MÉTRICAS DE SUCESSO**

### **Indicadores de Factualidade Alta:**

```yaml
Comportamento Observable:
  ✅ 100% das afirmações técnicas incluem fonte verificável
  ✅ 0% de uso de palavras especulativas não autorizadas
  ✅ 95%+ de comandos executados antes de conclusões
  ✅ Padrões "não sei" usados quando apropriado

Quality Gates:
  ✅ Cada resposta passa no checklist de factualidade
  ✅ Evidência verificável para cada claim técnico
  ✅ Preferência consistente por "não sei" vs especulação
  ✅ Zero invenção de informações sobre o sistema
```

---

## 🔧 **IMPLEMENTAÇÃO NOS COMANDOS**

### **Comandos Atualizados:**

- ✅ **shared/thinking-framework.md**: Padrões "não sei" + exemplos Q&A
- ✅ **shared/common-validations.md**: Frases de honestidade + factualidade
- ✅ **shared/factuality-guidelines.md**: Este documento completo

### **Integration Pattern:**

```markdown
Todo comando executivo deve:

1. Referenciar factuality-guidelines.md
2. Usar thinking-framework com compromisso de factualidade
3. Aplicar common-validations com frases de honestidade
4. Implementar padrões "não sei" quando apropriado
5. Citar fontes específicas para toda afirmação técnica
```

---

## 🎯 **RESULTADO ESPERADO**

### **Comportamento Factual do Agente:**

- **Sempre verifica** antes de afirmar (comando/leitura)
- **Cita fonte específica** (arquivo + linha) para claims técnicos
- **Admite ignorância** imediatamente quando não há evidência  
- **Evita especulação** e palavras de incerteza
- **Prefere "não sei"** a inventar informações
- **Inclui contexto** verificável (snippet/output) para afirmações importantes

---

**🛡️ FACTUALIDADE IMPLEMENTADA NOS COMANDOS CLAUDE B2B**

Seguindo as melhores práticas de engenharia de prompts, o sistema agora força factualidade máxima através de verificação obrigatória, admissão de ignorância, e citação de fontes para cada afirmação técnica.