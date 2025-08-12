"""CRM Lead Scoring Service.

Advanced ML-based lead scoring system with organization isolation.
Implements 6-factor scoring algorithm with transparent factors.
"""

import hashlib
import re
from datetime import datetime
from decimal import Decimal
from typing import Dict, List, Optional, Tuple
from uuid import UUID

from fastapi import HTTPException
from sqlalchemy.orm import Session

from ..models.crm_lead import Lead
from ..models.organization import Organization


class LeadScoringService:
    """Lead scoring service with organization isolation.

    Implements 6-factor scoring algorithm:
    - Email authority (10 points max)
    - Phone completeness (5 points max)
    - Estimated value tier (20 points max)
    - Source quality (15 points max)
    - Company size indicators (25 points max)
    - Recent engagement (15 points max)

    Total: 0-100 points with transparent factor breakdown.
    """

    # Enterprise email domains for authority scoring
    ENTERPRISE_DOMAINS = {
        # Consumer domains (lower score)
        "gmail.com": 2,
        "yahoo.com": 1,
        "hotmail.com": 1,
        "outlook.com": 2,
        # Corporate domains (higher score)
        "microsoft.com": 10,
        "google.com": 10,
        "amazon.com": 10,
        "apple.com": 10,
        "meta.com": 10,
        "netflix.com": 9,
        # Brazilian enterprise domains
        "petrobras.com.br": 10,
        "vale.com": 10,
        "ambev.com.br": 9,
        "bradesco.com.br": 9,
        "itau.com.br": 9,
        "santander.com.br": 9,
        # Government domains
        "gov.br": 8,
        ".edu.br": 7,
        # Tech startups
        "nubank.com.br": 8,
        "stone.com.br": 8,
        "vtex.com": 8,
    }

    def __init__(self, db: Session):
        """Initialize scoring service with database session."""
        self.db = db

    def calculate_basic_score(self, lead: Lead) -> Tuple[int, Dict[str, int]]:
        """Calculate 6-factor lead score (0-100).

        Args:
            lead: Lead instance to score

        Returns:
            Tuple of (total_score, factor_breakdown)
        """
        score = 0
        factors = {}

        # Factor 1: Email authority (10 points max)
        if lead.email:
            domain = lead.email.split("@")[1].lower() if "@" in lead.email else ""
            email_points = self._calculate_email_authority_score(domain)
            score += email_points
            factors["email_authority"] = email_points
        else:
            factors["email_authority"] = 0

        # Factor 2: Phone completeness (5 points)
        phone_points = self._calculate_phone_score(lead.phone)
        score += phone_points
        factors["phone_complete"] = phone_points

        # Factor 3: Estimated value tier (20 points max)
        value_points = self._calculate_value_tier_score(lead.estimated_value)
        score += value_points
        factors["value_tier"] = value_points

        # Factor 4: Source quality (15 points max)
        source_points = self._calculate_source_quality_score(lead.source)
        score += source_points
        factors["source_quality"] = source_points

        # Factor 5: Company size indicators from tags (25 points max)
        company_points = self._calculate_company_size_score(lead.tags)
        score += company_points
        factors["company_size"] = company_points

        # Factor 6: Recent engagement (15 points max)
        engagement_points = self._calculate_engagement_score(lead.last_contact_at)
        score += engagement_points
        factors["engagement"] = engagement_points

        return min(score, 100), factors

    def _calculate_email_authority_score(self, domain: str) -> int:
        """Calculate email domain authority score."""
        if not domain:
            return 0

        # Check exact domain matches
        if domain in self.ENTERPRISE_DOMAINS:
            return self.ENTERPRISE_DOMAINS[domain]

        # Check if it's a corporate domain (not free email)
        free_domains = {
            "gmail.com",
            "yahoo.com",
            "hotmail.com",
            "outlook.com",
            "uol.com.br",
            "terra.com.br",
            "globo.com",
            "bol.com.br",
        }

        if domain not in free_domains:
            # Corporate domain - give moderate score
            if domain.endswith(".com.br") or domain.endswith(".gov.br"):
                return 6  # Brazilian corporate
            elif domain.endswith(".edu"):
                return 5  # Educational
            else:
                return 4  # Other corporate

        return 2  # Free email domain

    def _calculate_phone_score(self, phone: Optional[str]) -> int:
        """Calculate phone completeness score."""
        if not phone:
            return 0

        # Remove formatting and check length
        cleaned_phone = re.sub(r"[^\d]", "", phone)

        # Brazilian phone: 11 digits (with area code) or 10 digits
        if len(cleaned_phone) >= 10:
            return 5
        elif len(cleaned_phone) >= 8:
            return 3
        else:
            return 1

    def _calculate_value_tier_score(self, estimated_value: Optional[Decimal]) -> int:
        """Calculate value tier score based on Brazilian market."""
        if not estimated_value or estimated_value <= 0:
            return 0

        value_float = float(estimated_value)

        # Brazilian agency pricing tiers (R$)
        if value_float >= 100000:  # R$ 100k+ (Enterprise)
            return 20
        elif value_float >= 50000:  # R$ 50k+ (Mid-market)
            return 15
        elif value_float >= 25000:  # R$ 25k+ (SMB High)
            return 12
        elif value_float >= 10000:  # R$ 10k+ (SMB)
            return 8
        elif value_float >= 5000:  # R$ 5k+ (Small)
            return 5
        else:
            return 2

    def _calculate_source_quality_score(self, source: str) -> int:
        """Calculate lead source quality score."""
        if not source:
            return 2

        source = source.lower()

        # High-quality sources (higher intent)
        source_scores = {
            "referral": 15,
            "partner": 14,
            "linkedin": 12,
            "google_ads": 10,
            "direct": 9,
            "website": 8,
            "webinar": 8,
            "content_download": 7,
            "facebook_ads": 6,
            "instagram_ads": 5,
            "cold_email": 4,
            "cold_call": 3,
            "trade_show": 6,
            "event": 7,
        }

        return source_scores.get(source, 3)  # Default score

    def _calculate_company_size_score(self, tags: Optional[List[str]]) -> int:
        """Calculate company size score from tags."""
        if not tags:
            return 5  # Default neutral score

        tags_lower = [tag.lower() for tag in tags]

        # Enterprise indicators (25 points)
        enterprise_tags = {"enterprise", "corporation", "multinacional", "holding"}
        if any(tag in tags_lower for tag in enterprise_tags):
            return 25

        # Large company indicators (20 points)
        large_company_tags = {"grande_empresa", "corporation", "s.a.", "ltda"}
        if any(tag in tags_lower for tag in large_company_tags):
            return 20

        # Medium company indicators (15 points)
        medium_tags = {"media_empresa", "startup", "scale_up", "agencia"}
        if any(tag in tags_lower for tag in medium_tags):
            return 15

        # Small business indicators (10 points)
        small_tags = {"pequena_empresa", "mei", "freelancer", "pj"}
        if any(tag in tags_lower for tag in small_tags):
            return 10

        return 8  # Unknown company size

    def _calculate_engagement_score(self, last_contact_at: Optional[datetime]) -> int:
        """Calculate engagement recency score."""
        if not last_contact_at:
            return 0

        now = datetime.now()
        if last_contact_at.tzinfo:
            now = now.replace(tzinfo=last_contact_at.tzinfo)

        days_since = (now - last_contact_at).days

        # Fresh engagement scores higher
        if days_since <= 1:
            return 15  # Very recent
        elif days_since <= 7:
            return 10  # Within week
        elif days_since <= 30:
            return 5  # Within month
        elif days_since <= 90:
            return 2  # Within quarter
        else:
            return 0  # Stale lead

    async def calculate_and_update_score(self, organization: Organization, lead_id: UUID) -> Dict:
        """Calculate and persist lead score with organization isolation.

        Args:
            organization: Current organization context
            lead_id: Lead UUID to score

        Returns:
            Dict with lead_id, score, factors, updated_at

        Raises:
            HTTPException: If lead not found or access denied
        """
        # Get lead with organization isolation
        lead = (
            self.db.query(Lead)
            .filter(Lead.id == lead_id, Lead.organization_id == organization.id)
            .first()
        )

        if not lead:
            raise HTTPException(status_code=404, detail="Lead not found or access denied")

        # Calculate new score
        score, factors = self.calculate_basic_score(lead)

        # Update lead with new score
        lead.lead_score = Decimal(str(score))
        lead.score_factors = factors

        # Generate duplicate check hash for future use
        if not lead.duplicate_check_hash:
            lead.duplicate_check_hash = self._generate_duplicate_hash(lead)

        self.db.commit()
        self.db.refresh(lead)

        return {
            "lead_id": str(lead.id),
            "lead_name": lead.name,
            "score": score,
            "factors": factors,
            "updated_at": datetime.now().isoformat(),
            "duplicate_hash": lead.duplicate_check_hash,
        }

    def _generate_duplicate_hash(self, lead: Lead) -> str:
        """Generate hash for duplicate detection."""
        # Normalize fields for hashing
        email_part = lead.email.lower().strip() if lead.email else ""
        phone_part = re.sub(r"\D", "", lead.phone or "")[-10:]  # Last 10 digits
        name_part = re.sub(r"\s+", "", lead.name.lower()) if lead.name else ""

        # Create composite hash
        hash_input = f"{email_part}|{phone_part}|{name_part}"
        return hashlib.sha256(hash_input.encode()).hexdigest()[:16]

    async def bulk_score_leads(
        self, organization: Organization, lead_ids: Optional[List[UUID]] = None
    ) -> Dict:
        """Bulk score multiple leads for organization.

        Args:
            organization: Organization context
            lead_ids: Optional list of specific lead IDs (if None, scores all)

        Returns:
            Dict with scoring results and statistics
        """
        # Build query with organization isolation
        query = self.db.query(Lead).filter(Lead.organization_id == organization.id)

        # Filter by specific leads if provided
        if lead_ids:
            query = query.filter(Lead.id.in_(lead_ids))

        leads = query.all()

        if not leads:
            return {
                "total_leads": 0,
                "scored_leads": 0,
                "average_score": 0,
                "score_distribution": {},
            }

        # Score all leads
        scored_count = 0
        total_score = 0
        score_ranges = {"0-25": 0, "26-50": 0, "51-75": 0, "76-100": 0}

        for lead in leads:
            score, factors = self.calculate_basic_score(lead)

            # Update lead
            lead.lead_score = Decimal(str(score))
            lead.score_factors = factors

            if not lead.duplicate_check_hash:
                lead.duplicate_check_hash = self._generate_duplicate_hash(lead)

            # Update statistics
            scored_count += 1
            total_score += score

            # Score distribution
            if score <= 25:
                score_ranges["0-25"] += 1
            elif score <= 50:
                score_ranges["26-50"] += 1
            elif score <= 75:
                score_ranges["51-75"] += 1
            else:
                score_ranges["76-100"] += 1

        self.db.commit()

        return {
            "total_leads": len(leads),
            "scored_leads": scored_count,
            "average_score": round(total_score / scored_count, 2) if scored_count > 0 else 0,
            "score_distribution": score_ranges,
            "organization_id": str(organization.id),
        }
