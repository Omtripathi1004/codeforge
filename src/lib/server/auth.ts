import { NextRequest } from 'next/server';
import { Database, DbUser } from './db';

export interface AuthContext {
  user: DbUser;
  token: string;
}

export function extractSessionToken(req: NextRequest): string | null {
  // 1. Authorization: Bearer <token>
  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7).trim();
  }

  // 2. Cookie: codeforge_session=<token>
  const cookie = req.cookies.get('codeforge_session');
  if (cookie?.value) {
    return cookie.value;
  }

  return null;
}

export function authenticateRequest(req: NextRequest): AuthContext | null {
  const token = extractSessionToken(req);
  if (token) {
    const result = Database.getSession(token);
    if (result) {
      return {
        user: result.user,
        token: result.session.token,
      };
    }
  }

  return null;
}

export function toUserProfile(user: DbUser) {
  return {
    id: user.id,
    name: user.name,
    firstName: user.firstName,
    email: user.email,
    avatar: user.avatar,
    role: user.role,
    provider: user.provider,
    githubUsername: user.githubUsername,
    connectedAt: user.createdAt,
  };
}
