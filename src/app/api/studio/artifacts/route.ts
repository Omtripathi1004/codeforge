import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/server/auth';
import { Database, DbStudioArtifact } from '@/lib/server/db';
import crypto from 'crypto';

export async function GET(req: NextRequest) {
  const auth = authenticateRequest(req);
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const artifacts = Database.listStudioArtifacts(auth.user.id);
  return NextResponse.json({ artifacts });
}

export async function POST(req: NextRequest) {
  const auth = authenticateRequest(req);
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { id, title, category, prompt, content, tags = [], projectId } = body;

    const artifact: DbStudioArtifact = {
      id: id || `art_${crypto.randomBytes(8).toString('hex')}`,
      userId: auth.user.id,
      projectId,
      title: title || 'Untitled Creative Concept',
      category: category || 'ui_concept',
      prompt: prompt || '',
      content: content || '',
      tags: Array.isArray(tags) ? tags : [],
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    Database.saveStudioArtifact(artifact);
    return NextResponse.json({ artifact }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to save artifact' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const auth = authenticateRequest(req);
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) {
    return NextResponse.json({ error: 'Artifact id is required' }, { status: 400 });
  }

  const success = Database.deleteStudioArtifact(id, auth.user.id);
  if (!success) {
    return NextResponse.json({ error: 'Artifact not found or forbidden' }, { status: 404 });
  }

  return NextResponse.json({ success: true, message: 'Artifact removed' });
}
