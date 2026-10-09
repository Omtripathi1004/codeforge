import { NextRequest, NextResponse } from 'next/server';
import { Database } from '../../../../lib/server/db';
import { extractSessionToken } from '../../../../lib/server/auth';

export async function POST(req: NextRequest) {
  const token = extractSessionToken(req);
  if (token) {
    Database.deleteSession(token);
  }

  const response = NextResponse.json({ success: true, message: 'Logged out successfully' });
  response.cookies.delete('codeforge_session');
  return response;
}
