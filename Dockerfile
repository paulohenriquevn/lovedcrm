# =====================================================
# 🚂 RAILWAY BACKEND DOCKERFILE - PRODUCTION READY
# =====================================================
# Dockerfile otimizado para projetos SaaS multi-tenant
# Compatível com FastAPI + SQLAlchemy + PostgreSQL

FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    postgresql-client \
    curl \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY ./api ./api
COPY ./migrations ./migrations

# Create non-root user for security
RUN useradd --create-home --shell /bin/bash app \
    && chown -R app:app /app
USER app

# Railway auto-injects PORT environment variable
EXPOSE $PORT

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:${PORT:-8000}/health || exit 1

# Production command with Railway PORT support
CMD uvicorn api.main:app --host 0.0.0.0 --port ${PORT:-8000} --workers 1