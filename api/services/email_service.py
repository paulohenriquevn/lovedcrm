"""Email service for sending emails using SMTP."""
import logging
import smtplib
from email.mime import multipart as mime_multipart, text as mime_text
from typing import Optional

from ..core.config import settings

logger = logging.getLogger(__name__)


class EmailService:
    """Simple email service using SMTP."""

    def __init__(self):
        """Initialize email service with SMTP configuration."""
        self.smtp_host = settings.SMTP_HOST
        self.smtp_port = settings.SMTP_PORT
        self.smtp_user = settings.SMTP_USER
        self.smtp_password = settings.SMTP_PASSWORD
        self.email_from = settings.EMAIL_FROM
        self.email_enabled = settings.EMAIL_ENABLED

    def _create_reset_email_html(self, reset_link: str, user_name: str = "User") -> str:
        """Create HTML content for password reset email."""
        return f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Password Reset - {settings.APP_NAME}</title>
        </head>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: #f8f9fa; padding: 20px; border-radius: 10px;">
                <h2 style="color: #333; text-align: center;">Password Reset Request</h2>
                
                <p>Hello {user_name},</p>
                
                <p>You requested to reset your password for your {settings.APP_NAME} account.</p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="{reset_link}" 
                       style="background: #007bff; color: white; padding: 12px 24px; 
                              text-decoration: none; border-radius: 5px; display: inline-block;">
                        Reset Password
                    </a>
                </div>
                
                <p>If the button doesn't work, copy and paste this link into your browser:</p>
                <p style="word-break: break-all; color: #007bff;">{reset_link}</p>
                
                <p><strong>This link will expire in 1 hour.</strong></p>
                
                <p>If you didn't request this password reset, please ignore this email.</p>
                
                <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
                <p style="color: #666; font-size: 12px; text-align: center;">
                    This email was sent by {settings.APP_NAME}
                </p>
            </div>
        </body>
        </html>
        """

    def send_password_reset_email_sync(
        self, to_email: str, reset_token: str, user_name: Optional[str] = None
    ) -> bool:
        """Send password reset email (synchronous version)."""
        if not self.email_enabled:
            logger.warning("Email sending is disabled")
            return False

        if not all([self.smtp_host, self.smtp_user, self.smtp_password]):
            logger.error("Email configuration incomplete")
            return False

        try:
            # Create reset link
            reset_link = (
                f"{settings.ALLOWED_ORIGINS.split(',')[0]}/auth/reset-password?token={reset_token}"
            )

            # Create message
            msg = mime_multipart.MIMEMultipart("alternative")
            msg["Subject"] = f"Password Reset - {settings.APP_NAME}"
            msg["From"] = self.email_from
            msg["To"] = to_email

            # Create HTML content
            html_content = self._create_reset_email_html(reset_link, user_name or "User")
            html_part = mime_text.MIMEText(html_content, "html")
            msg.attach(html_part)

            # Send email
            logger.info(f"🔄 Sending password reset email to {to_email}")

            with smtplib.SMTP(self.smtp_host, self.smtp_port) as server:
                server.starttls()
                server.login(self.smtp_user, self.smtp_password)
                server.send_message(msg)

            logger.info(f"✅ Password reset email sent successfully to {to_email}")
            return True

        except Exception as e:
            logger.error(f"❌ Failed to send password reset email to {to_email}: {e}")
            return False

    def send_verification_email_sync(
        self, to_email: str, verification_token: str, user_name: Optional[str] = None
    ) -> bool:
        """Send email verification email (synchronous version)."""
        if not self.email_enabled:
            logger.warning("Email sending is disabled")
            return False

        try:
            # Create verification link
            verification_link = f"{settings.ALLOWED_ORIGINS.split(',')[0]}/auth/verify-email?token={verification_token}"

            # Create message
            msg = mime_multipart.MIMEMultipart("alternative")
            msg["Subject"] = f"Email Verification - {settings.APP_NAME}"
            msg["From"] = self.email_from
            msg["To"] = to_email

            # Simple HTML content for verification
            html_content = f"""
            <!DOCTYPE html>
            <html>
            <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: #f8f9fa; padding: 20px; border-radius: 10px;">
                    <h2 style="color: #333; text-align: center;">Email Verification</h2>
                    
                    <p>Hello {user_name or 'User'},</p>
                    
                    <p>Welcome to {settings.APP_NAME}! Please verify your email address by clicking the link below:</p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="{verification_link}" 
                           style="background: #28a745; color: white; padding: 12px 24px; 
                                  text-decoration: none; border-radius: 5px; display: inline-block;">
                            Verify Email Address
                        </a>
                    </div>
                    
                    <p>If the button doesn't work, copy and paste this link:</p>
                    <p style="word-break: break-all; color: #28a745;">{verification_link}</p>
                    
                    <p><strong>This link will expire in 24 hours.</strong></p>
                    
                    <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
                    <p style="color: #666; font-size: 12px; text-align: center;">
                        This email was sent by {settings.APP_NAME}
                    </p>
                </div>
            </body>
            </html>
            """

            html_part = mime_text.MIMEText(html_content, "html")
            msg.attach(html_part)

            # Send email
            logger.info(f"🔄 Sending verification email to {to_email}")

            with smtplib.SMTP(self.smtp_host, self.smtp_port) as server:
                server.starttls()
                server.login(self.smtp_user, self.smtp_password)
                server.send_message(msg)

            logger.info(f"✅ Verification email sent successfully to {to_email}")
            return True

        except Exception as e:
            logger.error(f"❌ Failed to send verification email to {to_email}: {e}")
            return False

    async def send_verification_email(
        self, to_email: str, verification_token: str, user_name: Optional[str] = None
    ) -> bool:
        """Send email verification email."""
        if not self.email_enabled:
            logger.warning("Email sending is disabled")
            return False

        try:
            # Create verification link
            verification_link = f"{settings.ALLOWED_ORIGINS.split(',')[0]}/auth/verify-email?token={verification_token}"

            # Create message
            msg = mime_multipart.MIMEMultipart("alternative")
            msg["Subject"] = f"Email Verification - {settings.APP_NAME}"
            msg["From"] = self.email_from
            msg["To"] = to_email

            # Simple HTML content for verification
            html_content = f"""
            <!DOCTYPE html>
            <html>
            <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: #f8f9fa; padding: 20px; border-radius: 10px;">
                    <h2 style="color: #333; text-align: center;">Email Verification</h2>
                    
                    <p>Hello {user_name or 'User'},</p>
                    
                    <p>Please verify your email address by clicking the link below:</p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="{verification_link}" 
                           style="background: #28a745; color: white; padding: 12px 24px; 
                                  text-decoration: none; border-radius: 5px; display: inline-block;">
                            Verify Email
                        </a>
                    </div>
                    
                    <p>If the button doesn't work, copy and paste this link:</p>
                    <p style="word-break: break-all; color: #28a745;">{verification_link}</p>
                </div>
            </body>
            </html>
            """

            html_part = mime_text.MIMEText(html_content, "html")
            msg.attach(html_part)

            # Send email
            logger.info(f"🔄 Sending verification email to {to_email}")

            with smtplib.SMTP(self.smtp_host, self.smtp_port) as server:
                server.starttls()
                server.login(self.smtp_user, self.smtp_password)
                server.send_message(msg)

            logger.info(f"✅ Verification email sent successfully to {to_email}")
            return True

        except Exception as e:
            logger.error(f"❌ Failed to send verification email to {to_email}: {e}")
            return False


# Global instance
email_service = EmailService()
