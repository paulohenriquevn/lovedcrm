# 🎨 SHADCN/UI COMPLIANCE - ATUALIZAÇÃO DOS AGENTES

## **STATUS: SISTEMA 100% COMPLIANCE ALCANÇADO**

### **✅ VALIDAÇÃO COMPLETA**
- **31 componentes shadcn/ui oficiais** em `/components/ui/`
- **Zero customizações CSS** em componentes shadcn
- **Build funcional** sem erros
- **Linting limpo** após correções
- **Estrutura organizada** - componentes customizados em `/components/common/`

---

## **🔄 ATUALIZAÇÕES NOS AGENTES**

### **1. design-tokens-agent.md**
✅ Atualizado com diretrizes de compliance
✅ Adicionada seção "100% SHADCN/UI COMPLIANCE"
✅ Especificadas restrições e permissões

### **2. ui-ux-designer.md**
✅ Adicionado status de compliance na seção de sistema atual
✅ Listados os 31 componentes disponíveis
✅ Definidas regras de uso

### **3. exec-story.md**
✅ Atualizada seção de projeto com status shadcn/ui
✅ Expandidas restrições de UI/UX com compliance rules
✅ Adicionadas diretrizes específicas de components

### **4. docs/project/07-design-tokens.md**
✅ Adicionada seção de compliance no topo
✅ Mantido conteúdo setorial existente
✅ Incluídas diretrizes de uso

---

## **📋 DIRETRIZES PARA TODOS OS AGENTES**

### **🔒 PROIBIÇÕES ABSOLUTAS**
❌ **NUNCA alterar arquivos em `/components/ui/`**
❌ **NUNCA adicionar CSS customizado em componentes shadcn**  
❌ **NUNCA usar classes `bg-*`, `text-*` customizadas em componentes shadcn**
❌ **NUNCA criar variações customizadas de componentes oficiais**

### **✅ PERMISSÕES**
✅ **Usar variants padrão**: `default`, `secondary`, `destructive`, `outline`, `ghost`, `link`
✅ **Alterar CSS custom properties em `globals.css`**
✅ **Criar componentes customizados em `/components/common/`**
✅ **Combinar componentes shadcn para criar layouts**

### **🎯 COMPONENTES DISPONÍVEIS (31 OFICIAIS)**

```typescript
// UI Components - 100% Shadcn/UI Official
alert-dialog, alert, avatar, badge, breadcrumb, button,
card, checkbox, command, dialog, dropdown-menu, form,
input, label, navigation-menu, popover, progress,
scroll-area, select, separator, sheet, sidebar,
skeleton, switch, table, tabs, textarea, toast,
toaster, tooltip, use-toast
```

### **📝 EXEMPLO DE USO CORRETO**

```typescript
// ✅ CORRETO - Usando variants padrão
<Button variant="default">Ação Principal</Button>
<Button variant="secondary">Ação Secundária</Button>
<Badge variant="destructive">Erro</Badge>

// ✅ CORRETO - Combinando componentes
<Card>
  <CardHeader>
    <CardTitle>Título</CardTitle>
  </CardHeader>
  <CardContent>
    <Table>
      <TableHeader>...</TableHeader>
    </Table>
  </CardContent>
</Card>

// ❌ INCORRETO - CSS customizado
<Button className="bg-green-600 hover:bg-green-700">❌</Button>

// ❌ INCORRETO - HTML raw quando há componente
<button className="px-4 py-2 bg-blue-600">❌</button>
```

---

## **🧪 VALIDAÇÃO CONTÍNUA**

### **Comandos de Verificação**
```bash
# Build deve passar
npm run build

# Linting deve estar limpo  
npm run lint

# TypeScript deve validar
npm run typecheck

# Estrutura deve estar correta
ls components/ui/     # Apenas shadcn oficiais
ls components/common/ # Componentes customizados
```

### **Checklist de Compliance**
- [ ] Componente existe em shadcn/ui? → Use o oficial
- [ ] Precisa customizar? → Crie em `/components/common/`
- [ ] Quer alterar cor? → Use variant ou CSS custom property
- [ ] Build passou? → ✅ Compliance mantida

---

## **📚 REFERÊNCIAS**

- **Documentação Shadcn/UI**: https://ui.shadcn.com/
- **Lista de Componentes**: https://ui.shadcn.com/docs/components
- **Design Tokens**: https://ui.shadcn.com/docs/theming
- **Variants**: Cada componente tem variants específicas documentadas

---

## **⚠️ RESPONSABILIDADE DOS AGENTES**

Todos os agentes devem:
1. **Verificar compliance** antes de sugerir alterações
2. **Usar apenas componentes oficiais** listados
3. **Respeitar variants padrão** sem customizações
4. **Manter build funcional** após mudanças
5. **Documentar escolhas** de componentes usados

**Esta atualização garante que todos os agentes mantenham o sistema 100% compliant com shadcn/ui.**