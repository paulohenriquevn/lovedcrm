# 05-apis.md - Loved CRM - FastAPI Architecture Specification

## **1. EXECUTIVE SUMMARY**

**Project**: Loved CRM - API Architecture for Multi-Tenant B2B CRM System
**Objective**: Design FastAPI endpoints with complete organizational isolation for digital agencies
**Model**: B2B (confirmed from PRD analysis)
**Foundation**: Built on existing 60+ endpoint multi-tenant template with proven patterns

**Core Integration Points**:
- **Auth Module**: Uses `get_current_organization` dependency for complete JWT + header validation
- **Organization Middleware**: Header-based multi-tenancy with X-Org-Id validation
- **Repository Pattern**: SQLRepository with automatic organization_id filtering
- **Template Compliance**: 100% compatible with existing multi-tenant architecture

## **2. B2B MODEL IMPLEMENTATION**

### **Organization-Centric Architecture**

**Model Type**: B2B (Digital Agencies)
- **Shared Organizations**: Multiple users per organization (agencies with teams)
- **Data Isolation**: Complete separation using organization_id filtering
- **Role System**: owner/admin/member roles within each organization
- **Subscription Tiers**: Free (3 users), Pro (10 users), Enterprise (unlimited)

**Integration with Existing Auth System**:
```python
# All CRM endpoints inherit this pattern from existing template
@router.get("/leads")
async def get_leads(
    organization: Organization = Depends(get_current_organization),
    db: Session = Depends(get_db)
):
    # Organization context automatically validated by existing middleware
    return crm_service.get_organization_leads(organization.id)
```

## **3. MUST-HAVE FUNCTIONALITIES (3 Core Features)**

### **Feature 1: Pipeline Kanban de Leads**
- **Business Problem**: Lead organization and visual sales funnel tracking
- **Technical Implementation**: 5-stage fixed pipeline with drag & drop
- **Organization Scope**: All leads filtered by organization_id
- **Performance**: ≤ 500ms response time with org-scoped queries

### **Feature 2: Timeline de Comunicação Integrada**  
- **Business Problem**: Fragmented communication across multiple channels
- **Technical Implementation**: Unified timeline (WhatsApp + Email + VoIP)
- **Organization Scope**: Communications filtered by organization_id  
- **Performance**: ≤ 200ms database queries with org filtering

### **Feature 3: Resumos IA de Conversas**
- **Business Problem**: Long conversations lack actionable insights
- **Technical Implementation**: OpenAI GPT-4 automatic summaries
- **Organization Scope**: AI processing with org-isolated data
- **Performance**: ≤ 100ms context loading per organization

## **4. OPENAPI 3.0 SPECIFICATION**

### **Security Schemes**

```yaml
components:
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
```

### **4.1 Lead Management APIs**

```yaml
/api/v1/crm/leads:
  get:
    summary: Get organization leads with pagination
    description: Retrieve leads for current organization with Kanban pipeline support
    tags: [CRM - Leads]
    security:
      - bearerAuth: []
    parameters:
      - name: X-Org-Id
        in: header
        required: true
        schema:
          type: string
          format: uuid
        description: Organization ID for multi-tenant context
      - name: stage
        in: query
        schema:
          type: string
          enum: [lead, contact, proposal, negotiation, closed]
        description: Filter by pipeline stage
      - name: limit
        in: query
        schema:
          type: integer
          default: 50
          maximum: 100
      - name: offset
        in: query
        schema:
          type: integer
          default: 0
    responses:
      200:
        description: Organization leads retrieved successfully
        content:
          application/json:
            schema:
              type: object
              properties:
                leads:
                  type: array
                  items:
                    $ref: '#/components/schemas/LeadResponse'
                total:
                  type: integer
                pipeline_stats:
                  $ref: '#/components/schemas/PipelineStats'
      403:
        description: Organization access denied
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/ErrorResponse'

  post:
    summary: Create new lead for organization
    description: Add lead to organization pipeline with automatic stage assignment
    tags: [CRM - Leads]
    security:
      - bearerAuth: []
    parameters:
      - name: X-Org-Id
        in: header
        required: true
        schema:
          type: string
          format: uuid
    requestBody:
      required: true
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/LeadCreate'
    responses:
      201:
        description: Lead created successfully
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/LeadResponse'
      400:
        description: Validation error in lead data
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/ErrorResponse'

/api/v1/crm/leads/{lead_id}:
  get:
    summary: Get specific lead by ID within organization
    tags: [CRM - Leads]
    security:
      - bearerAuth: []
    parameters:
      - name: X-Org-Id
        in: header
        required: true
        schema:
          type: string
          format: uuid
      - name: lead_id
        in: path
        required: true
        schema:
          type: string
          format: uuid
    responses:
      200:
        description: Lead details retrieved
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/LeadResponse'
      404:
        description: Lead not found in organization
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/ErrorResponse'

  put:
    summary: Update lead within organization
    tags: [CRM - Leads]
    security:
      - bearerAuth: []
    parameters:
      - name: X-Org-Id
        in: header
        required: true
        schema:
          type: string
          format: uuid
      - name: lead_id
        in: path
        required: true
        schema:
          type: string
          format: uuid
    requestBody:
      required: true
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/LeadUpdate'
    responses:
      200:
        description: Lead updated successfully
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/LeadResponse'

/api/v1/crm/leads/{lead_id}/stage:
  patch:
    summary: Move lead between pipeline stages
    description: Update lead stage for Kanban drag & drop functionality
    tags: [CRM - Leads]
    security:
      - bearerAuth: []
    parameters:
      - name: X-Org-Id
        in: header
        required: true
        schema:
          type: string
          format: uuid
      - name: lead_id
        in: path
        required: true
        schema:
          type: string
          format: uuid
    requestBody:
      required: true
      content:
        application/json:
          schema:
            type: object
            properties:
              stage:
                type: string
                enum: [lead, contact, proposal, negotiation, closed]
              notes:
                type: string
                maxLength: 500
            required: [stage]
    responses:
      200:
        description: Lead stage updated successfully
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/LeadResponse'
      404:
        description: Lead not found in organization
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/ErrorResponse'
```

