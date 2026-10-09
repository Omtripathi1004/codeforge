import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '../../../../lib/server/auth';
import { RepoInspector } from '../../../../lib/server/repoInspector';
import { WorkspaceManager } from '../../../../lib/server/workspace';
import path from 'path';

export async function POST(req: NextRequest) {
  const auth = authenticateRequest(req);
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { dirPath, projectId, repoName, githubUrl } = body;

    let targetPath = '';
    if (projectId) {
      targetPath = WorkspaceManager.ensureWorkspace(projectId);
    } else if (dirPath) {
      targetPath = path.resolve(dirPath);
    } else {
      targetPath = process.cwd();
    }

    const repoContext = await RepoInspector.inspectDirectory(targetPath, repoName || 'inspected-repo');
    return NextResponse.json({ repository: repoContext });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to inspect repository' }, { status: 500 });
  }
}
