import {
  Mission,
  MissionStatus,
  AgentEvent,
  SolutionOption,
  RepositoryContext,
  SecurityFinding,
  VerificationReport,
  PullRequestEvidence,
  TestResult
} from '../types/codeforge';
import { SAMPLE_REPOSITORIES, DEMO_PRESET_MISSIONS } from './mockRepositoryData';
import { N8nAutomationService } from './n8nService';
import { generateUUID } from '../lib/utils';

export type MissionUpdateCallback = (mission: Mission, newEvent?: AgentEvent) => void;

export class AgentOrchestrator {
  private activeMission: Mission | null = null;
  private listeners: Set<MissionUpdateCallback> = new Set();
  private isRunning: boolean = false;
  private cancelRequested: boolean = false;

  public subscribe(callback: MissionUpdateCallback): () => void {
    this.listeners.add(callback);
    if (this.activeMission) {
      callback(this.activeMission);
    }
    return () => {
      this.listeners.delete(callback);
    };
  }

  private notify(newEvent?: AgentEvent) {
    if (!this.activeMission) return;
    const missionClone = JSON.parse(JSON.stringify(this.activeMission)) as Mission;
    this.listeners.forEach((fn) => fn(missionClone, newEvent));
    if (newEvent) {
      N8nAutomationService.dispatchEvent(missionClone, newEvent);
    }
  }

  public getActiveMission(): Mission | null {
    return this.activeMission;
  }

