import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '../../../../lib/server/auth';
import { Database } from '../../../../lib/server/db';
import { WorkspaceManager } from '../../../../lib/server/workspace';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = authenticateRequest(req);
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const project = Database.getProject(params.id, auth.user.id);
  if (!project) {
    // Check if it exists for another user to verify isolation
    const existsAnywhere = Database.getProject(params.id);
    if (existsAnywhere) {
      return NextResponse.json({ error: 'Forbidden: Access denied to this project' }, { status: 403 });
    }
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }

  return NextResponse.json({ project });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = authenticateRequest(req);
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const project = Database.getProject(params.id, auth.user.id);
  if (!project) {
    return NextResponse.json({ error: 'Project not found or forbidden' }, { status: 404 });
  }

  try {
    const body = await req.json();
    if (body.mission) {
      project.mission = { ...project.mission, ...body.mission };
    }
    if (body.name) {
      project.name = body.name;
    }
    if (body.description) {
      project.description = body.description;
    }

    Database.saveProject(project);
    return NextResponse.json({ project });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to update project' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = authenticateRequest(req);
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const success = Database.deleteProject(params.id, auth.user.id);
  if (!success) {
    return NextResponse.json({ error: 'Project not found or forbidden' }, { status: 404 });
  }

  return NextResponse.json({ success: true, message: 'Project deleted' });
}
