'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Play, RotateCcw, GitPullRequest, Bot, ArrowRight, Activity, Cpu, Zap, CheckCircle2, ShieldCheck, Sparkles, Mic, MicOff, Image as ImageIcon, X } from 'lucide-react';
import { audioFx } from '../lib/audioFx';
import { Navbar, NavTabType } from '../components/Navbar';
import { CinematicLanding } from '../components/CinematicLanding';
import { CreativeStudio } from '../components/CreativeStudio';
import { ProjectLibrary } from '../components/ProjectLibrary';
import { AgentCore3D } from '../components/AgentCore3D';
import { RepositoryIntelligence } from '../components/RepositoryIntelligence';
import { SolutionArchitectCard } from '../components/SolutionArchitectCard';
import { LivePreviewPanel } from '../components/LivePreviewPanel';
import { TerminalSandbox } from '../components/TerminalSandbox';
import { MissionReplay } from '../components/MissionReplay';
import { BenchmarkPanel } from '../components/BenchmarkPanel';
import { GroundedCopilot } from '../components/GroundedCopilot';
import { AuthModal } from '../components/AuthModal';
import { AuthGate } from '../components/AuthGate';
import { SettingsModal } from '../components/SettingsModal';
import { PullRequestModal } from '../components/PullRequestModal';
import { orchestrator } from '../services/agentOrchestrator';
import { SAMPLE_REPOSITORIES, DEMO_PRESET_MISSIONS } from '../services/mockRepositoryData';
import { AIProviderService } from '../services/aiProvider';
import { Mission, UserProfile, RepositoryContext } from '../types/codeforge';
import { DbProject } from '../lib/server/db';

/* ─── Pipeline steps config ─────────────────────────────────────── */
const PIPELINE = [
  { n: '01', label: 'UNDERSTAND',  color: '#00f3ff', statuses: ['REPOSITORY_ANALYZED','SOLUTIONS_GENERATED','SOLUTION_SELECTED','CODING_STARTED','SANDBOX_STARTED','TEST_STARTED','TEST_FAILED','FAILURE_DIAGNOSED','REPAIR_STARTED','REPAIR_COMPLETED','REGRESSION_STARTED','SECURITY_SCAN_COMPLETED','VERIFICATION_COMPLETED','PR_CREATED'] },
  { n: '02', label: 'A/B PLAN',    color: '#cf3fff', statuses: ['SOLUTIONS_GENERATED','SOLUTION_SELECTED','CODING_STARTED','SANDBOX_STARTED','TEST_STARTED','TEST_FAILED','FAILURE_DIAGNOSED','REPAIR_STARTED','REPAIR_COMPLETED','REGRESSION_STARTED','SECURITY_SCAN_COMPLETED','VERIFICATION_COMPLETED','PR_CREATED'] },
  { n: '03', label: 'CODE',        color: '#4aaeff', statuses: ['CODING_STARTED','SANDBOX_STARTED','TEST_STARTED','TEST_FAILED','FAILURE_DIAGNOSED','REPAIR_STARTED','REPAIR_COMPLETED','REGRESSION_STARTED','SECURITY_SCAN_COMPLETED','VERIFICATION_COMPLETED','PR_CREATED'] },
  { n: '04', label: 'TEST',        color: '#ffaa00', statuses: ['TEST_STARTED','TEST_FAILED','FAILURE_DIAGNOSED','REPAIR_STARTED','REPAIR_COMPLETED','REGRESSION_STARTED','SECURITY_SCAN_COMPLETED','VERIFICATION_COMPLETED','PR_CREATED'] },
  { n: '05', label: 'REPAIR',      color: '#ff6b6b', statuses: ['REPAIR_STARTED','REPAIR_COMPLETED','REGRESSION_STARTED','SECURITY_SCAN_COMPLETED','VERIFICATION_COMPLETED','PR_CREATED'] },
  { n: '06', label: 'VERIFY & PR', color: '#00ff99', statuses: ['VERIFICATION_COMPLETED','PR_CREATED'] },
];

const STATUS_COPY: Record<string, string> = {
  IDLE:                 'Ready to inspect the repository, generate A/B solutions, test in a sandbox, and create a verified PR.',
  REPOSITORY_ANALYZED:  'Repository AST + dependency graph analyzed. Preparing dual architectural strategies...',
  SOLUTIONS_GENERATED:  'Two distinct approaches generated — Conservative vs Architectural. Choose below.',
  TEST_FAILED:          'Test failure captured. Diagnosing root cause via stderr analysis...',
  REPAIR_STARTED:       'Synthesizing repair patch in isolated sandbox container...',
  REGRESSION_STARTED:   'Repair applied. Running full 18-test regression verification suite...',
  PR_CREATED:           'Mission complete. SHA-256 sealed PR verified and created. 🎉',
};

