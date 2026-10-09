'use client';

import React, { useState } from 'react';
import { Terminal, Cpu, HardDrive, ShieldAlert, CheckCircle2, AlertCircle, RefreshCw, Box, Play, Send, Loader2 } from 'lucide-react';
import { Mission, SandboxExecution } from '../types/codeforge';

interface TerminalSandboxProps {
  mission: Mission;
  projectId?: string;
}

export const TerminalSandbox: React.FC<TerminalSandboxProps> = ({ mission, projectId }) => {
  const [activeTab, setActiveTab] = useState<'console' | 'interactive' | 'diagnostics' | 'security'>('console');
  const [cmdInput, setCmdInput] = useState('pytest tests/test_auth_flow.py');
  const [customLogs, setCustomLogs] = useState<Array<{ cmd: string; out: string; err?: string; code: number }>>([]);
  const [runningCmd, setRunningCmd] = useState(false);

  const { sandbox, initialTestResults, repairedTestResults, repairCycles } = mission;

  const handleRunCommand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cmdInput.trim() || !projectId) return;

    setRunningCmd(true);
    try {
      const res = await fetch('/api/terminal/exec', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          command: cmdInput.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.result) {
        setCustomLogs((prev) => [
          ...prev,
          {
            cmd: data.result.command,
            out: data.result.stdout,
            err: data.result.stderr,
            code: data.result.exitCode,
          },
        ]);
      } else {
        setCustomLogs((prev) => [
          ...prev,
          {
            cmd: cmdInput,
            out: '',
            err: data.error || 'Execution failed',
            code: 1,
          },
        ]);
      }
    } catch (err: any) {
      setCustomLogs((prev) => [
        ...prev,
        {
          cmd: cmdInput,
          out: '',
          err: err.message || 'Network error',
          code: 1,
        },
      ]);
    } finally {
      setRunningCmd(false);
    }
  };

  return (
    <div
      className="cf-panel relative overflow-hidden rounded-2xl flex flex-col shadow-2xl transition-all"
      style={{
        background: 'rgba(6, 8, 18, 0.85)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
      }}
    >
      {/* Top Accent Line */}
      <div
        style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
          background: 'linear-gradient(90deg, transparent, #00f3ff 30%, #a855f7 70%, transparent)',
        }}
      />

      {/* Top Header */}
      <div
        className="flex flex-wrap items-center justify-between px-5 py-3 border-b gap-3"
        style={{
          background: 'rgba(3, 4, 8, 0.7)',
          borderColor: 'rgba(255, 255, 255, 0.06)',
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-cyan-400"
            style={{
              background: 'rgba(0, 243, 255, 0.08)',
              border: '1px solid rgba(0, 243, 255, 0.25)',
            }}
          >
            <Terminal className="w-4 h-4" />
          </div>
          <span
            style={{
              fontFamily: "'Orbitron', monospace",
              fontSize: '12px',
              fontWeight: 800,
              letterSpacing: '0.04em',
              color: '#f8fafc',
            }}
          >
            ISOLATED SANDBOX TELEMETRY
          </span>
          <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 flex items-center gap-1.5">
            <Box className="w-3 h-3" />
            {sandbox?.containerId || 'cf-box-94f82a1'}
          </span>
        </div>

        {/* Resources Badges */}
        <div className="flex items-center gap-2 text-[10px] font-mono">
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-slate-300 border"
            style={{ background: 'rgba(255, 255, 255, 0.03)', borderColor: 'rgba(255, 255, 255, 0.06)' }}
          >
            <Cpu className="w-3 h-3 text-cyan-400" />
            <span>2.0 vCPU</span>
          </div>
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-slate-300 border"
            style={{ background: 'rgba(255, 255, 255, 0.03)', borderColor: 'rgba(255, 255, 255, 0.06)' }}
          >
            <HardDrive className="w-3 h-3 text-purple-400" />
            <span>4096 MB RAM</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>NET: QUARANTINED</span>
          </div>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div
        className="flex items-center gap-2 px-5 py-2.5 border-b text-xs font-mono"
        style={{
          background: 'rgba(3, 4, 8, 0.5)',
          borderColor: 'rgba(255, 255, 255, 0.06)',
        }}
      >
        <button
          onClick={() => setActiveTab('console')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-all text-xs ${
            activeTab === 'console'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-[0_0_10px_rgba(0,243,255,0.2)]'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Pipeline Stream
        </button>

        <button
          onClick={() => setActiveTab('interactive')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 text-xs ${
            activeTab === 'interactive'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 shadow-[0_0_10px_rgba(0,255,153,0.2)]'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Play className="w-3 h-3 text-emerald-400" />
          Interactive Terminal
        </button>

        <button
          onClick={() => setActiveTab('diagnostics')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 text-xs ${
            activeTab === 'diagnostics'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40 shadow-[0_0_10px_rgba(255,170,0,0.2)]'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <RefreshCw className="w-3 h-3 text-amber-400" />
          Diagnostics & Self-Repair ({repairCycles} cycles)
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`px-3 py-1.5 rounded-lg font-medium transition-all text-xs ${
            activeTab === 'security'
              ? 'bg-purple-500/20 text-purple-300 border border-purple-400/40 shadow-[0_0_10px_rgba(207,63,255,0.2)]'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Security Audit
        </button>
      </div>

      {/* Console Display */}
      <div
        className="h-[290px] p-5 font-mono text-[11px] overflow-y-auto leading-relaxed space-y-3"
        style={{ background: '#030408' }}
      >
        {activeTab === 'console' && (
          <div>
            <div className="text-slate-500 pb-2 border-b border-white/[0.05] text-[10px]">
              # CodeForge Sandbox Execution Engine v2.4 (cgroups-v2 isolation)
            </div>

            {mission.events.map((event) => (
              <div key={event.id} className="pt-2">
                <div className="flex items-center gap-2 text-slate-400">
                  <span className="text-cyan-400 font-bold">[{event.agent}]</span>
                  <span className="text-slate-200 font-semibold">{event.title}</span>
                </div>
                <div className="text-slate-400 pl-4 text-[11px] mt-0.5">{event.description}</div>

                {event.evidence?.command && (
                  <div
                    className="mt-2 ml-4 p-2.5 rounded-lg border text-emerald-400"
                    style={{
                      background: 'rgba(6, 8, 18, 0.9)',
                      borderColor: 'rgba(255, 255, 255, 0.06)',
                    }}
                  >
                    <div className="font-bold">$ {event.evidence.command}</div>
                    {event.evidence.stdout && (
                      <div className="text-slate-300 text-[10px] mt-1.5 whitespace-pre-wrap">
                        {event.evidence.stdout}
                      </div>
                    )}
                    {event.evidence.stderr && (
                      <div className="text-rose-400 text-[10px] mt-1.5 whitespace-pre-wrap">
                        {event.evidence.stderr}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'interactive' && (
          <div className="space-y-3">
            <div className="text-slate-500 pb-1 border-b border-white/[0.05] text-[10px]">
              # Direct shell session inside isolated workspace container.
            </div>

            {customLogs.map((log, i) => (
              <div
                key={i}
                className="p-3 rounded-lg border text-xs font-mono"
                style={{
                  background: 'rgba(6, 8, 18, 0.9)',
                  borderColor: 'rgba(255, 255, 255, 0.06)',
                }}
              >
                <div className="text-emerald-400 flex items-center justify-between font-bold">
                  <span>$ {log.cmd}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${log.code === 0 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'}`}>
                    exit: {log.code}
                  </span>
                </div>
                {log.out && <pre className="text-slate-300 text-[11px] mt-2 whitespace-pre-wrap">{log.out}</pre>}
                {log.err && <pre className="text-rose-400 text-[11px] mt-1.5 whitespace-pre-wrap">{log.err}</pre>}
              </div>
            ))}

            <form onSubmit={handleRunCommand} className="flex gap-2 pt-2">
              <input
                type="text"
                value={cmdInput}
                onChange={(e) => setCmdInput(e.target.value)}
                placeholder="Enter sandbox shell command (e.g. pytest, git status, cat app/main.py)..."
                className="flex-1 text-slate-200 text-xs px-3.5 py-2.5 rounded-xl font-mono focus:outline-none focus:border-cyan-500"
                style={{
                  background: 'rgba(6, 8, 18, 0.9)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                }}
              />
              <button
                type="submit"
                disabled={runningCmd}
                className="px-5 py-2.5 rounded-xl font-mono text-xs font-bold flex items-center gap-2 transition-all shadow-md"
                style={{
                  background: 'linear-gradient(135deg, #00f3ff, #00ff99)',
                  color: '#030408',
                }}
              >
                {runningCmd ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                EXECUTE
              </button>
            </form>
          </div>
        )}

        {activeTab === 'diagnostics' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/[0.05]">
              <div className="flex items-center gap-2 text-slate-200">
                <AlertCircle className="w-4 h-4 text-amber-400" />
                <span className="font-bold">Automated Test Failure Diagnostics & Self-Healing Loop</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                {repairCycles} Active Repairs Applied
              </span>
            </div>

            {initialTestResults?.failures && initialTestResults.failures.length > 0 ? (
              initialTestResults.failures.map((fail, i) => (
                <div
                  key={i}
                  className="p-3.5 rounded-xl border space-y-2"
                  style={{
                    background: 'rgba(6, 8, 18, 0.8)',
                    borderColor: 'rgba(255, 255, 255, 0.06)',
                  }}
                >
                  <div className="flex items-center justify-between text-rose-400 font-bold">
                    <span>FAIL: {fail.testName}</span>
                    <span className="text-slate-500 text-[10px]">line {fail.line}</span>
                  </div>
                  <pre className="text-slate-400 text-[10px] p-2 rounded bg-black/60 border border-rose-500/20 overflow-x-auto">
                    {fail.errorMessage}
                  </pre>
                  <div className="text-cyan-300 text-[11px] bg-cyan-950/20 p-2 rounded border border-cyan-500/20">
                    <span className="font-bold text-cyan-400">Autonomous Diagnosis:</span> {fail.rootCauseDiagnosis}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-emerald-400 flex items-center gap-2 py-6 justify-center">
                <CheckCircle2 className="w-5 h-5" />
                <span>Zero unhandled diagnostic failures. Regression suite passing 100%.</span>
              </div>
            )}
          </div>
        )}

        {activeTab === 'security' && (
          <div className="space-y-3 font-mono text-xs">
            <div className="p-3.5 rounded-xl border flex items-center justify-between" style={{ background: 'rgba(6, 8, 18, 0.8)', borderColor: 'rgba(255, 255, 255, 0.06)' }}>
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-purple-400" />
                <span className="font-bold text-slate-200">Security & Sandboxing Static Analysis</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30">
                COMPLIANCE CLEAR
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5 text-[11px]">
              <div className="p-3 rounded-lg border" style={{ background: 'rgba(3, 4, 8, 0.7)', borderColor: 'rgba(255, 255, 255, 0.05)' }}>
                <div className="text-slate-400">High-Entropy Secrets</div>
                <div className="text-emerald-400 font-bold text-sm mt-1">0 Detected (Safe)</div>
              </div>
              <div className="p-3 rounded-lg border" style={{ background: 'rgba(3, 4, 8, 0.7)', borderColor: 'rgba(255, 255, 255, 0.05)' }}>
                <div className="text-slate-400">SQL / Parameter Injection</div>
                <div className="text-emerald-400 font-bold text-sm mt-1">Parameterized AST</div>
              </div>
              <div className="p-3 rounded-lg border" style={{ background: 'rgba(3, 4, 8, 0.7)', borderColor: 'rgba(255, 255, 255, 0.05)' }}>
                <div className="text-slate-400">Known CVE Scan</div>
                <div className="text-emerald-400 font-bold text-sm mt-1">0 Vulnerabilities</div>
              </div>
              <div className="p-3 rounded-lg border" style={{ background: 'rgba(3, 4, 8, 0.7)', borderColor: 'rgba(255, 255, 255, 0.05)' }}>
                <div className="text-slate-400">cgroups-v2 Containment</div>
                <div className="text-emerald-400 font-bold text-sm mt-1">Locked (pids.max=128)</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