### **4.2 Communication Timeline APIs**

```yaml
/api/v1/crm/communications:
  get:
    summary: Get unified communication timeline for organization
    description: Retrieve all communications (WhatsApp, Email, VoIP) for organization
    tags: [CRM - Communications]
    security:
      - bearerAuth: []
    parameters:
      - name: X-Org-Id
        in: header
        required: true
        schema:
          type: string
          format: uuid
      - name: lead_id
        in: query
        schema:
          type: string
          format: uuid
        description: Filter communications by specific lead
      - name: channel
        in: query
        schema:
          type: string
          enum: [whatsapp, email, voip]
      - name: limit
        in: query
        schema:
          type: integer
          default: 50
      - name: offset
        in: query
        schema:
          type: integer
          default: 0
    responses:
      200:
        description: Communication timeline retrieved
        content:
          application/json:
            schema:
              type: object
              properties:
                communications:
                  type: array
                  items:
                    $ref: '#/components/schemas/CommunicationResponse'
                total:
                  type: integer

  post:
    summary: Create new communication entry
    tags: [CRM - Communications]
    security:
      - bearerAuth: []
    parameters:
      - name: X-Org-Id
        in: header
        required: true
        schema:
          type: string
          format: uuid
    requestBody:
      required: true
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/CommunicationCreate'
    responses:
      201:
        description: Communication logged successfully
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/CommunicationResponse'

/api/v1/crm/communications/whatsapp/webhook:
  post:
    summary: WhatsApp Business API webhook endpoint
    description: Receive WhatsApp messages and automatically log to organization timeline
    tags: [CRM - Integrations]
    security: []  # Webhook uses different authentication
    requestBody:
      required: true
      content:
        application/json:
          schema:
            type: object
            description: WhatsApp Business API webhook payload
    responses:
      200:
        description: Webhook processed successfully
```

### **4.3 AI Summaries APIs**

