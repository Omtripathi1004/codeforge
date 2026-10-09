'use client';

import React, { useState } from 'react';
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
  Sparkles
} from 'lucide-react';
import { Mission, AgentEvent, AgentRole } from '../types/codeforge';
import { formatTimestamp } from '../lib/utils';

interface MissionReplayProps {
  mission: Mission;
  onJumpToStep?: (eventIndex: number) => void;
}

export const MissionReplay: React.FC<MissionReplayProps> = ({ mission, onJumpToStep }) => {
  const [selectedAgentFilter, setSelectedAgentFilter] = useState<string>('ALL');
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);

  const events = mission.events;

  const filteredEvents = events.filter((e) => {
    if (selectedAgentFilter === 'ALL') return true;
    return e.agent === selectedAgentFilter;
  });

  return (
    <div
      className="cf-panel relative overflow-hidden rounded-2xl p-6 shadow-2xl transition-all flex flex-col"
      style={{
        background: 'rgba(6, 8, 18, 0.85)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
      }}
    >
      {/* Top Edge Glow */}
      <div
        style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
          background: 'linear-gradient(90deg, transparent, #00f3ff 30%, #cf3fff 70%, transparent)',
        }}
      />

      {/* Header Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-cyan-400"
            style={{
              background: 'rgba(0, 243, 255, 0.08)',
              border: '1px solid rgba(0, 243, 255, 0.25)',
              boxShadow: '0 0 15px rgba(0, 243, 255, 0.15)',
            }}
          >
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h3
              style={{
                fontFamily: "'Orbitron', monospace",
                fontSize: '14px',
                fontWeight: 800,
                letterSpacing: '0.04em',
                color: '#f8fafc',
              }}
            >
              MISSION EVENT REPLAY & TELEMETRY AUDIT
            </h3>
            <p className="text-xs text-slate-400 font-sans mt-0.5">
              Ordered chronological execution timeline with cryptographic evidence traces ({events.length} events logged)
            </p>
          </div>
        </div>

        {/* Agent Filter Selector */}
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-500" />
          <select
            value={selectedAgentFilter}
            onChange={(e) => setSelectedAgentFilter(e.target.value)}
            className="text-slate-300 text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-cyan-400 font-mono"
            style={{
              background: 'rgba(3, 4, 8, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
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

      {/* Events List Timeline */}
      <div className="mt-5 space-y-2.5 max-h-[440px] overflow-y-auto pr-1">
        {filteredEvents.map((event, idx) => {
          const isExpanded = expandedEventId === event.id;

          const getStatusBadgeColor = () => {
            if (event.severity === 'error') return 'border-rose-500/40 bg-rose-950/30 text-rose-300';
            if (event.severity === 'warning') return 'border-amber-500/40 bg-amber-950/30 text-amber-300';
            if (event.severity === 'success') return 'border-emerald-500/40 bg-emerald-950/30 text-emerald-300';
            return 'border-cyan-500/40 bg-cyan-950/30 text-cyan-300';
          };

          return (
            <div
              key={event.id}
              className="rounded-xl border transition-all"
              style={{
                background: isExpanded ? 'rgba(6, 8, 24, 0.95)' : 'rgba(3, 4, 8, 0.6)',
                borderColor: isExpanded ? 'rgba(0, 243, 255, 0.4)' : 'rgba(255, 255, 255, 0.06)',
                boxShadow: isExpanded ? '0 0 20px rgba(0, 243, 255, 0.1)' : 'none',
              }}
            >
              <div
                onClick={() => setExpandedEventId(isExpanded ? null : event.id)}
                className="cursor-pointer p-3.5 flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono text-slate-500 text-[10px] w-6 text-right">{idx + 1}.</span>
                  
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono uppercase font-bold border ${getStatusBadgeColor()}`}>
                    {event.agent}
                  </span>

                  <div>
                    <span className="text-slate-200 font-semibold">{event.title}</span>
                    <span className="text-slate-500 text-[11px] block sm:inline sm:ml-2">
                      {event.durationMs ? `(${event.durationMs}ms)` : ''}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-mono text-slate-500">{formatTimestamp(event.timestamp)}</span>
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-cyan-400" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  )}
                </div>
              </div>

              {/* Collapsible Evidence Section */}
              {isExpanded && (
                <div className="px-5 pb-4 pt-1 border-t border-white/[0.05] font-mono text-xs space-y-2.5">
                  <p className="text-slate-300 text-[11px] font-sans leading-relaxed pt-2">{event.description}</p>

                  {event.affectedFiles && event.affectedFiles.length > 0 && (
                    <div className="flex items-center gap-2 text-[10px] text-slate-400">
                      <FileCode className="w-3 h-3 text-cyan-400" />
                      <span>Affected Files: </span>
                      <span className="text-cyan-300 font-bold">{event.affectedFiles.join(', ')}</span>
                    </div>
                  )}

                  {event.evidence?.command && (
                    <div
                      className="p-3 rounded-lg border text-[10px] text-slate-300"
                      style={{
                        background: '#030408',
                        borderColor: 'rgba(255, 255, 255, 0.08)',
                      }}
                    >
                      <div className="text-emerald-400 font-bold">$ {event.evidence.command}</div>
                      {event.evidence.stdout && <div className="text-slate-400 mt-1.5 whitespace-pre-wrap">{event.evidence.stdout}</div>}
                      {event.evidence.stderr && <div className="text-rose-400 mt-1.5 whitespace-pre-wrap">{event.evidence.stderr}</div>}
                    </div>
                  )}

                  {event.evidence?.diffSnippet && (
                    <pre
                      className="p-3 rounded-lg border text-[10px] text-emerald-300 overflow-x-auto"
                      style={{
                        background: '#030408',
                        borderColor: 'rgba(255, 255, 255, 0.08)',
                      }}
                    >
                      {event.evidence.diffSnippet}
                    </pre>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
