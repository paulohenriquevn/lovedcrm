#!/usr/bin/env python3
"""
Test minimal template router to isolate FastAPI issues.
"""

import uvicorn
from fastapi import FastAPI, APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Dict, Any
import time

# Create minimal schemas
class MinimalTemplateCreate(BaseModel):
    name: str
    content: str

class MinimalTemplateResponse(BaseModel):
    id: str
    name: str
    content: str
    created_at: str

# Create minimal router
minimal_router = APIRouter(prefix="/test-templates", tags=["Test Templates"])

@minimal_router.post("", response_model=MinimalTemplateResponse, status_code=201)
async def create_minimal_template(template_data: MinimalTemplateCreate):
    """Minimal template creation endpoint."""
    print(f"🔄 Received template data: {template_data}")
    
    # Simulate processing
    result = MinimalTemplateResponse(
        id="test-123",
        name=template_data.name,
        content=template_data.content,
        created_at=str(time.time())
    )
    
    print(f"✅ Returning result: {result}")
    return result

@minimal_router.get("", response_model=Dict[str, Any])
async def list_minimal_templates():
    """Minimal template list endpoint."""
    return {"templates": [], "message": "Minimal templates endpoint works"}

# Create minimal app
app = FastAPI(title="Minimal Template Test")
app.include_router(minimal_router)

@app.get("/")
async def root():
    return {"message": "Minimal test server running"}

@app.get("/health")
async def health():
    return {"status": "healthy", "message": "Minimal server"}

if __name__ == "__main__":
    print("🚀 Starting minimal template test server on port 8002...")
    uvicorn.run(app, host="0.0.0.0", port=8002, log_level="info")