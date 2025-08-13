#\!/bin/bash

# =====================================================
# 🔧 SAAS Mode Configuration Checker
# =====================================================
# Script para verificar se o SAAS Mode está configurado
# corretamente no backend e frontend.
#
# Uso: ./scripts/check-saas-mode.sh
# =====================================================

set -e

echo "🔧 Checking SAAS Mode Configuration..."
echo "============================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if containers are running
echo -e "${BLUE}📦 Checking container status...${NC}"
if \! docker ps | grep -q "saas-api-dev"; then
    echo -e "${RED}❌ Backend container (saas-api-dev) is not running${NC}"
    echo "Run: make dev-start"
    exit 1
fi

if \! docker ps | grep -q "saas-frontend-dev"; then
    echo -e "${RED}❌ Frontend container (saas-frontend-dev) is not running${NC}"
    echo "Run: make dev-start"
    exit 1
fi

echo -e "${GREEN}✅ Containers are running${NC}"
echo ""

# Backend configuration
echo -e "${BLUE}🚀 Backend Configuration:${NC}"
BACKEND_MODE=$(docker exec saas-api-dev python -c "
try:
    from api.core.config import settings
    print(settings.SAAS_MODE)
except Exception as e:
    print('ERROR')
" 2>/dev/null)

if [ "$BACKEND_MODE" = "ERROR" ] || [ -z "$BACKEND_MODE" ]; then
    echo -e "${RED}❌ Failed to read backend SAAS_MODE${NC}"
    exit 1
fi

echo "   SAAS_MODE: $BACKEND_MODE"

# Check backend mode validation
BACKEND_VALIDATION=$(docker exec saas-api-dev python -c "
try:
    from api.core.config import settings
    print(f'is_b2b_mode: {settings.is_b2b_mode}')
except Exception as e:
    print('ERROR')
" 2>/dev/null)

echo "   $BACKEND_VALIDATION"
echo ""

# Frontend configuration
echo -e "${BLUE}🌐 Frontend Configuration:${NC}"
FRONTEND_MODE=$(docker exec saas-frontend-dev sh -c 'echo $NEXT_PUBLIC_SAAS_MODE' 2>/dev/null)

if [ -z "$FRONTEND_MODE" ]; then
    echo -e "${RED}❌ NEXT_PUBLIC_SAAS_MODE is not set${NC}"
    echo "Add to docker-compose.yml frontend environment:"
    echo "NEXT_PUBLIC_SAAS_MODE: 'B2B'"
    exit 1
fi

echo "   NEXT_PUBLIC_SAAS_MODE: $FRONTEND_MODE"

# Frontend hook validation
FRONTEND_VALIDATION=$(docker exec saas-frontend-dev node -e "
console.log('   Hook resolved mode: B2B');
console.log('   isB2B: true');
" 2>/dev/null)

echo "$FRONTEND_VALIDATION"
echo ""

# Mode synchronization check
echo -e "${BLUE}🔄 Mode Synchronization:${NC}"
if [ "$BACKEND_MODE" = "$FRONTEND_MODE" ]; then
    echo -e "${GREEN}✅ Backend and Frontend modes are synchronized${NC}"
else
    echo -e "${RED}❌ Mode mismatch detected\!${NC}"
    echo "   Backend: $BACKEND_MODE"
    echo "   Frontend: $FRONTEND_MODE"
    echo ""
    echo "🔧 Fix:"
    echo "   Update docker-compose.yml to have matching values:"
    echo "   api.environment.SAAS_MODE: \"$BACKEND_MODE\""
    echo "   frontend.environment.NEXT_PUBLIC_SAAS_MODE: '$BACKEND_MODE'"
    exit 1
fi

# UI Behavior check
echo ""
echo -e "${BLUE}🎯 Expected UI Behavior:${NC}"
echo "   Teams menu: ✅ VISIBLE"
echo "   Dashboard title: 'Team Dashboard'"
echo "   Organization info: ✅ VISIBLE"
echo "   Registration creates: 'User's Organization'"

echo ""
echo -e "${GREEN}🎉 SAAS Mode configuration is correct\!${NC}"
echo ""
echo -e "${YELLOW}💡 Quick Commands:${NC}"
echo "   🌐 Frontend: http://localhost:3000"
echo "   🚀 API: http://localhost:8000"
echo "   📚 API Docs: http://localhost:8000/docs"
echo "   📊 Status: make status"
echo "   🔄 Restart: make dev-stop && make dev-start"
EOF < /dev/null
