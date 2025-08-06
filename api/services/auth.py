"""🔐 Auth Service - Alias para compatibilidade com testes.

Este módulo mantém compatibilidade com testes que importam de 'api.services.auth'
redirecionando para o SimpleAuthService.
"""

# Import the actual implementation
from .auth_simple import SimpleAuthService

# Create aliases for backward compatibility
AuthService = SimpleAuthService

# Export what tests expect
__all__ = ["AuthService", "SimpleAuthService"]
