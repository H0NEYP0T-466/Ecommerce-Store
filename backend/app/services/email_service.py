import logging
from typing import Optional

import aiosmtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

from app.config import settings

logger = logging.getLogger(__name__)


async def send_email(
    to_email: str,
    subject: str,
    html_body: str,
) -> bool:
    """Send an email via SMTP.
    
    Falls back to console logging if SMTP is not configured.
    
    Returns:
        True if sent successfully, False otherwise
    """
    if not settings.SMTP_USER or not settings.SMTP_PASSWORD:
        logger.warning(
            f"SMTP not configured. Email would have been sent to: {to_email}\n"
            f"Subject: {subject}\n"
            f"Body: {html_body}"
        )
        return True  # Return True so the flow continues

    message = MIMEMultipart("alternative")
    message["From"] = settings.SMTP_FROM
    message["To"] = to_email
    message["Subject"] = subject

    html_part = MIMEText(html_body, "html")
    message.attach(html_part)

    try:
        await aiosmtplib.send(
            message,
            hostname=settings.SMTP_HOST,
            port=settings.SMTP_PORT,
            username=settings.SMTP_USER,
            password=settings.SMTP_PASSWORD,
            use_tls=settings.SMTP_USE_TLS,
        )
        logger.info(f"Email sent to {to_email}: {subject}")
        return True
    except Exception as e:
        logger.error(f"Failed to send email to {to_email}: {e}")
        return False


async def send_password_reset_email(
    to_email: str,
    reset_token: str,
    user_name: str = "User",
) -> bool:
    """Send a password reset email with a reset link."""
    reset_url = f"{settings.FRONTEND_ORIGIN}/reset-password?token={reset_token}"

    html_body = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: 'Inter', system-ui, sans-serif; background: #ffffff; color: #000000; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 40px 24px; }}
            h1 {{ font-size: 24px; font-weight: 700; margin-bottom: 16px; }}
            p {{ font-size: 16px; color: #4b4b4b; line-height: 1.5; }}
            .btn {{
                display: inline-block;
                background: #000000;
                color: #ffffff;
                padding: 12px 24px;
                border-radius: 999px;
                text-decoration: none;
                font-weight: 500;
                font-size: 16px;
                margin: 24px 0;
            }}
            .footer {{ font-size: 12px; color: #afafaf; margin-top: 40px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <h1>Reset Your Password</h1>
            <p>Hi {user_name},</p>
            <p>We received a request to reset your password for your Hamid Cloth House account.
            Click the button below to set a new password:</p>
            <a href="{reset_url}" class="btn">Reset Password</a>
            <p>This link will expire in 1 hour. If you didn't request this, you can safely ignore this email.</p>
            <div class="footer">
                <p>&copy; Hamid Cloth House. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    """

    return await send_email(
        to_email=to_email,
        subject="Reset Your Password — Hamid Cloth House",
        html_body=html_body,
    )
