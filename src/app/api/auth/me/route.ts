import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, toUserProfile } from '../../../../lib/server/auth';

export async function GET(req: NextRequest) {
  const auth = authenticateRequest(req);
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized: Valid session required' }, { status: 401 });
  }

  return NextResponse.json({
    user: toUserProfile(auth.user),
    token: auth.token,
  });
}
