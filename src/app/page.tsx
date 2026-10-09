'use client';

import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { Play, RotateCcw, GitPullRequest, Bot, ArrowRight } from 'lucide-react';
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

/* ─── Section Divider ───────────────────────────────────────────── */
const SectionDivider = ({ label }: { label: string }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', margin: '8px 0' }}>
    <div className="hud-line-h" style={{ flex: 1 }} />
    <span style={{
      fontFamily: "'Space Mono', monospace", fontSize: '8px',
      letterSpacing: '0.25em', textTransform: 'uppercase', color: '#252840',
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
    'Fix JWT Race Condition & Token Replay during Concurrent Token Refresh'
  );

  // Session init
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch('/api/auth/me');
        if (r.ok) { const d = await r.json(); if (d.user) setUser(d.user); }
      } catch {}
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

  const handleStartMission = async () => {
    const settings = AIProviderService.getSettings();
    try {
      const r = await fetch('/api/agent/plan', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task: taskInput, repository: activeRepo, projectId, model: settings.openrouterModel || 'qwen/qwen3-coder' }),
      });
      if (r.ok) {
        const d = await r.json();
        if (d.plans) mission.solutions = { solution_a: d.plans.solution_a, solution_b: d.plans.solution_b };
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
      <Navbar
        user={user} activeRepo={activeRepo} onSelectRepo={handleRepoChange}
        missionStatus={mission.status} onOpenAuth={() => setIsAuthOpen(true)}
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
        <div style={{ paddingTop: '80px' }}>
          <CreativeStudio onBackToWorkspace={() => setActiveNavTab('mission')} />
        </div>
      )}

      {/* ── Library ── */}
      {activeNavTab === 'library' && (
        <div style={{ paddingTop: '80px' }}>
          <ProjectLibrary
            onSelectProject={handleSelectProjectFromLibrary}
            onBackToWorkspace={() => setActiveNavTab('mission')}
          />
        </div>
      )}

      {/* ── SWE Mission Workspace ── */}
      {activeNavTab === 'mission' && (
        <main style={{ paddingTop: '90px', paddingBottom: '60px', maxWidth: '1440px', margin: '0 auto', padding: '90px 24px 60px' }}>

          {/* ═ Workspace header area ═ */}
          <div style={{ marginBottom: '24px' }}>
            <SectionDivider label="SWE Mission Workspace" />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

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
                      onClick={handleStartMission}
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

                {/* Objective input */}
                <div style={{ marginBottom: '14px' }}>
                  <label style={{
                    fontFamily: "'Space Mono', monospace", fontSize: '8px',
                    letterSpacing: '0.2em', textTransform: 'uppercase',
                    color: '#252840', display: 'block', marginBottom: '8px',
                  }}>
                    Engineering Objective
                  </label>
                  <input
                    type="text"
                    value={taskInput}
                    onChange={e => setTaskInput(e.target.value)}
                    className="cf-input"
                    style={{ fontWeight: 500, fontSize: '13px' }}
                    placeholder="Describe the bug, feature, or task..."
                  />
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
            <SectionDivider label="Repository Intelligence" />
            <RepositoryIntelligence repo={activeRepo} />

            {/* ── Solution Architect ── */}
            <SectionDivider label="Solution Architect Engine" />
            <SolutionArchitectCard
              solutionA={mission.solutions.solution_a}
              solutionB={mission.solutions.solution_b}
              selectedSolutionId={mission.selectedSolutionId}
              onSelectSolution={handleSelectSolution}
              disabled={['CODING_STARTED','SANDBOX_STARTED','TEST_STARTED'].includes(mission.status)}
            />

            {/* ── Live Preview ── */}
            <SectionDivider label="Live Preview & Diff Viewer" />
            <LivePreviewPanel
              projectId={projectId}
              solution={currentActiveSolution}
              missionStatus={mission.status}
              browserVerification={mission.browserVerification}
            />

            {/* ── Terminal / Sandbox ── */}
            <SectionDivider label="Isolated Sandbox Terminal" />
            <TerminalSandbox mission={mission} projectId={projectId} />
          </div>
        </main>
      )}

      {/* ── Replay ── */}
      {activeNavTab === 'replay' && (
        <div style={{ paddingTop: '80px' }}>
          <MissionReplay mission={mission} />
        </div>
      )}

      {/* ── Benchmarks ── */}
      {activeNavTab === 'benchmarks' && (
        <div style={{ paddingTop: '80px' }}>
          <BenchmarkPanel />
        </div>
      )}

      {/* Overlays */}
      <GroundedCopilot mission={mission} isOpen={isCopilotOpen} onClose={() => setIsCopilotOpen(false)} />
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} currentUser={user} onUpdateUser={setUser} />
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      <PullRequestModal isOpen={isPROpen} onClose={() => setIsPROpen(false)} pullRequest={mission.pullRequest} verificationReport={mission.verificationReport} />
    </div>
  );
}
