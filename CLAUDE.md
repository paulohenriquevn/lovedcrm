# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with this repository.

## Fundamental Rule

### A Regra Fundamental:

"Antes de iniciar uma nova task, SEMPRE pergunte: 'A task anterior está 100% implementada?'"

🚨 Como Funciona:

PASSO 1: Quando você me pedir para fazer algo novo
PASSO 2: Eu sempre perguntarei: "A task anterior está 100% implementada?"
PASSO 3: Se a resposta for NÃO → Paro e completo a anterior primeiro
PASSO 4: Se a resposta for SIM → Prossigo com a nova task

🛡️ Definição de "100% Implementada":

- ✅ Todos os botões funcionam (têm handlers)
- ✅ Todos os formulários submetem (têm validação + submit)
- ✅ Todas as modais abrem/fecham
- ✅ Todas as integrações funcionam de verdade (não mocks)
- ✅ Usuário consegue completar todos os fluxos

🎯 Resultado:

- NUNCA mais tasks esquecidas
- NUNCA mais acúmulo de funcionalidades incompletas
- SEMPRE validação completa antes de prosseguir