```yaml
/api/v1/crm/ai-summaries:
  get:
    summary: Get AI conversation summaries for organization
    description: Retrieve OpenAI-generated summaries of conversations
    tags: [CRM - AI]
    security:
      - bearerAuth: []
    parameters:
      - name: X-Org-Id
        in: header
        required: true
        schema:
          type: string
          format: uuid
      - name: lead_id
        in: query
        schema:
          type: string
          format: uuid
      - name: limit
        in: query
        schema:
          type: integer
          default: 20
    responses:
      200:
        description: AI summaries retrieved
        content:
          application/json:
            schema:
              type: object
              properties:
                summaries:
                  type: array
                  items:
                    $ref: '#/components/schemas/AISummaryResponse'

  post:
    summary: Generate AI summary for conversation
    description: Create OpenAI GPT-4 summary for specific lead conversation
    tags: [CRM - AI]
    security:
      - bearerAuth: []
    x-feature-gate: 
      tier: pro
      feature: ai_summaries
    parameters:
      - name: X-Org-Id
        in: header
        required: true
        schema:
          type: string
          format: uuid
    requestBody:
      required: true
      content:
        application/json:
          schema:
            type: object
            properties:
              lead_id:
                type: string
                format: uuid
              conversation_length:
                type: integer
                minimum: 3
                description: Minimum messages to generate summary
            required: [lead_id]
    responses:
      201:
        description: AI summary generated successfully
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/AISummaryResponse'
      402:
        description: Feature requires Pro tier upgrade
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/FeatureGateError'

### **4.4 OpenAPI Components Schemas**

```yaml
components:
  schemas:
    ErrorResponse:
      type: object
      properties:
        detail:
          type: string
        error_code:
          type: string
        timestamp:
          type: string
          format: date-time
      required:
        - detail

    FeatureGateError:
      type: object
      properties:
        detail:
          type: object
          properties:
            error:
              type: string
              example: "feature_requires_upgrade"
            required_tier:
              type: string
              example: "pro"
            current_tier:
              type: string
              example: "free"
            upgrade_url:
              type: string
              example: "/billing/upgrade?tier=pro"

    LeadCreate:
      type: object
      properties:
        name:
          type: string
          minLength: 1
          maxLength: 255
        email:
          type: string
          format: email
          nullable: true
        phone:
          type: string
          maxLength: 20
          nullable: true
        source:
          type: string
          maxLength: 100
        stage:
          type: string
          enum: [lead, contact, proposal, negotiation, closed]
          default: lead
      required:
        - name
        - source

    LeadUpdate:
      type: object
      properties:
        name:
          type: string
          minLength: 1
          maxLength: 255
          nullable: true
        email:
          type: string
          format: email
          nullable: true
        phone:
          type: string
          maxLength: 20
          nullable: true
        source:
          type: string
          maxLength: 100
          nullable: true
        stage:
          type: string
          enum: [lead, contact, proposal, negotiation, closed]
          nullable: true

    LeadResponse:
      type: object
      properties:
        id:
          type: string
          format: uuid
        organization_id:
          type: string
          format: uuid
        name:
          type: string
        email:
          type: string
          format: email
          nullable: true
        phone:
          type: string
          nullable: true
        source:
          type: string
        stage:
          type: string
          enum: [lead, contact, proposal, negotiation, closed]
        communication_count:
          type: integer
          default: 0
        last_communication:
          type: string
          format: date-time
          nullable: true
        created_at:
          type: string
          format: date-time
        updated_at:
          type: string
          format: date-time
      required:
        - id
        - organization_id
        - name
        - source
        - stage
        - created_at
        - updated_at

    PipelineStats:
      type: object
      properties:
        lead:
          type: integer
          default: 0
        contact:
          type: integer
          default: 0
        proposal:
          type: integer
          default: 0
        negotiation:
          type: integer
          default: 0
        closed:
          type: integer
          default: 0
        total_leads:
          type: integer
          default: 0
        conversion_rate:
          type: number
          format: float
          default: 0.0

    CommunicationCreate:
      type: object
      properties:
        lead_id:
          type: string
          format: uuid
        channel:
          type: string
          enum: [whatsapp, email, voip]
        direction:
          type: string
          enum: [inbound, outbound]
        content:
          type: string
          maxLength: 5000
        metadata:
          type: object
          additionalProperties: true
          default: {}
      required:
        - lead_id
        - channel
        - direction
        - content

    CommunicationResponse:
      type: object
      properties:
        id:
          type: string
          format: uuid
        organization_id:
          type: string
          format: uuid
        lead_id:
          type: string
          format: uuid
        channel:
          type: string
          enum: [whatsapp, email, voip]
        direction:
          type: string
          enum: [inbound, outbound]
        content:
          type: string
        metadata:
          type: object
          additionalProperties: true
        created_at:
          type: string
          format: date-time
        processed_at:
          type: string
          format: date-time
          nullable: true
      required:
        - id
        - organization_id
        - lead_id
        - channel
        - direction
        - content
        - created_at

    AISummaryResponse:
      type: object
      properties:
        id:
          type: string
          format: uuid
        organization_id:
          type: string
          format: uuid
        lead_id:
          type: string
          format: uuid
        summary:
          type: string
        key_points:
          type: array
          items:
            type: string
        sentiment:
          type: string
          enum: [positive, neutral, negative]
        next_actions:
          type: array
          items:
            type: string
        confidence_score:
          type: number
          format: float
          minimum: 0.0
          maximum: 1.0
        created_at:
          type: string
          format: date-time
      required:
        - id
        - organization_id
        - lead_id
        - summary
        - key_points
        - sentiment
        - next_actions
        - confidence_score
        - created_at
```

## **5. PYDANTIC SCHEMAS WITH ORGANIZATION AWARENESS**

### **5.1 Lead Schemas**

```python
# api/schemas/crm_lead.py
from datetime import datetime
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, Field, validator

