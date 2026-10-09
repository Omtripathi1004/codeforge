export type MissionStatus =
  | 'IDLE'
  | 'REPOSITORY_ANALYZED'
  | 'SOLUTIONS_GENERATED'
  | 'SOLUTION_SELECTED'
  | 'CODING_STARTED'
  | 'SANDBOX_STARTED'
  | 'TEST_STARTED'
  | 'TEST_FAILED'
  | 'FAILURE_DIAGNOSED'
  | 'REPAIR_STARTED'
  | 'REPAIR_COMPLETED'
  | 'REGRESSION_STARTED'
  | 'SECURITY_SCAN_COMPLETED'
  | 'BROWSER_VERIFYING'
  | 'BROWSER_VERIFIED'
  | 'VERIFICATION_COMPLETED'
  | 'PR_CREATED'
  | 'DEPLOYMENT_PENDING_APPROVAL'
  | 'DEPLOYING'
  | 'DEPLOYED'
  | 'DEPLOYMENT_FAILED'
  | 'ESCALATED_UNRESOLVED'
  | 'MISSION_FAILED';

export type AgentRole =
  | 'REPO_INTELLIGENCE'
  | 'SOLUTION_ARCHITECT'
  | 'CODING_AGENT'
  | 'SANDBOX_ENGINE'
  | 'TEST_DEBUG_REPAIR'
  | 'BROWSER_VERIFIER'
  | 'SECURITY_VERIFIER'
  | 'PR_AGENT'
  | 'DEPLOYMENT_AGENT'
  | 'NOTIFICATION_AGENT'
  | 'COPILOT';

export type UserRole = 'USER' | 'DEVELOPER';

export interface UserProfile {
  id: string;
  name: string;
  firstName: string;
  email: string;
  avatar: string;
  role: UserRole;
  provider: 'github' | 'google' | 'email';
  githubUsername?: string;
  connectedAt: string;
}

export interface AgentEvent {
  id: string;
  timestamp: string;
  status: MissionStatus;
  agent: AgentRole;
  title: string;
  description: string;
  affectedFiles?: string[];
  durationMs?: number;
  evidence?: {
    command?: string;
    exitCode?: number;
    stdout?: string;
    stderr?: string;
    diffSnippet?: string;
    testSuite?: string;
    passCount?: number;
    failCount?: number;
    securityFlags?: string[];
    browserAssertions?: string[];
    deploymentUrl?: string;
  };
  severity?: 'info' | 'success' | 'warning' | 'error';
}

export interface SolutionOption {
  id: 'solution_a' | 'solution_b' | 'custom';
  title: string;
  subtitle: string;
  type: 'conservative' | 'architectural' | 'custom';
  tagline: string;
  description: string;
  filesAffected: string[];
  linesAdded: number;
  linesRemoved: number;
  complexity: 'Low' | 'Moderate' | 'High';
  risk: 'Low' | 'Medium' | 'High';
  securityImpact: string;
  performanceImpact: string;
  dependencyImpact: string;
  testImpact: string;
  estimatedEffort: string;
  recommended: boolean;
  explanation: string;
  diffs: Array<{
    filePath: string;
    language: string;
    oldCode: string;
    newCode: string;
  }>;
  customPromptConstraint?: string;
}

export interface RepositoryContext {
  id: string;
  name: string;
  fullName: string;
  defaultBranch: string;
  language: string;
  framework: string;
  packageManager: string;
  structure: {
    totalFiles: number;
    entryPoints: string[];
    apiEndpoints: string[];
    databaseModels: string[];
    testSuites: string[];
    riskyFiles: string[];
    dependencies: Record<string, string>;
  };
  stats: {
    stars: number;
    forks: number;
    openIssues: number;
    lastCommit: string;
  };
}

export interface SandboxExecution {
  id: string;
  containerId: string;
  cpuLimit: string;
  memoryLimit: string;
  isolatedNetwork: boolean;
  status: 'PENDING' | 'RUNNING' | 'PASS' | 'FAIL' | 'TERMINATED';
  startTime: string;
  endTime?: string;
  durationMs: number;
  commands: Array<{
    cmd: string;
    exitCode: number;
    stdout: string;
    stderr: string;
    durationMs: number;
  }>;
}

export interface TestResult {
  suiteName: string;
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  durationSec: number;
  failures: Array<{
    testName: string;
    filePath: string;
    line: number;
    errorMessage: string;
    stackTrace: string;
    rootCauseDiagnosis?: string;
    proposedPatch?: string;
  }>;
}

export interface SecurityFinding {
  id: string;
  category: 'SECRETS_SCAN' | 'INJECTION_PATTERN' | 'DEPENDENCY_CVE' | 'PERMISSION_BOUNDARY' | 'REGRESSION_CHECK';
  severity: 'PASS' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  title: string;
  description: string;
  targetFile?: string;
  passed: boolean;
}

export interface BrowserInteractionStep {
  step: string;
  type: 'NAVIGATE' | 'FORM_SUBMIT' | 'AUTH' | 'CLICK' | 'DATA_FETCH';
  status: 'PASS' | 'FAIL' | 'BLOCKED';
  observation: string;
  assertion: string;
  durationMs: number;
}

export interface BrowserVerificationResult {
  route: string;
  passed: boolean;
  verifiedAt: string;
  interactions: BrowserInteractionStep[];
  visualObservations: string[];
  responsiveLayouts: {
    mobile: boolean;
    tablet: boolean;
    desktop: boolean;
  };
  statesVerified: {
    empty: boolean;
    loading: boolean;
    success: boolean;
    error: boolean;
  };
  errorSnippet?: string;
  isSimulatedVisualOnly: boolean;
}

