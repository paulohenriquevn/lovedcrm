"""
Configuração de fixtures para testes E2E de integração proxy.

Reutiliza o ambiente de teste do backend e adiciona Next.js dev server.
"""
import pytest
import httpx
import subprocess
import time
import os
import signal
import logging
from typing import Generator, Dict, Any

# Reutilizar fixtures do backend
from ..api.conftest import (
    authenticated_user,
    registered_user,
    clean_database,
    test_user_data,
    db_session,
    other_organization,
    api_client,  # Necessário para fixtures internas, mas não para testes
    assert_successful_response,
    assert_error_response,
    assert_valid_uuid
)

from .utils.nextjs_client import NextJSClient, create_authenticated_headers
from .utils.proxy_helpers import log_proxy_test_start, log_proxy_test_end

logger = logging.getLogger(__name__)

# Configuração
NEXTJS_TEST_URL = "http://localhost:3000"
NEXTJS_DEV_PORT = 3000
NEXTJS_STARTUP_TIMEOUT = 30  # segundos


@pytest.fixture(scope="session")
def nextjs_server():
    """
    Fixture que inicia o Next.js dev server para testes de proxy.
    
    Reutiliza o mesmo ambiente de backend dos testes API.
    """
    logger.info("🚀 Starting Next.js dev server for proxy tests...")
    
    # Verificar se Next.js já está rodando
    try:
        response = httpx.get(f"{NEXTJS_TEST_URL}/api/health", timeout=5)
        if response.status_code == 200:
            logger.info("✅ Next.js dev server already running")
            yield NEXTJS_TEST_URL
            return
    except httpx.RequestError:
        pass  # Server not running, will start it
    
    # Configurar ambiente para desenvolvimento com backend de teste
    env = os.environ.copy()
    env.update({
        "NODE_ENV": "development",
        "PORT": str(NEXTJS_DEV_PORT),
        # Usar o mesmo backend de teste que os testes API
        "NEXT_PUBLIC_API_URL": "http://localhost:8001",
        # Outras variáveis necessárias
        "NEXT_PUBLIC_SAAS_MODE": "B2B",
    })
    
    # Iniciar Next.js dev server
    process = None
    try:
        logger.info(f"Starting Next.js on port {NEXTJS_DEV_PORT}...")
        process = subprocess.Popen(
            ["npm", "run", "next-dev"],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            env=env,
            preexec_fn=os.setsid  # Para poder matar o grupo de processos
        )
        
        # Aguardar servidor estar pronto
        start_time = time.time()
        while time.time() - start_time < NEXTJS_STARTUP_TIMEOUT:
            try:
                # Tentar fazer uma requisição simples
                response = httpx.get(f"{NEXTJS_TEST_URL}/api/health", timeout=5)
                if response.status_code in [200, 404]:  # 404 também indica que o servidor está rodando
                    logger.info("✅ Next.js dev server is ready")
                    break
            except httpx.RequestError:
                time.sleep(1)
                continue
        else:
            # Timeout - mostrar logs para debug
            stdout, stderr = process.communicate(timeout=5)
            raise RuntimeError(
                f"Next.js dev server failed to start within {NEXTJS_STARTUP_TIMEOUT}s.\n"
                f"stdout: {stdout.decode()}\n"
                f"stderr: {stderr.decode()}"
            )
        
        yield NEXTJS_TEST_URL
        
    finally:
        # Cleanup: matar Next.js dev server
        if process:
            logger.info("🛑 Stopping Next.js dev server...")
            try:
                # Matar grupo de processos (para pegar subprocessos do Next.js)
                os.killpg(os.getpgid(process.pid), signal.SIGTERM)
                process.wait(timeout=10)
            except (ProcessLookupError, subprocess.TimeoutExpired):
                try:
                    os.killpg(os.getpgid(process.pid), signal.SIGKILL)
                except ProcessLookupError:
                    pass
            logger.info("✅ Next.js dev server stopped")


@pytest.fixture
def proxy_client(nextjs_server) -> Generator[NextJSClient, None, None]:
    """Cliente para fazer requisições via Next.js proxy."""
    with NextJSClient(base_url=nextjs_server) as client:
        yield client


@pytest.fixture
def proxy_authenticated_headers(authenticated_user) -> Dict[str, str]:
    """Headers para requisições autenticadas via proxy."""
    return create_authenticated_headers(
        access_token=authenticated_user["tokens"]["access_token"],
        org_id=authenticated_user["organization"]["id"]
    )


# Remover fixture proxy_admin_headers por enquanto - usar apenas authenticated_user


@pytest.fixture(autouse=True)
def log_proxy_test(request):
    """Log automático para todos os testes de proxy."""
    test_name = request.node.name
    log_proxy_test_start(test_name, "TBD")
    
    success = True
    try:
        yield
    except Exception:
        success = False
        raise
    finally:
        log_proxy_test_end(test_name, success)


# Re-exportar fixtures importantes do backend para facilitar uso
__all__ = [
    'nextjs_server',
    'proxy_client',
    'proxy_authenticated_headers',
    'authenticated_user',
    'registered_user',
    'other_organization',
    'assert_successful_response',
    'assert_error_response',
    'assert_valid_uuid',
    'NEXTJS_TEST_URL'
]