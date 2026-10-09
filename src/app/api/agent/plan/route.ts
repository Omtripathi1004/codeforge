import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '../../../../lib/server/auth';
import { AgentEngine } from '../../../../lib/server/agentEngine';
import { Database } from '../../../../lib/server/db';
import { SAMPLE_REPOSITORIES } from '../../../../services/mockRepositoryData';

export async function POST(req: NextRequest) {
  const auth = authenticateRequest(req);
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { task, repository, projectId, model } = body;

    const targetRepo = repository || SAMPLE_REPOSITORIES[0];
    const planResult = await AgentEngine.generatePlans(
      task || 'Fix Concurrency Race Condition',
      targetRepo,
      undefined, // uses server-side process.env.OPENROUTER_API_KEY
      model || process.env.OPENROUTER_MODEL || 'qwen/qwen3-coder'
    );

    if (projectId) {
      const project = Database.getProject(projectId, auth.user.id);
      if (project) {
        project.mission.solutions = {
          solution_a: planResult.solution_a,
          solution_b: planResult.solution_b,
        };
        project.mission.status = 'SOLUTIONS_GENERATED';
        project.mission.currentStepIndex = 2;
        Database.saveProject(project);
      }
    }

    return NextResponse.json({
      success: true,
      plans: planResult,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to generate agent plan' }, { status: 500 });
  }
}
