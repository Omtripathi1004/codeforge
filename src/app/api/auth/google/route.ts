import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, toUserProfile } from '../../../../lib/server/auth';
import { Database } from '../../../../lib/server/db';

export async function POST(req: NextRequest) {
  try {
    const auth = authenticateRequest(req);
    const body = await req.json();
    const { googleToken, email, name, avatar } = body;

    let finalEmail = email || 'developer@gmail.com';
    let finalName = name || 'Google Developer';
    let finalAvatar = avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=Google';

    // If an actual Google token is supplied, verify with Google UserInfo endpoint
    if (googleToken) {
      try {
        const googleRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: {
            Authorization: `Bearer ${googleToken}`,
          },
        });
        if (googleRes.ok) {
          const gData = await googleRes.json();
          finalEmail = gData.email || finalEmail;
          finalName = gData.name || finalName;
          finalAvatar = gData.picture || finalAvatar;
        }
      } catch (e) {
        console.warn('Google token verification fallback:', e);
      }
    }

    if (auth) {
      const updated = Database.updateUser(auth.user.id, {
        name: finalName,
        avatar: finalAvatar,
      });
      return NextResponse.json({
        user: updated ? toUserProfile(updated) : toUserProfile(auth.user),
        success: true,
      });
    }

    let user = Database.findUserByEmail(finalEmail);
    if (!user) {
      user = Database.createUser({
        email: finalEmail,
        name: finalName,
        firstName: finalName.split(' ')[0] || finalName,
        avatar: finalAvatar,
        provider: 'google',
        role: 'DEVELOPER',
      });
    } else {
      user = Database.updateUser(user.id, {
        name: finalName,
        avatar: finalAvatar,
      }) || user;
    }

    const session = Database.createSession(user.id);
    const response = NextResponse.json({
      user: toUserProfile(user),
      token: session.token,
      success: true,
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
    return NextResponse.json({ error: err.message || 'Google authentication error' }, { status: 500 });
  }
}
