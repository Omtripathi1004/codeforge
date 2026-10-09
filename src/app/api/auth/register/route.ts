import { NextRequest, NextResponse } from 'next/server';
import { Database } from '../../../../lib/server/db';
import { toUserProfile } from '../../../../lib/server/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, name, role } = body;

    if (!email || !password || !name) {
      return NextResponse.json({ error: 'Email, password, and name are required.' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters long.' }, { status: 400 });
    }

    const existing = Database.findUserByEmail(email);
    if (existing) {
      return NextResponse.json({ error: 'A user with this email address already exists.' }, { status: 409 });
    }

    const user = Database.createUser({
      email,
      password,
      name,
      role: role === 'USER' ? 'USER' : 'DEVELOPER',
      provider: 'email',
    });

    const session = Database.createSession(user.id);
    const response = NextResponse.json({
      user: toUserProfile(user),
      token: session.token,
    });

    response.cookies.set('codeforge_session', session.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}