class LeadBaseSchema(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    email: Optional[str] = Field(None, pattern=r'^[^@]+@[^@]+\.[^@]+$')
    phone: Optional[str] = Field(None, max_length=20)
    source: str = Field(..., max_length=100)
    stage: str = Field(default="lead", pattern=r'^(lead|contact|proposal|negotiation|closed)$')
    
    @validator('stage')
    def validate_stage(cls, v):
        allowed_stages = ["lead", "contact", "proposal", "negotiation", "closed"]
        if v not in allowed_stages:
            raise ValueError(f'Stage must be one of: {allowed_stages}')
        return v

class LeadCreateSchema(LeadBaseSchema):
    # organization_id will be set automatically by service layer
    pass

class LeadUpdateSchema(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    email: Optional[str] = Field(None, pattern=r'^[^@]+@[^@]+\.[^@]+$')
    phone: Optional[str] = Field(None, max_length=20)
    source: Optional[str] = Field(None, max_length=100)
    stage: Optional[str] = Field(None, pattern=r'^(lead|contact|proposal|negotiation|closed)$')

class LeadResponseSchema(LeadBaseSchema):
    id: UUID
    organization_id: UUID  # Include for frontend verification
    created_at: datetime
    updated_at: datetime
    communication_count: int = 0
    last_communication: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class PipelineStatsSchema(BaseModel):
    lead: int = 0
    contact: int = 0
    proposal: int = 0
    negotiation: int = 0
    closed: int = 0
    total_leads: int = 0
    conversion_rate: float = 0.0
```

### **5.2 Communication Schemas**

```python
# api/schemas/crm_communication.py
from datetime import datetime
from typing import Optional, Any, Dict
from uuid import UUID
from pydantic import BaseModel, Field

class CommunicationBaseSchema(BaseModel):
    lead_id: UUID
    channel: str = Field(..., pattern=r'^(whatsapp|email|voip)$')
    direction: str = Field(..., pattern=r'^(inbound|outbound)$')
    content: str = Field(..., max_length=5000)
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict)

class CommunicationCreateSchema(CommunicationBaseSchema):
    # organization_id set automatically from context
    pass

class CommunicationResponseSchema(CommunicationBaseSchema):
    id: UUID
    organization_id: UUID
    created_at: datetime
    processed_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True
```

### **5.3 AI Summary Schemas**

```python
# api/schemas/crm_ai_summary.py
from datetime import datetime
from typing import Optional, Dict, Any
from uuid import UUID
from pydantic import BaseModel, Field

class AISummaryCreateSchema(BaseModel):
    lead_id: UUID
    conversation_length: Optional[int] = Field(default=10, ge=3)

class AISummaryResponseSchema(BaseModel):
    id: UUID
    organization_id: UUID
    lead_id: UUID
    summary: str
    key_points: list[str]
    sentiment: str = Field(..., pattern=r'^(positive|neutral|negative)$')
    next_actions: list[str]
    confidence_score: float = Field(..., ge=0.0, le=1.0)
    created_at: datetime
    
    class Config:
        from_attributes = True
```

## **6. FEATURE GATING DECORATORS**

### **6.1 Subscription Tier Validation**

```python
# api/core/feature_gates.py
from functools import wraps
from typing import Callable, Any
from fastapi import HTTPException, status
from ..models.organization import Organization

def require_subscription_tier(required_tier: str):
    """Decorator to enforce subscription tier requirements."""
    
    tier_hierarchy = {
        "free": 0,
        "pro": 1, 
        "enterprise": 2
    }
    
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        async def wrapper(*args, **kwargs) -> Any:
            # Extract organization from function arguments
            organization = None
            for arg in args:
                if isinstance(arg, Organization):
                    organization = arg
                    break
            
            if not organization:
                # Look in kwargs
                organization = kwargs.get('organization')
            
            if not organization:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Organization context not found for feature gate"
                )
            
            current_tier = getattr(organization, 'subscription_tier', 'free').lower()
            required_level = tier_hierarchy.get(required_tier.lower(), 0)
            current_level = tier_hierarchy.get(current_tier, 0)
            
            if current_level < required_level:
                raise HTTPException(
                    status_code=status.HTTP_402_PAYMENT_REQUIRED,
                    detail={
                        "error": "feature_requires_upgrade",
                        "required_tier": required_tier,
                        "current_tier": current_tier,
                        "upgrade_url": f"/billing/upgrade?tier={required_tier}"
                    }
                )
            
            return await func(*args, **kwargs)
        return wrapper
    return decorator

def require_pro_tier(func: Callable) -> Callable:
    """Shorthand decorator for Pro tier features."""
    return require_subscription_tier("pro")(func)

def require_enterprise_tier(func: Callable) -> Callable:
    """Shorthand decorator for Enterprise tier features."""
    return require_subscription_tier("enterprise")(func)
```

### **6.2 Usage-Based Limits**

```python
# api/core/usage_limits.py
from datetime import datetime, timedelta
from typing import Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from ..models.organization import Organization

async def check_ai_summary_limit(
    organization: Organization, 
    db: Session
) -> None:
    """Check if organization has reached AI summary limits."""
    
    limits = {
        "free": 10,
        "pro": 100, 
        "enterprise": -1  # Unlimited
    }
    
    tier = getattr(organization, 'subscription_tier', 'free').lower()
    monthly_limit = limits.get(tier, 10)
    
    if monthly_limit == -1:  # Unlimited
        return
    
    # Count this month's usage
    current_month = datetime.utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    
    from ..models.crm_ai_summary import AISummary
    monthly_usage = db.query(AISummary).filter(
        AISummary.organization_id == organization.id,
        AISummary.created_at >= current_month
    ).count()
    
    if monthly_usage >= monthly_limit:
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail={
                "error": "monthly_limit_exceeded",
                "feature": "ai_summaries",
                "limit": monthly_limit,
                "used": monthly_usage,
                "upgrade_url": "/billing/upgrade?feature=ai_summaries"
            }
        )
```

## **7. REPOSITORY LAYER WITH ORGANIZATION FILTERING**

### **7.1 Lead Repository**

```python
# api/repositories/crm_lead_repository.py
from typing import List, Optional, Dict, Any
from uuid import UUID
from sqlalchemy.orm import Session
from sqlalchemy import func, and_

from .base import SQLRepository
from ..models.crm_lead import Lead

