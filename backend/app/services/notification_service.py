import httpx
import base64
from typing import Dict, Any, Optional
from ..core.config import settings

class NotificationService:
    @staticmethod
    async def send_sms(to: str, message: str) -> Dict[str, Any]:
        """Send an SMS via Twilio using backend settings."""
        sid = settings.TWILIO_ACCOUNT_SID
        token = settings.TWILIO_AUTH_TOKEN
        from_number = settings.TWILIO_PHONE_NUMBER

        if not sid or not token or not from_number:
            return {
                "success": False,
                "status": "NOT_CONFIGURED",
                "error": "Twilio credentials (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER) not configured."
            }

        auth_header = base64.b64encode(f"{sid}:{token}".encode("utf-8")).decode("utf-8")
        url = f"https://api.twilio.com/2010-04-01/Accounts/{sid}/Messages.json"

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.post(
                    url,
                    headers={
                        "Authorization": f"Basic {auth_header}",
                        "Content-Type": "application/x-www-form-urlencoded",
                    },
                    data={
                        "From": from_number,
                        "To": to,
                        "Body": message,
                    }
                )
                if res.is_success:
                    data = res.json()
                    return {"success": True, "status": "DELIVERED", "message_id": data.get("sid")}
                else:
                    return {"success": False, "status": "FAILED", "error": f"Twilio HTTP {res.status_code}: {res.text}"}
        except Exception as e:
            return {"success": False, "status": "FAILED", "error": str(e)}

    @staticmethod
    async def send_email(to: str, subject: str, body: str) -> Dict[str, Any]:
        """Send an email via Resend API."""
        api_key = settings.RESEND_API_KEY
        if not api_key:
            return {
                "success": False,
                "status": "NOT_CONFIGURED",
                "error": "Resend API key (RESEND_API_KEY) not configured."
            }

        url = "https://api.resend.com/emails"
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.post(
                    url,
                    headers={
                        "Authorization": f"Bearer {api_key}",
                        "Content-Type": "application/json",
                    },
                    json={
                        "from": "CodeForge <notifications@codeforge.dev>",
                        "to": [to],
                        "subject": subject,
                        "text": body,
                    }
                )
                if res.is_success:
                    data = res.json()
                    return {"success": True, "status": "DELIVERED", "message_id": data.get("id")}
                else:
                    return {"success": False, "status": "FAILED", "error": f"Resend HTTP {res.status_code}: {res.text}"}
        except Exception as e:
            return {"success": False, "status": "FAILED", "error": str(e)}
