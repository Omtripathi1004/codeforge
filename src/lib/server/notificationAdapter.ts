import { NotificationAdapterStatus, Mission } from '../../types/codeforge';

export interface SendSmsResult {
  success: boolean;
  status: 'DELIVERED' | 'ACCEPTED' | 'FAILED' | 'NOT_CONFIGURED';
  messageId?: string;
  error?: string;
  timestamp: string;
}

export interface SendEmailResult {
  success: boolean;
  status: 'DELIVERED' | 'ACCEPTED' | 'FAILED' | 'NOT_CONFIGURED';
  messageId?: string;
  error?: string;
  timestamp: string;
}

export class NotificationAdapter {
  /**
   * Send a direct SMS using Twilio credentials.
   * If credentials are not passed as arguments, falls back to process.env.
   */
  public static async sendDirectSms(params: {
    to: string;
    body: string;
    twilioSid?: string;
    twilioAuthToken?: string;
    fromPhone?: string;
  }): Promise<SendSmsResult> {
    const sid = params.twilioSid || process.env.TWILIO_ACCOUNT_SID || process.env.TWILIO_SID;
    const authToken = params.twilioAuthToken || process.env.TWILIO_AUTH_TOKEN;
    const from = params.fromPhone || process.env.TWILIO_PHONE_NUMBER;
    const to = params.to || process.env.NOTIFICATION_RECIPIENT_PHONE;

    if (!sid || !authToken || !from || !to) {
      return {
        success: false,
        status: 'NOT_CONFIGURED',
        error: 'Twilio credentials not configured (requires TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER, and recipient phone).',
        timestamp: new Date().toISOString(),
      };
    }

    try {
      const basicAuth = Buffer.from(`${sid}:${authToken}`).toString('base64');
      const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${basicAuth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          From: from,
          To: to,
          Body: params.body,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok) {
        return {
          success: true,
          status: 'DELIVERED',
          messageId: data.sid,
          timestamp: new Date().toISOString(),
        };
      } else {
        return {
          success: false,
          status: 'FAILED',
          error: data.message || `Twilio error HTTP ${response.status}`,
          timestamp: new Date().toISOString(),
        };
      }
    } catch (err: any) {
      return {
        success: false,
        status: 'FAILED',
        error: err.message || 'Network failure dispatching SMS via Twilio',
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Send a direct Email using Resend credentials.
   * If credentials are not passed as arguments, falls back to process.env.
   */
  public static async sendDirectEmail(params: {
    to: string;
    subject: string;
    text: string;
    html?: string;
    resendApiKey?: string;
    fromEmail?: string;
  }): Promise<SendEmailResult> {
    const apiKey = params.resendApiKey || process.env.RESEND_API_KEY || process.env.EMAIL_PROVIDER_API_KEY;
    const from = params.fromEmail || process.env.EMAIL_FROM_ADDRESS || 'CodeForge <onboarding@resend.dev>';
    const to = params.to || process.env.NOTIFICATION_RECIPIENT_EMAIL;

    if (!apiKey || !to) {
      return {
        success: false,
        status: 'NOT_CONFIGURED',
        error: 'Email provider not configured (requires RESEND_API_KEY / EMAIL_PROVIDER_API_KEY and recipient email).',
        timestamp: new Date().toISOString(),
      };
    }

    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from,
          to: [to],
          subject: params.subject,
          text: params.text,
          ...(params.html ? { html: params.html } : {}),
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok) {
        return {
          success: true,
          status: 'DELIVERED',
          messageId: data.id,
          timestamp: new Date().toISOString(),
        };
      } else {
        return {
          success: false,
          status: 'FAILED',
          error: data.message || `Resend error HTTP ${response.status}`,
          timestamp: new Date().toISOString(),
        };
      }
    } catch (err: any) {
      return {
        success: false,
        status: 'FAILED',
        error: err.message || 'Network failure dispatching Email via Resend',
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Dispatches end-to-end mission lifecycle notifications across Webhook, Email, and SMS.
   */
  public static async dispatchMissionNotifications(params: {
    mission: Mission;
    settings?: {
      resendApiKey?: string;
      recipientEmail?: string;
      twilioSid?: string;
      twilioAuthToken?: string;
      twilioPhoneNumber?: string;
      recipientPhone?: string;
      n8nWebhookUrl?: string;
      n8nEnabled?: boolean;
    };
  }): Promise<NotificationAdapterStatus> {
    const { mission, settings } = params;
    const isExplicitlyEmpty = settings !== undefined && Object.keys(settings).length === 0;

    const resendApiKey = settings?.resendApiKey || (!isExplicitlyEmpty ? (process.env.RESEND_API_KEY || process.env.EMAIL_PROVIDER_API_KEY) : undefined);
    const recipientEmail = settings?.recipientEmail || (!isExplicitlyEmpty ? process.env.NOTIFICATION_RECIPIENT_EMAIL : undefined);

    const twilioSid = settings?.twilioSid || (!isExplicitlyEmpty ? (process.env.TWILIO_ACCOUNT_SID || process.env.TWILIO_SID) : undefined);
    const twilioAuthToken = settings?.twilioAuthToken || (!isExplicitlyEmpty ? process.env.TWILIO_AUTH_TOKEN : undefined);
    const twilioPhoneNumber = settings?.twilioPhoneNumber || (!isExplicitlyEmpty ? process.env.TWILIO_PHONE_NUMBER : undefined);
    const recipientPhone = settings?.recipientPhone || (!isExplicitlyEmpty ? process.env.NOTIFICATION_RECIPIENT_PHONE : undefined);

    const n8nWebhookUrl = settings?.n8nWebhookUrl || (!isExplicitlyEmpty ? process.env.N8N_WEBHOOK_URL : undefined);
    const n8nEnabled = settings?.n8nEnabled ?? (!isExplicitlyEmpty ? (process.env.N8N_ENABLED === 'true') : false);

    const status: NotificationAdapterStatus = {
      email: {
        configured: !!(resendApiKey && recipientEmail),
        provider: 'Resend / SMTP',
        status: 'NOT_CONFIGURED',
        error: !(resendApiKey && recipientEmail) ? 'Email provider API key or recipient email not configured.' : undefined,
      },
      sms: {
        configured: !!(twilioSid && twilioAuthToken && twilioPhoneNumber && recipientPhone),
        provider: 'Twilio SMS',
        status: 'NOT_CONFIGURED',
        error: !(twilioSid && twilioAuthToken && twilioPhoneNumber && recipientPhone) ? 'Twilio SID / Auth token or phone numbers not configured.' : undefined,
      },
      webhook: {
        configured: !!(n8nEnabled && n8nWebhookUrl),
        status: 'NOT_CONFIGURED',
        error: !(n8nEnabled && n8nWebhookUrl) ? 'Webhook URL not configured.' : undefined,
      },
    };

    // 1. Webhook Adapter
    if (status.webhook.configured && n8nWebhookUrl) {
      status.webhook.url = n8nWebhookUrl;
      try {
        const payload = {
          event: mission.status,
          missionId: mission.id,
          repository: mission.repository?.fullName || 'local/repo',
          issueTitle: mission.issueTitle,
          status: mission.status,
          timestamp: new Date().toISOString(),
          prUrl: mission.pullRequest?.htmlUrl,
        };

        const res = await fetch(n8nWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        status.webhook.status = res.ok ? 'DELIVERED' : 'ACCEPTED';
        status.webhook.lastAttempt = new Date().toISOString();
      } catch (err: any) {
        status.webhook.status = 'FAILED';
        status.webhook.error = err.message || 'Webhook unreachable';
        status.webhook.lastAttempt = new Date().toISOString();
      }
    }

    // 2. Email Adapter
    if (status.email.configured && resendApiKey && recipientEmail) {
      status.email.recipient = recipientEmail;
      const emailRes = await this.sendDirectEmail({
        to: recipientEmail,
        subject: `[CodeForge] Mission ${mission.status}: ${mission.issueTitle}`,
        text: `Mission #${mission.issueNumber || '1'} reached state ${mission.status}. Pull Request: ${mission.pullRequest?.htmlUrl || 'N/A'}\n\nTimestamp: ${new Date().toISOString()}`,
        resendApiKey,
      });

      status.email.status = emailRes.status;
      status.email.lastAttempt = emailRes.timestamp;
      if (emailRes.error) status.email.error = emailRes.error;
    }

    // 3. SMS Adapter
    if (status.sms.configured && twilioSid && twilioAuthToken && twilioPhoneNumber && recipientPhone) {
      status.sms.recipient = recipientPhone;
      const smsRes = await this.sendDirectSms({
        to: recipientPhone,
        body: `CodeForge: Mission #${mission.issueNumber || '1'} (${mission.status}). PR: ${mission.pullRequest?.htmlUrl || 'Completed'}.`,
        twilioSid,
        twilioAuthToken,
        fromPhone: twilioPhoneNumber,
      });

      status.sms.status = smsRes.status;
      status.sms.lastAttempt = smsRes.timestamp;
      if (smsRes.error) status.sms.error = smsRes.error;
    }

    return status;
  }
}