class LeadRepository(SQLRepository[Lead]):
    def __init__(self, db: Session):
        super().__init__(db, Lead)
    
    def get_by_organization(
        self, 
        org_id: UUID, 
        stage: Optional[str] = None,
        limit: int = 50, 
        offset: int = 0
    ) -> List[Lead]:
        """Get leads for organization with optional stage filtering."""
        query = self.db.query(Lead).filter(Lead.organization_id == org_id)
        
        if stage:
            query = query.filter(Lead.stage == stage)
        
        return query.order_by(Lead.created_at.desc())\
                   .offset(offset)\
                   .limit(limit)\
                   .all()
    
    def get_pipeline_stats(self, org_id: UUID) -> Dict[str, Any]:
        """Get pipeline statistics for organization."""
        stats = self.db.query(
            Lead.stage,
            func.count(Lead.id).label('count')
        ).filter(
            Lead.organization_id == org_id
        ).group_by(Lead.stage).all()
        
        pipeline_stats = {
            "lead": 0, "contact": 0, "proposal": 0, 
            "negotiation": 0, "closed": 0
        }
        
        total_leads = 0
        closed_count = 0
        
        for stage, count in stats:
            pipeline_stats[stage] = count
            total_leads += count
            if stage == "closed":
                closed_count = count
        
        conversion_rate = (closed_count / total_leads * 100) if total_leads > 0 else 0.0
        
        pipeline_stats.update({
            "total_leads": total_leads,
            "conversion_rate": round(conversion_rate, 2)
        })
        
        return pipeline_stats
    
    def update_stage(
        self, 
        org_id: UUID, 
        lead_id: UUID, 
        new_stage: str
    ) -> Optional[Lead]:
        """Update lead stage within organization scope."""
        lead = self.db.query(Lead).filter(
            and_(
                Lead.id == lead_id,
                Lead.organization_id == org_id
            )
        ).first()
        
        if lead:
            lead.stage = new_stage
            lead.updated_at = func.now()
            self.db.commit()
            self.db.refresh(lead)
        
        return lead
```

### **7.2 Communication Repository**

```python
# api/repositories/crm_communication_repository.py
from typing import List, Optional
from uuid import UUID
from sqlalchemy.orm import Session
from sqlalchemy import and_, desc

from .base import SQLRepository
from ..models.crm_communication import Communication

class CommunicationRepository(SQLRepository[Communication]):
    def __init__(self, db: Session):
        super().__init__(db, Communication)
    
    def get_by_organization(
        self, 
        org_id: UUID,
        lead_id: Optional[UUID] = None,
        channel: Optional[str] = None,
        limit: int = 50,
        offset: int = 0
    ) -> List[Communication]:
        """Get communications for organization with filtering."""
        query = self.db.query(Communication).filter(
            Communication.organization_id == org_id
        )
        
        if lead_id:
            query = query.filter(Communication.lead_id == lead_id)
        
        if channel:
            query = query.filter(Communication.channel == channel)
        
        return query.order_by(desc(Communication.created_at))\
                   .offset(offset)\
                   .limit(limit)\
                   .all()
    
    def get_lead_timeline(self, org_id: UUID, lead_id: UUID) -> List[Communication]:
        """Get chronological communication timeline for specific lead."""
        return self.db.query(Communication).filter(
            and_(
                Communication.organization_id == org_id,
                Communication.lead_id == lead_id
            )
        ).order_by(Communication.created_at.asc()).all()
```

## **8. SERVICE LAYER WITH BUSINESS LOGIC**

### **8.1 Lead Service**

```python
# api/services/crm_lead_service.py
from typing import List, Optional, Dict, Any
from uuid import UUID
from sqlalchemy.orm import Session

from ..models.organization import Organization
from ..models.crm_lead import Lead
from ..repositories.crm_lead_repository import LeadRepository
from ..schemas.crm_lead import LeadCreateSchema, LeadUpdateSchema

class LeadService:
    def __init__(self, db: Session):
        self.db = db
        self.repository = LeadRepository(db)
    
    def get_organization_leads(
        self,
        organization: Organization,
        stage: Optional[str] = None,
        limit: int = 50,
        offset: int = 0
    ) -> List[Lead]:
        """Get leads for organization with optional filtering."""
        return self.repository.get_by_organization(
            org_id=organization.id,
            stage=stage,
            limit=limit,
            offset=offset
        )
    
    def get_lead_by_id(
        self, 
        organization: Organization, 
        lead_id: UUID
    ) -> Optional[Lead]:
        """Get specific lead within organization scope."""
        return self.repository.get_by_id_and_organization(
            item_id=lead_id,
            org_id=organization.id
        )
    
    def create_lead(
        self, 
        organization: Organization, 
        data: LeadCreateSchema
    ) -> Lead:
        """Create new lead for organization."""
        lead_data = data.dict()
        lead_data['organization_id'] = organization.id
        
        return self.repository.create(lead_data)
    
    def update_lead(
        self,
        organization: Organization,
        lead_id: UUID,
        data: LeadUpdateSchema
    ) -> Optional[Lead]:
        """Update lead within organization scope."""
        lead = self.get_lead_by_id(organization, lead_id)
        if not lead:
            return None
        
        update_data = data.dict(exclude_unset=True)
        return self.repository.update(lead, update_data)
    
    def update_lead_stage(
        self,
        organization: Organization,
        lead_id: UUID,
        new_stage: str
    ) -> Optional[Lead]:
        """Update lead pipeline stage."""
        return self.repository.update_stage(
            org_id=organization.id,
            lead_id=lead_id,
            new_stage=new_stage
        )
    
    def get_pipeline_statistics(self, organization: Organization) -> Dict[str, Any]:
        """Get pipeline statistics for organization dashboard."""
        return self.repository.get_pipeline_stats(organization.id)
