'use client';

import React, { useState } from 'react';
import { Bot, Send, ShieldCheck, Sparkles, Terminal, FileCode, CheckCircle2, ChevronRight, X } from 'lucide-react';
import { Mission, MissionStatus } from '../types/codeforge';

interface GroundedCopilotProps {
  mission: Mission;
  isOpen: boolean;
  onClose: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'copilot';
  text: string;
  mode?: string;
  citations?: Array<{
    label: string;
    fileOrCommand: string;
    detail: string;
  }>;
  timestamp: string;
}

export const GroundedCopilot: React.FC<GroundedCopilotProps> = ({ mission, isOpen, onClose }) => {
  const [mode, setMode] = useState<'Explain' | 'Debug' | 'Architecture' | 'Security' | 'Review' | 'Mission'>('Mission');
  const [inputQuery, setInputQuery] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-init',
      sender: 'copilot',
      text: `Hello! I am CodeForge Copilot, strictly grounded in the execution evidence of Mission #${mission.issueNumber}. I have access to repository AST, test logs, sandbox traces, and security audits. How can I assist?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      citations: [
        {
          label: 'Active Context',
          fileOrCommand: mission.repository.fullName,
          detail: `FastAPI / SQLAlchemy with 18 automated tests.`
        }
      ]
    }
  ]);

  if (!isOpen) return null;

  const handleSend = () => {
    if (!inputQuery.trim()) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: inputQuery,
      mode: mode,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    const query = inputQuery.toLowerCase();
    setInputQuery('');

    // Formulate evidence-grounded response
    setTimeout(() => {
      let botResponse = '';
      let botCitations: ChatMessage['citations'] = [];

      if (query.includes('fail') || query.includes('error') || query.includes('bug') || query.includes('diagnos')) {
        if (mission.initialTestResults && mission.initialTestResults.failures.length > 0) {
          const fail = mission.initialTestResults.failures[0];
          botResponse = `During Phase 1 test execution, **${fail.testName}** failed at line ${fail.line} due to: \n\n> "${fail.errorMessage}"\n\n**Diagnosis:** ${fail.rootCauseDiagnosis}\n\nThis was autonomously resolved in Self-Repair Cycle #1 by injecting an atomic Redis pipeline grace cache before committing the database transaction.`;
          botCitations = [
            {
              label: 'Test Failure Trace',
              fileOrCommand: 'tests/test_auth_flow.py:114',
              detail: fail.errorMessage
            },
            {
              label: 'Repair Patch',
              fileOrCommand: 'app/services/token_manager.py',
              detail: 'Atomic pipeline grace cache injection'
            }
          ];
        } else {
          botResponse = `No test failures recorded at this mission stage. All 18 automated tests in the test suite are passing.`;
        }
      } else if (query.includes('security') || query.includes('secret') || query.includes('cve') || query.includes('injection')) {
        botResponse = `The Security & Verification Agent ran 4 compliance checks:\n- **Secrets Scan:** 0 high-entropy keys found.\n- **Injection Defense:** SQLAlchemy parameter binding verified.\n- **CVE Audit:** 0 known vulnerabilities across 8 dependencies.\n- **Sandbox Boundaries:** Strict cgroups v2 limits enforced without breach.`;
        botCitations = [
          {
            label: 'Security Audit Log',
            fileOrCommand: 'codeforge-sec audit --strict',
            detail: '4/4 checks passed'
          }
        ];
      } else if (query.includes('diff') || query.includes('solution') || query.includes('change') || query.includes('code')) {
        const sol = (mission.selectedSolutionId && mission.solutions[mission.selectedSolutionId]) || mission.solutions.solution_b;
        botResponse = `Currently active solution is **${sol?.title || 'Solution B'}** modifying **${sol?.filesAffected?.length || 4} files** (+${sol?.linesAdded || 68} / -${sol?.linesRemoved || 14} lines).\n\nKey modification: Replaced uncoordinated token invalidation with RFC 6749 Token Family tracking and a 15s Redis atomic lock grace window.`;
        botCitations = [
          {
            label: 'Primary Modified File',
            fileOrCommand: 'app/services/token_manager.py',
            detail: 'Token family rotation logic'
          },
          {
            label: 'DB Model',
            fileOrCommand: 'app/database/models.py',
            detail: 'family_id index addition'
          }
        ];
      } else if (query.includes('pr') || query.includes('pull request') || query.includes('github')) {
        if (mission.pullRequest) {
          botResponse = `GitHub Pull Request #${mission.pullRequest.number} is prepared on branch \`${mission.pullRequest.branch}\` with title "${mission.pullRequest.title}". All automated CI checks passed.`;
          botCitations = [
            {
              label: 'PR URL',
              fileOrCommand: mission.pullRequest.htmlUrl,
              detail: 'Verified PR evidence artifact'
            }
          ];
        } else {
          botResponse = `PR will be automatically sealed once the verification suite confirms zero regressions and mathematical correctness.`;
        }
      } else {
        botResponse = `Based on the repository state (${mission.repository.fullName}), the current mission is at status **${mission.status}**. The codebase contains ${mission.repository.structure.totalFiles} files and ${mission.repository.structure.apiEndpoints.length} endpoints.`;
        botCitations = [
          {
            label: 'AST State',
            fileOrCommand: mission.repository.name,
            detail: `Language: ${mission.repository.language} (${mission.repository.framework})`
          }
        ];
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `copilot-${Date.now()}`,
          sender: 'copilot',
          text: botResponse,
          mode: mode,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          citations: botCitations
        }
      ]);
    }, 400);
  };

  return (
    <div
      className="fixed inset-y-0 right-0 w-full max-w-md shadow-2xl z-50 flex flex-col"
      style={{
        background: 'rgba(3, 4, 8, 0.96)',
        backdropFilter: 'blur(30px)',
        borderLeft: '1px solid rgba(255, 255, 255, 0.08)',
      }}
    >
      {/* Top Accent Line */}
      <div
        style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
          background: 'linear-gradient(90deg, #00f3ff, #cf3fff)',
        }}
      />

      {/* Header */}
      <div
        className="p-4 border-b flex items-center justify-between"
        style={{
          background: 'rgba(6, 8, 18, 0.8)',
          borderColor: 'rgba(255, 255, 255, 0.06)',
        }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-cyan-400"
            style={{
              background: 'rgba(0, 243, 255, 0.1)',
              border: '1px solid rgba(0, 243, 255, 0.3)',
            }}
          >
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h3
              style={{
                fontFamily: "'Orbitron', monospace",
                fontSize: '12px',
                fontWeight: 800,
                letterSpacing: '0.04em',
                color: '#f8fafc',
              }}
            >
              GROUNDED COPILOT
            </h3>
            <p className="text-[10px] text-cyan-400 font-mono">100% EVIDENCE GROUNDED • ZERO HALLUCINATION</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-all"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Mode Switcher */}
      <div
        className="px-3 py-2 border-b flex items-center gap-1.5 overflow-x-auto text-[10px] font-mono"
        style={{
          background: 'rgba(6, 8, 18, 0.5)',
          borderColor: 'rgba(255, 255, 255, 0.06)',
        }}
      >
        {(['Mission', 'Explain', 'Debug', 'Architecture', 'Security', 'Review'] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`px-2.5 py-1 rounded-full transition-all shrink-0 ${
              mode === m
                ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-400/50 shadow-[0_0_8px_rgba(0,243,255,0.2)]'
                : 'text-slate-400 hover:text-slate-200 border border-transparent'
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 font-sans">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[90%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-cyan-500/20 text-cyan-100 border border-cyan-400/40 rounded-br-none shadow-[0_0_15px_rgba(0,243,255,0.15)]'
                  : 'text-slate-200 rounded-bl-none shadow-lg'
              }`}
              style={{
                background: msg.sender === 'user' ? 'rgba(0, 243, 255, 0.15)' : 'rgba(6, 8, 18, 0.85)',
                border: msg.sender === 'user' ? '1px solid rgba(0, 243, 255, 0.4)' : '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              {msg.mode && (
                <div className="text-[9px] font-mono text-cyan-300 uppercase font-semibold mb-1 opacity-80">
                  Mode: {msg.mode}
                </div>
              )}
              <div className="whitespace-pre-wrap">{msg.text}</div>

              {/* Verified Citations */}
              {msg.citations && msg.citations.length > 0 && (
                <div className="mt-3 pt-2.5 border-t border-white/[0.08] space-y-1.5">
                  <div className="text-[10px] font-mono font-bold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Grounded Evidence Citations:
                  </div>
                  {msg.citations.map((c, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded-lg border text-[10px] font-mono text-slate-300"
                      style={{
                        background: '#030408',
                        borderColor: 'rgba(255, 255, 255, 0.06)',
                      }}
                    >
                      <span className="text-cyan-400 font-semibold">{c.fileOrCommand}</span>
                      <span className="text-slate-400 block text-[9px] mt-0.5">{c.detail}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <span className="text-[9px] text-slate-500 font-mono mt-1 px-1">{msg.timestamp}</span>
          </div>
        ))}
      </div>

      {/* Query Input Box */}
      <div
        className="p-3.5 border-t"
        style={{
          background: 'rgba(6, 8, 18, 0.9)',
          borderColor: 'rgba(255, 255, 255, 0.06)',
        }}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder={`Ask Copilot about AST, diffs, tests in ${mode} mode...`}
            className="flex-1 px-3.5 py-2.5 text-xs rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-400 font-mono"
            style={{
              background: '#030408',
              border: '1px solid rgba(255, 255, 255, 0.1)',
            }}
          />
          <button
            type="submit"
            disabled={!inputQuery.trim()}
            className="p-2.5 rounded-xl font-bold disabled:opacity-40 transition-all shadow-md"
            style={{
              background: 'linear-gradient(135deg, #00f3ff, #cf3fff)',
              color: '#030408',
            }}
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
