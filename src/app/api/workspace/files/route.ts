import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '../../../../lib/server/auth';
import { WorkspaceManager } from '../../../../lib/server/workspace';
import { Database } from '../../../../lib/server/db';

export async function GET(req: NextRequest) {
  const auth = authenticateRequest(req);
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get('projectId');
  const filePath = searchParams.get('path');

  if (!projectId) {
    return NextResponse.json({ error: 'projectId is required' }, { status: 400 });
  }

  const project = Database.getProject(projectId, auth.user.id);
  if (!project) {
    return NextResponse.json({ error: 'Project not found or forbidden' }, { status: 404 });
  }

  WorkspaceManager.ensureWorkspace(projectId, project.repository);

  if (filePath) {
    try {
      const content = WorkspaceManager.readFile(projectId, filePath);
      return NextResponse.json({ content, path: filePath });
    } catch (err: any) {
      return NextResponse.json({ error: err.message || 'File not found' }, { status: 404 });
    }
  }

  const fileTree = WorkspaceManager.listFiles(projectId);
  return NextResponse.json({ files: fileTree });
}

export async function POST(req: NextRequest) {
  const auth = authenticateRequest(req);
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { projectId, filePath, content } = body;

    if (!projectId || !filePath || typeof content !== 'string') {
      return NextResponse.json({ error: 'projectId, filePath and content are required' }, { status: 400 });
    }

    const project = Database.getProject(projectId, auth.user.id);
    if (!project) {
      return NextResponse.json({ error: 'Project not found or forbidden' }, { status: 404 });
    }

    WorkspaceManager.writeFile(projectId, filePath, content);
    return NextResponse.json({ success: true, path: filePath, bytes: Buffer.byteLength(content, 'utf-8') });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to write file' }, { status: 500 });
  }
}