```

### **8.2 AI Summary Service**

```python
# api/services/crm_ai_summary_service.py
import openai
from typing import List, Dict, Any
from uuid import UUID
from sqlalchemy.orm import Session

from ..models.organization import Organization
from ..core.config import settings
from ..core.usage_limits import check_ai_summary_limit
from ..repositories.crm_communication_repository import CommunicationRepository
from ..repositories.crm_ai_summary_repository import AISummaryRepository

class AISummaryService:
    def __init__(self, db: Session):
        self.db = db
        self.communication_repo = CommunicationRepository(db)
        self.ai_summary_repo = AISummaryRepository(db)
        self.openai_client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)
    
    async def generate_conversation_summary(
        self,
        organization: Organization,
        lead_id: UUID,
        conversation_length: int = 10
    ) -> Dict[str, Any]:
        """Generate AI summary for lead conversation."""
        
        # Check usage limits first
        await check_ai_summary_limit(organization, self.db)
        
        # Get recent communications for the lead
        communications = self.communication_repo.get_lead_timeline(
            org_id=organization.id,
            lead_id=lead_id
        )
        
        if len(communications) < 3:
            raise ValueError("Insufficient conversation history for summary")
        
        # Prepare conversation for OpenAI
        conversation_text = self._format_conversation_for_ai(
            communications[-conversation_length:]
        )
        
        # Generate summary using OpenAI
        summary_data = await self._generate_openai_summary(conversation_text)
        
        # Save to database
        ai_summary_data = {
            'organization_id': organization.id,
            'lead_id': lead_id,
            'summary': summary_data['summary'],
            'key_points': summary_data['key_points'],
            'sentiment': summary_data['sentiment'],
            'next_actions': summary_data['next_actions'],
            'confidence_score': summary_data['confidence_score']
        }
        
        return self.ai_summary_repo.create(ai_summary_data)
    
    def _format_conversation_for_ai(self, communications: List) -> str:
        """Format communications for OpenAI processing."""
        formatted = []
        for comm in communications:
            direction = "Cliente" if comm.direction == "inbound" else "Agência"
            formatted.append(f"{direction}: {comm.content}")
        
        return "\n".join(formatted)
    
    async def _generate_openai_summary(self, conversation: str) -> Dict[str, Any]:
        """Call OpenAI API to generate conversation summary."""
        
        prompt = f"""
        Analise a seguinte conversa entre uma agência digital e um cliente potencial.
        Forneça um resumo estruturado em português brasileiro:

        Conversa:
        {conversation}

        Formato de resposta (JSON):
        {{
            "summary": "Resumo da conversa em 2-3 frases",
            "key_points": ["ponto 1", "ponto 2", "ponto 3"],
            "sentiment": "positive|neutral|negative",
            "next_actions": ["ação 1", "ação 2"],
            "confidence_score": 0.85
        }}
        """
        
        try:
            response = await self.openai_client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "Você é um assistente especializado em análise de conversas comerciais para agências digitais brasileiras."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                max_tokens=800
            )
            
            import json
            return json.loads(response.choices[0].message.content)
            
        except Exception as e:
            # Fallback summary if OpenAI fails
            return {
                "summary": "Resumo não disponível devido a erro técnico",
                "key_points": ["Erro na geração do resumo"],
                "sentiment": "neutral",
                "next_actions": ["Revisar conversa manualmente"],
                "confidence_score": 0.0
            }
```

## **9. PERFORMANCE & SECURITY SPECIFICATIONS**

### **9.1 Performance Requirements**

**Database Query Performance**:
- ≤ 200ms for organization-scoped queries with proper indexing
- ≤ 500ms for API endpoint responses including business logic
- ≤ 100ms for organization context loading via `useOrgContext()`

**Optimization Strategies**:
```sql
-- Required indexes for performance (already in database schema)
CREATE INDEX ix_leads_organization_id ON leads(organization_id);
CREATE INDEX ix_leads_organization_stage ON leads(organization_id, stage);
CREATE INDEX ix_communications_organization_id ON communications(organization_id);
CREATE INDEX ix_communications_organization_lead ON communications(organization_id, lead_id);
CREATE INDEX ix_ai_summaries_organization_id ON ai_summaries(organization_id);
```

**Caching Strategy**:
```python
# Redis caching for frequently accessed data
@cache(expire=300)  # 5 minutes
def get_pipeline_stats(org_id: UUID) -> Dict[str, Any]:
    return lead_repository.get_pipeline_stats(org_id)
