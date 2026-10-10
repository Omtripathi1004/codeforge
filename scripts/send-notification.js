#!/usr/bin/env node

/**
 * CodeForge Notification & SMS CLI Dispatcher
 *
 * Usage:
 *   node scripts/send-notification.js --type sms --to "+1XXXXXXXXXX" --message "CodeForge task finished"
 *   node scripts/send-notification.js --type email --to "you@example.com" --subject "Build ready" --message "Task complete"
 */

const fs = require('fs');
const path = require('path');

// 1. Load local .env
const envPath = path.resolve(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx !== -1) {
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim().replace(/^['"](.*)['"]$/, '$1');
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  }
}

// 2. Parse arguments
const args = process.argv.slice(2);
function getArg(flag) {
  const idx = args.indexOf(flag);
  if (idx !== -1 && idx + 1 < args.length) return args[idx + 1];
  return null;
}

const type = getArg('--type') || 'sms';
const to = getArg('--to') || process.env.NOTIFICATION_RECIPIENT_PHONE || process.env.NOTIFICATION_RECIPIENT_EMAIL;
const message = getArg('--message') || 'CodeForge test notification: Agent task verified.';
const subject = getArg('--subject') || '[CodeForge] Autonomous Alert';

async function sendTwilioSms() {
  const sid = process.env.TWILIO_ACCOUNT_SID || process.env.TWILIO_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_PHONE_NUMBER;

  console.log('\n📲 [SMS Dispatch: Twilio]');
  console.log(`- Account SID: ${sid ? sid.slice(0, 6) + '...' : 'NOT_CONFIGURED'}`);
  console.log(`- From Number: ${from || 'NOT_CONFIGURED'}`);
  console.log(`- To Number:   ${to || 'NOT_SPECIFIED'}`);
  console.log(`- Message:     "${message}"\n`);

  if (!sid || !token || !from) {
    console.error('❌ Error: Twilio credentials not found in .env.');
    console.log('Please ensure the following are set in your .env:');
    console.log('  TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx');
    console.log('  TWILIO_AUTH_TOKEN=your_auth_token_here');
    console.log('  TWILIO_PHONE_NUMBER=+1XXXXXXXXXX');
    process.exit(1);
  }

  if (!to) {
    console.error('❌ Error: No destination phone number provided. Use --to "+1XXXXXXXXXX" or set NOTIFICATION_RECIPIENT_PHONE in .env.');
    process.exit(1);
  }

  const basicAuth = Buffer.from(`${sid}:${token}`).toString('base64');
  try {
    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${basicAuth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        From: from,
        To: to,
        Body: message,
      }),
    });

    const data = await response.json();
    if (response.ok) {
      console.log(`✅ SMS Sent Successfully! Message SID: ${data.sid}`);
      console.log(`Status: ${data.status}`);
    } else {
      console.error(`❌ Twilio Error HTTP ${response.status}: ${data.message || JSON.stringify(data)}`);
      process.exit(1);
    }
  } catch (err) {
    console.error(`❌ Network error sending SMS: ${err.message}`);
    process.exit(1);
  }
}

async function sendResendEmail() {
  const apiKey = process.env.RESEND_API_KEY || process.env.EMAIL_PROVIDER_API_KEY;
  const from = process.env.EMAIL_FROM_ADDRESS || 'CodeForge <notifications@codeforge.dev>';

  console.log('\n📧 [Email Dispatch: Resend]');
  console.log(`- Provider Key: ${apiKey ? apiKey.slice(0, 6) + '...' : 'NOT_CONFIGURED'}`);
  console.log(`- From:         ${from}`);
  console.log(`- To:           ${to || 'NOT_SPECIFIED'}`);
  console.log(`- Subject:      "${subject}"\n`);

  if (!apiKey) {
    console.error('❌ Error: Email API key not found in .env.');
    console.log('Please ensure the following are set in your .env:');
    console.log('  RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx');
    console.log('  NOTIFICATION_RECIPIENT_EMAIL=you@example.com');
    process.exit(1);
  }

  if (!to) {
    console.error('❌ Error: No destination email provided. Use --to "you@example.com" or set NOTIFICATION_RECIPIENT_EMAIL in .env.');
    process.exit(1);
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
        subject,
        text: message,
      }),
    });

    const data = await response.json();
    if (response.ok) {
      console.log(`✅ Email Sent Successfully! Message ID: ${data.id}`);
    } else {
      console.error(`❌ Resend Error HTTP ${response.status}: ${data.message || JSON.stringify(data)}`);
      process.exit(1);
    }
  } catch (err) {
    console.error(`❌ Network error sending Email: ${err.message}`);
    process.exit(1);
  }
}

if (type === 'email') {
  sendResendEmail();
} else {
  sendTwilioSms();
}
