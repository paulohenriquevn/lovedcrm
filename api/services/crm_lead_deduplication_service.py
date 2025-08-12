"""CRM Lead Deduplication Service.

Advanced duplicate detection using fuzzy matching algorithms.
Supports merge operations with audit trail and organization isolation.
"""

import hashlib
import re
from datetime import datetime
from typing import Dict, List, Optional, Tuple
from uuid import UUID

from fastapi import HTTPException
from fuzzywuzzy import fuzz
from sqlalchemy.orm import Session

from ..models.crm_lead import Lead
from ..models.organization import Organization


class LeadDeduplicationService:
    """Lead duplicate detection service with organization isolation.

    Features:
    - Fuzzy name matching with configurable thresholds
    - Exact email and normalized phone matching
    - Multiple merge strategies with audit trails
    - Organization-scoped operations only
    """

    # Similarity thresholds for duplicate detection
    SIMILARITY_THRESHOLDS = {
        "exact_email_match": 100,  # Definite duplicate
        "phone_normalized": 95,  # Very likely duplicate
        "name_similarity_high": 85,  # High confidence
        "name_similarity_medium": 70,  # Medium confidence
        "email_domain_match": 60,  # Same domain, different emails
        "minimum_threshold": 70,  # Minimum to consider duplicate
    }

    def __init__(self, db: Session):
        """Initialize deduplication service."""
        self.db = db

    def normalize_phone(self, phone: Optional[str]) -> str:
        """Normalize phone number for comparison."""
        if not phone:
            return ""

        # Remove all non-numeric characters
        digits_only = re.sub(r"\D", "", phone)

        # Return last 10-11 digits (Brazilian phone format)
        return digits_only[-11:] if len(digits_only) >= 11 else digits_only[-10:]

    def normalize_name(self, name: Optional[str]) -> str:
        """Normalize name for comparison."""
        if not name:
            return ""

        # Convert to lowercase, remove extra spaces, special characters
        normalized = re.sub(r"[^\w\s]", "", name.lower())
        return " ".join(normalized.split())

    def generate_duplicate_hash(self, lead: Lead) -> str:
        """Generate hash for quick duplicate detection."""
        email_part = lead.email.lower().strip() if lead.email else ""
        phone_part = self.normalize_phone(lead.phone)
        name_part = self.normalize_name(lead.name)

        hash_input = f"{email_part}|{phone_part}|{name_part}"
        return hashlib.sha256(hash_input.encode()).hexdigest()[:16]

    def find_potential_duplicates(
        self, organization: Organization, target_lead: Optional[Lead] = None, limit: int = 50
    ) -> List[Dict]:
        """Find potential duplicate leads using multiple algorithms.

        Args:
            organization: Organization context for isolation
            target_lead: Optional specific lead to check (if None, checks all)
            limit: Maximum duplicates to return

        Returns:
            List of duplicate pairs with similarity scores and factors
        """
        # Get all leads for organization
        query = self.db.query(Lead).filter(Lead.organization_id == organization.id)

        if target_lead:
            # Check specific lead against all others
            all_leads = query.filter(Lead.id != target_lead.id).all()
            leads_to_check = [target_lead]
        else:
            # Check all leads against each other
            all_leads = query.all()
            leads_to_check = all_leads

        duplicates = []

        for lead1 in leads_to_check:
            for lead2 in all_leads:
                if lead1.id == lead2.id:
                    continue

                similarity_score, factors = self._calculate_similarity(lead1, lead2)

                # Only include if above minimum threshold
                if similarity_score >= self.SIMILARITY_THRESHOLDS["minimum_threshold"]:
                    duplicates.append(
                        {
                            "original_lead": {
                                "id": str(lead1.id),
                                "name": lead1.name,
                                "email": lead1.email,
                                "phone": lead1.phone,
                                "created_at": lead1.created_at.isoformat(),
                                "lead_score": float(lead1.lead_score) if lead1.lead_score else 0,
                            },
                            "potential_duplicate": {
                                "id": str(lead2.id),
                                "name": lead2.name,
                                "email": lead2.email,
                                "phone": lead2.phone,
                                "created_at": lead2.created_at.isoformat(),
                                "lead_score": float(lead2.lead_score) if lead2.lead_score else 0,
                            },
                            "similarity_score": similarity_score,
                            "matching_factors": factors,
                            "confidence_level": self._get_confidence_level(similarity_score),
                            "recommended_action": self._get_recommended_action(
                                similarity_score, factors
                            ),
                        }
                    )

        # Remove reverse duplicates and sort by similarity
        unique_duplicates = self._remove_reverse_duplicates(duplicates)
        return sorted(unique_duplicates, key=lambda x: x["similarity_score"], reverse=True)[:limit]

    def _check_exact_email_match(self, lead1: Lead, lead2: Lead) -> Tuple[bool, int, List[str]]:
        """Check for exact email match."""
        if (
            lead1.email
            and lead2.email
            and lead1.email.lower().strip() == lead2.email.lower().strip()
        ):
            return True, 100, ["email_exact_match"]
        return False, 0, []

    def _calculate_phone_similarity(self, lead1: Lead, lead2: Lead) -> Tuple[int, List[str]]:
        """Calculate phone number similarity score."""
        phone1 = self.normalize_phone(lead1.phone)
        phone2 = self.normalize_phone(lead2.phone)
        if phone1 and phone2 and len(phone1) >= 8 and phone1 == phone2:
            return 40, ["phone_exact_match"]
        return 0, []

    def _calculate_name_similarity(self, lead1: Lead, lead2: Lead) -> Tuple[int, List[str]]:
        """Calculate name similarity score using fuzzy matching."""
        if not (lead1.name and lead2.name):
            return 0, []

        name_similarity = fuzz.ratio(
            self.normalize_name(lead1.name), self.normalize_name(lead2.name)
        )

        if name_similarity >= 90:
            return 35, ["name_very_high_similarity"]
        elif name_similarity >= 80:
            return 25, ["name_high_similarity"]
        elif name_similarity >= 70:
            return 15, ["name_medium_similarity"]

        return 0, []

    def _calculate_domain_similarity(self, lead1: Lead, lead2: Lead) -> Tuple[int, List[str]]:
        """Calculate email domain similarity score."""
        if not (lead1.email and lead2.email):
            return 0, []

        domain1 = lead1.email.split("@")[1] if "@" in lead1.email else ""
        domain2 = lead2.email.split("@")[1] if "@" in lead2.email else ""

        if domain1 and domain2 and domain1.lower() == domain2.lower():
            return 15, ["email_domain_match"]

        return 0, []

    def _calculate_value_similarity(self, lead1: Lead, lead2: Lead) -> Tuple[int, List[str]]:
        """Calculate estimated value similarity score."""
        if not (lead1.estimated_value and lead2.estimated_value):
            return 0, []

        value1 = float(lead1.estimated_value)
        value2 = float(lead2.estimated_value)
        max_value = max(value1, value2)

        if max_value > 0:
            diff_ratio = abs(value1 - value2) / max_value
            if diff_ratio < 0.1:  # Within 10%
                return 10, ["similar_value_exact"]
            elif diff_ratio < 0.3:  # Within 30%
                return 5, ["similar_value_close"]

        return 0, []

    def _calculate_tag_similarity(self, lead1: Lead, lead2: Lead) -> Tuple[int, List[str]]:
        """Calculate common tags similarity score."""
        tags1 = set((lead1.tags or []))
        tags2 = set((lead2.tags or []))
        common_tags = tags1.intersection(tags2)

        if common_tags:
            tag_score = min(len(common_tags) * 3, 10)
            return tag_score, ["common_tags"]

        return 0, []

    def _calculate_source_similarity(self, lead1: Lead, lead2: Lead) -> Tuple[int, List[str]]:
        """Calculate source similarity score."""
        if lead1.source and lead2.source and lead1.source.lower() == lead2.source.lower():
            return 5, ["same_source"]
        return 0, []

    def _calculate_similarity(self, lead1: Lead, lead2: Lead) -> Tuple[int, List[str]]:
        """Calculate similarity percentage between two leads."""
        # Check for exact email match first (definitive duplicate)
        is_exact_match, exact_score, exact_factors = self._check_exact_email_match(lead1, lead2)
        if is_exact_match:
            return exact_score, exact_factors

        # Calculate individual similarity components
        total_score = 0
        all_factors = []

        similarity_checks = [
            self._calculate_phone_similarity,
            self._calculate_name_similarity,
            self._calculate_domain_similarity,
            self._calculate_value_similarity,
            self._calculate_tag_similarity,
            self._calculate_source_similarity,
        ]

        for check_func in similarity_checks:
            score, factors = check_func(lead1, lead2)
            total_score += score
            all_factors.extend(factors)

        return min(total_score, 100), all_factors

    def _get_confidence_level(self, similarity_score: int) -> str:
        """Get confidence level based on similarity score."""
        if similarity_score >= 95:
            return "very_high"
        elif similarity_score >= 85:
            return "high"
        elif similarity_score >= 75:
            return "medium"
        else:
            return "low"

    def _get_recommended_action(self, similarity_score: int, factors: List[str]) -> str:
        """Get recommended action based on similarity."""
        if "email_exact_match" in factors:
            return "auto_merge"
        elif similarity_score >= 90:
            return "merge_recommended"
        elif similarity_score >= 80:
            return "review_required"
        else:
            return "monitor"

    def _remove_reverse_duplicates(self, duplicates: List[Dict]) -> List[Dict]:
        """Remove reverse duplicate entries (A->B and B->A)."""
        seen_pairs = set()
        unique_duplicates = []

        for dup in duplicates:
            id1 = dup["original_lead"]["id"]
            id2 = dup["potential_duplicate"]["id"]

            # Create sorted tuple to identify unique pairs
            pair = tuple(sorted([id1, id2]))

            if pair not in seen_pairs:
                seen_pairs.add(pair)
                unique_duplicates.append(dup)

        return unique_duplicates

    async def merge_leads(
        self,
        organization: Organization,
        primary_lead_id: UUID,
        duplicate_lead_id: UUID,
        merge_strategy: str = "keep_best_data",
        notes: Optional[str] = None,
    ) -> Dict:
        """Merge duplicate leads with specified strategy.

        Args:
            organization: Organization context
            primary_lead_id: Lead to keep as primary
            duplicate_lead_id: Lead to merge into primary
            merge_strategy: 'keep_original', 'keep_recent', 'keep_best_data'
            notes: Optional merge notes

        Returns:
            Dict with merge results and audit information
        """
        # Get both leads with organization isolation
        primary = (
            self.db.query(Lead)
            .filter(Lead.id == primary_lead_id, Lead.organization_id == organization.id)
            .first()
        )

        duplicate = (
            self.db.query(Lead)
            .filter(Lead.id == duplicate_lead_id, Lead.organization_id == organization.id)
            .first()
        )

        if not primary or not duplicate:
            raise HTTPException(
                status_code=404, detail="One or both leads not found or access denied"
            )

        if primary.id == duplicate.id:
            raise HTTPException(status_code=400, detail="Cannot merge lead with itself")

        # Execute merge strategy
        original_data = self._capture_lead_data(primary)

        if merge_strategy == "keep_original":
            # Keep primary data, just merge notes and tags
            self._merge_supplementary_data(primary, duplicate)

        elif merge_strategy == "keep_recent":
            # Use data from most recently updated lead
            if duplicate.updated_at > primary.updated_at:
                self._merge_field_data(primary, duplicate, prefer_source=False)
            self._merge_supplementary_data(primary, duplicate)

        elif merge_strategy == "keep_best_data":
            # Intelligent merge - keep best quality data from each field
            self._merge_field_data(primary, duplicate, prefer_source=True)
            self._merge_supplementary_data(primary, duplicate)

        # Create audit trail
        merge_audit = {
            "merged_lead_id": str(duplicate.id),
            "merge_strategy": merge_strategy,
            "merge_timestamp": datetime.now().isoformat(),
            "merged_by": "system",  # Could be user_id if available
            "original_data": original_data,
            "duplicate_data": self._capture_lead_data(duplicate),
            "notes": notes,
        }

        # Update primary lead metadata
        primary.lead_metadata = {
            **(primary.lead_metadata or {}),
            "merge_history": (primary.lead_metadata.get("merge_history", []) + [merge_audit]),
        }

        # Soft delete the duplicate (for recovery)
        duplicate.tags = (duplicate.tags or []) + ["MERGED_DUPLICATE"]
        duplicate.notes = f"[MERGED TO {primary.id}] {duplicate.notes or ''}"

        # Mark as merged but don't actually delete for audit purposes
        duplicate.lead_metadata = {
            **(duplicate.lead_metadata or {}),
            "merged_to_lead_id": str(primary.id),
            "merge_timestamp": datetime.now().isoformat(),
        }

        self.db.commit()
        self.db.refresh(primary)

        return {
            "success": True,
            "primary_lead_id": str(primary.id),
            "merged_lead_id": str(duplicate.id),
            "merge_strategy": merge_strategy,
            "audit_trail": merge_audit,
            "merged_at": datetime.now().isoformat(),
        }

    def _capture_lead_data(self, lead: Lead) -> Dict:
        """Capture lead data for audit purposes."""
        return {
            "id": str(lead.id),
            "name": lead.name,
            "email": lead.email,
            "phone": lead.phone,
            "source": lead.source,
            "estimated_value": float(lead.estimated_value) if lead.estimated_value else None,
            "tags": lead.tags,
            "notes": lead.notes,
            "lead_score": float(lead.lead_score) if lead.lead_score else None,
            "stage": lead.stage,
            "created_at": lead.created_at.isoformat(),
            "updated_at": lead.updated_at.isoformat(),
        }

    def _merge_email_field(self, primary: Lead, duplicate: Lead, prefer_source: bool) -> None:
        """Merge email field with quality preference."""
        if not primary.email and duplicate.email:
            primary.email = duplicate.email
        elif duplicate.email and prefer_source:
            primary_domain = (
                primary.email.split("@")[1] if primary.email and "@" in primary.email else ""
            )
            dup_domain = duplicate.email.split("@")[1] if "@" in duplicate.email else ""

            # Prefer corporate domain over consumer domains
            consumer_domains = {"gmail.com", "yahoo.com", "hotmail.com", "outlook.com"}
            if primary_domain in consumer_domains and dup_domain not in consumer_domains:
                primary.email = duplicate.email

    def _merge_phone_field(self, primary: Lead, duplicate: Lead, prefer_source: bool) -> None:
        """Merge phone field with length preference."""
        if not primary.phone and duplicate.phone:
            primary.phone = duplicate.phone
        elif duplicate.phone and prefer_source:
            primary_digits = len(re.sub(r"\D", "", primary.phone or ""))
            dup_digits = len(re.sub(r"\D", "", duplicate.phone or ""))
            if dup_digits > primary_digits:
                primary.phone = duplicate.phone

    def _merge_value_field(self, primary: Lead, duplicate: Lead, prefer_source: bool) -> None:
        """Merge estimated value field with higher value preference."""
        if (not primary.estimated_value and duplicate.estimated_value) or (
            duplicate.estimated_value
            and prefer_source
            and duplicate.estimated_value > (primary.estimated_value or 0)
        ):
            primary.estimated_value = duplicate.estimated_value

    def _merge_score_field(self, primary: Lead, duplicate: Lead) -> None:
        """Merge lead score field with higher score preference."""
        if duplicate.lead_score and (
            not primary.lead_score or duplicate.lead_score > primary.lead_score
        ):
            primary.lead_score = duplicate.lead_score
            primary.score_factors = duplicate.score_factors

    def _merge_field_data(self, primary: Lead, duplicate: Lead, prefer_source: bool = True):
        """Merge field data between leads based on quality."""
        self._merge_email_field(primary, duplicate, prefer_source)
        self._merge_phone_field(primary, duplicate, prefer_source)
        self._merge_value_field(primary, duplicate, prefer_source)
        self._merge_score_field(primary, duplicate)

    def _merge_supplementary_data(self, primary: Lead, duplicate: Lead):
        """Merge notes, tags, and other supplementary data."""
        # Merge tags (unique only)
        primary_tags = set(primary.tags or [])
        duplicate_tags = set(duplicate.tags or [])
        merged_tags = list(primary_tags.union(duplicate_tags))
        primary.tags = merged_tags

        # Merge notes
        if duplicate.notes:
            if primary.notes:
                primary.notes = f"{primary.notes}\n\n[MERGED NOTES] {duplicate.notes}"
            else:
                primary.notes = duplicate.notes

        # Keep most recent contact information
        if duplicate.last_contact_at and (
            not primary.last_contact_at or duplicate.last_contact_at > primary.last_contact_at
        ):
            primary.last_contact_at = duplicate.last_contact_at
            primary.last_contact_channel = duplicate.last_contact_channel