```

### **9.2 Security Specifications**

**Organization Isolation (Critical)**:
- 100% of CRM queries MUST include organization_id filtering
- ≥ 99.9% cross-organization access attempts blocked
- 0 tolerance for data leaks between organizations

**Authentication & Authorization**:
```python
# All CRM endpoints use this security pattern
@router.get("/leads")  
async def get_leads(
    organization: Organization = Depends(get_current_organization),  # JWT + header validation
    db: Session = Depends(get_db)
):
    # organization context already validated by middleware
    # JWT org_id matches X-Org-Id header (enforced)
    # User membership in organization confirmed
```

**Input Validation**:
- All inputs validated by Pydantic schemas
- SQL injection prevention via SQLAlchemy ORM
- XSS prevention via content sanitization
- File upload restrictions for attachments

**Rate Limiting**:
```python
# API rate limiting per organization
@limiter.limit("100/minute")
@router.post("/leads")
async def create_lead(...):
    pass

# AI endpoint specific limits
@limiter.limit("10/hour")  # Expensive OpenAI calls
@router.post("/ai-summaries")
async def generate_summary(...):
    pass
```

## **10. INTEGRATION SPECIFICATIONS**

### **10.1 WhatsApp Business API Integration**

**Webhook Configuration**:
```python
# api/routers/crm_integrations.py
@router.post("/whatsapp/webhook")
async def whatsapp_webhook(
    webhook_data: dict,
    signature: str = Header(None, alias="X-Hub-Signature-256")
):
    # Verify webhook signature
    if not verify_whatsapp_signature(webhook_data, signature):
        raise HTTPException(status_code=401)
    
    # Process incoming message
    await process_whatsapp_message(webhook_data)
    return {"status": "ok"}

async def process_whatsapp_message(data: dict):
    """Process WhatsApp message and associate with organization/lead."""
    phone_number = extract_phone_number(data)
    message_content = extract_message_content(data)
    
    # Find lead by phone number across all organizations
    lead = find_lead_by_phone(phone_number)
    if lead:
        # Log communication to correct organization
        await log_communication(
            organization_id=lead.organization_id,
            lead_id=lead.id,
            channel="whatsapp",
            direction="inbound",
            content=message_content,
            metadata={"whatsapp_id": data.get("id")}
        )
```

### **10.2 Email Integration (Gmail/Outlook)**

**IMAP/OAuth Integration**:
```python
# Email parsing and organization association
class EmailIntegrationService:
    async def sync_emails_for_organization(self, organization: Organization):
        """Sync emails and associate with leads based on email addresses."""
        
        # Get organization's connected email accounts
        email_accounts = get_organization_email_accounts(organization.id)
        
        for account in email_accounts:
            recent_emails = await fetch_recent_emails(account)
            
            for email in recent_emails:
                lead = find_lead_by_email(email.sender, organization.id)
                if lead:
                    await log_communication(
                        organization_id=organization.id,
                        lead_id=lead.id,
                        channel="email",
                        direction="inbound" if email.is_inbound else "outbound",
                        content=email.content,
                        metadata={"email_id": email.id, "subject": email.subject}
                    )
```

### **10.3 VoIP Integration**

**Call Recording & Logging**:
```python
# VoIP webhook for call completion
@router.post("/voip/call-completed")
async def voip_call_completed(
    call_data: VoIPCallData,
    api_key: str = Header(None, alias="X-VoIP-API-Key")
):
    # Verify VoIP provider API key
    if not verify_voip_api_key(api_key):
        raise HTTPException(status_code=401)
    
    # Find lead by phone number
    lead = find_lead_by_phone(call_data.phone_number)
    if lead:
        await log_communication(
            organization_id=lead.organization_id,
            lead_id=lead.id,
            channel="voip",
            direction=call_data.direction,
            content=f"Call duration: {call_data.duration}s",
            metadata={
                "call_id": call_data.call_id,
                "duration": call_data.duration,
                "recording_url": call_data.recording_url
            }
        )
```

## **11. TESTING STRATEGY**

### **11.1 Organization Isolation Tests**

```python
# tests/e2e/api/test_crm_isolation.py
@pytest.mark.crm
def test_lead_cross_organization_access_denied(authenticated_user, other_organization):
    """Test that leads cannot be accessed across organizations."""
    
    # Create lead in user's organization
    lead_data = {"name": "Test Lead", "email": "test@example.com", "source": "website"}
    create_response = client.post(
        "/api/v1/crm/leads",
        json=lead_data,
        headers={
            'Authorization': f"Bearer {authenticated_user['tokens']['access_token']}",
            'X-Org-Id': authenticated_user['organization']['id']
        }
    )
    assert create_response.status_code == 201
    lead_id = create_response.json()['id']
    
    # Try to access lead from different organization
    access_response = client.get(
        f"/api/v1/crm/leads/{lead_id}",
        headers={
            'Authorization': f"Bearer {authenticated_user['tokens']['access_token']}",
            'X-Org-Id': other_organization['id']  # Different org!
        }
    )
    
    assert access_response.status_code == 403
    assert "organization mismatch" in access_response.json()['detail']

