import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/server/auth';
import { Database } from '@/lib/server/db';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = authenticateRequest(req);
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const newName = body.name;

    const duplicated = Database.duplicateProject(params.id, auth.user.id, newName);
    if (!duplicated) {
      return NextResponse.json({ error: 'Project not found or unauthorized' }, { status: 404 });
    }

    return NextResponse.json({ project: duplicated }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Duplication failed' }, { status: 500 });
  }
}
