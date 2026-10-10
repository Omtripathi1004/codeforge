import { NextRequest, NextResponse } from 'next/server';
import { NotificationAdapter } from '../../../../lib/server/notificationAdapter';
import { authenticateRequest } from '../../../../lib/server/auth';

export async function POST(req: NextRequest) {
  try {
    const user = authenticateRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized: Authentication required to trigger notification dispatches.' }, { status: 401 });
    }

    const body = await req.json();
    const { type, to, message, subject, html, twilioSid, twilioAuthToken, fromPhone, resendApiKey } = body;

    if (!type || (type !== 'sms' && type !== 'email')) {
      return NextResponse.json({ error: "Invalid notification type. Must be 'sms' or 'email'." }, { status: 400 });
    }

    if (type === 'sms') {
      const result = await NotificationAdapter.sendDirectSms({
        to,
        body: message || 'CodeForge test notification: Autonomous agent event completed.',
        twilioSid,
        twilioAuthToken,
        fromPhone,
      });

      return NextResponse.json(result, { status: result.success ? 200 : 400 });
    }

    if (type === 'email') {
      const result = await NotificationAdapter.sendDirectEmail({
        to,
        subject: subject || '[CodeForge] Autonomous Agent Notification',
        text: message || 'Autonomous agent event reached target status.',
        html,
        resendApiKey,
      });

      return NextResponse.json(result, { status: result.success ? 200 : 400 });
    }

    return NextResponse.json({ error: 'Unsupported dispatch route.' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal notification dispatch error.' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const user = authenticateRequest(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const twilioConfigured = !!(
    (process.env.TWILIO_ACCOUNT_SID || process.env.TWILIO_SID) &&
    process.env.TWILIO_AUTH_TOKEN &&
    process.env.TWILIO_PHONE_NUMBER
  );

  const emailConfigured = !!(process.env.RESEND_API_KEY || process.env.EMAIL_PROVIDER_API_KEY);

  return NextResponse.json({
    sms: {
      provider: 'Twilio SMS',
      configured: twilioConfigured,
      fromPhone: process.env.TWILIO_PHONE_NUMBER ? `${process.env.TWILIO_PHONE_NUMBER.slice(0, 4)}***` : null,
    },
    email: {
      provider: 'Resend',
      configured: emailConfigured,
      fromEmail: process.env.EMAIL_FROM_ADDRESS || 'notifications@codeforge.dev',
    },
  });
}
