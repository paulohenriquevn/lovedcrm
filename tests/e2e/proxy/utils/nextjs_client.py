"""
Next.js Client for E2E Proxy Tests

Cliente HTTP que faz requisições para o Next.js dev server (porta 3000)
que então usa os rewrites para redirecionar para o backend (porta 8001).
"""
import httpx
from typing import Dict, Any, Optional
import logging

logger = logging.getLogger(__name__)

class NextJSClient:
    """Cliente para fazer requisições via Next.js proxy."""
    
    def __init__(self, base_url: str = "http://localhost:3000"):
        self.base_url = base_url
        self.client = httpx.Client(
            base_url=base_url,
            timeout=30.0,
            follow_redirects=True
        )
    
    def _log_request(self, method: str, url: str, headers: Dict[str, str]):
        """Log da requisição para debug."""
        logger.info(f"🌐 PROXY REQUEST: {method} {self.base_url}{url}")
        if 'Authorization' in headers:
            logger.info(f"   Authorization: Bearer ***")
        if 'X-Org-Id' in headers:
            logger.info(f"   X-Org-Id: {headers['X-Org-Id']}")
    
    def _log_response(self, response: httpx.Response):
        """Log da resposta para debug."""
        logger.info(f"🌐 PROXY RESPONSE: {response.status_code}")
        
    def request(
        self,
        method: str,
        url: str,
        json: Optional[Dict[str, Any]] = None,
        headers: Optional[Dict[str, str]] = None,
        **kwargs
    ) -> httpx.Response:
        """Fazer requisição via proxy do Next.js."""
        headers = headers or {}
        
        # Garantir Content-Type para requests com body
        if json is not None and 'Content-Type' not in headers:
            headers['Content-Type'] = 'application/json'
        
        self._log_request(method, url, headers)
        
        response = self.client.request(
            method=method,
            url=url,
            json=json,
            headers=headers,
            **kwargs
        )
        
        self._log_response(response)
        return response
    
    def get(self, url: str, **kwargs) -> httpx.Response:
        """GET request via proxy."""
        return self.request("GET", url, **kwargs)
    
    def post(self, url: str, **kwargs) -> httpx.Response:
        """POST request via proxy."""
        return self.request("POST", url, **kwargs)
    
    def put(self, url: str, **kwargs) -> httpx.Response:
        """PUT request via proxy."""
        return self.request("PUT", url, **kwargs)
    
    def delete(self, url: str, **kwargs) -> httpx.Response:
        """DELETE request via proxy."""
        return self.request("DELETE", url, **kwargs)
    
    def patch(self, url: str, **kwargs) -> httpx.Response:
        """PATCH request via proxy."""
        return self.request("PATCH", url, **kwargs)
    
    def close(self):
        """Fechar cliente HTTP."""
        self.client.close()
        
    def __enter__(self):
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        self.close()


def create_authenticated_headers(access_token: str, org_id: str) -> Dict[str, str]:
    """Criar headers para requisições autenticadas via proxy."""
    return {
        'Authorization': f'Bearer {access_token}',
        'X-Org-Id': org_id,
        'Content-Type': 'application/json'
    }