import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, toUserProfile } from '../../../../lib/server/auth';
import { Database } from '../../../../lib/server/db';

export async function POST(req: NextRequest) {
  try {
    const auth = authenticateRequest(req);
    const body = await req.json();
    const { githubToken, githubUsername } = body;

    if (!githubToken && !githubUsername) {
      return NextResponse.json({ error: 'GitHub personal access token or username is required.' }, { status: 400 });
    }

    let finalUsername = githubUsername || 'octocat';

    // Verify token with GitHub API if token provided
    if (githubToken) {
      try {
        const ghRes = await fetch('https://api.github.com/user', {
          headers: {
            Authorization: `Bearer ${githubToken}`,
            'User-Agent': 'CodeForge-Autonomous-Agent',
          },
        });
        if (ghRes.ok) {
          const ghData = await ghRes.json();
          finalUsername = ghData.login || finalUsername;
        } else {
          return NextResponse.json(
            { error: `GitHub API authorization failed: ${ghRes.statusText}` },
            { status: 401 }
          );
        }
      } catch (err: any) {
        console.warn('GitHub API network check fallback:', err);
      }
    }

    if (auth) {
      // Update existing logged in user
      const updated = Database.updateUser(auth.user.id, {
        githubToken,
        githubUsername: finalUsername,
      });
      return NextResponse.json({
        user: updated ? toUserProfile(updated) : toUserProfile(auth.user),
        success: true,
      });
    }

    // Login or create GitHub user
    let user = Database.findUserByEmail(`${finalUsername}@github.com`);
    if (!user) {
      user = Database.createUser({
        email: `${finalUsername}@github.com`,
        name: finalUsername,
        firstName: finalUsername,
        provider: 'github',
        githubUsername: finalUsername,
        githubToken,
        role: 'DEVELOPER',
      });
    } else {
      Database.updateUser(user.id, { githubToken, githubUsername: finalUsername });
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
    return NextResponse.json({ error: err.message || 'Failed to authenticate with GitHub' }, { status: 500 });
  }
}