export interface AutonomousRepairLoop {
  maxRetries: number;
  currentRetry: number;
  unresolvedIssues: Array<{
    error: string;
    file: string;
    line?: number;
    diagnosis: string;
    attemptedFix: string;
    status: 'UNRESOLVED' | 'RESOLVED' | 'ESCALATED';
  }>;
  escalatedToUser: boolean;
  escalationReason?: string;
}

export interface GitHubProviderStatus {
  configured: boolean;
  tokenConfigured: boolean;
  owner: string;
  repo: string;
  pr?: PullRequestEvidence;
  error?: string;
  rateLimitRemaining?: number;
}

export interface DeploymentIntegration {
  provider: 'vercel' | 'nebius_inference' | 'custom_webhook';
  configured: boolean;
  deploymentId?: string;
  url?: string;
  status: 'NOT_CONFIGURED' | 'QUEUED' | 'BUILDING' | 'READY' | 'ERROR' | 'CANCELLED';
  buildLogs: string[];
  requiresApproval: boolean;
  approved: boolean;
  error?: string;
}

export interface NotificationAdapterStatus {
  email: {
    configured: boolean;
    provider: string;
    status: 'NOT_CONFIGURED' | 'ACCEPTED' | 'DELIVERED' | 'FAILED';
    recipient?: string;
    lastAttempt?: string;
    error?: string;
  };
  sms: {
    configured: boolean;
    provider: string;
    status: 'NOT_CONFIGURED' | 'ACCEPTED' | 'DELIVERED' | 'FAILED';
    recipient?: string;
    lastAttempt?: string;
    error?: string;
  };
  webhook: {
    configured: boolean;
    url?: string;
    status: 'NOT_CONFIGURED' | 'ACCEPTED' | 'DELIVERED' | 'FAILED';
    lastAttempt?: string;
    error?: string;
  };
}

export interface ApprovalGate {
  id: string;
  action: 'DESTRUCTIVE_FILE_DELETE' | 'EXTERNAL_NETWORK_DISPATCH' | 'PAID_API_USAGE' | 'PRODUCTION_DEPLOY' | 'BRANCH_FORCE_PUSH';
  title: string;
  description: string;
  required: boolean;
  approved: boolean;
  approvedBy?: string;
  timestamp?: string;
  rationale: string;
}

export interface VerificationReport {
  verificationId: string;
  missionId: string;
  repository: string;
  targetBranch: string;
  solutionSelected: 'solution_a' | 'solution_b' | 'custom';
  verified: boolean;
  cryptographicEvidenceHash: string;
  timestamp: string;
  testsRun: number;
  testsPassed: number;
  repairCyclesCount: number;
  securityChecks: SecurityFinding[];
  browserVerification?: BrowserVerificationResult;
  summary: string;
}

export interface PullRequestEvidence {
  number: number;
  title: string;
  branch: string;
  targetBranch: string;
  htmlUrl: string;
  diffUrl: string;
  bodyMarkdown: string;
  author: string;
  createdAt: string;
  labels: string[];
  checksPassed: boolean;
  isRealProviderPr?: boolean;
  providerStatusText?: string;
}

export interface Mission {
  id: string;
  issueNumber: number;
  issueTitle: string;
  issueDescription: string;
  repository: RepositoryContext;
  status: MissionStatus;
  currentStepIndex: number;
  selectedSolutionId?: 'solution_a' | 'solution_b' | 'custom';
  customInstructions?: string;
  solutions: {
    solution_a: SolutionOption;
    solution_b: SolutionOption;
    custom?: SolutionOption;
  };
  events: AgentEvent[];
  sandbox?: SandboxExecution;
  initialTestResults?: TestResult;
  repairedTestResults?: TestResult;
  repairCycles: number;
  repairLoop?: AutonomousRepairLoop;
  securityFindings: SecurityFinding[];
  browserVerification?: BrowserVerificationResult;
  verificationReport?: VerificationReport;
  pullRequest?: PullRequestEvidence;
  githubStatus?: GitHubProviderStatus;
  deployment?: DeploymentIntegration;
  notifications?: NotificationAdapterStatus;
  approvals?: ApprovalGate[];
  isDemo: boolean;
  createdAt: string;
  completedAt?: string;
}

export interface BenchmarkMetrics {
  taskSuccessRate: number;
  avgRepairCycles: number;
  avgExecutionTimeSec: number;
  testPassRate: number;
  regressionRate: number;
  humanInterventionRate: number;
  securityDetectionRate: number;
  industryCopilotComparison: {
    codeForgeSuccess: number;
    standardAIAssistant: number;
    rawLlmCompletion: number;
  };
}

export interface AIProviderSettings {
  provider: 'openrouter' | 'openai' | 'anthropic' | 'local_ollama' | 'nebius_nvidia_legacy';
  openrouterModel: string;
  openrouterBaseUrl: string;
  nebiusModel?: string;
  nebiusApiKey?: string;
  temperature: number;
  maxTokens: number;
  sandboxCpuLimit: string;
  sandboxMemoryLimit: string;
  // External Provider Integrations
  githubToken?: string;
  vercelToken?: string;
  vercelProjectId?: string;
  resendApiKey?: string;
  twilioSid?: string;
  twilioAuthToken?: string;
  twilioPhoneNumber?: string;
  n8nWebhookUrl: string;
  n8nEnabled: boolean;
}