  public createMission(
    repo: RepositoryContext = SAMPLE_REPOSITORIES[0],
    issueTitle?: string,
    issueDescription?: string,
    issueNumber: number = 142
  ): Mission {
    const preset = DEMO_PRESET_MISSIONS[repo.id];

    const newMission: Mission = {
      id: `mission_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      issueNumber: issueNumber || preset?.issueNumber || 142,
      issueTitle: issueTitle || preset?.issueTitle || 'Fix JWT Race Condition & Token Replay during Concurrent Token Refresh',
      issueDescription: issueDescription || preset?.issueDescription || 'Concurrent mobile token refresh causes random 401 logouts due to lack of single-flight atomic synchronization.',
      repository: repo,
      status: 'IDLE',
      currentStepIndex: 0,
      repairCycles: 0,
      isDemo: true,
      createdAt: new Date().toISOString(),
      solutions: preset?.solutions || {
        solution_a: {
          id: 'solution_a',
          title: 'Solution A — Conservative / Minimal Change',
          subtitle: 'In-Memory Lock + Atomic Refresh Grace Window',
          type: 'conservative',
          tagline: 'Preserves existing session table; patches token_manager.py with minimal blast radius.',
          description: 'Atomic Redis lock with 15s grace period to mitigate duplicate requests.',
          filesAffected: ['app/services/token_manager.py', 'tests/test_auth_flow.py'],
          linesAdded: 24,
          linesRemoved: 8,
          complexity: 'Low',
          risk: 'Low',
          securityImpact: 'Eliminates concurrent token collision; maintains token security.',
          performanceImpact: '0.8ms Redis lock overhead during refresh only.',
          dependencyImpact: 'Zero new dependencies. Uses existing redis-py.',
          testImpact: 'Adds 2 concurrent unit tests.',
          estimatedEffort: 'Fast (~1 min)',
          recommended: false,
          explanation: 'Fastest fix with minimal blast radius.',
          diffs: []
        },
        solution_b: {
          id: 'solution_b',
          title: 'Solution B — Optimized / Architecture Improvement',
          subtitle: 'Single-Flight Token Rotation + Cryptographic Family Tree & Threat Detection',
          type: 'architectural',
          tagline: 'RFC 6749 recommended Token Family IDs with automated cascade revocation.',
          description: 'Introduces token family hash tracking with instant breach mitigation.',
          filesAffected: ['app/services/token_manager.py', 'app/database/models.py', 'app/middleware/auth.py', 'tests/test_auth_flow.py'],
          linesAdded: 68,
          linesRemoved: 14,
          complexity: 'Moderate',
          risk: 'Medium',
          securityImpact: 'Zero-trust token family rotation with automatic revocation cascades on breach.',
          performanceImpact: 'Pipelined Redis transaction + asynchronous audit logging.',
          dependencyImpact: 'Zero external dependencies; uses existing stack.',
          testImpact: 'Adds comprehensive concurrency stress tests & fuzz tests.',
          estimatedEffort: 'Comprehensive (~2 min)',
          recommended: true,
          explanation: 'Permanently eliminates race conditions while dramatically strengthening token breach protection.',
          diffs: []
        }
      },
      events: [
        {
          id: generateUUID(),
          timestamp: new Date().toISOString(),
          status: 'IDLE',
          agent: 'REPO_INTELLIGENCE',
          title: 'Mission Initialized',
          description: `Loaded repository ${repo.fullName} and ingested task #${issueNumber || 142}.`,
          severity: 'info'
        }
      ],
      securityFindings: []
    };

    this.activeMission = newMission;
    this.notify();
    return newMission;
  }

  public async startUnderstandingAndPlanning(): Promise<void> {
    if (!this.activeMission) return;
    this.cancelRequested = false;
    this.isRunning = true;

    // Step 1: Repository Intelligence
    await this.delay(700);
    if (this.cancelRequested) return;

    this.activeMission.status = 'REPOSITORY_ANALYZED';
    this.activeMission.currentStepIndex = 1;
    const repoEvent: AgentEvent = {
      id: generateUUID(),
      timestamp: new Date().toISOString(),
      status: 'REPOSITORY_ANALYZED',
      agent: 'REPO_INTELLIGENCE',
      title: 'Repository Structure & AST Ingestion Complete',
      description: `Indexed ${this.activeMission.repository.structure.totalFiles} files. Identified ${this.activeMission.repository.structure.apiEndpoints.length} API endpoints, ${this.activeMission.repository.structure.databaseModels.length} DB entities, and ${this.activeMission.repository.structure.riskyFiles.length} critical path files.`,
      affectedFiles: this.activeMission.repository.structure.riskyFiles,
      durationMs: 680,
      evidence: {
        command: `codeforge-ast index --repo ${this.activeMission.repository.name} --depth 4`,
        exitCode: 0,
        stdout: `Parsed 48 modules in 0.68s. AST graph built with 324 nodes.`
      },
      severity: 'info'
    };
    this.activeMission.events.push(repoEvent);
    this.notify(repoEvent);

    // Step 2: Engineering Planner / Solution Architect
    await this.delay(900);
    if (this.cancelRequested) return;

    this.activeMission.status = 'SOLUTIONS_GENERATED';
    this.activeMission.currentStepIndex = 2;
    const planEvent: AgentEvent = {
      id: generateUUID(),
      timestamp: new Date().toISOString(),
      status: 'SOLUTIONS_GENERATED',
      agent: 'SOLUTION_ARCHITECT',
      title: 'Solution Architect Generated A/B Architectural Strategies',
      description: `Generated Solution A (Minimal Blast Radius, 2 files) and Solution B (Architecture Improvement with Token Family Tree, 4 files). Awaiting user selection or custom constraints.`,
      affectedFiles: this.activeMission.solutions.solution_b.filesAffected,
      durationMs: 890,
      severity: 'success'
    };
    this.activeMission.events.push(planEvent);
    this.notify(planEvent);
    this.isRunning = false;
  }

  public async selectSolutionAndExecute(
    solutionId: 'solution_a' | 'solution_b' | 'custom',
    customPrompt?: string
  ): Promise<void> {
    if (!this.activeMission) return;
    this.cancelRequested = false;
    this.isRunning = true;
    this.activeMission.selectedSolutionId = solutionId;
    this.activeMission.customInstructions = customPrompt;

    if (solutionId === 'custom' && customPrompt) {
      // Synthesize custom hybrid solution
      this.activeMission.solutions.custom = {
        id: 'custom',
        title: 'Custom Hybrid Solution',
        subtitle: 'User Constrained Solution Pipeline',
        type: 'custom',
        tagline: customPrompt,
        description: `Custom synthesized strategy adhering to user constraint: "${customPrompt}"`,
        filesAffected: ['app/services/token_manager.py', 'app/middleware/auth.py', 'tests/test_auth_flow.py'],
        linesAdded: 45,
        linesRemoved: 10,
        complexity: 'Moderate',
        risk: 'Low',
        securityImpact: 'Enhanced concurrency control with custom constraints.',
        performanceImpact: 'Optimized execution profile.',
        dependencyImpact: 'Zero new dependencies.',
        testImpact: 'Customized regression test suite.',
        estimatedEffort: 'Adaptive (~1.5 min)',
        recommended: false,
        explanation: 'Tailored hybrid combining user-requested parameters.',
        customPromptConstraint: customPrompt,
        diffs: this.activeMission.solutions.solution_b.diffs
      };
    }

    // Step: Solution Selected
    this.activeMission.status = 'SOLUTION_SELECTED';
    const selectEvent: AgentEvent = {
      id: generateUUID(),
      timestamp: new Date().toISOString(),
      status: 'SOLUTION_SELECTED',
      agent: 'SOLUTION_ARCHITECT',
      title: `Selected ${solutionId === 'solution_a' ? 'Solution A (Conservative)' : solutionId === 'solution_b' ? 'Solution B (Architectural)' : 'Custom Hybrid Solution'}`,
      description: `User authorized execution path. Initializing isolated sandbox and dispatching Coding Agent.`,
      severity: 'info'
    };
    this.activeMission.events.push(selectEvent);
    this.notify(selectEvent);

    // Step: Coding Agent
    await this.delay(900);
    if (this.cancelRequested) return;

    this.activeMission.status = 'CODING_STARTED';
    this.activeMission.currentStepIndex = 3;
    const codingEvent: AgentEvent = {
      id: generateUUID(),
      timestamp: new Date().toISOString(),
      status: 'CODING_STARTED',
      agent: 'CODING_AGENT',
      title: 'Coding Agent Generating Workspace Patch',
      description: `Applied atomic lock and token rotation semantics to app/services/token_manager.py. Generated 68 additions, 14 deletions across affected files.`,
      affectedFiles: ['app/services/token_manager.py', 'app/database/models.py'],
      durationMs: 920,
      evidence: {
        command: 'git apply --check /tmp/patch_solution_b.diff',
        exitCode: 0,
        diffSnippet: `+ async with redis.lock(lock_key, timeout=12):\n+     cached_result = await redis.get(f"token_grace:{refresh_token}")\n+     if cached_result: return TokenPair.model_validate_json(cached_result)`
      },
      severity: 'info'
    };
    this.activeMission.events.push(codingEvent);
    this.notify(codingEvent);

    // Step: Sandbox Spin-up
    await this.delay(800);
    if (this.cancelRequested) return;

    this.activeMission.status = 'SANDBOX_STARTED';
    this.activeMission.currentStepIndex = 4;
    this.activeMission.sandbox = {
      id: generateUUID(),
      containerId: 'cf-box-94f82a1',
      cpuLimit: '2.0 vCPU',
      memoryLimit: '4096 MB',
      isolatedNetwork: true,
      status: 'RUNNING',
      startTime: new Date().toISOString(),
      durationMs: 0,
      commands: [
        {
          cmd: 'docker run -d --cpus=2.0 --memory=4096m --network=isolated-bridge forge-env:py313-fastapi',
          exitCode: 0,
          stdout: 'Container cf-box-94f82a1 started with seccomp profile strict.',
          stderr: '',
          durationMs: 410
        },
        {
          cmd: 'poetry run uvicorn app.main:app --port 8000 &',
          exitCode: 0,
          stdout: 'INFO: Application startup complete. Uvicorn running on http://127.0.0.1:8000',
          stderr: '',
          durationMs: 380
        }
      ]
    };

    const sandboxEvent: AgentEvent = {
      id: generateUUID(),
      timestamp: new Date().toISOString(),
      status: 'SANDBOX_STARTED',
      agent: 'SANDBOX_ENGINE',
      title: 'Isolated Sandbox Environment Initialized',
      description: `Container cf-box-94f82a1 allocated with strict CPU (2.0 vCPU) & memory (4GB) boundaries. Process containment active.`,
      durationMs: 790,
      evidence: {
        command: 'sandbox-ctl verify --container cf-box-94f82a1',
        exitCode: 0,
        stdout: 'cgroups v2 limits enforced. Network ingress/egress quarantined to loopback.'
      },
      severity: 'info'
    };
    this.activeMission.events.push(sandboxEvent);
    this.notify(sandboxEvent);

    // Step: Test Execution (Phase 1: Detects initial concurrency edge case)
    await this.delay(1000);
    if (this.cancelRequested) return;

    this.activeMission.status = 'TEST_STARTED';
    this.activeMission.currentStepIndex = 5;
    const testStartEvent: AgentEvent = {
      id: generateUUID(),
      timestamp: new Date().toISOString(),
      status: 'TEST_STARTED',
      agent: 'TEST_DEBUG_REPAIR',
      title: 'Running Automated Concurrency & Unit Test Suite',
      description: `Executing pytest tests/test_auth_flow.py with 100 concurrent async client threads.`,
      durationMs: 950,
      evidence: {
        command: 'pytest -v tests/test_auth_flow.py --asyncio-mode=auto',
        exitCode: 1,
        stdout: `tests/test_auth_flow.py::test_login_flow PASSED [ 25%]
tests/test_auth_flow.py::test_token_expiry PASSED [ 50%]
tests/test_auth_flow.py::test_concurrent_refresh_race FAILED [ 75%]
tests/test_auth_flow.py::test_revoked_token PASSED [100%]`
      },
      severity: 'warning'
    };
    this.activeMission.events.push(testStartEvent);
    this.notify(testStartEvent);

    // Step: Test Failed & Diagnosis Captured
    await this.delay(900);
    if (this.cancelRequested) return;

    this.activeMission.status = 'TEST_FAILED';
    const initialTestResult: TestResult = {
      suiteName: 'tests/test_auth_flow.py',
      total: 4,
      passed: 3,
      failed: 1,
      skipped: 0,
      durationSec: 1.84,
      failures: [
        {
          testName: 'test_concurrent_refresh_race',
          filePath: 'tests/test_auth_flow.py',
          line: 114,
          errorMessage: 'AssertionError: Expected 200 OK for concurrent refresh, got 401 Unauthorized for request #2',
          stackTrace: `Traceback (most recent call last):
  File "/workspace/tests/test_auth_flow.py", line 114, in test_concurrent_refresh_race
    assert res2.status_code == 200, f"Expected 200, got {res2.status_code}"
AssertionError: Expected 200 OK for concurrent refresh, got 401 Unauthorized for request #2`,
          rootCauseDiagnosis: 'Race condition: Thread #2 arrived while Thread #1 was in the middle of writing new SessionToken record before the 15s Redis grace cache entry was finalized.',
          proposedPatch: 'Acquire Redis distributed lock before read, and write grace cache in atomic pipeline before committing DB transaction.'
        }
      ]
    };
    this.activeMission.initialTestResults = initialTestResult;

    const testFailEvent: AgentEvent = {
      id: generateUUID(),
      timestamp: new Date().toISOString(),
      status: 'TEST_FAILED',
      agent: 'TEST_DEBUG_REPAIR',
      title: 'Automated Test Captured Concurrency Race Condition',
      description: `Failure in test_concurrent_refresh_race: Thread #2 returned 401 during simultaneous in-flight rotation.`,
      affectedFiles: ['tests/test_auth_flow.py', 'app/services/token_manager.py'],
      durationMs: 880,
      evidence: {
        testSuite: 'tests/test_auth_flow.py',
        passCount: 3,
        failCount: 1,
        stderr: 'AssertionError: Expected 200 OK for concurrent refresh, got 401'
      },
      severity: 'error'
    };
    this.activeMission.events.push(testFailEvent);
    this.notify(testFailEvent);

    // Step: Failure Diagnosed
    await this.delay(850);
    if (this.cancelRequested) return;

    this.activeMission.status = 'FAILURE_DIAGNOSED';
    const diagEvent: AgentEvent = {
      id: generateUUID(),
      timestamp: new Date().toISOString(),
      status: 'FAILURE_DIAGNOSED',
      agent: 'TEST_DEBUG_REPAIR',
      title: 'Root Cause Diagnosed: Redis Lock / DB Commit Pipeline Ordering',
      description: `Identified gap between DB transaction commit and Redis grace key insertion. Self-Repair Agent preparing atomic pipeline fix.`,
      durationMs: 820,
      evidence: {
        command: 'codeforge-debugger diagnose --trace 0x4fa8',
        exitCode: 0,
        stdout: `Root cause identified: Pipeline sequencing flaw. Fix requires writing grace key before unlocking mutex.`
      },
      severity: 'warning'
    };
    this.activeMission.events.push(diagEvent);
    this.notify(diagEvent);

    // Step: Self-Repair Loop
    await this.delay(950);
    if (this.cancelRequested) return;

    this.activeMission.status = 'REPAIR_STARTED';
    this.activeMission.repairCycles = 1;
    const repairEvent: AgentEvent = {
      id: generateUUID(),
      timestamp: new Date().toISOString(),
      status: 'REPAIR_STARTED',
      agent: 'TEST_DEBUG_REPAIR',
      title: 'Self-Repair Agent Cycle #1 Initiated',
      description: `Synthesizing corrected synchronization block with atomic Redis pipeline in token_manager.py.`,
      affectedFiles: ['app/services/token_manager.py'],
      durationMs: 910,
      evidence: {
        diffSnippet: `+ async with redis.pipeline(transaction=True) as pipe:\n+     pipe.setex(f"token_grace:{refresh_token}", 15, new_token_pair.model_dump_json())\n+     await pipe.execute()`
      },
      severity: 'info'
    };
    this.activeMission.events.push(repairEvent);
    this.notify(repairEvent);

    // Step: Repair Completed
    await this.delay(850);
    if (this.cancelRequested) return;

    this.activeMission.status = 'REPAIR_COMPLETED';
    const repairCompEvent: AgentEvent = {
      id: generateUUID(),
      timestamp: new Date().toISOString(),
      status: 'REPAIR_COMPLETED',
      agent: 'TEST_DEBUG_REPAIR',
      title: 'Self-Repair Patch Applied Successfully',
      description: `Atomic pipeline patch injected into sandbox workspace. Triggering regression testing.`,
      durationMs: 800,
      severity: 'success'
    };
    this.activeMission.events.push(repairCompEvent);
    this.notify(repairCompEvent);

    // Step: Regression Testing
    await this.delay(950);
    if (this.cancelRequested) return;

    this.activeMission.status = 'REGRESSION_STARTED';
    this.activeMission.currentStepIndex = 6;
    const repairedTestResult: TestResult = {
      suiteName: 'tests/test_auth_flow.py + tests/test_payments.py + tests/test_rate_limit.py',
      total: 18,
      passed: 18,
      failed: 0,
      skipped: 0,
      durationSec: 2.34,
      failures: []
    };
    this.activeMission.repairedTestResults = repairedTestResult;

    const regressionEvent: AgentEvent = {
      id: generateUUID(),
      timestamp: new Date().toISOString(),
      status: 'REGRESSION_STARTED',
      agent: 'TEST_DEBUG_REPAIR',
      title: 'All Test Suites Passed (18/18 Tests Green, 0 Regressions)',
      description: `Reran full test suite + 200-worker concurrency benchmark. 100% pass rate achieved with 0.72ms p99 latency.`,
      durationMs: 950,
      evidence: {
        command: 'pytest -v tests/ --benchmark-only --asyncio-mode=auto',
        exitCode: 0,
        passCount: 18,
        failCount: 0,
        stdout: `tests/test_auth_flow.py ................. [100%]
tests/test_payments.py .................. [100%]
tests/test_rate_limit.py ................ [100%]
============================== 18 passed in 2.34s ==============================`
      },
      severity: 'success'
    };
    this.activeMission.events.push(regressionEvent);
    this.notify(regressionEvent);

    // Step: Security Verification
    await this.delay(850);
    if (this.cancelRequested) return;

    this.activeMission.status = 'SECURITY_SCAN_COMPLETED';
    this.activeMission.currentStepIndex = 7;
    const securityFindings: SecurityFinding[] = [
      {
        id: generateUUID(),
        category: 'SECRETS_SCAN',
        severity: 'PASS',
        title: 'Zero Secrets or API Keys Exposed',
        description: 'Scanned 4 modified files; no high-entropy tokens, AWS keys, or unhashed passwords found.',
        passed: true
      },
      {
        id: generateUUID(),
        category: 'INJECTION_PATTERN',
        severity: 'PASS',
        title: 'SQL & Redis Injection Defense Verified',
        description: 'All queries use SQLAlchemy ORM parameter binding and Redis safe key namespaces.',
        passed: true
      },
      {
        id: generateUUID(),
        category: 'DEPENDENCY_CVE',
        severity: 'PASS',
        title: 'Dependency Vulnerability Audit Clean',
        description: 'Audited 8 dependencies against PyPA / OSV database. Zero known CVEs.',
        passed: true
      },
      {
        id: generateUUID(),
        category: 'REGRESSION_CHECK',
        severity: 'PASS',
        title: 'Zero Regressions in Payment Ledger & Session Handlers',
        description: 'All upstream endpoints verified against baseline contracts.',
        passed: true
      }
    ];
    this.activeMission.securityFindings = securityFindings;

    const secEvent: AgentEvent = {
      id: generateUUID(),
      timestamp: new Date().toISOString(),
      status: 'SECURITY_SCAN_COMPLETED',
      agent: 'SECURITY_VERIFIER',
      title: 'Security & Verification Scan Passed (4/4 Audits Cleared)',
      description: `Security verifier passed secrets scanning, SQL injection checks, dependency CVE analysis, and sandbox isolation boundaries.`,
      durationMs: 820,
      evidence: {
        command: 'codeforge-sec audit --strict --report-json',
        exitCode: 0,
        securityFlags: ['SECRETS_CLEAN', 'ORM_SAFE', 'CVE_ZERO', 'ZERO_REGRESSION']
      },
      severity: 'success'
    };
    this.activeMission.events.push(secEvent);
    this.notify(secEvent);

    // Step: Verification Completed & Report Created
    await this.delay(800);
    if (this.cancelRequested) return;

    this.activeMission.status = 'VERIFICATION_COMPLETED';
    this.activeMission.currentStepIndex = 8;
    const verificationReport: VerificationReport = {
      verificationId: `VERIF-${Date.now().toString(36).toUpperCase()}`,
      missionId: this.activeMission.id,
      repository: this.activeMission.repository.fullName,
      targetBranch: 'main',
      solutionSelected: solutionId,
      verified: true,
      cryptographicEvidenceHash: `sha256:${generateUUID().replace(/-/g, '')}${generateUUID().replace(/-/g, '')}`,
      timestamp: new Date().toISOString(),
      testsRun: 18,
      testsPassed: 18,
      repairCyclesCount: 1,
      securityChecks: securityFindings,
      summary: 'Task successfully resolved with mathematical correctness, zero regressions, and full test evidence.'
    };
    this.activeMission.verificationReport = verificationReport;

    const verifEvent: AgentEvent = {
      id: generateUUID(),
      timestamp: new Date().toISOString(),
      status: 'VERIFICATION_COMPLETED',
      agent: 'SECURITY_VERIFIER',
      title: 'Cryptographic Verification Sealed',
      description: `Verification Report ${verificationReport.verificationId} generated with SHA256 evidence hash. Ready for GitHub PR creation.`,
      durationMs: 760,
      severity: 'success'
    };
    this.activeMission.events.push(verifEvent);
    this.notify(verifEvent);

    // Step: GitHub PR Created
    await this.delay(900);
    if (this.cancelRequested) return;

    this.activeMission.status = 'PR_CREATED';
    this.activeMission.completedAt = new Date().toISOString();
    const pullRequest: PullRequestEvidence = {
      number: this.activeMission.issueNumber + 10,
      title: `[CodeForge Autonomous Fix] Resolve JWT race condition & token replay (#${this.activeMission.issueNumber})`,
      branch: `codeforge/fix-issue-${this.activeMission.issueNumber}-token-race`,
      targetBranch: 'main',
      htmlUrl: `https://github.com/${this.activeMission.repository.fullName}/pull/${this.activeMission.issueNumber + 10}`,
      diffUrl: `https://github.com/${this.activeMission.repository.fullName}/pull/${this.activeMission.issueNumber + 10}.diff`,
      author: 'codeforge-agent[bot]',
      createdAt: new Date().toISOString(),
      labels: ['autonomous-engineer', 'verified-fix', 'tests-passing', 'security-cleared'],
      checksPassed: true,
      bodyMarkdown: `## 🤖 Autonomous Engineering Summary

### 📌 Issue Resolved
Fixes #${this.activeMission.issueNumber} — *${this.activeMission.issueTitle}*

---

### 🛡️ Solution Implemented
**${this.activeMission.solutions[solutionId === 'custom' ? 'custom' : solutionId]?.title || 'Solution B — Optimized Architecture'}**
- **Strategy:** Single-Flight Redis Distributed Lock + RFC 6749 Token Family Trees.
- **Files Modified:** 4 files (+68 / -14 lines).
- **Self-Repair:** Resolved initial lock acquisition ordering in Cycle #1.

---

### 🧪 Test & Verification Evidence
- **Test Suite:** \`tests/test_auth_flow.py\`, \`tests/test_payments.py\`, \`tests/test_rate_limit.py\`
- **Tests Executed:** 18/18 PASSED (100% Pass Rate)
- **Concurrency Test:** 100 simultaneous refresh requests tested with 0 failures (p99 latency: 0.72ms).
- **Security Findings:** 0 Secrets, 0 CVEs, 0 Injections.
- **Verification Hash:** \`${verificationReport.cryptographicEvidenceHash}\`

---

*Generated autonomously by [CodeForge](https://codeforge.dev)*`
    };
    this.activeMission.pullRequest = pullRequest;

    const prEvent: AgentEvent = {
      id: generateUUID(),
      timestamp: new Date().toISOString(),
      status: 'PR_CREATED',
      agent: 'PR_AGENT',
      title: `GitHub Pull Request #${pullRequest.number} Created & Verified`,
      description: `Branch ${pullRequest.branch} pushed and PR #${pullRequest.number} opened against ${pullRequest.targetBranch} with verified test proof.`,
      durationMs: 910,
      evidence: {
        command: `gh pr create --title "${pullRequest.title}" --head ${pullRequest.branch} --base main`,
        exitCode: 0,
        stdout: `Created pull request https://github.com/${this.activeMission.repository.fullName}/pull/${pullRequest.number}`
      },
      severity: 'success'
    };
    this.activeMission.events.push(prEvent);
    this.notify(prEvent);

    this.isRunning = false;
  }

  public cancelMission(): void {
    this.cancelRequested = true;
    this.isRunning = false;
    if (this.activeMission) {
      this.activeMission.status = 'MISSION_FAILED';
      const failEvent: AgentEvent = {
        id: generateUUID(),
        timestamp: new Date().toISOString(),
        status: 'MISSION_FAILED',
        agent: 'SANDBOX_ENGINE',
        title: 'Mission Cancelled / Terminated Safely',
        description: 'User initiated safe cancellation. Sandbox containers halted and resources reclaimed.',
        severity: 'warning'
      };
      this.activeMission.events.push(failEvent);
      this.notify(failEvent);
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export const orchestrator = new AgentOrchestrator();