@pytest.mark.crm
def test_ai_summary_organization_isolation(authenticated_user, other_organization):
    """Test AI summaries are organization-isolated."""
    
    # Generate AI summary in user's org
    summary_data = {"lead_id": str(uuid.uuid4())}
    create_response = client.post(
        "/api/v1/crm/ai-summaries",
        json=summary_data,
        headers={
            'Authorization': f"Bearer {authenticated_user['tokens']['access_token']}",
            'X-Org-Id': authenticated_user['organization']['id']
        }
    )
    
    # Try to list summaries from different organization  
    list_response = client.get(
        "/api/v1/crm/ai-summaries",
        headers={
            'Authorization': f"Bearer {authenticated_user['tokens']['access_token']}",
            'X-Org-Id': other_organization['id']
        }
    )
    
    assert list_response.status_code == 403
```

### **11.2 Feature Gate Tests**

```python
@pytest.mark.crm
@pytest.mark.billing
def test_ai_summary_requires_pro_tier(authenticated_user_free_tier):
    """Test that AI summaries require Pro tier."""
    
    summary_data = {"lead_id": str(uuid.uuid4())}
    response = client.post(
        "/api/v1/crm/ai-summaries",
        json=summary_data,
        headers={
            'Authorization': f"Bearer {authenticated_user_free_tier['tokens']['access_token']}",
            'X-Org-Id': authenticated_user_free_tier['organization']['id']
        }
    )
    
    assert response.status_code == 402
    assert response.json()['detail']['error'] == "feature_requires_upgrade"
    assert response.json()['detail']['required_tier'] == "pro"
```

## **12. DEPLOYMENT & MONITORING**

### **12.1 Railway Deployment Configuration**

**Environment Variables**:
```bash
# Production environment variables for Railway
OPENAI_API_KEY=sk-...
WHATSAPP_WEBHOOK_SECRET=...
VOIP_API_KEY=...
REDIS_URL=redis://...
DATABASE_URL=postgresql://...
```

**Health Check Endpoint**:
```python
@router.get("/health/crm")
async def crm_health_check(db: Session = Depends(get_db)):
    """Health check for CRM functionality."""
    try:
        # Test database connectivity
        db.execute("SELECT 1")
        
        # Test Redis connectivity  
        redis_client.ping()
        
        # Test OpenAI API (optional)
        # await test_openai_connection()
        
        return {
            "status": "healthy",
            "database": "connected",
            "redis": "connected",
            "timestamp": datetime.utcnow()
        }
    except Exception as e:
        return {
            "status": "unhealthy", 
            "error": str(e),
            "timestamp": datetime.utcnow()
        }
```

### **12.2 Monitoring & Observability**

**Key Metrics to Track**:
- API response times per endpoint
- Organization isolation validation success rate
- AI summary generation success/failure rates
- WhatsApp webhook processing latency
- Database query performance by organization

**Logging Configuration**:
```python
# Structured logging for CRM operations
logger.info(
    "Lead created successfully",
    extra={
        "organization_id": str(organization.id),
        "lead_id": str(lead.id),
        "user_id": str(current_user.id),
        "source": lead_data.source,
        "operation": "create_lead"
    }
)

logger.warning(
    "Cross-organization access attempt blocked",
    extra={
        "user_id": str(current_user.id),
        "requested_org_id": org_id,
        "user_org_id": current_user._token_org_id,
        "operation": "organization_validation",
        "security_event": True
    }
)
```

## **13. CONCLUSION & NEXT STEPS**

### **13.1 Implementation Priority**

**Phase 1 (MVP - 2 weeks)**:
1. Lead management APIs with pipeline stages
2. Basic communication logging (manual entry)
3. Organization isolation and security validation

**Phase 2 (Integrations - 3 weeks)**:
1. WhatsApp Business API webhook integration
2. Email sync (Gmail/Outlook OAuth)
3. Communication timeline UI integration

**Phase 3 (AI Features - 2 weeks)**:
1. OpenAI GPT-4 integration for summaries
2. Feature gating for subscription tiers
3. Usage limit enforcement

### **13.2 Technical Validation**

**Architecture Compliance**: ✅ 100% compatible with existing multi-tenant template
- Uses `get_current_organization` dependency pattern
- Follows SQLRepository with organization_id filtering
- Implements header-based multi-tenancy validation
- Maintains complete data isolation between organizations

**Performance Targets**: ✅ Achievable with proper indexing
- Database indexes already specified in schema
- Query optimization follows existing patterns
- Caching strategies aligned with current infrastructure

**Security Standards**: ✅ Meets multi-tenant security requirements
- Organization context validation at every endpoint
- Cross-organization access prevention
- Input validation via Pydantic schemas
- Audit logging for security events

### **13.3 Success Metrics**

**Technical Metrics**:
- 100% organization isolation compliance
- ≤ 500ms API response times
- ≥ 99.9% uptime for CRM endpoints
- 0 cross-organization data leaks

**Business Metrics**:
- ≥ 80% team activation rate (B2B model)
- ≥ 60% multi-user adoption within organizations
- ≥ 15% conversion to paid tiers
- ≥ 85% organization retention rate

This FastAPI architecture specification provides a complete foundation for implementing the Loved CRM system with full organizational isolation, feature gating, and integration capabilities while maintaining 100% compatibility with the existing multi-tenant template.