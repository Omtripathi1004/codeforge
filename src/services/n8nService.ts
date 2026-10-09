import { AgentEvent, Mission } from '../types/codeforge';
import { AIProviderService } from './aiProvider';

export interface N8nWebhookPayload {
  event: string;
  missionId: string;
  repository: string;
  issueTitle: string;
  status: string;
  agent: string;
  timestamp: string;
  details: {
    title: string;
    description: string;
    filesAffected?: string[];
    testsPassed?: number;
    testsFailed?: number;
    prUrl?: string;
  };
}

export class N8nAutomationService {
  public static async dispatchEvent(mission: Mission, event: AgentEvent): Promise<boolean> {
    const settings = AIProviderService.getSettings();
    if (!settings.n8nEnabled || !settings.n8nWebhookUrl) {
      return false;
    }

    const payload: N8nWebhookPayload = {
      event: event.status,
      missionId: mission.id,
      repository: mission.repository.fullName,
      issueTitle: mission.issueTitle,
      status: mission.status,
      agent: event.agent,
      timestamp: event.timestamp,
      details: {
        title: event.title,
        description: event.description,
        filesAffected: event.affectedFiles,
        testsPassed: event.evidence?.passCount,
        testsFailed: event.evidence?.failCount,
        prUrl: mission.pullRequest?.htmlUrl,
      },
    };

    try {
      // In production/sandbox this fires to configured n8n webhook
      if (settings.n8nWebhookUrl.startsWith('http')) {
        await fetch(settings.n8nWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          mode: 'no-cors' // Allows outward webhook dispatch without CORS blocking
        }).catch(() => {
          // gracefully handle offline webhooks
        });
      }
      return true;
    } catch {
      return false;
    }
  }
}
