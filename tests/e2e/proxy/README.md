# E2E Proxy Integration Tests

**Testes End-to-End para validar a integração completa Frontend → Next.js Proxy → Backend**

## Objetivo

Enquanto os testes `tests/e2e/api/` testam o backend diretamente, estes testes validam:

- **Next.js rewrites** funcionando corretamente
- **Services do frontend** funcionando com backend real
- **Headers X-Org-Id** passando pelo proxy
- **Integração completa** do fluxo de dados

## Arquitetura

```
Testes API (Existentes):
TestClient → FastAPI:8001 (direto)

Testes Proxy (Novos):
TestClient → Next.js:3000/api/* → Next.js rewrites → FastAPI:8001
```

## Estrutura

```
tests/e2e/proxy/
├── README.md                    # Este arquivo
├── conftest.py                  # Configuração para ambiente Next.js + Backend
├── test_proxy_auth.py           # Testes de auth via proxy
├── test_proxy_organizations.py  # Testes de organizations via proxy
├── test_proxy_users.py          # Testes de users via proxy
├── test_proxy_headers.py        # Testes específicos de headers
└── utils/
    ├── __init__.py
    ├── nextjs_client.py         # Cliente para chamar Next.js
    └── proxy_helpers.py         # Helpers específicos do proxy
```

## Comandos

```bash
# Executar todos os testes de proxy
make test-proxy

# Executar testes específicos
pytest tests/e2e/proxy/test_proxy_auth.py -v

# Comparar resultados proxy vs direct
make test-proxy-compare
```

## Diferenças dos Testes API

| Aspecto | Testes API | Testes Proxy |
|---------|------------|--------------|
| **Target** | `localhost:8001` | `localhost:3000/api/*` |
| **Valida** | Backend isolado | Integração completa |
| **Headers** | Direto ao FastAPI | Via Next.js rewrites |
| **Objetivo** | Funcionalidade | Integração real |

## Ambiente

- **Backend**: Usa mesmo ambiente de teste (porta 8001)
- **Frontend**: Next.js dev server (porta 3000)
- **Database**: Mesma base de dados de teste
- **Fixtures**: Reutiliza fixtures dos testes API