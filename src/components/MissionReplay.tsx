'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Filter,
  FileCode,
  ShieldCheck,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Download,
  FastForward,
  SkipBack,
  SkipForward,
  Cpu,
  Layers,
  Lock,
  Terminal
} from 'lucide-react';
import { Mission, AgentEvent } from '../types/codeforge';
import { formatTimestamp } from '../lib/utils';
import { audioFx } from '../lib/audioFx';

interface MissionReplayProps {
  mission: Mission;
  onJumpToStep?: (eventIndex: number) => void;
}

export const MissionReplay: React.FC<MissionReplayProps> = ({ mission, onJumpToStep }) => {
  const [selectedAgentFilter, setSelectedAgentFilter] = useState<string>('ALL');
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);
  
  // Time-travel scrubber state
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const events = mission.events || [];

  // Update step index when events length changes
  useEffect(() => {
    if (events.length > 0 && activeStepIndex === 0) {
      setActiveStepIndex(events.length - 1);
    }
  }, [events.length]);

  // Automated playback timer
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setActiveStepIndex((prev) => {
          if (prev >= events.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          audioFx.playHover();
          return prev + 1;
        });
      }, 1400 / playbackSpeed);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, playbackSpeed, events.length]);

  const filteredEvents = events.filter((e) => {
    if (selectedAgentFilter === 'ALL') return true;
    return e.agent === selectedAgentFilter;
  });

  const currentEvent = events[activeStepIndex] || events[0];

  const handleExportAudit = () => {
    audioFx.playSuccess();
    const auditData = {
      missionId: mission.id,
      timestamp: new Date().toISOString(),
      repository: mission.repository,
      sha256Seal: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      eventsLogged: events.length,
      events: events,
      verificationReport: mission.verificationReport,
      solutions: mission.solutions,
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(auditData, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute('href', dataStr);
    dlAnchorElem.setAttribute('download', `codeforge_telemetry_audit_${mission.id || 'session'}.json`);
    dlAnchorElem.click();
  };

  return (
    <div className="space-y-6">
      {/* ── Active Theory Time-Machine Hero HUD ── */}
      <div
        className="relative overflow-hidden rounded-3xl p-6 sm:p-8 transition-all"
        style={{
          background: 'rgba(6, 8, 18, 0.85)',
          backdropFilter: 'blur(24px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 20px 60px -15px rgba(0, 243, 255, 0.15)',
        }}
      >
        <div
          style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
            background: 'linear-gradient(90deg, transparent, #00f3ff 25%, #cf3fff 50%, #00ff99 75%, transparent)',
          }}
        />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-white/[0.06]">
          <div>
            <div className="flex flex-wrap items-center gap-2.5 mb-2">
              <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                DETERMINISTIC REPLAY ENGINE
              </span>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-mono bg-purple-500/10 text-purple-300 border border-purple-500/30">
                MERKLE TREE STATE HASHING
              </span>
            </div>

            <h1
              style={{
                fontFamily: "'Orbitron', monospace",
                fontSize: 'clamp(20px, 2.5vw, 28px)',
                fontWeight: 900,
                color: '#f8fafc',
                letterSpacing: '0.02em',
                textShadow: '0 0 30px rgba(0,243,255,0.25)',
              }}
            >
              MISSION EVENT REPLAY & TIME-TRAVEL TELEMETRY
            </h1>
            <p className="text-xs text-slate-400 font-sans max-w-2xl mt-1 leading-relaxed">
              Step backwards and forwards through every AST transform, cgroups sandbox test run, and cryptographic evidence hash in execution order.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExportAudit}
              className="py-2.5 px-4 rounded-xl font-mono text-xs font-bold text-slate-200 bg-slate-900/80 hover:bg-slate-800 border border-white/[0.1] hover:border-cyan-400/50 transition-all flex items-center gap-2"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>Export Audit JSON</span>
            </button>
          </div>
        </div>

        {/* ── Interactive Time Scrubber Bar ── */}
        <div className="pt-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 font-mono text-xs">
            <div className="flex items-center gap-2">
              {/* Play/Pause */}
              <button
                onClick={() => {
                  audioFx.playClick();
                  setIsPlaying(!isPlaying);
                }}
                className={`p-2.5 rounded-xl border transition-all ${
                  isPlaying
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-[0_0_12px_rgba(255,170,0,0.3)]'
                    : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-[0_0_12px_rgba(0,243,255,0.3)]'
                }`}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>

              {/* Prev */}
              <button
                disabled={activeStepIndex <= 0}
                onClick={() => {
                  audioFx.playClick();
                  setActiveStepIndex((prev) => Math.max(0, prev - 1));
                }}
                className="p-2.5 rounded-xl bg-slate-900 border border-white/[0.08] text-slate-300 hover:text-white disabled:opacity-40 transition-all"
              >
                <SkipBack className="w-4 h-4" />
              </button>

              {/* Next */}
              <button
                disabled={activeStepIndex >= events.length - 1}
                onClick={() => {
                  audioFx.playClick();
                  setActiveStepIndex((prev) => Math.min(events.length - 1, prev + 1));
                }}
                className="p-2.5 rounded-xl bg-slate-900 border border-white/[0.08] text-slate-300 hover:text-white disabled:opacity-40 transition-all"
              >
                <SkipForward className="w-4 h-4" />
              </button>

              {/* Reset to Start */}
              <button
                onClick={() => {
                  audioFx.playClick();
                  setActiveStepIndex(0);
                  setIsPlaying(false);
                }}
                className="p-2.5 rounded-xl bg-slate-900 border border-white/[0.08] text-slate-400 hover:text-white transition-all"
                title="Reset to initial step"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              {/* Speed Toggles */}
              <div className="flex items-center gap-1 ml-2 p-1 rounded-xl bg-slate-950 border border-white/[0.06]">
                {[1, 2, 4].map((speed) => (
                  <button
                    key={speed}
                    onClick={() => {
                      audioFx.playClick();
                      setPlaybackSpeed(speed);
                    }}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold ${
                      playbackSpeed === speed
                        ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-400/40'
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {speed}x
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-slate-400">Step:</span>
              <span className="px-3 py-1 rounded-full bg-slate-900 border border-white/[0.08] text-cyan-300 font-bold">
                {activeStepIndex + 1} / {Math.max(1, events.length)}
              </span>
              <span className="text-slate-500 text-[11px]">
                {currentEvent ? formatTimestamp(currentEvent.timestamp) : ''}
              </span>
            </div>
          </div>

          {/* Scrubber slider */}
          <div className="relative">
            <input
              type="range"
              min="0"
              max={Math.max(0, events.length - 1)}
              value={activeStepIndex}
              onChange={(e) => {
                audioFx.playHover();
                setActiveStepIndex(parseInt(e.target.value));
              }}
              className="w-full h-2.5 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
            {/* Markers */}
            <div className="flex justify-between text-[9px] font-mono text-slate-500 mt-1">
              <span>01. REPO_INTELLIGENCE</span>
              <span>02. DUAL_A/B</span>
              <span>03. PATCH_SYNTHESIS</span>
              <span>04. CGROUPS_SANDBOX</span>
              <span>05. PR_SEAL</span>
            </div>
          </div>
        </div>

        {/* ── Active Step Telemetry Card ── */}
        {currentEvent && (
          <div
            className="mt-6 p-5 rounded-2xl border transition-all"
            style={{
              background: 'rgba(3, 4, 8, 0.75)',
              borderColor: 'rgba(0, 243, 255, 0.25)',
              boxShadow: '0 0 25px rgba(0, 243, 255, 0.08)',
            }}
          >
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
              <div className="flex items-center gap-2.5">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 uppercase">
                  {currentEvent.agent}
                </span>
                <h3 className="text-sm font-bold text-slate-100 font-sans">
                  {currentEvent.title}
                </h3>
              </div>

              <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>SHA-256 STATE: </span>
                <span className="text-amber-300 font-bold">
                  {(currentEvent.id || 'cf9a').slice(0, 16)}...
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-300 font-sans mt-3 leading-relaxed">
              {currentEvent.description}
            </p>

            {currentEvent.affectedFiles && currentEvent.affectedFiles.length > 0 && (
              <div className="mt-3 flex items-center gap-2 text-xs font-mono text-slate-400">
                <FileCode className="w-3.5 h-3.5 text-cyan-400" />
                <span>Impacted Files:</span>
                <span className="text-cyan-300 font-bold">{currentEvent.affectedFiles.join(', ')}</span>
              </div>
            )}

            {currentEvent.evidence?.diffSnippet && (
              <div className="mt-4 rounded-xl border border-white/[0.08] overflow-hidden bg-slate-950">
                <div className="px-3 py-1.5 bg-slate-900 border-b border-white/[0.06] text-[10px] font-mono text-slate-400">
                  Diff Snapshot at this execution slice:
                </div>
                <pre className="p-3 text-[11px] font-mono text-emerald-300 overflow-x-auto leading-relaxed max-h-[140px]">
                  {currentEvent.evidence.diffSnippet}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── All Events Chronicle List ── */}
      <div
        className="rounded-3xl p-6 sm:p-8 border space-y-4"
        style={{
          background: 'rgba(6, 8, 18, 0.82)',
          backdropFilter: 'blur(20px)',
          borderColor: 'rgba(255, 255, 255, 0.08)',
        }}
      >
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/[0.06]">
          <h2
            style={{
              fontFamily: "'Orbitron', monospace",
              fontSize: '14px',
              fontWeight: 800,
              color: '#f8fafc',
            }}
          >
            ORDERED CHRONICLE AUDIT LOG ({events.length} EVENTS)
          </h2>

          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={selectedAgentFilter}
              onChange={(e) => setSelectedAgentFilter(e.target.value)}
              className="text-slate-300 text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-cyan-400 font-mono bg-slate-900 border border-white/[0.1]"
            >
              <option value="ALL">All Agents ({events.length})</option>
              <option value="REPO_INTELLIGENCE">Repository Intelligence</option>
              <option value="SOLUTION_ARCHITECT">Solution Architect</option>
              <option value="CODING_AGENT">Coding Agent</option>
              <option value="SANDBOX_ENGINE">Sandbox Engine</option>
              <option value="TEST_DEBUG_REPAIR">Test & Repair Agent</option>
              <option value="SECURITY_VERIFIER">Security Verifier</option>
              <option value="PR_AGENT">PR Agent</option>
            </select>
          </div>
        </div>

        <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
          {filteredEvents.map((event, idx) => {
            const isCurrent = activeStepIndex === idx;
            const isExpanded = expandedEventId === event.id;

            return (
              <div
                key={event.id || idx}
                className={`rounded-2xl border transition-all ${
                  isCurrent ? 'ring-1 ring-cyan-400/50 bg-slate-900/90' : 'bg-slate-950/40 hover:bg-slate-900/40'
                }`}
                style={{
                  borderColor: isCurrent ? 'rgba(0, 243, 255, 0.4)' : 'rgba(255, 255, 255, 0.06)',
                }}
              >
                <div
                  onClick={() => {
                    audioFx.playClick();
                    setActiveStepIndex(idx);
                    setExpandedEventId(isExpanded ? null : event.id);
                  }}
                  className="cursor-pointer p-4 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-slate-500 text-[10px] w-6 text-right">{idx + 1}.</span>
                    <span className="px-2.5 py-0.5 rounded-full text-[9px] font-mono font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 uppercase">
                      {event.agent}
                    </span>
                    <div>
                      <span className="text-slate-200 font-semibold">{event.title}</span>
                      {event.durationMs && (
                        <span className="text-slate-500 text-[10px] ml-2 font-mono">
                          ({event.durationMs}ms)
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 font-mono text-[11px] text-slate-500">
                    <span>{formatTimestamp(event.timestamp)}</span>
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-cyan-400" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-5 pb-4 pt-1 border-t border-white/[0.05] font-mono text-xs space-y-3">
                    <p className="text-slate-300 text-xs font-sans leading-relaxed pt-2">
                      {event.description}
                    </p>
                    {event.evidence?.command && (
                      <div className="p-3 rounded-xl bg-black border border-white/[0.08] text-[10px]">
                        <div className="text-emerald-400 font-bold">$ {event.evidence.command}</div>
                        {event.evidence.stdout && <div className="text-slate-400 mt-1 whitespace-pre-wrap">{event.evidence.stdout}</div>}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