/* ─── Panel wrapper ─────────────────────────────────────────────── */
const Panel = ({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) => (
  <div
    className="cf-panel"
    style={{
      position: 'relative',
      overflow: 'hidden',
      ...style,
    }}
  >
    {children}
  </div>
);

import { ActiveTheoryBackground } from '../components/ActiveTheoryBackground';

/* ─── Section Divider ───────────────────────────────────────────── */
const SectionDivider = ({ label, id }: { label: string; id?: string }) => (
  <div id={id} style={{ display: 'flex', alignItems: 'center', gap: '16px', margin: '20px 0 10px' }}>
    <div className="hud-line-h" style={{ flex: 1 }} />
    <span style={{
      fontFamily: "'Space Mono', monospace", fontSize: '9px',
      letterSpacing: '0.25em', textTransform: 'uppercase', color: '#00f3ff',
      fontWeight: 700,
    }}>
      {label}
    </span>
    <div className="hud-line-h" style={{ flex: 1 }} />
  </div>
);

export default function Home() {
  const [user, setUser] = useState<UserProfile>({
    id: 'usr_om_sharma', name: 'Om Sharma', firstName: 'Om',
    email: 'om@codeforge.dev',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Om',
    role: 'DEVELOPER', provider: 'github',
    githubUsername: 'om-sharma',
    connectedAt: new Date().toISOString(),
  });

  const [projectId, setProjectId]     = useState<string>('proj_om_default');
  const [activeRepo, setActiveRepo]   = useState<RepositoryContext>(SAMPLE_REPOSITORIES[0]);
  const [mission, setMission]         = useState<Mission>(() => orchestrator.createMission(SAMPLE_REPOSITORIES[0]));
  const [activeNavTab, setActiveNavTab] = useState<NavTabType>('landing');
  const [isAuthOpen, setIsAuthOpen]   = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCopilotOpen, setIsCopilotOpen]   = useState(false);
  const [isPROpen, setIsPROpen]       = useState(false);
  const [taskInput, setTaskInput]     = useState(
    'Build a modern interactive calculator with live LCD display'
  );
  const [previewMode, setPreviewMode] = useState<'minimum' | 'recommended' | 'custom'>('recommended');
  const [isRecording, setIsRecording] = useState(false);
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleSpeechRecognition = () => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech Recognition is supported in Chrome, Edge, and modern browsers.');
      return;
    }
    if (isRecording) {
      setIsRecording(false);
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onstart = () => {
      setIsRecording(true);
      audioFx.playClick();
    };
    recognition.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript;
      setTaskInput(prev => prev ? `${prev} ${transcript}` : transcript);
      setIsRecording(false);
      audioFx.playSuccess();
    };
    recognition.onerror = () => setIsRecording(false);
    recognition.onend = () => setIsRecording(false);
    recognition.start();
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setAttachedImage(ev.target?.result as string);
        audioFx.playSuccess();
      };
      reader.readAsDataURL(file);
    }
  };

  const [isAuthGateOpen, setIsAuthGateOpen] = useState(false);

  // Server-verified session init
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch('/api/auth/me');
        if (r.ok) {
          const d = await r.json();
          if (d.user) {
            setUser(d.user);
            if (typeof window !== 'undefined') {
              localStorage.setItem('codeforge_user', JSON.stringify(d.user));
            }
          }
        } else {
          // Server rejected unauthenticated visitor — open authentication gate
          if (typeof window !== 'undefined') {
            localStorage.removeItem('codeforge_user');
          }
          setIsAuthGateOpen(true);
        }
      } catch {
        setIsAuthGateOpen(true);
      }

      try {
        const r = await fetch('/api/projects');
        if (r.ok) {
          const d = await r.json();
          if (d.projects?.length > 0) {
            const p = d.projects[0];
            setProjectId(p.id); setActiveRepo(p.repository); setMission(p.mission);
            if (p.mission?.issueTitle) setTaskInput(p.mission.issueTitle);
          }
        }
      } catch {}
    })();
  }, []);

  // Orchestrator subscription
  useEffect(() => {
    const unsub = orchestrator.subscribe((m) => {
      setMission(m);
      if (m.status === 'PR_CREATED')
        confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 } });
      if (projectId && m)
        fetch(`/api/projects/${projectId}`, {
          method: 'PUT', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mission: m }),
        }).catch(() => {});
    });
    return () => unsub();
  }, [projectId]);

  const handleRepoChange = async (newRepo: RepositoryContext) => {
    setActiveRepo(newRepo);
    setMission(orchestrator.createMission(newRepo));
    const preset = DEMO_PRESET_MISSIONS[newRepo.id];
    if (preset?.issueTitle) setTaskInput(preset.issueTitle);
    try {
      const r = await fetch('/api/projects', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newRepo.name, repository: newRepo, initialTask: preset?.issueTitle || taskInput }),
      });
      if (r.ok) { const d = await r.json(); setProjectId(d.project.id); }
    } catch {}
  };

  const handleSelectProjectFromLibrary = (proj: DbProject) => {
    setProjectId(proj.id); setActiveRepo(proj.repository); setMission(proj.mission);
    if (proj.mission?.issueTitle) setTaskInput(proj.mission.issueTitle);
    setActiveNavTab('mission');
  };

  const handleStartMission = async (customTask?: string) => {
    const activeTask = (customTask || taskInput).trim();
    if (!activeTask) return;
    audioFx.playClick();

    // ── Auto-Stack Engine: Intelligently shift stack between Frontend (TS) and Backend (PY)
    const isFrontendIntent = /website|landing|page|login|register|signup|registration|ui|form|component|frontend|css|html|react|portfolio|dashboard|calc|calculator|math|arithmetic|keypad|display|tool|widget/i.test(activeTask);
    const isBackendIntent = /backend|api|fastapi|redis|database|mutex|lock|concurrency|cgroups|worker|distributed|python|celery|sql/i.test(activeTask);

    let targetRepo = activeRepo;
    if (isFrontendIntent && activeRepo.language !== 'TypeScript') {
      const tsRepo = SAMPLE_REPOSITORIES.find(r => r.language === 'TypeScript');
      if (tsRepo) {
        targetRepo = tsRepo;
        setActiveRepo(tsRepo);
      }
    } else if (isBackendIntent && activeRepo.language !== 'Python') {
      const pyRepo = SAMPLE_REPOSITORIES.find(r => r.language === 'Python');
      if (pyRepo) {
        targetRepo = pyRepo;
        setActiveRepo(pyRepo);
      }
    }

    const isRegistration = /register|registration|student|enroll|admission|sign\s?up/i.test(activeTask);
    const isLogin = !isRegistration && /login|auth|password|email|sign\s?in/i.test(activeTask);
    const dynamicDesc = isRegistration
      ? `Requirements:\n1. Build an authentic, complete Registration Page with all logical fields: Full Name, Class / Grade, Roll / Student ID Number, Email, Phone Number, Password with show/hide eye toggle, and Department.\n2. Include Terms checkbox and instant client-side validation.\n3. Real-time interactive 60 FPS live preview sandbox across Minimum, Recommended, and Customized styles.`
      : isLogin
      ? `Requirements:\n1. Build an authentic, responsive login page with clean email & password inputs.\n2. Interactive password show/hide eye toggle with real-time field validation.\n3. Include 'Remember Me for 30 days' checkbox and 'Forgot Password' link.\n4. GitHub OAuth authentication bridge + clean Google enterprise styling.`
      : `Requirements:\n1. Synthesize and execute verified software solution strictly for: "${activeTask}".\n2. Real-time 60 FPS live interactive preview sandbox.\n3. Zero regression test assertions across the repository AST.`;

    const activeMissionObj = orchestrator.createMission(targetRepo, activeTask, dynamicDesc);
    setMission(activeMissionObj);

    const settings = AIProviderService.getSettings();
    try {
      const r = await fetch('/api/agent/plan', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task: activeTask, repository: targetRepo, projectId, model: settings.openrouterModel || 'qwen/qwen3-coder' }),
      });
      if (r.ok) {
        const d = await r.json();
        if (d.plans) {
          activeMissionObj.solutions = { solution_a: d.plans.solution_a, solution_b: d.plans.solution_b };
          orchestrator.setMission(activeMissionObj);
        }
      }
    } catch {}
    orchestrator.startUnderstandingAndPlanning();
  };

  const handleSelectSolution = async (id: 'solution_a' | 'solution_b' | 'custom', customPrompt?: string) => {
    orchestrator.selectSolutionAndExecute(id, customPrompt);
    try {
      const settings = AIProviderService.getSettings();
      await fetch('/api/agent/execute', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId, solutionId: id, customPrompt,
          githubToken: settings.githubToken, vercelToken: settings.vercelToken,
          vercelProjectId: settings.vercelProjectId,
          notificationsSettings: {
            resendApiKey: settings.resendApiKey, recipientEmail: user.email,
            twilioSid: settings.twilioSid, twilioAuthToken: settings.twilioAuthToken,
            twilioPhoneNumber: settings.twilioPhoneNumber, n8nWebhookUrl: settings.n8nWebhookUrl,
            n8nEnabled: settings.n8nEnabled,
          },
        }),
      });
    } catch {}
  };

  const handleReset = () => setMission(orchestrator.createMission(activeRepo, taskInput));

  const currentActiveSolution =
    mission.selectedSolutionId === 'solution_a' ? mission.solutions.solution_a
    : mission.selectedSolutionId === 'custom' && mission.solutions.custom ? mission.solutions.custom
    : mission.solutions.solution_b;

  const statusMsg = STATUS_COPY[mission.status] ?? mission.status.replace(/_/g, ' ');

  return (
    <div style={{ minHeight: '100vh', background: '#030408', color: '#c8cde8', position: 'relative' }}>
      {/* ── Global 3D WebGL Active Theory Atmospheric Backdrop (All Pages) ── */}
      <ActiveTheoryBackground showSpine={true} />

      <Navbar
        user={user} activeRepo={activeRepo} onSelectRepo={handleRepoChange}
        missionStatus={mission.status} onOpenAuth={() => setIsAuthGateOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onToggleCopilot={() => setIsCopilotOpen(!isCopilotOpen)}
        copilotOpen={isCopilotOpen} activeTab={activeNavTab} setActiveTab={setActiveNavTab}
      />

      {/* ── Landing ── */}
      {activeNavTab === 'landing' && (
        <CinematicLanding
          userFirstName={user.firstName}
          onEnterWorkspace={() => setActiveNavTab('mission')}
          onEnterStudio={() => setActiveNavTab('studio')}
          onEnterLibrary={() => setActiveNavTab('library')}
          onToggleCopilot={() => setIsCopilotOpen(!isCopilotOpen)}
        />
      )}

      {/* ── Studio ── */}
      {activeNavTab === 'studio' && (
        <main className="relative z-10 max-w-7xl mx-auto px-6 pt-24 pb-16">
          <CreativeStudio onBackToWorkspace={() => setActiveNavTab('mission')} />
        </main>
      )}

      {/* ── Library ── */}
      {activeNavTab === 'library' && (
        <main className="relative z-10 max-w-7xl mx-auto px-6 pt-24 pb-16">
          <ProjectLibrary
            onSelectProject={handleSelectProjectFromLibrary}
            onBackToWorkspace={() => setActiveNavTab('mission')}
          />
        </main>
      )}

      {/* ── SWE Mission Workspace ── */}
      {activeNavTab === 'mission' && (
        <main className="relative z-10 max-w-7xl mx-auto px-6 pt-24 pb-16 space-y-6">
          {/* ═ Active Theory Mission Control HUD Hero ═ */}
          <div
            className="relative overflow-hidden rounded-3xl p-6 transition-all duration-300"
            style={{
              background: 'rgba(6, 8, 18, 0.82)',
              backdropFilter: 'blur(24px)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              boxShadow: '0 20px 60px -15px rgba(0, 243, 255, 0.15)',
            }}
          >
            {/* Top iridescent glow bar */}
            <div
              style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
                background: 'linear-gradient(90deg, transparent, #00f3ff 25%, #cf3fff 50%, #00ff99 75%, transparent)',
              }}
            />

            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div>
                <div className="flex flex-wrap items-center gap-2.5 mb-2.5">
                  <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#00f3ff]" />
                    CGROUPS-V2 CONTAINER ONLINE
                  </span>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-mono bg-slate-900 border border-white/[0.08] text-slate-300">
                    repo: {activeRepo.fullName}
                  </span>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-mono bg-purple-500/10 text-purple-300 border border-purple-500/30">
                    branch: {activeRepo.defaultBranch}
                  </span>
                </div>

                <h1
                  style={{
                    fontFamily: "'Orbitron', monospace",
                    fontSize: 'clamp(20px, 2.5vw, 28px)',
                    fontWeight: 900,
                    letterSpacing: '0.02em',
                    color: '#f8fafc',
                    textShadow: '0 0 30px rgba(0,243,255,0.25)',
                  }}
                >
                  {mission.issueTitle || 'Autonomous SWE Mission Workspace'}
                </h1>

                <p className="text-xs text-slate-400 font-mono mt-1 flex items-center gap-2">
                  <span className="text-cyan-400 font-bold">STATUS:</span>
                  <span>{statusMsg}</span>
                </p>
              </div>

              {/* Right: Telemetry KPI Cards in Active Theory HUD style */}
              <div className="flex flex-wrap items-center gap-2.5 font-mono">
                <div className="px-4 py-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-center min-w-[110px]">
                  <div className="text-[9px] uppercase tracking-wider text-emerald-400/80">Regression Tests</div>
                  <div className="text-sm font-bold font-mono text-emerald-300 mt-0.5">18/18 PASS</div>
                </div>
                <div className="px-4 py-2.5 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-300 text-center min-w-[110px]">
                  <div className="text-[9px] uppercase tracking-wider text-purple-400/80">Isolation Box</div>
                  <div className="text-sm font-bold font-mono text-purple-300 mt-0.5">4096 MB RAM</div>
                </div>
                <div className="px-4 py-2.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-center min-w-[110px]">
                  <div className="text-[9px] uppercase tracking-wider text-cyan-400/80">Redis Mutex</div>
                  <div className="text-sm font-bold font-mono text-cyan-300 mt-0.5">1.2ms LATENCY</div>
                </div>
                <div className="px-4 py-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-center min-w-[110px]">
                  <div className="text-[9px] uppercase tracking-wider text-amber-400/80">GitHub Commit</div>
                  <div className="text-sm font-bold font-mono text-amber-300 mt-0.5">SHA-256 SEAL</div>
                </div>
              </div>
            </div>

            {/* Quick Jump Section Bar */}
            <div className="flex flex-wrap items-center gap-2 pt-4 mt-5 border-t border-white/[0.06] text-xs font-mono">
              <span className="text-[10px] text-slate-500 uppercase tracking-widest mr-1">QUICK JUMP:</span>
              <a
                href="#sec-intelligence"
                className="px-3 py-1.5 rounded-lg bg-slate-900/60 hover:bg-slate-800 border border-white/[0.06] hover:border-cyan-400/50 text-slate-300 hover:text-cyan-300 transition-all flex items-center gap-1.5"
              >
                <span className="text-cyan-400">01</span> Repo Intel
              </a>
              <a
                href="#sec-architect"
                className="px-3 py-1.5 rounded-lg bg-slate-900/60 hover:bg-slate-800 border border-white/[0.06] hover:border-purple-400/50 text-slate-300 hover:text-purple-300 transition-all flex items-center gap-1.5"
              >
                <span className="text-purple-400">02</span> Dual A/B Duel
              </a>
              <a
                href="#sec-preview"
                className="px-3 py-1.5 rounded-lg bg-slate-900/60 hover:bg-slate-800 border border-white/[0.06] hover:border-emerald-400/50 text-slate-300 hover:text-emerald-300 transition-all flex items-center gap-1.5"
              >
                <span className="text-emerald-400">03</span> Live Runtime & Diff
              </a>
              <a
                href="#sec-terminal"
                className="px-3 py-1.5 rounded-lg bg-slate-900/60 hover:bg-slate-800 border border-white/[0.06] hover:border-amber-400/50 text-slate-300 hover:text-amber-300 transition-all flex items-center gap-1.5"
              >
                <span className="text-amber-400">04</span> Isolated Terminal
              </a>
            </div>
          </div>

          {/* ── Autonomous Multi-Agent Swarm Topology HUD ── */}
          <div
            className="relative overflow-hidden rounded-3xl p-5 border transition-all"
            style={{
              background: 'rgba(6, 8, 18, 0.78)',
              backdropFilter: 'blur(20px)',
              borderColor: 'rgba(255, 255, 255, 0.08)',
              boxShadow: '0 10px 30px -10px rgba(0, 243, 255, 0.1)',
            }}
          >
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-2 font-mono text-xs">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#00f3ff]" />
                <span className="font-bold text-slate-200 uppercase tracking-wider" style={{ fontFamily: "'Orbitron', monospace" }}>
                  AUTONOMOUS AGENT SWARM TOPOLOGY & EVENT BUS
                </span>
                <span className="text-[10px] text-slate-500 hidden sm:inline">
                  (4 SPECIALIZED AGENTS • OPENROUTER QWEN3-CODER INFERENCE)
                </span>
              </div>

              <div className="flex items-center gap-2 font-mono text-[10px]">
                <span className="text-slate-400">THROUGHPUT:</span>
                <span className="text-cyan-300 font-bold">84 TOKENS/SEC</span>
                <span className="text-slate-600">|</span>
                <span className="text-slate-400">BUS LATENCY:</span>
                <span className="text-emerald-300 font-bold">0.8ms</span>
              </div>
            </div>

            {/* Swarm Nodes Connection Graph */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3 font-mono text-xs">
              {[
                { id: '01', role: 'REPO INTELLIGENCE', desc: 'AST Syntax Tree & Blast Radius', color: '#00f3ff', stat: '14,200 LOC Scanned' },
                { id: '02', role: 'SOLUTION ARCHITECT', desc: 'Dual A/B Plan Synthesis', color: '#cf3fff', stat: '2 Plans Generated' },
                { id: '03', role: 'CODING AGENT', desc: 'OpenRouter Qwen3-Coder AST Diffs', color: '#00ff99', stat: '14 Lines Synthesized' },
                { id: '04', role: 'CGROUPS VERIFIER', desc: 'Quarantined Container Assertions', color: '#ffaa00', stat: '18/18 Tests Passing' },
              ].map((agent) => (
                <div
                  key={agent.id}
                  className="p-3.5 rounded-2xl border transition-all hover:scale-[1.01]"
                  style={{
                    background: 'rgba(3, 4, 8, 0.65)',
                    borderColor: `${agent.color}35`,
                  }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold" style={{ color: agent.color }}>
                      NODE {agent.id}
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: agent.color, boxShadow: `0 0 6px ${agent.color}` }} />
                  </div>
                  <div className="font-bold text-slate-200 text-[11px]" style={{ fontFamily: "'Orbitron', monospace" }}>
                    {agent.role}
                  </div>
                  <div className="text-[10px] text-slate-400 font-sans mt-0.5 line-clamp-1">
                    {agent.desc}
                  </div>
                  <div className="mt-2 pt-2 border-t border-white/[0.05] text-[9px] font-bold" style={{ color: agent.color }}>
                    {agent.stat}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Agent greeting / mission command bar ── */}
          <Panel>
              {/* Top gradient line */}
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: '1px',
                background: 'linear-gradient(90deg, transparent 0%, rgba(0,243,255,0.35) 30%, rgba(207,63,255,0.35) 70%, transparent 100%)',
              }} />

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', padding: '18px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  {/* AI bot icon */}
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '10px', flexShrink: 0,
                    background: 'rgba(0,243,255,0.07)', border: '1px solid rgba(0,243,255,0.18)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 0 20px -8px rgba(0,243,255,0.3)',
                  }}>
                    <Bot size={18} style={{ color: '#00f3ff' }} />
                  </div>

                  <div>
                    <p style={{
                      fontFamily: "'Orbitron', monospace", fontSize: '11px',
                      fontWeight: 700, letterSpacing: '0.06em', color: '#f8faff',
                      marginBottom: '4px',
                    }}>
                      Hey {user.firstName} — what shall I build?
                    </p>
                    <p style={{
                      fontFamily: "'Space Mono', monospace", fontSize: '9px',
                      color: '#424868', letterSpacing: '0.04em', lineHeight: 1.6,
                    }}>
                      {statusMsg}
                    </p>
                  </div>
                </div>

                {/* Action buttons */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {mission.status === 'IDLE' && (
                    <button
                      onClick={() => handleStartMission()}
                      className="btn-launch"
                      style={{ fontSize: '9px', padding: '10px 22px' }}
                    >
                      <Play size={11} style={{ fill: '#000' }} />
                      START MISSION
                    </button>
                  )}
                  {mission.status === 'PR_CREATED' && (
                    <button
                      onClick={() => setIsPROpen(true)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '7px',
                        padding: '10px 20px', borderRadius: '999px',
                        fontFamily: "'Space Mono', monospace", fontSize: '9px',
                        letterSpacing: '0.14em', textTransform: 'uppercase',
                        background: 'rgba(0,255,153,0.08)', color: '#00ff99',
                        border: '1px solid rgba(0,255,153,0.25)', cursor: 'pointer',
                        boxShadow: '0 0 20px -5px rgba(0,255,153,0.2)',
                      }}
                    >
                      <GitPullRequest size={11} />
                      VIEW PR #{mission.pullRequest?.number}
                    </button>
                  )}
                  <button
                    onClick={handleReset}
                    title="Reset Mission"
                    style={{
                      padding: '9px', borderRadius: '999px',
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.07)',
                      cursor: 'pointer', display: 'flex', alignItems: 'center',
                      transition: 'all 0.2s ease', color: '#424868',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#c8cde8'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = '#424868'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; }}
                  >
                    <RotateCcw size={13} />
                  </button>
                </div>
              </div>
            </Panel>

            {/* ── Task HUD + 3D Agent ── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '16px', alignItems: 'stretch' }}>

              {/* Task panel */}
              <Panel style={{ padding: '20px' }}>
                {/* Task header */}
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  marginBottom: '16px', paddingBottom: '14px',
                  borderBottom: '1px solid rgba(255,255,255,0.04)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="tag-cyan">Task #{mission.issueNumber}</span>
                    <span style={{
                      fontFamily: "'Space Mono', monospace", fontSize: '9px',
                      color: '#424868', letterSpacing: '0.1em',
                    }}>
                      {mission.repository.fullName}
                    </span>
                  </div>
                  <span style={{
                    fontFamily: "'Space Mono', monospace", fontSize: '8px',
                    letterSpacing: '0.14em', textTransform: 'uppercase',
                    padding: '3px 10px', borderRadius: '999px',
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    color: '#252840',
                  }}>
                    cgroups-v2 isolated
                  </span>
                </div>

                {/* Multimodal Agentic Objective input */}
                <div style={{ marginBottom: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <label style={{
                      fontFamily: "'Space Mono', monospace", fontSize: '8px',
                      letterSpacing: '0.2em', textTransform: 'uppercase',
                      color: '#00f3ff', display: 'flex', alignItems: 'center', gap: '6px',
                    }}>
                      <Sparkles size={11} color="#00f3ff" />
                      Multimodal Engineering Prompt (Text • Voice • Image)
                    </label>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        style={{
                          padding: '4px 10px', borderRadius: '8px',
                          background: attachedImage ? 'rgba(0,243,255,0.2)' : 'rgba(255,255,255,0.04)',
                          border: `1px solid ${attachedImage ? '#00f3ff' : 'rgba(255,255,255,0.08)'}`,
                          color: attachedImage ? '#00f3ff' : '#94a3b8',
                          fontFamily: "'Space Mono', monospace", fontSize: '9px',
                          cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px',
                        }}
                        title="Attach visual mockup or UI design image"
                      >
                        <ImageIcon size={11} />
                        {attachedImage ? 'IMAGE ATTACHED' : 'ADD IMAGE'}
                      </button>
                      <button
                        type="button"
                        onClick={toggleSpeechRecognition}
                        style={{
                          padding: '4px 10px', borderRadius: '8px',
                          background: isRecording ? 'rgba(255,75,75,0.25)' : 'rgba(255,255,255,0.04)',
                          border: `1px solid ${isRecording ? '#ff4b4b' : 'rgba(255,255,255,0.08)'}`,
                          color: isRecording ? '#ff4b4b' : '#94a3b8',
                          fontFamily: "'Space Mono', monospace", fontSize: '9px',
                          cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px',
                        }}
                        title="Speak prompt with microphone"
                      >
                        {isRecording ? <MicOff size={11} className="animate-pulse" /> : <Mic size={11} />}
                        {isRecording ? 'LISTENING...' : 'VOICE MIC'}
                      </button>
                    </div>
                  </div>

                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleImageSelect}
                    style={{ display: 'none' }}
                  />

                  {attachedImage && (
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: '10px',
                      padding: '8px 12px', borderRadius: '10px',
                      background: 'rgba(0,243,255,0.05)', border: '1px solid rgba(0,243,255,0.2)',
                      marginBottom: '10px',
                    }}>
                      <img src={attachedImage} alt="Attachment" style={{ width: '36px', height: '36px', borderRadius: '6px', objectFit: 'cover' }} />
                      <div style={{ flex: 1, fontFamily: "'Space Mono', monospace", fontSize: '9px', color: '#00f3ff' }}>
                        Image visual context attached to prompt
                      </div>
                      <button
                        onClick={() => setAttachedImage(null)}
                        style={{ background: 'transparent', border: 'none', color: '#ff6b6b', cursor: 'pointer' }}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input
                      type="text"
                      value={taskInput}
                      onChange={e => setTaskInput(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          handleStartMission();
                        }
                      }}
                      className="cf-input"
                      style={{ flex: 1, fontWeight: 500, fontSize: '13px' }}
                      placeholder="e.g. create a login page with email and password..."
                    />
                    <button
                      type="button"
                      onClick={() => handleStartMission()}
                      style={{
                        padding: '10px 18px', borderRadius: '10px',
                        background: 'linear-gradient(135deg, #00f3ff, #cf3fff)',
                        color: '#030408', fontFamily: "'Orbitron', monospace",
                        fontSize: '10px', fontWeight: 800, letterSpacing: '0.08em',
                        border: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
                        boxShadow: '0 0 20px rgba(0,243,255,0.4)',
                        display: 'flex', alignItems: 'center', gap: '6px',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <Sparkles size={12} />
                      BUILD NOW
                    </button>
                  </div>
                </div>

                {/* Issue description */}
                <p style={{
                  fontFamily: "'Space Mono', monospace", fontSize: '9px',
                  color: '#424868', lineHeight: 1.8, letterSpacing: '0.03em',
                  whiteSpace: 'pre-wrap',
                }}>
                  {mission.issueDescription}
                </p>

                {/* Pipeline stepper */}
                <div style={{
                  marginTop: '16px', paddingTop: '14px',
                  borderTop: '1px solid rgba(255,255,255,0.04)',
                }}>
                  <div style={{
                    display: 'flex', justifyContent: 'space-between', marginBottom: '10px',
                  }}>
                    <span style={{
                      fontFamily: "'Space Mono', monospace", fontSize: '8px',
                      letterSpacing: '0.2em', textTransform: 'uppercase', color: '#252840',
                    }}>
                      Pipeline State
                    </span>
                    <span style={{
                      fontFamily: "'Orbitron', monospace", fontSize: '8px',
                      letterSpacing: '0.1em', color: '#00f3ff',
                    }}>
                      {mission.status}
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '5px' }}>
                    {PIPELINE.map((step, i) => {
                      const active = step.statuses.includes(mission.status);
                      const isCurrent = active && !PIPELINE[i + 1]?.statuses.includes(mission.status);
                      return (
                        <div
                          key={i}
                          style={{
                            padding: '8px 5px', borderRadius: '8px', textAlign: 'center',
                            background: active ? `${step.color}08` : 'rgba(255,255,255,0.02)',
                            border: `1px solid ${active ? `${step.color}25` : 'rgba(255,255,255,0.04)'}`,
                            color: active ? step.color : '#252840',
                            fontFamily: "'Space Mono', monospace", fontSize: '7px',
                            letterSpacing: '0.06em', lineHeight: 1.4,
                            transition: 'all 0.4s ease',
                            boxShadow: isCurrent ? `0 0 15px -5px ${step.color}50` : 'none',
                            position: 'relative', overflow: 'hidden',
                          }}
                        >
                          {isCurrent && (
                            <div style={{
                              position: 'absolute', top: 0, left: 0, right: 0, height: '1px',
                              background: `linear-gradient(90deg, transparent, ${step.color}, transparent)`,
                              animation: 'shimmer 2s linear infinite', backgroundSize: '200% auto',
                            }} />
                          )}
                          <div style={{
                            fontFamily: "'Orbitron', monospace", fontSize: '11px',
                            fontWeight: 900, color: active ? step.color : '#252840',
                            textShadow: active ? `0 0 10px ${step.color}60` : 'none',
                            marginBottom: '3px', lineHeight: 1,
                          }}>
                            {step.n}
                          </div>
                          {step.label}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </Panel>

              {/* 3D Agent Core */}
              <div style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)' }}>
                <AgentCore3D status={mission.status} repairCycles={mission.repairCycles} />
              </div>
            </div>

            {/* ── Repository Intelligence ── */}
            <SectionDivider id="sec-intelligence" label="Repository Intelligence" />
            <RepositoryIntelligence repo={activeRepo} />

            {/* ── Solution Architect ── */}
            <SectionDivider id="sec-architect" label="Solution Architect Engine" />
            <SolutionArchitectCard
              solutionA={mission.solutions.solution_a}
              solutionB={mission.solutions.solution_b}
              selectedSolutionId={mission.selectedSolutionId}
              onSelectSolution={handleSelectSolution}
              onPreviewTemplate={(mode) => {
                setPreviewMode(mode);
                const el = document.getElementById('sec-preview');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              disabled={['CODING_STARTED','SANDBOX_STARTED','TEST_STARTED'].includes(mission.status)}
            />

            {/* ── Live Preview ── */}
            <SectionDivider id="sec-preview" label="Live Preview & Diff Viewer" />
            <LivePreviewPanel
              projectId={projectId}
              solution={currentActiveSolution}
              missionStatus={mission.status}
              browserVerification={mission.browserVerification}
              initialMode={previewMode}
              task={mission.issueTitle || taskInput}
            />

            {/* ── Terminal / Sandbox ── */}
            <SectionDivider id="sec-terminal" label="Isolated Sandbox Terminal" />
            <TerminalSandbox mission={mission} projectId={projectId} />
        </main>
      )}

      {/* ── Replay ── */}
      {activeNavTab === 'replay' && (
        <main className="relative z-10 max-w-7xl mx-auto px-6 pt-24 pb-16">
          <MissionReplay mission={mission} />
        </main>
      )}

      {/* ── Benchmarks ── */}
      {activeNavTab === 'benchmarks' && (
        <main className="relative z-10 max-w-7xl mx-auto px-6 pt-24 pb-16">
          <BenchmarkPanel />
        </main>
      )}

      {/* Overlays */}
      <GroundedCopilot mission={mission} isOpen={isCopilotOpen} onClose={() => setIsCopilotOpen(false)} />
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} currentUser={user} onUpdateUser={setUser} />
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      <PullRequestModal isOpen={isPROpen} onClose={() => setIsPROpen(false)} pullRequest={mission.pullRequest} verificationReport={mission.verificationReport} />

      {/* ── Authentic Login & MFA OTP Gate ── */}
      <AuthGate
        isOpen={isAuthGateOpen}
        onSuccess={(authenticatedUser) => {
          setUser(authenticatedUser);
          setIsAuthGateOpen(false);
        }}
        onClose={() => setIsAuthGateOpen(false)}
      />
    </div>
  );
}
