"""🏢 Organization Invite Service - Advanced Member Management.

Service for managing organization invitations with security, validation, and email integration.
"""
import secrets
import string
from datetime import datetime, timedelta, timezone
from typing import List, Optional, Tuple
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy import and_
from sqlalchemy.orm import Session, joinedload

from ..models.organization import OrganizationMember
from ..models.organization_invite import InviteStatus, OrganizationInvite, OrganizationRole
from ..models.user import User
from ..schemas.organization_invite import (
    OrganizationInviteCreate,
    OrganizationInviteResponse,
    OrganizationInviteStats,
)


class OrganizationInviteService:
    """Service for managing organization invitations."""

    def __init__(self, db: Session):
        """Initialize organization invite service with database session."""
        self.db = db

    def _generate_secure_token(self, length: int = 32) -> str:
        """Generate a cryptographically secure random token."""
        alphabet = string.ascii_letters + string.digits
        return "".join(secrets.choice(alphabet) for _ in range(length))

    def _generate_temp_password(self, length: int = 12) -> str:
        """Generate a secure temporary password."""
        # Mix of uppercase, lowercase, digits and special chars
        import secrets
        import string

        alphabet = string.ascii_letters + string.digits + "!@#$%&*"
        return "".join(secrets.choice(alphabet) for _ in range(length))

    def _hash_password(self, password: str) -> str:
        """Hash password using bcrypt."""
        from passlib.context import CryptContext

        pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
        return pwd_context.hash(password)

    def _validate_invite_permissions(
        self, organization_id: UUID, invited_by: User
    ) -> OrganizationMember:
        """Validate that user can send invites for this organization."""
        membership = (
            self.db.query(OrganizationMember)
            .filter(
                and_(
                    OrganizationMember.organization_id == organization_id,
                    OrganizationMember.user_id == invited_by.id,
                    OrganizationMember.is_active.is_(True),
                )
            )
            .first()
        )

        if not membership:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not a member of this organization",
            )

        # Only owners and admins can send invites
        if membership.role not in ["owner", "admin"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only owners and admins can send invites",
            )

        return membership

    def _validate_invite_role(
        self, invited_role: OrganizationRole, inviter_membership: OrganizationMember
    ) -> None:
        """Validate that inviter can assign the requested role."""
        inviter_role = inviter_membership.role

        # Role hierarchy validation
        role_hierarchy = {"owner": 4, "admin": 3, "member": 2, "viewer": 1}

        inviter_level = role_hierarchy.get(inviter_role, 0)
        invited_level = role_hierarchy.get(invited_role.value, 0)

        # Can't invite someone to a higher role than yourself
        if invited_level >= inviter_level:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Cannot invite user to role '{invited_role}' with your current role '{inviter_role}'",
            )

        # Only owners can create admins
        if invited_role == OrganizationRole.admin and inviter_role != "owner":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, detail="Only owners can invite admins"
            )

    def _check_existing_invite_or_member(self, organization_id: UUID, email: str) -> None:
        """Check if user is already a member or has a pending invite."""
        # Check if user is already a member
        existing_user = self.db.query(User).filter(User.email.ilike(email)).first()
        if existing_user:
            existing_membership = (
                self.db.query(OrganizationMember)
                .filter(
                    and_(
                        OrganizationMember.organization_id == organization_id,
                        OrganizationMember.user_id == existing_user.id,
                        OrganizationMember.is_active.is_(True),
                    )
                )
                .first()
            )

            if existing_membership:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="User is already a member of this organization",
                )

        # Check for existing pending invite
        existing_invite = (
            self.db.query(OrganizationInvite)
            .filter(
                and_(
                    OrganizationInvite.organization_id == organization_id,
                    OrganizationInvite.email.ilike(email),
                    OrganizationInvite.status == InviteStatus.pending,
                    OrganizationInvite.is_active.is_(True),
                )
            )
            .first()
        )

        if existing_invite and not existing_invite.is_expired:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="User already has a pending invite to this organization",
            )

    def create_invite(
        self, organization_id: UUID, invite_data: OrganizationInviteCreate, invited_by: User
    ) -> OrganizationInvite:
        """Create a new organization invite."""
        # Validate permissions
        inviter_membership = self._validate_invite_permissions(organization_id, invited_by)

        # Validate role assignment
        self._validate_invite_role(invite_data.role, inviter_membership)

        # Check for conflicts
        self._check_existing_invite_or_member(organization_id, invite_data.email)

        # Generate secure token
        token = self._generate_secure_token()

        # Create invite
        invite = OrganizationInvite(
            organization_id=organization_id,
            invited_by_id=invited_by.id,
            email=invite_data.email.lower(),
            role=invite_data.role,
            message=invite_data.message,
            invited_name=invite_data.invited_name,
            token=token,
            expires_at=datetime.utcnow() + timedelta(days=7),
        )

        self.db.add(invite)
        self.db.commit()
        self.db.refresh(invite)

        # Send invitation email
        self._send_invitation_email(invite)

        return invite

    def get_organization_invites(
        self,
        organization_id: UUID,
        user: User,
        status_filter: Optional[InviteStatus] = None,
        limit: int = 50,
        offset: int = 0,
    ) -> Tuple[List[OrganizationInviteResponse], int]:
        """Get invites for an organization with pagination."""
        # Validate permissions
        self._validate_invite_permissions(organization_id, user)

        # Build query
        query = (
            self.db.query(OrganizationInvite)
            .options(
                joinedload(OrganizationInvite.invited_by),
                joinedload(OrganizationInvite.organization),
            )
            .filter(OrganizationInvite.organization_id == organization_id)
        )

        if status_filter:
            query = query.filter(OrganizationInvite.status == status_filter)

        # Get total count
        total = query.count()

        # Get paginated results
        invites = (
            query.order_by(OrganizationInvite.created_at.desc()).limit(limit).offset(offset).all()
        )

        # Convert to response format
        response_invites = []
        for invite in invites:
            # Compute properties safely

            now = datetime.now(timezone.utc)
            expires_at = (
                invite.expires_at.replace(tzinfo=timezone.utc)
                if invite.expires_at.tzinfo is None
                else invite.expires_at
            )
            is_expired = now > expires_at
            is_pending = invite.status.value == "pending" and not is_expired and invite.is_active
            can_be_accepted = is_pending
            can_be_cancelled = invite.status.value == "pending" and invite.is_active

            response_invite = OrganizationInviteResponse(
                id=invite.id,
                organization_id=invite.organization_id,
                invited_by_id=invite.invited_by_id,
                email=invite.email,
                role=invite.role,
                message=invite.message,
                invited_name=invite.invited_name,
                status=invite.status,
                created_at=invite.created_at,
                expires_at=invite.expires_at,
                responded_at=invite.responded_at,
                is_active=invite.is_active,
                # Computed properties
                is_expired=is_expired,
                is_pending=is_pending,
                can_be_accepted=can_be_accepted,
                can_be_cancelled=can_be_cancelled,
            )
            response_invites.append(response_invite)

        return response_invites, total

    def get_invite_by_token(self, token: str) -> OrganizationInvite:
        """Get invite by token for public access."""
        invite = (
            self.db.query(OrganizationInvite)
            .options(
                joinedload(OrganizationInvite.organization),
                joinedload(OrganizationInvite.invited_by),
            )
            .filter(OrganizationInvite.token == token)
            .first()
        )

        if not invite:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invite not found")

        # Mark expired invites
        if invite.is_expired and invite.status == InviteStatus.pending:
            invite.mark_expired()
            self.db.commit()

        return invite

    def accept_invite(
        self, token: str, accepting_user: Optional[User] = None
    ) -> Tuple[OrganizationInvite, OrganizationMember]:
        """Accept an organization invite."""
        invite = self.get_invite_by_token(token)

        if not invite.can_be_accepted:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invite cannot be accepted (status: {invite.status})",
            )

        # If user provided, validate email matches
        if accepting_user and accepting_user.email.lower() != invite.email.lower():
            import logging

            logger = logging.getLogger(__name__)
            logger.warning(
                f"Email mismatch: User email '{accepting_user.email}' vs Invite email '{invite.email}'"
            )

            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Este convite foi enviado para '{invite.email}', mas você está logado como '{accepting_user.email}'. Por favor, faça login com o email correto ou peça um novo convite.",
            )

        # Check if user already exists
        existing_user = self.db.query(User).filter(User.email.ilike(invite.email)).first()

        if existing_user:
            # User exists - check if already a member
            existing_membership = (
                self.db.query(OrganizationMember)
                .filter(
                    and_(
                        OrganizationMember.organization_id == invite.organization_id,
                        OrganizationMember.user_id == existing_user.id,
                        OrganizationMember.is_active.is_(True),
                    )
                )
                .first()
            )

            if existing_membership:
                # Accept the invite but don't create duplicate membership
                invite.accept_invite()
                self.db.commit()
                return invite, existing_membership

            # Create membership for existing user
            membership = OrganizationMember(
                organization_id=invite.organization_id,
                user_id=existing_user.id,
                role=invite.role.value,
                is_active=True,
            )
            self.db.add(membership)
            invite.accept_invite()
            self.db.commit()
            return invite, membership

        else:
            # 🚀 NOVO FLUXO: User doesn't exist - create automatically with temp password
            temp_password = self._generate_temp_password()

            # Create user with temporary password
            new_user = User(
                email=invite.email.lower(),
                full_name=invite.invited_name or invite.email.split("@")[0],
                hashed_password=self._hash_password(temp_password),
                is_active=True,
                is_verified=True,  # Auto-verify since they accepted invite
                must_change_password=True,  # Force password change on first login
            )
            self.db.add(new_user)
            self.db.flush()  # Get user ID

            # Create membership
            membership = OrganizationMember(
                organization_id=invite.organization_id,
                user_id=new_user.id,
                role=invite.role.value,
                is_active=True,
            )
            self.db.add(membership)

            # Accept the invite
            invite.accept_invite()
            self.db.commit()

            # Send email with temporary password
            self._send_temp_password_email(new_user, temp_password, invite.organization)

            return invite, membership

    def reject_invite(self, token: str, reason: Optional[str] = None) -> OrganizationInvite:
        """Reject an organization invite."""
        invite = self.get_invite_by_token(token)

        if not invite.can_be_accepted:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invite cannot be rejected (status: {invite.status})",
            )

        invite.reject_invite()
        self.db.commit()

        # Notify inviter of rejection
        self._notify_invite_rejection(invite, reason)

        return invite

    def cancel_invite(
        self, invite_id: UUID, organization_id: UUID, user: User, reason: Optional[str] = None
    ) -> OrganizationInvite:
        """Cancel a pending invite."""
        # Validate permissions
        self._validate_invite_permissions(organization_id, user)

        invite = (
            self.db.query(OrganizationInvite)
            .filter(
                and_(
                    OrganizationInvite.id == invite_id,
                    OrganizationInvite.organization_id == organization_id,
                )
            )
            .first()
        )

        if not invite:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invite not found")

        if not invite.can_be_cancelled:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invite cannot be cancelled (status: {invite.status})",
            )

        invite.cancel_invite()
        self.db.commit()

        return invite

    def get_invite_stats(self, organization_id: UUID, user: User) -> OrganizationInviteStats:
        """Get invitation statistics for an organization."""
        # Validate permissions
        self._validate_invite_permissions(organization_id, user)

        # Get counts by status
        stats_query = self.db.query(OrganizationInvite).filter(
            OrganizationInvite.organization_id == organization_id
        )

        total_invites = stats_query.count()
        pending_invites = stats_query.filter(
            OrganizationInvite.status == InviteStatus.pending
        ).count()
        accepted_invites = stats_query.filter(
            OrganizationInvite.status == InviteStatus.accepted
        ).count()
        rejected_invites = stats_query.filter(
            OrganizationInvite.status == InviteStatus.rejected
        ).count()
        expired_invites = stats_query.filter(
            OrganizationInvite.status == InviteStatus.expired
        ).count()
        cancelled_invites = stats_query.filter(
            OrganizationInvite.status == InviteStatus.cancelled
        ).count()

        return OrganizationInviteStats(
            total_invites=total_invites,
            pending_invites=pending_invites,
            accepted_invites=accepted_invites,
            rejected_invites=rejected_invites,
            expired_invites=expired_invites,
            cancelled_invites=cancelled_invites,
        )

    def cleanup_expired_invites(self, organization_id: Optional[UUID] = None) -> int:
        """Mark expired invites as expired and return count."""
        query = self.db.query(OrganizationInvite).filter(
            and_(
                OrganizationInvite.status == InviteStatus.pending,
                OrganizationInvite.expires_at < datetime.utcnow(),
                OrganizationInvite.is_active.is_(True),
            )
        )

        if organization_id:
            query = query.filter(OrganizationInvite.organization_id == organization_id)

        expired_invites = query.all()
        count = len(expired_invites)

        for invite in expired_invites:
            invite.mark_expired()

        if count > 0:
            self.db.commit()

        return count

    def _send_invitation_email(self, invite: OrganizationInvite) -> None:
        """Send invitation email to the invitee."""
        try:
            # Get organization and inviter details
            organization = invite.organization
            inviter = invite.invited_by

            # Create invitation URL
            invitation_url = f"{self._get_frontend_url()}/invites/{invite.token}/accept"

            # Prepare email content
            subject = f"Você foi convidado para {organization.name}"

            # HTML email template
            html_content = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <style>
                    body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }}
                    .container {{ background: #f8f9fa; padding: 20px; border-radius: 10px; }}
                    .header {{ background-color: #007bff; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; margin: -20px -20px 20px -20px; }}
                    .content {{ padding: 20px 0; }}
                    .button {{ display: inline-block; padding: 12px 24px; background-color: #28a745; color: white; text-decoration: none; border-radius: 5px; }}
                    .footer {{ margin-top: 30px; font-size: 12px; color: #666; text-align: center; }}
                    .info-box {{ background: #e3f2fd; padding: 15px; border-radius: 5px; margin: 15px 0; }}
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🎉 Convite para Equipe</h1>
                    </div>
                    <div class="content">
                        <p>Olá{" " + invite.invited_name if invite.invited_name else ""}!</p>
                        
                        <p><strong>{inviter.full_name}</strong> convidou você para se juntar à organização <strong>{organization.name}</strong> como <strong>{invite.role.value}</strong>.</p>
                        
                        {f'<div class="info-box"><p><em>"{invite.message}"</em></p></div>' if invite.message else ''}
                        
                        <p>Clique no botão abaixo para aceitar este convite:</p>
                        
                        <p style="text-align: center; margin: 30px 0;">
                            <a href="{invitation_url}" class="button">✅ Aceitar Convite</a>
                        </p>
                        
                        <p>Ou copie e cole este link no seu navegador:</p>
                        <p style="word-break: break-all; color: #007bff;"><a href="{invitation_url}">{invitation_url}</a></p>
                        
                        <p><strong>⏰ Este convite expira em {invite.expires_at.strftime('%d/%m/%Y às %H:%M')}.</strong></p>
                        
                        <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
                        
                        <p style="color: #666; font-size: 14px;">
                            Se você não esperava este convite, pode ignorar este email com segurança.
                        </p>
                    </div>
                    <div class="footer">
                        <p>Este email foi enviado pelo sistema de convites de {organization.name}</p>
                    </div>
                </div>
            </body>
            </html>
            """

            # Import email service
            import logging

            logger = logging.getLogger(__name__)

            logger.info(f"📧 Sending invitation email to {invite.email}")
            logger.info(f"📧 Organization: {organization.name}")
            logger.info(f"📧 Invited by: {inviter.full_name}")
            logger.info(f"📧 Invitation URL: {invitation_url}")

            # Send email using the existing email service
            success = self._send_invite_email_smtp(
                to_email=invite.email,
                subject=subject,
                html_content=html_content,
                invited_name=invite.invited_name,
            )

            if success:
                logger.info(f"✅ Invitation email sent successfully to {invite.email}")
            else:
                logger.warning(
                    f"⚠️ Failed to send invitation email to {invite.email} (but invite still created)"
                )

        except Exception as e:
            import logging

            logger = logging.getLogger(__name__)
            logger.error(f"❌ Failed to send invitation email to {invite.email}: {e}")
            # Don't raise exception - invitation should still work without email

    def _send_invite_email_smtp(
        self, to_email: str, subject: str, html_content: str, invited_name: Optional[str] = None
    ) -> bool:
        """Send invitation email using SMTP service."""
        try:
            import smtplib
            from email.mime import multipart as mime_multipart, text as mime_text

            from ..core.config import settings

            # Check if email is enabled
            if not settings.EMAIL_ENABLED:
                import logging

                logger = logging.getLogger(__name__)
                logger.warning("Email sending is disabled")
                return False

            if not all([settings.SMTP_HOST, settings.SMTP_USER, settings.SMTP_PASSWORD]):
                import logging

                logger = logging.getLogger(__name__)
                logger.error("Email configuration incomplete")
                return False

            # Create message
            msg = mime_multipart.MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = settings.EMAIL_FROM
            msg["To"] = to_email

            # Attach HTML content
            html_part = mime_text.MIMEText(html_content, "html")
            msg.attach(html_part)

            # Send email
            with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
                server.starttls()
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
                server.send_message(msg)

            return True

        except Exception as e:
            import logging

            logger = logging.getLogger(__name__)
            logger.error(f"SMTP error sending invitation to {to_email}: {e}")
            return False

    def _send_temp_password_email(self, user: User, temp_password: str, organization) -> None:
        """Send temporary password email to new user."""
        try:
            import logging

            logger = logging.getLogger(__name__)

            # Prepare email content
            subject = f"Bem-vindo à {organization.name} - Sua senha temporária"

            # HTML email template
            html_content = f"""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <style>
                    body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }}
                    .container {{ background: #f8f9fa; padding: 20px; border-radius: 10px; }}
                    .header {{ background-color: #28a745; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; margin: -20px -20px 20px -20px; }}
                    .content {{ padding: 20px 0; }}
                    .password-box {{ background: #fff3cd; border: 2px solid #ffc107; padding: 15px; border-radius: 5px; margin: 15px 0; text-align: center; }}
                    .password {{ font-family: monospace; font-size: 18px; font-weight: bold; color: #856404; letter-spacing: 2px; }}
                    .button {{ display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; }}
                    .footer {{ margin-top: 30px; font-size: 12px; color: #666; text-align: center; }}
                    .warning {{ background: #f8d7da; border: 1px solid #f5c6cb; padding: 15px; border-radius: 5px; color: #721c24; margin: 15px 0; }}
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🎉 Sua conta foi criada!</h1>
                    </div>
                    <div class="content">
                        <p>Olá <strong>{user.full_name}</strong>!</p>
                        
                        <p>Sua conta foi criada automaticamente na organização <strong>{organization.name}</strong>. Você já pode fazer login no sistema!</p>
                        
                        <div class="password-box">
                            <p><strong>🔑 Sua senha temporária:</strong></p>
                            <div class="password">{temp_password}</div>
                        </div>
                        
                        <div class="warning">
                            <p><strong>⚠️ IMPORTANTE:</strong></p>
                            <ul style="margin: 10px 0; padding-left: 20px;">
                                <li>Esta é uma senha temporária</li>
                                <li>Você será obrigado a criar uma nova senha no primeiro login</li>
                                <li>Copie e guarde esta senha temporária com segurança</li>
                            </ul>
                        </div>
                        
                        <p style="text-align: center; margin: 30px 0;">
                            <a href="{self._get_frontend_url()}/auth/login?email={user.email}" class="button">🚀 Fazer Login Agora</a>
                        </p>
                        
                        <p><strong>Dados para login:</strong></p>
                        <ul>
                            <li><strong>Email:</strong> {user.email}</li>
                            <li><strong>Senha:</strong> {temp_password} (temporária)</li>
                        </ul>
                        
                        <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
                        
                        <p style="color: #666; font-size: 14px;">
                            Se você não esperava este email, pode ignorá-lo com segurança.
                        </p>
                    </div>
                    <div class="footer">
                        <p>Este email foi enviado pelo sistema de convites de {organization.name}</p>
                    </div>
                </div>
            </body>
            </html>
            """

            logger.info(f"📧 Sending temporary password email to {user.email}")
            logger.info(f"📧 Organization: {organization.name}")
            # 🔒 SECURITY: Log without exposing temporary password
            logger.info("📧 Temporary password generated for user invitation")

            # Send email using SMTP
            success = self._send_invite_email_smtp(
                to_email=user.email,
                subject=subject,
                html_content=html_content,
                invited_name=user.full_name,
            )

            if success:
                logger.info(f"✅ Temporary password email sent successfully to {user.email}")
            else:
                logger.warning(f"⚠️ Failed to send temporary password email to {user.email}")

        except Exception as e:
            import logging

            logger = logging.getLogger(__name__)
            logger.error(f"❌ Failed to send temporary password email to {user.email}: {e}")

    def _get_frontend_url(self) -> str:
        """Get the frontend URL for creating invitation links."""
        from ..core.config import settings

        return getattr(settings, "FRONTEND_URL", "http://localhost:3000")

    def _notify_invite_rejection(
        self, invite: OrganizationInvite, reason: Optional[str] = None
    ) -> None:
        """Notify the inviter that their invitation was rejected."""
        try:
            # Get organization and inviter details
            organization = invite.organization
            inviter = invite.invited_by

            # Prepare email content
            subject = f"Invitation to {organization.name} was declined"

            # TODO: Implement HTML email template for invitation declined notification
            # html_content would be used here for email service integration

            # For now, just log the notification (in production, use actual email service)
            import logging

            logger = logging.getLogger(__name__)

            logger.info(f"📧 REJECTION NOTIFICATION SENT TO: {inviter.email}")
            logger.info(f"📧 SUBJECT: {subject}")
            logger.info(f"📧 REJECTED INVITE: {invite.email}")
            logger.info(f"📧 ORGANIZATION: {organization.name}")
            if reason:
                logger.info(f"📧 REJECTION REASON: {reason}")

            # TODO: Replace with actual email service integration
            # email_service.send_email(
            #     to=inviter.email,
            #     subject=subject,
            #     html_content=html_content
            # )

        except Exception as e:
            import logging

            logger = logging.getLogger(__name__)
            logger.error(f"Failed to send rejection notification to {invite.invited_by.email}: {e}")
            # Don't raise exception - rejection should still work without notification
