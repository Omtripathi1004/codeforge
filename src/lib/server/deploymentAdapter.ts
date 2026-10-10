import { DeploymentIntegration } from '../../types/codeforge';

export class DeploymentAdapter {
  public static async triggerDeployment(params: {
    projectId: string;
    projectName: string;
    vercelToken?: string;
    vercelProjectId?: string;
    requiresApproval?: boolean;
    isApproved?: boolean;
  }): Promise<DeploymentIntegration> {
    const { projectId, projectName, vercelToken, vercelProjectId, requiresApproval = true, isApproved = false } = params;

    // Check approval gate
    if (requiresApproval && !isApproved) {
      return {
        provider: 'vercel',
        configured: Boolean(vercelToken),
        status: 'QUEUED',
        buildLogs: ['[Policy Engine] Production deployment requires explicit approval.'],
        requiresApproval: true,
        approved: false,
        error: 'Deployment awaiting developer authorization gate.',
      };
    }

    // Check credentials
    if (!vercelToken) {
      return {
        provider: 'vercel',
        configured: false,
        status: 'NOT_CONFIGURED',
        buildLogs: [
          '[Deployment Adapter] Vercel token not configured in CodeForge settings.',
          '[Status] Deployment cancelled safely: Missing external provider credentials.',
        ],
        requiresApproval: false,
        approved: isApproved,
        error: 'NOT CONFIGURED: Vercel deployment credentials not provided.',
      };
    }

    // Call real Vercel API
    try {
      const res = await fetch('https://api.vercel.com/v13/deployments', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${vercelToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: projectName,
          project: vercelProjectId,
          target: 'production',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        return {
          provider: 'vercel',
          configured: true,
          deploymentId: data.id,
          url: data.url ? `https://${data.url}` : undefined,
          status: data.readyState === 'READY' ? 'READY' : 'BUILDING',
          buildLogs: [
            `[Vercel API] Deployment ${data.id} initialized.`,
            `[Vercel API] Target: production (${data.url})`,
          ],
          requiresApproval: false,
          approved: true,
        };
      } else {
        const err = await res.json().catch(() => ({}));
        return {
          provider: 'vercel',
          configured: true,
          status: 'ERROR',
          buildLogs: [`[Vercel API] Error ${res.status}: ${err.message || res.statusText}`],
          requiresApproval: false,
          approved: true,
          error: err.message || `Vercel API returned HTTP ${res.status}`,
        };
      }
    } catch (err: any) {
      return {
        provider: 'vercel',
        configured: true,
        status: 'ERROR',
        buildLogs: [`[Network Error] Could not reach Vercel API: ${err.message}`],
        requiresApproval: false,
        approved: true,
        error: err.message,
      };
    }
  }
}
