import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { Mission, RepositoryContext } from '../../types/codeforge';

const isServerless = process.env.VERCEL === '1' || !!process.env.AWS_LAMBDA_FUNCTION_NAME;
const DATA_DIR = isServerless ? path.join('/tmp', 'codeforge-data') : path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'storage.json');
const WORKSPACES_DIR = path.join(DATA_DIR, 'workspaces');

export interface DbUser {
  id: string;
  email: string;
  passwordHash: string;
  salt: string;
  name: string;
  firstName: string;
  avatar: string;
  role: 'USER' | 'DEVELOPER';
  provider: 'github' | 'google' | 'email';
  githubUsername?: string;
  githubToken?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DbSession {
  id: string;
  userId: string;
  token: string;
  expiresAt: string;
  createdAt: string;
}

export interface DbProject {
  id: string;
  userId: string;
  name: string;
  description: string;
  repository: RepositoryContext;
  mission: Mission;
  workspacePath: string;
  tags?: string[];
  isArchived?: boolean;
  version?: number;
  createdAt: string;
  updatedAt: string;
}

export interface DbStudioArtifact {
  id: string;
  userId: string;
  projectId?: string;
  title: string;
  category: 'architecture' | 'ui_concept' | 'poster' | 'storyboard' | 'character';
  prompt: string;
  content: string; // SVG / JSON / Canvas data
  previewUrl?: string;
  tags?: string[];
  version?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface DbSchema {
  users: DbUser[];
  sessions: DbSession[];
  projects: DbProject[];
  studioArtifacts: DbStudioArtifact[];
  executionLogs: Array<{
    id: string;
    projectId: string;
    missionId: string;
    command: string;
    stdout: string;
    stderr: string;
    exitCode: number;
    durationMs: number;
    createdAt: string;
  }>;
}

function ensureDirs() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(WORKSPACES_DIR)) {
      fs.mkdirSync(WORKSPACES_DIR, { recursive: true });
    }
  } catch (err) {
    console.warn('Could not ensure data directories on disk, using memory store:', err);
  }
}

function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
}

