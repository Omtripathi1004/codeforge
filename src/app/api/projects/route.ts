import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '../../../lib/server/auth';
import { Database, DbProject } from '../../../lib/server/db';
import { WorkspaceManager } from '../../../lib/server/workspace';
import { SAMPLE_REPOSITORIES } from '../../../services/mockRepositoryData';
import { orchestrator } from '../../../services/agentOrchestrator';

export async function GET(req: NextRequest) {
  const auth = authenticateRequest(req);
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let projects = Database.listProjectsForUser(auth.user.id);

  // If new user has no projects, create default initial project
  if (projects.length === 0) {
    const defaultRepo = SAMPLE_REPOSITORIES[0];
    const initialMission = orchestrator.createMission(defaultRepo);
    const projectId = `proj_${auth.user.id.substring(4)}_${Date.now()}`;
    const wsPath = WorkspaceManager.ensureWorkspace(projectId, defaultRepo);

    const newProj: DbProject = {
      id: projectId,
      userId: auth.user.id,
      name: defaultRepo.name,
      description: 'Production FastAPI authentication and token management service.',
      repository: defaultRepo,
      mission: initialMission,
      workspacePath: wsPath,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    Database.saveProject(newProj);
    projects = [newProj];
  }

  return NextResponse.json({ projects });
}

export async function POST(req: NextRequest) {
  const auth = authenticateRequest(req);
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, repository, initialTask } = body;

    const targetRepo = repository || SAMPLE_REPOSITORIES[0];
    const projectId = `proj_${auth.user.id.substring(4)}_${Date.now()}`;
    const wsPath = WorkspaceManager.ensureWorkspace(projectId, targetRepo);
    const mission = orchestrator.createMission(targetRepo, initialTask);

    const project: DbProject = {
      id: projectId,
      userId: auth.user.id,
      name: name || targetRepo.name,
      description: initialTask || `Workspace for ${targetRepo.fullName}`,
      repository: targetRepo,
      mission,
      workspacePath: wsPath,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    Database.saveProject(project);

    return NextResponse.json({ project }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to create project' }, { status: 500 });
  }
}
