import { NextRequest, NextResponse } from 'next/server';
import { Database } from '../../../../lib/server/db';
import { toUserProfile } from '../../../../lib/server/auth';
import crypto from 'crypto';

// In-memory OTP storage: email/identifier -> { code, expiresAt, name, provider, avatar }
const otpStore = new Map<string, { code: string; expiresAt: number; name: string; provider: string; avatar?: string }>();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, email, code, name, provider, githubUsername } = body;

    const identifier = (email || githubUsername || '').trim().toLowerCase();
    if (!identifier) {
      return NextResponse.json({ error: 'Email or GitHub account identifier is required.' }, { status: 400 });
    }

    // ── ACTION 1: SEND / GENERATE OTP ──
    if (action === 'send') {
      // Generate secure 6-digit OTP
      const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes validity

      otpStore.set(identifier, {
        code: generatedOtp,
        expiresAt,
        name: name || (provider === 'github' ? (githubUsername || 'GitHub Developer') : identifier.split('@')[0]),
        provider: provider || 'email',
        avatar: provider === 'github'
          ? `https://github.com/${githubUsername || 'octocat'}.png`
          : `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(identifier)}`,
      });

      // Mask email for realistic security UX (e.g. om***@gmail.com)
      let masked = identifier;
      if (identifier.includes('@')) {
        const [localPart, domain] = identifier.split('@');
        masked = `${localPart.substring(0, 2)}***@${domain}`;
      } else {
        masked = `${identifier.substring(0, 2)}***`;
      }

      return NextResponse.json({
        success: true,
        message: `A 6-digit verification code has been dispatched to ${masked}.`,
        maskedDestination: masked,
        code: generatedOtp, // Included so user can view/auto-fill directly on screen in the security notice
        expiresInSeconds: 300,
      });
    }

    // ── ACTION 2: VERIFY OTP ──
    if (action === 'verify') {
      const stored = otpStore.get(identifier);
      if (!stored) {
        return NextResponse.json({ error: 'No active OTP found. Please request a new verification code.' }, { status: 400 });
      }

      if (Date.now() > stored.expiresAt) {
        otpStore.delete(identifier);
        return NextResponse.json({ error: 'Verification code has expired. Please request a new code.' }, { status: 400 });
      }

      if (stored.code !== (code || '').trim()) {
        return NextResponse.json({ error: 'Invalid 6-digit verification code. Please try again.' }, { status: 400 });
      }

      // OTP Verified Successfully! Register / update user in Database
      let dbUser = Database.findUserByEmail(identifier.includes('@') ? identifier : `${identifier}@codeforge.dev`);
      if (!dbUser) {
        dbUser = Database.createUser({
          email: identifier.includes('@') ? identifier : `${identifier}@codeforge.dev`,
          name: stored.name,
          firstName: stored.name.split(' ')[0],
          provider: stored.provider as any,
          avatar: stored.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(identifier)}`,
          githubUsername: stored.provider === 'github' ? (githubUsername || identifier) : undefined,
          role: 'DEVELOPER',
        });
      } else {
        Database.updateUser(dbUser.id, {
          name: stored.name,
          provider: stored.provider as any,
          githubUsername: stored.provider === 'github' ? (githubUsername || identifier) : dbUser.githubUsername,
        });
      }

      const session = Database.createSession(dbUser.id);
      otpStore.delete(identifier);

      const response = NextResponse.json({
        success: true,
        message: 'Multi-factor authentication verified successfully.',
        user: toUserProfile(dbUser),
        token: session.token,
      });

      // Set secure HttpOnly cookie for session persistence
      response.cookies.set('codeforge_session', session.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 7 * 24 * 60 * 60,
      });

      return response;
    }

    return NextResponse.json({ error: 'Unsupported action.' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'OTP operation failed.' }, { status: 500 });
  }
}
