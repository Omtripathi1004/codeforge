import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '../../../../lib/server/auth';
import { ProcessExecutor } from '../../../../lib/server/executor';
import { Database } from '../../../../lib/server/db';

export async function POST(req: NextRequest) {
  const auth = authenticateRequest(req);
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { projectId, command, timeoutMs } = body;

    if (!projectId || !command) {
      return NextResponse.json({ error: 'projectId and command are required' }, { status: 400 });
    }

    const project = Database.getProject(projectId, auth.user.id);
    if (!project) {
      return NextResponse.json({ error: 'Project not found or forbidden' }, { status: 404 });
    }

    const result = await ProcessExecutor.runCommand(
      projectId,
      command,
      timeoutMs || 20000,
      project.mission.id
    );

    return NextResponse.json({ result });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Execution error' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const auth = authenticateRequest(req);
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get('projectId');
  if (!projectId) {
    return NextResponse.json({ error: 'projectId is required' }, { status: 400 });
  }

  const project = Database.getProject(projectId, auth.user.id);
  if (!project) {
    return NextResponse.json({ error: 'Project not found or forbidden' }, { status: 404 });
  }

  const logs = Database.getExecutionLogs(projectId);
  return NextResponse.json({ logs });
}