function createDefaultDb(): DbSchema {
  const defaultSalt = crypto.randomBytes(16).toString('hex');
  const defaultUser: DbUser = {
    id: 'usr_om_sharma',
    email: 'om@codeforge.dev',
    passwordHash: hashPassword('developer123', defaultSalt),
    salt: defaultSalt,
    name: 'Om Sharma',
    firstName: 'Om',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Om',
    role: 'DEVELOPER',
    provider: 'github',
    githubUsername: 'om-sharma',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const testSalt = crypto.randomBytes(16).toString('hex');
  const testUser: DbUser = {
    id: 'usr_alice_dev',
    email: 'alice@codeforge.dev',
    passwordHash: hashPassword('alice123', testSalt),
    salt: testSalt,
    name: 'Alice Cooper',
    firstName: 'Alice',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Alice',
    role: 'USER',
    provider: 'email',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const defaultProject: DbProject = {
    id: 'proj_om_default',
    userId: 'usr_om_sharma',
    name: 'Nexus Backend Auth API',
    description: 'Fix JWT Race Condition & Token Replay during Concurrent Token Refresh',
    workspacePath: path.join(WORKSPACES_DIR, 'proj_om_default'),
    repository: {
      id: 'repo_fastapi_auth',
      name: 'nexus-backend-api',
      fullName: 'acme-corp/nexus-backend-api',
      defaultBranch: 'main',
      language: 'Python',
      framework: 'FastAPI + SQLAlchemy + Redis',
      packageManager: 'poetry / pip',
      structure: {
        totalFiles: 48,
        entryPoints: ['app/main.py', 'app/api/v1/router.py'],
        apiEndpoints: [
          'POST /api/v1/auth/login',
          'POST /api/v1/auth/refresh',
          'POST /api/v1/payments/charge',
          'GET /api/v1/users/me',
          'GET /api/v1/health'
        ],
        databaseModels: ['User', 'SessionToken', 'PaymentLedger', 'AuditLog'],
        testSuites: ['tests/test_auth_flow.py', 'tests/test_payments.py'],
        riskyFiles: ['app/services/token_manager.py', 'app/middleware/auth.py'],
        dependencies: { fastapi: '^0.111.0', redis: '^5.0.4', sqlalchemy: '^2.0.30' }
      },
      stats: { stars: 432, forks: 89, openIssues: 14, lastCommit: '2 hours ago' }
    },
    mission: ({
      id: 'msn_default_seed',
      issueNumber: 142,
      issueTitle: 'Fix JWT Race Condition & Token Replay during Concurrent Token Refresh',
      status: 'PR_CREATED',
      currentStep: 6,
      totalSteps: 6,
      repository: {
        id: 'repo_fastapi_auth',
        name: 'nexus-backend-api',
        fullName: 'acme-corp/nexus-backend-api',
        defaultBranch: 'main',
        language: 'Python',
        framework: 'FastAPI + SQLAlchemy + Redis',
        packageManager: 'poetry / pip',
        structure: {
          totalFiles: 48,
          entryPoints: ['app/main.py', 'app/api/v1/router.py'],
          apiEndpoints: ['POST /api/v1/auth/login', 'POST /api/v1/auth/refresh', 'GET /api/v1/health'],
          databaseModels: ['User', 'SessionToken'],
          testSuites: ['tests/test_auth_flow.py'],
          riskyFiles: ['app/services/token_manager.py'],
          dependencies: { fastapi: '^0.111.0', redis: '^5.0.4' }
        },
        stats: { stars: 432, forks: 89, openIssues: 14, lastCommit: '2 hours ago' }
      },
      solutions: {
        solution_a: {
          id: 'solution_a',
          title: 'Conservative: DB Transaction Isolation & Row Lock',
          strategy: 'conservative',
          description: 'Pessimistic locking via SELECT FOR UPDATE on SessionToken table with minimal blast radius.',
          architecturalChanges: ['Added row-level lock on SessionToken lookup', 'Enforced atomic database commit'],
          filesAffected: ['app/services/token_manager.py', 'app/database/session.py'],
          linesAdded: 14, linesRemoved: 6,
          riskLevel: 'LOW', estimatedComplexity: 'LOW', confidenceScore: 92,
          pros: ['Zero architectural redesign', 'Deterministic serialization', 'Immediate rollback capability'],
          cons: ['Slightly higher DB latency under extreme concurrency'],
          diffPreview: '@@ -42,6 +42,9 @@ async def refresh_token(token: str):\n+    async with db.transaction():\n+        stmt = select(SessionToken).where(SessionToken.val == token).with_for_update()\n+        sess = await db.execute(stmt)'
        },
        solution_b: {
          id: 'solution_b',
          title: 'Architectural: Redis Distributed Mutex & Grace Window',
          strategy: 'improvement',
          description: 'Single-flight distributed mutex in Redis with 15-second grace window and RFC 6749 Token Family rotation.',
          architecturalChanges: ['Single-flight Redis mutex prevents duplicate token generation', 'RFC 6749 token family tracking with 15s grace cache', 'Invalidate all tokens if duplicate used outside grace'],
          filesAffected: ['app/services/token_manager.py', 'app/middleware/auth.py', 'app/database/session.py'],
          linesAdded: 68, linesRemoved: 14,
          riskLevel: 'MEDIUM', estimatedComplexity: 'MEDIUM', confidenceScore: 97,
          pros: ['Eliminates mobile token storm', 'Zero extra DB load', 'Cryptographically verified RFC 6749 rotation'],
          cons: ['Requires Redis availability'],
          diffPreview: '@@ -30,12 +30,28 @@ async def rotate_token_family(user_id: str, old_token: str):\n+    lock_key = f"mutex:refresh:{old_token}"\n+    acquired = await redis.set(lock_key, "1", nx=True, ex=15)\n+    if not acquired:\n+        cached = await redis.get(f"grace:{old_token}")\n+        if cached: return cached'
        }
      },
      selectedSolutionId: 'solution_b',
      events: [
        { id: 'ev_0', agent: 'REPO_INTELLIGENCE', title: 'Repository Analyzed', description: 'AST parsed 48 files across acme-corp/nexus-backend-api.', severity: 'info', timestamp: new Date(Date.now() - 60000).toISOString() },
        { id: 'ev_1', agent: 'SOLUTION_ARCHITECT', title: 'Dual A/B Strategies Formulated', description: 'Option A (Conservative) vs Option B (Redis Mutex) generated.', severity: 'info', timestamp: new Date(Date.now() - 45000).toISOString() },
        { id: 'ev_2', agent: 'CODING_AGENT', title: 'Repair Patch Injected', description: 'Applied RFC 6749 Token Family Rotation with Redis Mutex.', severity: 'success', timestamp: new Date(Date.now() - 30000).toISOString() },
        { id: 'ev_3', agent: 'TEST_DEBUG_REPAIR', title: '18/18 Regression Tests Passing', description: 'Isolated sandbox confirmed 0 regression errors.', severity: 'success', timestamp: new Date(Date.now() - 15000).toISOString() },
        { id: 'ev_4', agent: 'PR_AGENT', title: 'SHA-256 Verified PR Created', description: 'Cryptographic commit sealed into GitHub PR #143.', severity: 'success', timestamp: new Date().toISOString() }
      ],
      sandbox: { containerId: 'cf-box-94f82a1', cgroupsLimits: { memoryMb: 4096, cpuQuota: '2.0', networkPolicy: 'quarantined' }, ports: [8000], activeProcesses: ['uvicorn app.main:app'], startedAt: new Date().toISOString() },
      verificationReport: { testsRun: 18, testsPassed: 18, testsFailed: 0, coveragePct: 98.4, executionTimeSec: 42, cryptographicProof: 'sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855' },
      pullRequest: { number: 143, title: 'fix: eliminate JWT concurrency race condition with RFC 6749 grace window', url: 'https://github.com/acme-corp/nexus-backend-api/pull/143', diffUrl: 'https://github.com/acme-corp/nexus-backend-api/pull/143.diff', sha256Evidence: 'sha256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', branch: 'codeforge/fix-jwt-concurrency-token-replay', createdAt: new Date().toISOString() }
    }) as unknown as Mission,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const defaultArtifact: DbStudioArtifact = {
    id: 'art_seed_arch',
    userId: 'usr_om_sharma',
    projectId: 'proj_om_default',
    title: 'Nexus API Concurrency Architecture & Redis Grace Window',
    category: 'architecture',
    prompt: 'Nexus API Concurrency Architecture & Redis Grace Window',
    content: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="100%" height="100%">
  <rect width="800" height="450" fill="#030408" rx="16"/>
  <rect x="40" y="180" width="160" height="90" fill="#080c18" stroke="#00f3ff" stroke-width="1.5" rx="10"/>
  <text x="120" y="220" fill="#f8fafc" font-size="13" font-family="'Orbitron', monospace" text-anchor="middle" font-weight="bold">MOBILE CLIENTS</text>
  <text x="120" y="240" fill="#64748b" font-size="11" font-family="'Space Mono', monospace" text-anchor="middle">Concurrent /refresh</text>
  <path d="M 200 225 L 300 225" stroke="#00f3ff" stroke-width="2" marker-end="url(#arrow)" stroke-dasharray="4,4"/>
  <rect x="300" y="140" width="200" height="170" fill="#0c1024" stroke="#cf3fff" stroke-width="1.5" rx="12"/>
  <text x="400" y="175" fill="#cf3fff" font-size="13" font-family="'Orbitron', monospace" text-anchor="middle" font-weight="bold">TOKEN MANAGER</text>
  <text x="400" y="200" fill="#f8fafc" font-size="11" font-family="'Space Mono', monospace" text-anchor="middle">asyncio.Lock()</text>
  <text x="400" y="230" fill="#00ff99" font-size="11" font-family="'Space Mono', monospace" text-anchor="middle">Redis Pipeline Mutex</text>
  <text x="400" y="260" fill="#64748b" font-size="10" font-family="'Space Mono', monospace" text-anchor="middle">15s Grace Cache</text>
  <text x="400" y="285" fill="#ffaa00" font-size="10" font-family="'Space Mono', monospace" text-anchor="middle">Token Family Rotation</text>
  <path d="M 500 200 L 600 160" stroke="#cf3fff" stroke-width="1.5"/>
  <path d="M 500 250 L 600 290" stroke="#00ff99" stroke-width="1.5"/>
  <rect x="600" y="120" width="160" height="80" fill="#080c18" stroke="#ff4466" stroke-width="1.5" rx="8"/>
  <text x="680" y="155" fill="#ff6b8b" font-size="12" font-family="'Orbitron', monospace" text-anchor="middle" font-weight="bold">REDIS CACHE</text>
  <text x="680" y="175" fill="#64748b" font-size="10" font-family="'Space Mono', monospace" text-anchor="middle">Atomic Grace TTL</text>
  <rect x="600" y="250" width="160" height="80" fill="#080c18" stroke="#00ff99" stroke-width="1.5" rx="8"/>
  <text x="680" y="285" fill="#00ff99" font-size="12" font-family="'Orbitron', monospace" text-anchor="middle" font-weight="bold">SQL DATABASE</text>
  <text x="680" y="305" fill="#64748b" font-size="10" font-family="'Space Mono', monospace" text-anchor="middle">SessionToken Table</text>
</svg>`,
    tags: ['architecture', 'redis', 'concurrency'],
    version: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return {
    users: [defaultUser, testUser],
    sessions: [],
    projects: [defaultProject],
    studioArtifacts: [defaultArtifact],
    executionLogs: [],
  };
}

export class Database {
  private static memoryDb: DbSchema | null = null;

  private static readDb(): DbSchema {
    if (this.memoryDb) {
      return this.memoryDb;
    }
    ensureDirs();
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (!parsed.studioArtifacts) parsed.studioArtifacts = [];
        if (!parsed.projects) parsed.projects = [];
        this.memoryDb = parsed;
        return parsed;
      }
    } catch (err) {
      console.warn('Error reading storage.json, recovering with in-memory store:', err);
    }
    const fallback = createDefaultDb();
    this.memoryDb = fallback;
    this.writeDb(fallback);
    return fallback;
  }

  private static writeDb(data: DbSchema): void {
    this.memoryDb = data;
    ensureDirs();
    try {
      const tempFile = `${DB_FILE}.${Date.now()}.tmp`;
      fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
      fs.renameSync(tempFile, DB_FILE);
    } catch (err) {
      // On read-only environments (Vercel), silently preserve state in memory
      // console.warn('Disk write skipped in serverless environment');
    }
  }

  public static getUsers(): DbUser[] {
    return this.readDb().users;
  }

  public static getUserById(userId: string): DbUser | null {
    const db = this.readDb();
    return db.users.find(u => u.id === userId) || null;
  }

  // --- USER OPERATIONS ---
  public static findUserByEmail(email: string): DbUser | null {
    const db = this.readDb();
    return db.users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
  }

  public static findUserById(id: string): DbUser | null {
    const db = this.readDb();
    return db.users.find((u) => u.id === id) || null;
  }

  public static createUser(params: {
    email: string;
    password?: string;
    name: string;
    firstName?: string;
    avatar?: string;
    role?: 'USER' | 'DEVELOPER';
    provider?: 'github' | 'google' | 'email';
    githubUsername?: string;
    githubToken?: string;
  }): DbUser {
    const db = this.readDb();
    const existing = db.users.find((u) => u.email.toLowerCase() === params.email.toLowerCase());
    if (existing) {
      throw new Error('User with this email already exists');
    }

    const salt = crypto.randomBytes(16).toString('hex');
    const passwordHash = params.password ? hashPassword(params.password, salt) : '';
    const firstName = params.firstName || params.name.split(' ')[0] || 'User';

    const newUser: DbUser = {
      id: `usr_${crypto.randomBytes(8).toString('hex')}`,
      email: params.email.toLowerCase(),
      passwordHash,
      salt,
      name: params.name,
      firstName,
      avatar: params.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(firstName)}`,
      role: params.role || 'DEVELOPER',
      provider: params.provider || 'email',
      githubUsername: params.githubUsername,
      githubToken: params.githubToken,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.users.push(newUser);
    this.writeDb(db);
    return newUser;
  }

  public static verifyPassword(user: DbUser, passwordAttempt: string): boolean {
    if (!user.passwordHash || !user.salt) return false;
    const attemptHash = hashPassword(passwordAttempt, user.salt);
    return user.passwordHash === attemptHash;
  }

  public static updateUser(userId: string, updates: Partial<DbUser>): DbUser | null {
    const db = this.readDb();
    const idx = db.users.findIndex((u) => u.id === userId);
    if (idx === -1) return null;

    db.users[idx] = {
      ...db.users[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.writeDb(db);
    return db.users[idx];
  }

  // --- SESSION OPERATIONS ---
  public static createSession(userId: string, daysValid: number = 7): DbSession {
    const db = this.readDb();
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + daysValid * 24 * 60 * 60 * 1000).toISOString();

    const newSession: DbSession = {
      id: `ses_${crypto.randomBytes(8).toString('hex')}`,
      userId,
      token,
      expiresAt,
      createdAt: new Date().toISOString(),
    };

    db.sessions = db.sessions.filter((s) => new Date(s.expiresAt) > new Date());
    db.sessions.push(newSession);
    this.writeDb(db);
    return newSession;
  }

  public static getSession(token: string): { session: DbSession; user: DbUser } | null {
    if (!token) return null;
    const db = this.readDb();
    const session = db.sessions.find((s) => s.token === token);
    if (!session) return null;

    if (new Date(session.expiresAt) <= new Date()) {
      return null;
    }

    const user = db.users.find((u) => u.id === session.userId);
    if (!user) return null;

    return { session, user };
  }

  public static deleteSession(token: string): void {
    const db = this.readDb();
    db.sessions = db.sessions.filter((s) => s.token !== token);
    this.writeDb(db);
  }

  // --- PROJECT OPERATIONS ---
  public static getProjects(): DbProject[] {
    const db = this.readDb();
    return db.projects || [];
  }

  public static listProjectsForUser(userId: string): DbProject[] {
    const db = this.readDb();
    return db.projects.filter((p) => p.userId === userId);
  }

  public static getProject(projectId: string, userId?: string): DbProject | null {
    const db = this.readDb();
    const project = db.projects.find((p) => p.id === projectId);
    if (!project) return null;
    if (userId && project.userId !== userId) {
      return null;
    }
    return project;
  }

  public static saveProject(project: DbProject): DbProject {
    const db = this.readDb();
    const idx = db.projects.findIndex((p) => p.id === project.id);
    project.updatedAt = new Date().toISOString();

    if (idx >= 0) {
      db.projects[idx] = project;
    } else {
      db.projects.push(project);
    }
    this.writeDb(db);
    return project;
  }

  public static duplicateProject(projectId: string, userId: string, newName?: string): DbProject | null {
    const db = this.readDb();
    const source = db.projects.find((p) => p.id === projectId && p.userId === userId);
    if (!source) return null;

    const newId = `proj_${crypto.randomBytes(6).toString('hex')}_copy`;
    const newWs = path.join(WORKSPACES_DIR, newId);

    // Copy workspace files if exist
    if (fs.existsSync(source.workspacePath)) {
      try {
        fs.cpSync(source.workspacePath, newWs, { recursive: true });
      } catch (err) {
        console.warn('Could not deep copy workspace directory:', err);
      }
    }

    const duplicated: DbProject = {
      ...JSON.parse(JSON.stringify(source)),
      id: newId,
      name: newName || `${source.name} (Copy)`,
      workspacePath: newWs,
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.projects.push(duplicated);
    this.writeDb(db);
    return duplicated;
  }

  public static deleteProject(projectId: string, userId: string): boolean {
    const db = this.readDb();
    const idx = db.projects.findIndex((p) => p.id === projectId && p.userId === userId);
    if (idx === -1) return false;

    const project = db.projects[idx];
    if (fs.existsSync(project.workspacePath)) {
      try {
        fs.rmSync(project.workspacePath, { recursive: true, force: true });
      } catch (err) {
        console.warn('Could not remove workspace path:', err);
      }
    }

    db.projects.splice(idx, 1);
    this.writeDb(db);
    return true;
  }

  // --- CREATIVE STUDIO ARTIFACTS ---
  public static listStudioArtifacts(userId: string): DbStudioArtifact[] {
    const db = this.readDb();
    return db.studioArtifacts.filter((a) => a.userId === userId);
  }

  public static saveStudioArtifact(artifact: DbStudioArtifact): DbStudioArtifact {
    const db = this.readDb();
    const idx = db.studioArtifacts.findIndex((a) => a.id === artifact.id);
    artifact.updatedAt = new Date().toISOString();

    if (idx >= 0) {
      db.studioArtifacts[idx] = artifact;
    } else {
      db.studioArtifacts.push(artifact);
    }
    this.writeDb(db);
    return artifact;
  }

  public static deleteStudioArtifact(artifactId: string, userId: string): boolean {
    const db = this.readDb();
    const idx = db.studioArtifacts.findIndex((a) => a.id === artifactId && a.userId === userId);
    if (idx === -1) return false;

    db.studioArtifacts.splice(idx, 1);
    this.writeDb(db);
    return true;
  }

  // --- EXECUTION LOGS ---
  public static appendExecutionLog(log: {
    projectId: string;
    missionId: string;
    command: string;
    stdout: string;
    stderr: string;
    exitCode: number;
    durationMs: number;
  }): void {
    const db = this.readDb();
    db.executionLogs.push({
      id: `log_${crypto.randomBytes(8).toString('hex')}`,
      ...log,
      createdAt: new Date().toISOString(),
    });
    if (db.executionLogs.length > 500) {
      db.executionLogs = db.executionLogs.slice(-500);
    }
    this.writeDb(db);
  }

  public static getExecutionLogs(projectId: string): DbSchema['executionLogs'] {
    const db = this.readDb();
    return db.executionLogs.filter((l) => l.projectId === projectId);
  }
}
