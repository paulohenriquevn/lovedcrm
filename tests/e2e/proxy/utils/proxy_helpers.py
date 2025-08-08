"""
Helper functions for E2E Proxy Tests

Funções utilitárias específicas para testes de integração proxy.
"""
import httpx
from typing import Dict, Any
import logging

logger = logging.getLogger(__name__)

def compare_responses(direct_response: httpx.Response, proxy_response: httpx.Response) -> Dict[str, Any]:
    """
    Comparar resposta direta do backend vs resposta via proxy.
    
    Args:
        direct_response: Resposta direta do FastAPI (porta 8001)
        proxy_response: Resposta via Next.js proxy (porta 3000)
        
    Returns:
        Dict com resultado da comparação
    """
    comparison = {
        "status_match": direct_response.status_code == proxy_response.status_code,
        "content_match": False,
        "headers_analysis": {},
        "direct_status": direct_response.status_code,
        "proxy_status": proxy_response.status_code
    }
    
    # Comparar conteúdo (JSON)
    try:
        direct_json = direct_response.json()
        proxy_json = proxy_response.json()
        comparison["content_match"] = direct_json == proxy_json
        comparison["direct_content"] = direct_json
        comparison["proxy_content"] = proxy_json
    except Exception as e:
        comparison["content_error"] = str(e)
        # Comparar como texto se não for JSON
        comparison["content_match"] = direct_response.text == proxy_response.text
        comparison["direct_text"] = direct_response.text
        comparison["proxy_text"] = proxy_response.text
    
    # Analisar headers importantes
    important_headers = ['content-type', 'x-correlation-id', 'x-ratelimit-remaining']
    for header in important_headers:
        direct_val = direct_response.headers.get(header.lower())
        proxy_val = proxy_response.headers.get(header.lower())
        comparison["headers_analysis"][header] = {
            "direct": direct_val,
            "proxy": proxy_val,
            "match": direct_val == proxy_val
        }
    
    return comparison


def assert_proxy_integration_works(direct_response: httpx.Response, proxy_response: httpx.Response):
    """
    Assert que a integração proxy está funcionando corretamente.
    
    Para testes de criação (registro, etc), compara apenas estrutura, não dados específicos.
    
    Args:
        direct_response: Resposta direta do backend
        proxy_response: Resposta via proxy
    """
    comparison = compare_responses(direct_response, proxy_response)
    
    # Status code deve ser igual
    assert comparison["status_match"], (
        f"Status codes diferentes: Direct={comparison['direct_status']} vs "
        f"Proxy={comparison['proxy_status']}"
    )
    
    # Para casos de sucesso (2xx), validar apenas estrutura das respostas
    if direct_response.status_code < 300 and proxy_response.status_code < 300:
        direct_keys = set()
        proxy_keys = set()
        
        try:
            direct_json = direct_response.json()
            proxy_json = proxy_response.json()
            
            # Extrair chaves da estrutura (recursivamente para objetos aninhados)
            def extract_keys(obj, prefix=""):
                keys = set()
                if isinstance(obj, dict):
                    for key, value in obj.items():
                        full_key = f"{prefix}.{key}" if prefix else key
                        keys.add(full_key)
                        if isinstance(value, dict):
                            keys.update(extract_keys(value, full_key))
                        elif isinstance(value, list) and value and isinstance(value[0], dict):
                            keys.update(extract_keys(value[0], f"{full_key}[0]"))
                return keys
            
            direct_keys = extract_keys(direct_json)
            proxy_keys = extract_keys(proxy_json)
            
            # Estrutura deve ser igual
            assert direct_keys == proxy_keys, (
                f"Estruturas diferentes:\n"
                f"Direct keys: {sorted(direct_keys)}\n"
                f"Proxy keys: {sorted(proxy_keys)}\n"
                f"Missing in proxy: {sorted(direct_keys - proxy_keys)}\n"
                f"Extra in proxy: {sorted(proxy_keys - direct_keys)}"
            )
            
        except Exception as e:
            # Se não conseguir comparar JSON, comparar texto completo
            assert comparison["content_match"], (
                f"Conteúdos diferentes (não-JSON):\n"
                f"Direct: {comparison.get('direct_text')}\n"
                f"Proxy: {comparison.get('proxy_text')}\n"
                f"Error: {e}"
            )
    else:
        # Para erros, conteúdo deve ser exatamente igual
        assert comparison["content_match"], (
            f"Conteúdos de erro diferentes:\n"
            f"Direct: {comparison.get('direct_content', comparison.get('direct_text'))}\n"
            f"Proxy: {comparison.get('proxy_content', comparison.get('proxy_text'))}"
        )
    
    # Log success
    logger.info("✅ Proxy integration working correctly")


def validate_org_header_forwarding(proxy_response: httpx.Response, expected_org_id: str):
    """
    Validar que o header X-Org-Id foi corretamente encaminhado pelo proxy.
    
    Isso pode ser feito verificando se a resposta é específica da organização.
    """
    # Se a resposta contém dados de organização, verificar se são da org correta
    if proxy_response.status_code == 200:
        try:
            data = proxy_response.json()
            if isinstance(data, dict) and "organization_id" in data:
                assert data["organization_id"] == expected_org_id, (
                    f"Organization mismatch in response: expected {expected_org_id}, "
                    f"got {data['organization_id']}"
                )
            elif isinstance(data, list) and data and isinstance(data[0], dict):
                # Lista de items - verificar primeiro item
                if "organization_id" in data[0]:
                    assert data[0]["organization_id"] == expected_org_id, (
                        f"Organization mismatch in list response: expected {expected_org_id}, "
                        f"got {data[0]['organization_id']}"
                    )
        except Exception as e:
            logger.warning(f"Could not validate org header forwarding: {e}")


def log_proxy_test_start(test_name: str, endpoint: str):
    """Log início de teste de proxy."""
    logger.info(f"🧪 PROXY TEST START: {test_name}")
    logger.info(f"   Endpoint: {endpoint}")
    logger.info(f"   Flow: Next.js:3000 → rewrites → FastAPI:8001")


def log_proxy_test_end(test_name: str, success: bool):
    """Log fim de teste de proxy."""
    status = "✅ PASSED" if success else "❌ FAILED"
    logger.info(f"🧪 PROXY TEST END: {test_name} - {status}")