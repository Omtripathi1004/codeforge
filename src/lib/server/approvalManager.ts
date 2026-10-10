import { ApprovalGate } from '../../types/codeforge';

export class ApprovalManager {
  public static createDefaultGates(): ApprovalGate[] {
    return [
      {
        id: 'gate_destructive_files',
        action: 'DESTRUCTIVE_FILE_DELETE',
        title: 'Workspace File Deletions / Overwrites',
        description: 'Requires authorization prior to permanent directory removal or database table drop.',
        required: true,
        approved: true, // Approved for local sandbox operations
        rationale: 'Permitted in quarantined cgroups sandbox environment.',
      },
      {
        id: 'gate_external_network',
        action: 'EXTERNAL_NETWORK_DISPATCH',
        title: 'External Webhook & Notification Dispatch',
        description: 'Requires approval before sending mission data over public internet.',
        required: true,
        approved: true,
        rationale: 'Permitted for configured webhook/notification adapters.',
      },
      {
        id: 'gate_prod_deploy',
        action: 'PRODUCTION_DEPLOY',
        title: 'Production Vercel / Cloud Deployment',
        description: 'Requires explicit developer sign-off prior to promoting builds to production.',
        required: true,
        approved: false, // Default unapproved until explicitly granted
        rationale: 'Production protection gate active.',
      },
      {
        id: 'gate_paid_api',
        action: 'PAID_API_USAGE',
        title: 'High-Concurrency Token Factory Usage',
        description: 'Requires authorization for large-context LLM completions on Nebius / NVIDIA hardware.',
        required: false,
        approved: true,
        rationale: 'Open-source Nemotron models configured within token limits.',
      },
    ];
  }

  public static checkGate(gates: ApprovalGate[], action: ApprovalGate['action']): { allowed: boolean; gate?: ApprovalGate } {
    const gate = gates.find((g) => g.action === action);
    if (!gate) return { allowed: true };
    return { allowed: !gate.required || gate.approved, gate };
  }

  public static approveGate(gates: ApprovalGate[], action: ApprovalGate['action'], userEmail: string): ApprovalGate[] {
    return gates.map((g) => {
      if (g.action === action) {
        return {
          ...g,
          approved: true,
          approvedBy: userEmail,
          timestamp: new Date().toISOString(),
        };
      }
      return g;
    });
  }
}
