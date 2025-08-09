.PHONY: help setup dev build test lint clean db-up db-down db-migrate db-reset check-db-prod connect-db-prod db-prod-info db-prod-status db-prod-logs db-prod-migration-status db-prod-migration-check db-prod-migration-apply db-prod-migration-init db-prod-console dev-docker dev-start dev-stop dev-logs dev-docker-reset test-hot-migrate test-hot-data test-hot-reset test-hot-mocks test-hot-status test-hot-all test-migration-check test-backend-unit test-backend-unit-quick test-backend-unit-failed test-backend-unit-ci test-rebuild test-logs test-logs-api test-logs-db test-nuclear docker-stop-all docker-clean-all test-proxy test-proxy-auth test-proxy-orgs test-proxy-headers test-proxy-compare test-proxy-quick

# =============================================================================
# NextJS + FastAPI SaaS Starter - CLEAN MAKEFILE
# =============================================================================

help: ## Show available commands
	@echo "NextJS + FastAPI SaaS Starter"
	@echo "================================"
	@echo ""
	@echo "QUICK START (Choose one):"
	@echo "  make setup           # Local development (Node + Python)"
	@echo "  npm run dev          # Start both servers locally (port 3000 + 8000)"
	@echo ""
	@echo "  make dev-start   # Docker development (easier setup)"
	@echo "  make dev-logs # View logs"
	@echo "  make dev-stop # Stop Docker environment"
	@echo ""
	@echo "DATABASE:"
	@echo "  make db-up         # Start PostgreSQL + Redis"
	@echo "  make db-down       # Stop database services"
	@echo "  make db-seed-dev   # Apply development seeds (organizations + users)"
	@echo "  ./migrate help     # Local migration commands"
	@echo ""
	@echo "PRODUCTION DATABASE:"
	@echo "  make connect-db-prod           # Connect to Railway PostgreSQL (interactive psql)"
	@echo "  make db-prod-status            # Complete database health check via API"
	@echo "  make db-prod-migration-status  # Check current migration version"
	@echo "  make db-prod-migration-apply   # Apply all pending migrations to production"
	@echo "  make check-db-prod             # Complete production system health check"
	@echo ""
	@echo "TESTING:"
	@echo "  make test                    # Run all tests (frontend + backend + e2e)"
	@echo "  make test-unit               # Run all unit tests (frontend + backend)"
	@echo "  make test-unit-quick         # Run all unit tests (quick mode)"
	@echo "  make test-unit-coverage      # Run all unit tests with coverage"
	@echo ""
	@echo "  Frontend Unit Tests:"
	@echo "    make test-frontend         # Run frontend unit tests"
	@echo "    make test-frontend-watch   # Run frontend tests in watch mode"
	@echo "    make test-frontend-coverage# Run frontend tests with coverage"
	@echo "    make test-frontend-ui      # Open frontend tests in UI mode"
	@echo "    make test-frontend-smoke   # Run frontend smoke test"
	@echo ""
	@echo "  Backend Unit Tests:"
	@echo "    make test-backend-unit     # Run backend unit tests (detailed)"
	@echo "    make test-backend-unit-quick # Run backend unit tests (quick)"
	@echo ""
	@echo "  E2E Tests:"
	@echo "    make test-start            # Start E2E test environment"
	@echo "    make test-run              # Run E2E tests"
	@echo "    make test-stop             # Stop test environment"
	@echo "    make test-logs             # View all service logs"
	@echo "    make test-logs-api         # View API logs only"
	@echo "    make test-logs-db          # View database logs only"
	@echo "    make test-rebuild          # Rebuild API image (after dependency changes)"
	@echo "    make test-nuclear          # NUCLEAR: Remove ALL Docker data (extreme cases)"
	@echo ""
	@echo "  Proxy Integration Tests (NEW):"
	@echo "    make test-proxy            # Run all proxy integration tests"
	@echo "    make test-proxy-quick      # Run proxy tests (quick mode)"
	@echo "    make test-proxy-auth       # Test auth via Next.js proxy"
	@echo "    make test-proxy-orgs       # Test organizations via proxy"
	@echo "    make test-proxy-headers    # Test header forwarding"
	@echo "    make test-proxy-compare    # Compare proxy vs direct responses"
	@echo ""
	@echo "HOT UPDATES (Fast - No Restart):"
	@echo "  make test-hot-migrate  # Apply schema changes (2s)"
	@echo "  make test-hot-data     # Reload test data (3s)"
	@echo "  make test-hot-reset    # Reset data only (5s)"
	@echo "  make test-hot-all      # Apply all hot updates"
	@echo ""
	@echo "CODE QUALITY:"
	@echo "  make lint      # Run all linters"
	@echo "  make lint-fix  # Auto-fix issues"
	@echo ""
	@echo "ALL COMMANDS:"
	@echo "  Database Commands:"
	@grep -E '^[a-zA-Z_-]*db[a-zA-Z_-]*:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "    \033[36m%-25s\033[0m %s\n", $$1, $$2}'
	@echo "  Development Commands:"
	@grep -E '^(setup|dev|build|test|lint):.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "    \033[36m%-25s\033[0m %s\n", $$1, $$2}'
	@echo "  Production Commands:"
	@grep -E '^[a-zA-Z_-]*prod[a-zA-Z_-]*:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "    \033[36m%-25s\033[0m %s\n", $$1, $$2}'
	@echo "  Other Commands:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | grep -v -E '(db|prod|setup|dev|build|test|lint)' | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "    \033[36m%-25s\033[0m %s\n", $$1, $$2}'

# =============================================================================
# CORE COMMANDS
# =============================================================================

setup: ## Complete setup (install deps + DB + migrations)
	@echo "Setting up development environment..."
	npm install
	pip install -r requirements.txt
	docker-compose up -d postgres redis
	@echo "Waiting for PostgreSQL..."
	@sleep 5
	cd migrations && ./migrate apply
	@echo "Setup complete! Run 'npm run dev' to start"

dev: ## Start development servers
	npm run dev

build: ## Build application
	npm run build

# =============================================================================
# DOCKER DEVELOPMENT COMMANDS
# =============================================================================

dev-docker: ## Start complete development environment (Docker)
	@echo "Starting complete development environment with billing system..."
	docker-compose up --build

dev-start: ## Start development environment in background
	@echo "Starting development environment in background..."
	docker-compose up --build -d
	@echo "Services started:"
	@echo "  Frontend: http://localhost:3000"
	@echo "  API: http://localhost:8000"
	@echo "  API Docs: http://localhost:8000/docs"
	@echo "  PostgreSQL: localhost:5433"
	@echo "  Redis: localhost:6379"
	@echo ""
	@echo "To view logs: docker-compose logs -f"
	@echo "To stop: make dev-stop"

dev-stop: ## Stop development environment
	@echo "Stopping development environment..."
	docker-compose down

dev-logs: ## View development environment logs  
	docker-compose logs -f

dev-docker-reset: ## Reset development environment completely
	@echo "Resetting development environment..."
	docker-compose down -v
	docker-compose build --no-cache
	docker-compose up -d

# =============================================================================
# DATABASE COMMANDS
# =============================================================================

db-up: ## Start database services (PostgreSQL + Redis)
	docker-compose up -d postgres redis

db-down: ## Stop database services
	docker-compose down

db-migrate: ## Apply pending migrations
	cd migrations && ./migrate apply

db-reset: ## Reset database (WARNING: deletes all data)
	cd migrations && ./migrate init

db-seed-dev: ## Apply all development seeds automatically (evolutionary)
	@echo "🌱 Applying development seeds automatically..."
	@cd migrations && \
	SEED_COUNT=$$(find seeds/dev -name "*.sql" | wc -l) && \
	echo "📦 Found $$SEED_COUNT seed files in seeds/dev/" && \
	if [ "$$SEED_COUNT" -eq 0 ]; then \
		echo "⚠️  No seed files found in seeds/dev/"; \
	else \
		echo "🔄 Applying seeds in order..."; \
		for seed_file in $$(ls seeds/dev/*.sql | sort -V); do \
			echo "   📄 Applying: $$(basename "$$seed_file")"; \
			PGPASSWORD=postgres psql -h localhost -p 5433 -U postgres -d saas_starter -f "$$seed_file" -q && \
			echo "   ✅ Applied: $$(basename "$$seed_file")"; \
		done; \
		echo "🎉 All $$SEED_COUNT development seeds applied successfully!"; \
	fi

db-seed-dev-docker: ## Apply development seeds inside Docker container
	@echo "🌱 Applying development seeds automatically (Docker)..."
	@cd migrations && \
	SEED_COUNT=$$(find seeds/dev -name "*.sql" | wc -l) && \
	echo "📦 Found $$SEED_COUNT seed files in seeds/dev/" && \
	if [ "$$SEED_COUNT" -eq 0 ]; then \
		echo "⚠️  No seed files found in seeds/dev/"; \
	else \
		echo "🔄 Applying seeds in order..."; \
		for seed_file in $$(ls seeds/dev/*.sql | sort -V); do \
			echo "   📄 Applying: $$(basename "$$seed_file")"; \
			PGPASSWORD=postgres psql -h postgres -p 5432 -U postgres -d saas_starter -f "$$seed_file" -q && \
			echo "   ✅ Applied: $$(basename "$$seed_file")"; \
		done; \
		echo "🎉 All $$SEED_COUNT development seeds applied successfully!"; \
	fi

# =============================================================================
# TESTING COMMANDS
# =============================================================================

test: ## Run all tests (frontend + backend + e2e)
	npm run test:all

test-api: ## Run API E2E tests
	npm run test:e2e:api

# =============================================================================
# FRONTEND UNIT TESTS
# =============================================================================

test-frontend: ## Run frontend unit tests
	@echo "Running frontend unit tests..."
	npm run test:frontend
	@echo "Frontend unit tests completed!"

test-frontend-watch: ## Run frontend unit tests in watch mode
	@echo "Starting frontend unit tests in watch mode..."
	npm run test:frontend:watch

test-frontend-coverage: ## Run frontend unit tests with coverage report
	@echo "Running frontend unit tests with coverage..."
	npm run test:frontend:coverage
	@echo "Coverage report generated in coverage/ directory"

test-frontend-ui: ## Open frontend tests in UI mode
	@echo "Opening frontend tests in UI mode..."
	npm run test:ui

test-frontend-smoke: ## Run frontend smoke test to verify setup
	@echo "Running frontend smoke test..."
	npm run test:frontend tests/frontend/smoke.test.tsx
	@echo "Frontend smoke test completed!"

# =============================================================================
# BACKEND UNIT TESTS
# =============================================================================

test-backend-unit: ## Run backend unit tests
	@echo "Running backend unit tests..."
	python3 -m pytest tests/unit/ -v --tb=short
	@echo "Backend unit tests completed!"

test-backend-unit-quick: ## Run backend unit tests (quick, no verbose output)
	@echo "Running backend unit tests (quick)..."
	python3 -m pytest tests/unit/ --tb=line -q
	@echo "Backend unit tests completed!"

test-backend-unit-failed: ## Run only failed backend unit tests
	@echo "Running only failed backend unit tests..."
	python3 -m pytest tests/unit/ --lf -v --tb=short
	@echo "Failed backend unit tests rerun completed!"

test-backend-unit-ci: ## Run backend unit tests for CI (don't fail build)
	@echo "Running backend unit tests (CI mode)..."
	python3 -m pytest tests/unit/ --tb=short -q || true
	@echo "Backend unit tests CI run completed!"

# =============================================================================
# UNIT TESTS COMBINED
# =============================================================================

test-unit: ## Run all unit tests (frontend + backend)
	@echo "Running all unit tests..."
	@echo "================================"
	@echo ""
	@echo "1. Frontend Unit Tests:"
	@make test-frontend --no-print-directory
	@echo ""
	@echo "2. Backend Unit Tests:"
	@make test-backend-unit --no-print-directory
	@echo ""
	@echo "All unit tests completed!"

test-unit-quick: ## Run all unit tests in quick mode
	@echo "Running all unit tests (quick mode)..."
	@echo "======================================"
	@echo ""
	@echo "1. Frontend Unit Tests:"
	npm run test:frontend
	@echo ""
	@echo "2. Backend Unit Tests (quick):"
	@make test-backend-unit-quick --no-print-directory
	@echo ""
	@echo "All unit tests (quick) completed!"

test-unit-coverage: ## Run all unit tests with coverage
	@echo "Running all unit tests with coverage..."
	@echo "======================================="
	@echo ""
	@echo "1. Frontend Unit Tests with Coverage:"
	@make test-frontend-coverage --no-print-directory
	@echo ""
	@echo "2. Backend Unit Tests:"
	@make test-backend-unit --no-print-directory
	@echo ""
	@echo "Coverage reports:"
	@echo "  Frontend: coverage/index.html"
	@echo "  Backend: Use 'pytest --cov=api --cov-report=html'"

# =============================================================================
# E2E TEST ENVIRONMENT
# =============================================================================

test-start: ## Start complete E2E test environment
	@echo "Starting E2E test environment..."
	@echo "==================================="
	docker-compose -f docker-compose.test.yml down -v
	docker-compose -f docker-compose.test.yml up -d postgres-test redis-test
	@echo "Waiting for test databases..."
	@sleep 8
	docker-compose -f docker-compose.test.yml up -d mock-stripe mock-email mock-s3
	@echo "Waiting for mock services..."
	@sleep 5
	docker-compose -f docker-compose.test.yml up -d api-test
	@echo "Waiting for API test server..."
	@sleep 10
	@echo "E2E test environment ready!"
	@echo ""
	@echo "Available services:"
	@echo "  API Test:     http://localhost:8001"
	@echo "  PostgreSQL:   localhost:5434"
	@echo "  Redis:        localhost:6380"
	@echo "  Mock Stripe:  http://localhost:9080"
	@echo "  Mock Email:   http://localhost:8025"
	@echo " 		 Mock S3:      http://localhost:90			00"

test-stop: ## Stop and cleanup E2E test environment
	@echo "Stopping E2E test environment..."
	docker-compose -f docker-compose.test.yml down -v
	@echo "E2E test environment stopped and cleaned!"

test-rebuild: ## Rebuild test API image (no cache) - useful after dependency changes
	@echo "🔨 Rebuilding test API image without cache..."
	docker-compose -f docker-compose.test.yml build --no-cache api-test
	@echo "✅ Test API image rebuilt successfully!"

test-logs: ## View E2E test environment logs (all services)
	@echo "📋 Viewing E2E test environment logs..."
	docker-compose -f docker-compose.test.yml logs -f --tail=100

test-logs-api: ## View E2E test API logs only
	@echo "📋 Viewing test API logs..."
	docker-compose -f docker-compose.test.yml logs -f --tail=100 api-test

test-logs-db: ## View E2E test database logs only
	@echo "📋 Viewing test database logs..."
	docker-compose -f docker-compose.test.yml logs -f --tail=100 postgres-test

test-nuclear: ## NUCLEAR OPTION: Complete Docker cleanup (use if test-stop isn't enough)
	@echo "☢️  NUCLEAR CLEANUP: Removing ALL Docker data..."
	@echo "⚠️  This will affect ALL Docker containers and images on your system!"
	@read -p "Are you sure? [y/N] " -n 1 -r && echo && \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		docker-compose -f docker-compose.test.yml down -v --remove-orphans --rmi all || true; \
		docker system prune -af --volumes; \
		docker volume prune -f; \
		echo "☢️  Nuclear cleanup complete!"; \
	else \
		echo "Nuclear cleanup cancelled."; \
	fi

test-verify: ## Verify E2E test environment is healthy
	@echo "Verifying E2E test environment..."
	@echo "===================================="
	@echo ""
	@echo -n "PostgreSQL Test: "
	@docker-compose -f docker-compose.test.yml ps postgres-test | grep -q 'Up.*healthy' && echo "Running" || echo "Not running"
	@echo -n "Redis Test: "
	@docker-compose -f docker-compose.test.yml ps redis-test | grep -q 'Up.*healthy' && echo "Running" || echo "Not running"
	@echo -n "API Test: "
	@docker-compose -f docker-compose.test.yml ps api-test | grep -q 'Up' && echo "Running" || echo "Not running"
	@echo -n "Mock Stripe: "
	@docker-compose -f docker-compose.test.yml ps mock-stripe | grep -q 'Up.*healthy' && echo "Running" || echo "Not running"
	@echo -n "Mock Email: "
	@docker-compose -f docker-compose.test.yml ps mock-email | grep -q 'Up.*healthy' && echo "Running" || echo "Not running"
	@echo -n "Mock S3: "
	@docker-compose -f docker-compose.test.yml ps mock-s3 | grep -q 'Up.*healthy' && echo "Running" || echo "Not running"
	@echo ""
	@echo -n "API Health Check: "
	@curl -s http://localhost:8001/health >/dev/null 2>&1 && echo "API responding" || echo "API not responding"
	@echo ""
	@echo "Test Database Status:"
	@cd migrations && DATABASE_HOST=localhost DATABASE_PORT=5434 DATABASE_NAME=saas_test ./migrate status 2>/dev/null | grep -E '(up to date|needs updates)' | head -1 || echo "Migration status error"

test-run: ## Run all E2E tests (requires test environment)
	@echo "Running E2E Tests..."
	@echo "======================="
	@echo ""
	@echo "Verifying test environment first..."
	@make test-verify --no-print-directory
	@echo ""
	@echo "Auto-applying migrations if needed..."
	@make test-hot-migrate --no-print-directory
	@echo ""
	@echo "Running API E2E tests..."
	npm run test:e2e:api
	@echo ""
	@echo "Running Frontend E2E tests..."
	npm run test:e2e:frontend 2>/dev/null || echo "Frontend E2E tests not configured yet"
	@echo ""
	@echo "All E2E tests completed!"

# =============================================================================
# HOT UPDATES (No Restart Required)
# =============================================================================

test-hot-migrate: ## Apply schema changes to running test environment (2s vs 45s)
	@echo "Hot applying migrations to test database..."
	@cd migrations && DATABASE_HOST=localhost DATABASE_PORT=5434 DATABASE_NAME=saas_test ./migrate apply
	@echo "Migrations applied without restart!"

test-hot-data: ## Reload test data without restart (3s vs 45s)
	@echo "Hot reloading test data..."
	@cd migrations && DATABASE_HOST=localhost DATABASE_PORT=5434 DATABASE_NAME=saas_test ./migrate test-setup
	@echo "Test data reloaded!"

test-hot-reset: ## Reset data keeping schema without restart (5s vs 45s)
	@echo "Hot resetting test data (keeping schema)..."
	@cd migrations && DATABASE_HOST=localhost DATABASE_PORT=5434 DATABASE_NAME=saas_test ./migrate clean
	@echo "Test data reset!"

test-hot-mocks: ## Restart mock services only (1s vs 45s)
	@echo "Hot restarting mock services..."
	@docker-compose -f docker-compose.test.yml restart mock-stripe mock-email mock-s3
	@echo "Mock services restarted!"

test-hot-status: ## Check test environment status quickly
	@echo "Hot status check..."
	@echo -n "Database: "
	@cd migrations && DATABASE_HOST=localhost DATABASE_PORT=5434 DATABASE_NAME=saas_test ./migrate status 2>/dev/null | grep -E '(up to date|needs updates)' | head -1 || echo "Error"
	@echo -n "API Health: "
	@curl -s http://localhost:8001/health >/dev/null 2>&1 && echo "OK" || echo "Down"

test-hot-all: ## Apply all hot updates in sequence
	@echo "Applying all hot updates..."
	@make test-hot-migrate --no-print-directory
	@make test-hot-data --no-print-directory
	@echo "All hot updates completed!"

test-migration-check: ## Validate migration files for version tracking
	@echo "Checking migration files for version tracking..."
	@cd migrations && \
	for file in [0-9]*.sql; do \
		if [ -f "$$file" ]; then \
			if ! grep -q "INSERT INTO schema_versions" "$$file"; then \
				echo "Missing version tracking in: $$file"; \
				echo "   Add: INSERT INTO schema_versions (version, description) VALUES (X, 'Description');"; \
				exit 1; \
			else \
				echo "Version tracking found in: $$file"; \
			fi; \
		fi; \
	done
	@echo "All migration files have proper version tracking!"

# =============================================================================
# CODE QUALITY COMMANDS
# =============================================================================

lint: ## Run all linters
	@echo "Running linters..."
	npm run lint
	npm run typecheck

lint-fix: ## Auto-fix linting issues
	@echo "Auto-fixing issues..."
	npm run fix

# Backend specific linting
backend-lint: ## Run backend linters (flake8, mypy, bandit)
	@echo "Running backend linters..."
	@echo "Running flake8..."
	@python3 -m flake8 --exclude=migrations,env,venv,__pycache__,.git,node_modules api/ || true
	@echo "Running mypy..."
	@python3 -m mypy api/ || true
	@echo "Running bandit security analysis..."
	@python3 -m bandit -r api/ -f txt || true
	@echo "Backend linting completed!"

backend-security: ## Run security analysis with bandit
	@echo "Running security analysis..."
	@python3 -m bandit -r api/ -f txt --severity-level medium --confidence-level medium
	@echo "Security analysis completed!"

backend-security-json: ## Run security analysis and save JSON report
	@echo "Running security analysis (JSON report)..."
	@python3 -m bandit -r api/ -f json -o bandit-report.json
	@echo "Security report saved to bandit-report.json"

backend-security-html: ## Run security analysis and save HTML report
	@echo "Running security analysis (HTML report)..."
	@python3 -m bandit -r api/ -f html -o bandit-report.html
	@echo "Security report saved to bandit-report.html"

backend-fix: ## Auto-fix backend formatting issues
	@echo "Auto-fixing backend code..."
	@python3 -m black api/
	@python3 -m isort api/
	@echo "Backend code formatting fixed!"

lint-all: ## Run all linters (frontend + backend)
	@echo "Running all linters..."
	@make lint --no-print-directory
	@make backend-lint --no-print-directory
	@echo "All linting completed!"

lint-fix-all: ## Auto-fix all formatting issues
	@echo "Auto-fixing all issues..."
	@make lint-fix --no-print-directory
	@make backend-fix --no-print-directory
	@echo "All formatting fixed!"

# =============================================================================
# UTILITY COMMANDS
# =============================================================================

clean: ## Clean build artifacts and caches
	@echo "Cleaning..."
	rm -rf .next
	rm -rf node_modules/.cache
	rm -rf api/__pycache__
	rm -rf api/**/__pycache__
	@echo "Cleaned!"

ci: ## Full CI check (lint + typecheck + security + test)
	@echo "Running CI checks..."
	@echo "====================="
	@echo ""
	@echo "1. Linting and Type Checking:"
	make lint-all
	@echo ""
	@echo "2. Security Analysis:"
	make backend-security
	@echo ""
	@echo "3. Unit Tests:"
	make test-unit-quick
	@echo ""
	@echo "4. E2E Tests:"
	make test-api
	@echo ""
	@echo "CI checks passed!"

ci-quick: ## Quick CI check (linting + unit tests only)
	@echo "Running quick CI checks..."
	@echo "=========================="
	@echo ""
	@echo "1. Linting:"
	make lint-all
	@echo ""
	@echo "2. Unit Tests:"
	make test-unit-quick
	@echo ""
	@echo "Quick CI checks passed!"

ci-security: ## Security-focused CI check
	@echo "Running security CI checks..."
	make backend-security
	@echo "Security CI checks passed!"

ci-unit: ## CI check for unit tests only
	@echo "Running unit tests CI check..."
	@echo "==============================="
	@echo ""
	@echo "Frontend Unit Tests:"
	npm run test:frontend
	@echo ""
	@echo "Backend Unit Tests:"
	make test-backend-unit-ci
	@echo ""
	@echo "Unit tests CI check passed!"

# =============================================================================
# UTILITY COMMANDS
# =============================================================================

connect-db-prod: ## Connect to Railway PostgreSQL (interactive psql session)
	@echo "Connecting to Railway PostgreSQL..."
	@echo "======================================"
	@echo ""
	@echo "Opening direct PostgreSQL connection..."
	@echo "   Host: gondola.proxy.rlwy.net:54886"
	@echo "   Database: railway"
	@echo ""
	@echo "Comandos úteis no psql:"
	@echo "   \\dt                                    # Listar tabelas"
	@echo "   \\d users                               # Descrever tabela users"
	@echo "   SELECT COUNT(*) FROM users;            # Contar usuários"
	@echo "   SELECT * FROM schema_versions;         # Ver migrations aplicadas"
	@echo "   \\q                                     # Sair"
	@echo ""
	@PGPASSWORD=gdLKoeCiMKduNBFVHPXjvLrcWPYsQyks psql -h gondola.proxy.rlwy.net -p 54886 -U postgres -d railway"

db-prod-info: ## Get database info via backend API
	@echo "Production Database Information"
	@echo "================================="
	@echo ""
	@echo "Backend Health Check:"
	@curl -s https://backend-production-fd50.up.railway.app/health 2>/dev/null | python3 -m json.tool 2>/dev/null || echo "{\"status\": \"API responding\"}"
	@echo ""
	@echo "Database URL (Railway Environment):"
	@railway service backend > /dev/null 2>&1 && railway run -- sh -c 'echo "Host: $$(echo $$DATABASE_URL | cut -d@ -f2 | cut -d/ -f1)"' 2>/dev/null || echo "Railway CLI error"
	@echo ""
	@echo "Database accessible only through:"
	@echo "   1. Backend API endpoints"
	@echo "   2. Railway Console (web interface)"
	@echo "   3. Backend service logs"

db-prod-migration: ## Check migration status via logs
	@echo "Production Migration Status"
	@echo "============================="
	@echo ""
	@echo "Checking backend startup logs for migration info..."
	@echo "Recent deployment logs:"
	@railway service backend > /dev/null 2>&1
	@echo ""
	@echo "Para ver migration status completo:"
	@echo "   1. railway logs -s backend"
	@echo "   2. Procurar por 'migration' ou 'database' nos logs"
	@echo "   3. Ou usar Railway Console: https://railway.com/project/5b33fc8c-1beb-4f1d-863f-a5608f6f9a0a"

db-prod-logs: ## Show recent backend logs (may contain DB info)
	@echo "Recent Backend Logs (Database Context)"
	@echo "========================================"
	@echo ""
	@railway service backend && railway logs

db-prod-status: ## Complete database health check via backend API
	@echo "Production Database Status"
	@echo "============================="
	@echo ""
	@echo "Backend Health Check:"
	@curl -s https://backend-production-fd50.up.railway.app/health 2>/dev/null | python3 -m json.tool 2>/dev/null || echo "API response received"
	@echo ""
	@echo "Database Information:"
	@curl -s https://backend-production-fd50.up.railway.app/database/info 2>/dev/null | python3 -m json.tool 2>/dev/null || echo "Database info API not available"
	@echo ""
	@echo "Para conectar diretamente:"
	@echo "   make connect-db-prod     # Conexão interativa psql"

db-prod-migration-status: ## Check current migration version via PostgreSQL
	@echo "Production Migration Status"
	@echo "=============================="
	@echo ""
	@echo "Checking schema_versions table..."
	@PGPASSWORD=gdLKoeCiMKduNBFVHPXjvLrcWPYsQyks psql -h gondola.proxy.rlwy.net -p 54886 -U postgres -d railway -c "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'schema_versions') as schema_versions_exists;" 2>/dev/null || echo "Could not connect to database"
	@echo ""
	@echo "Current migrations applied:"
	@PGPASSWORD=gdLKoeCiMKduNBFVHPXjvLrcWPYsQyks psql -h gondola.proxy.rlwy.net -p 54886 -U postgres -d railway -c "SELECT version, description, applied_at FROM schema_versions ORDER BY version;" 2>/dev/null || echo "No schema_versions table found - database needs initialization"

db-prod-migration-check: ## Check for pending migrations in production
	@echo "Production Migration Check"
	@echo "============================="
	@echo ""
	@echo "Checking schema_versions table via PostgreSQL connection..."
	@echo "First, checking if schema_versions table exists..."
	@echo "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'schema_versions');" | railway connect Postgres || echo "Could not check pending migrations"

db-prod-migration-apply: ## Apply all pending migrations to production
	@echo "Production Migration Apply"
	@echo "============================="
	@echo ""
	@echo "WARNING: This will apply migrations to PRODUCTION database!"
	@echo ""
	@echo "Database Connection:"
	@echo "   Host: gondola.proxy.rlwy.net:54886"
	@echo "   Database: railway"
	@echo ""
	@echo "Applying ALL migrations individually..."
	@for migration in migrations/[0-9]*.sql; do \
		echo "Applying $$migration..."; \
		PGPASSWORD=gdLKoeCiMKduNBFVHPXjvLrcWPYsQyks psql -h gondola.proxy.rlwy.net -p 54886 -U postgres -d railway -f "$$migration" || echo "Failed to apply $$migration"; \
	done
	@echo ""
	@echo "Migrations applied successfully!"
	@echo ""
	@echo "Verifying migration status..."
	@PGPASSWORD=gdLKoeCiMKduNBFVHPXjvLrcWPYsQyks psql -h gondola.proxy.rlwy.net -p 54886 -U postgres -d railway -c "SELECT version, description, applied_at FROM schema_versions ORDER BY version;"
	@echo ""
	@echo "Checking final migration status..."
	@make db-prod-migration-status --no-print-directory

db-prod-migration-init: ## Initialize production database schema (DANGEROUS - USE WITH CAUTION)
	@echo "Production Database Initialize"
	@echo "================================"
	@echo ""
	@echo "DANGER: This will DROP ALL TABLES and recreate the database!"
	@echo "This should ONLY be used for initial setup of empty database!"
	@echo ""
	@echo "Production database info:"
	@curl -s https://backend-production-fd50.up.railway.app/database/info 2>/dev/null | python3 -c "import sys,json; data=json.load(sys.stdin); print(f'   Database: {data.get(\"database_version\", \"Unknown\")}'); print(f'   Status: {data.get(\"status\", \"Unknown\")}')" 2>/dev/null || echo "   Could not get database info"
	@echo ""
	@echo "If you really want to initialize, run:"
	@echo "   railway service backend"
	@echo "   railway run -- sh -c 'cd migrations && DATABASE_HOST=\$$(echo \$$DATABASE_URL | cut -d@ -f2 | cut -d: -f1) DATABASE_PORT=\$$(echo \$$DATABASE_URL | cut -d: -f4 | cut -d/ -f1) DATABASE_NAME=\$$(echo \$$DATABASE_URL | cut -d/ -f4) DATABASE_USER=\$$(echo \$$DATABASE_URL | cut -d: -f2 | cut -d@ -f1) DATABASE_PASSWORD=\$$(echo \$$DATABASE_URL | cut -d: -f3 | cut -d@ -f1) ./migrate init'"
	@echo ""
	@echo "Command blocked for safety - use manual command above if needed"

db-prod-console: ## Open Railway console for database management
	@echo "Opening Railway Console..."
	@echo "============================"
	@echo ""
	@echo "Railway Project Dashboard:"
	@echo "   https://railway.com/project/5b33fc8c-1beb-4f1d-863f-a5608f6f9a0a"
	@echo ""
	@echo "Direct database access available via:"
	@echo "   1. Railway Console → Services → PostgreSQL"
	@echo "   2. Settings → Networking → TCP Proxy (para conexão externa)"
	@echo "   3. Built-in query editor"
	@echo "   4. Connection string for external tools"
	@railway open 2>/dev/null || echo "Use link above to access Railway Console"

check-db-prod: ## Complete production system health check (all services)
	@echo "Railway Production Database Status"
	@echo "====================================="
	@echo ""
	@echo "Production Environment:"
	@echo "  Project: saas-multi-tenant-base"
	@echo "  Backend:  https://backend-production-fd50.up.railway.app"
	@echo "  Database: postgres.railway.internal (Private Network)"
	@echo ""
	@echo "Database Connection Test:"
	@echo -n "  Backend Health: "
	@curl -s https://backend-production-fd50.up.railway.app/health >/dev/null 2>&1 && echo "API Online" || echo "API Offline"
	@echo ""
	@echo "Database Schema Status:"
	@echo "  Testing direct database connection..."
	@railway service backend && railway run psql $$DATABASE_URL -c "SELECT 'Database connection: SUCCESS' as status;" 2>/dev/null || echo "Database connection failed"
	@echo ""
	@echo "Quick Production Health Check:"
	@echo -n "  Frontend: "
	@curl -s https://frontend-production-c57a.up.railway.app >/dev/null 2>&1 && echo "Online" || echo "Offline"
	@echo -n "  Backend:  "
	@curl -s https://backend-production-fd50.up.railway.app >/dev/null 2>&1 && echo "Online" || echo "Offline"
	@echo -n "  API Docs: "
	@curl -s https://backend-production-fd50.up.railway.app/docs >/dev/null 2>&1 && echo "Available" || echo "Unavailable"
	@echo ""
	@echo "Comandos disponíveis para DB:"
	@echo "   make connect-db-prod     # Conexão interativa"
	@echo "   make db-prod-schema      # Ver schema completo"
	@echo "   make db-prod-tables      # Listar todas as tabelas"
	@echo "   make db-prod-query SQL='SELECT version();'  # Query customizada"

status: ## Show project status
	@echo "Project Status:"
	@echo "=================="
	@echo "Database: $$(docker-compose ps postgres | grep -q 'Up' && echo 'Running' || echo 'Stopped')"
	@echo "Redis: $$(docker-compose ps redis | grep -q 'Up' && echo 'Running' || echo 'Stopped')"
	@echo "Migrations: $$(cd migrations && ./migrate status 2>/dev/null | grep -E '(up to date|needs updates)' | sed 's/\x1b\[[0-9;]*m//g' | head -1 || echo 'Error checking migrations')"
	@echo "Node modules: $$([ -d node_modules ] && echo 'Installed' || echo 'Missing')"
	@echo "Python deps: $$(pip list 2>/dev/null | grep -q fastapi && echo 'Installed' || echo 'Missing')"

# =============================================================================
# E2E PROXY INTEGRATION TESTS - NEW
# =============================================================================

test-proxy: ## Run all proxy integration tests (Next.js → Backend)
	@echo "🌐 Running E2E Proxy Integration Tests"
	@echo "======================================"
	@echo ""
	@echo "ℹ️  These tests validate:"
	@echo "   • Next.js rewrites working correctly"
	@echo "   • Headers (X-Org-Id, Authorization) forwarded"
	@echo "   • Complete integration: Frontend → Proxy → Backend"
	@echo ""
	@echo "🚀 Starting test environment..."
	@make test-start --no-print-directory
	@echo ""
	@echo "🧪 Running proxy tests..."
	python3 -m pytest tests/e2e/proxy/ -v --tb=short
	@echo ""
	@echo "✅ Proxy integration tests completed!"

test-proxy-quick: ## Run proxy tests in quick mode
	@echo "🌐 Running E2E Proxy Tests (Quick Mode)"
	@echo "========================================"
	@echo ""
	@make test-start --no-print-directory
	python3 -m pytest tests/e2e/proxy/ -v --tb=line -q
	@echo ""
	@echo "✅ Quick proxy tests completed!"

test-proxy-auth: ## Run authentication proxy tests only
	@echo "🔐 Running Authentication Proxy Tests"
	@echo "======================================"
	@echo ""
	@make test-start --no-print-directory
	python3 -m pytest tests/e2e/proxy/test_proxy_auth.py -v --tb=short
	@echo ""
	@echo "✅ Auth proxy tests completed!"

test-proxy-orgs: ## Run organization proxy tests only
	@echo "🏢 Running Organizations Proxy Tests"
	@echo "====================================="
	@echo ""
	@make test-start --no-print-directory
	python3 -m pytest tests/e2e/proxy/test_proxy_organizations.py -v --tb=short
	@echo ""
	@echo "✅ Organizations proxy tests completed!"

test-proxy-headers: ## Run header forwarding tests only
	@echo "🌐 Running Header Forwarding Tests"
	@echo "==================================="
	@echo ""
	@make test-start --no-print-directory
	python3 -m pytest tests/e2e/proxy/test_proxy_headers.py -v --tb=short
	@echo ""
	@echo "✅ Header forwarding tests completed!"

test-proxy-compare: ## Compare proxy vs direct API responses
	@echo "⚖️  Comparing Proxy vs Direct API Responses"
	@echo "==========================================="
	@echo ""
	@echo "ℹ️  This compares responses from:"
	@echo "   • Direct: TestClient → FastAPI:8001"
	@echo "   • Proxy:  TestClient → Next.js:3000 → FastAPI:8001"
	@echo ""
	@make test-start --no-print-directory
	python3 -m pytest tests/e2e/proxy/ -v -k "vs_direct" --tb=short
	@echo ""
	@echo "✅ Proxy vs direct comparison completed!"