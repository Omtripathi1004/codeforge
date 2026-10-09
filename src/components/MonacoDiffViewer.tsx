'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { FileCode, Database, Network, Eye, Layers, Check, Copy } from 'lucide-react';
import { SolutionOption } from '../types/codeforge';

// Dynamically import DiffEditor from @monaco-editor/react to avoid SSR issues
const DiffEditor = dynamic(
  () => import('@monaco-editor/react').then((mod) => mod.DiffEditor),
  { ssr: false, loading: () => <div className="p-8 text-center text-slate-500 font-mono text-xs">Loading Monaco Diff Engine...</div> }
);

interface MonacoDiffViewerProps {
  solution: SolutionOption | null;
  activeFileIndex?: number;
}

export const MonacoDiffViewer: React.FC<MonacoDiffViewerProps> = ({ solution }) => {
  const [selectedFileIdx, setSelectedFileIdx] = useState(0);
  const [activeTab, setActiveTab] = useState<'diff' | 'architecture' | 'schema' | 'api' | 'preview'>('diff');
  const [copied, setCopied] = useState(false);

  if (!solution || !solution.diffs || solution.diffs.length === 0) {
    return (
      <div className="h-[360px] rounded-xl border border-slate-800 bg-slate-950/60 flex flex-col items-center justify-center p-6 text-center">
        <FileCode className="w-10 h-10 text-slate-600 mb-3" />
        <h4 className="text-slate-300 font-medium text-sm mb-1">Awaiting Solution Generation</h4>
        <p className="text-slate-500 text-xs max-w-sm">
          Once the Repository Intelligence Agent and Solution Architect inspect the codebase, side-by-side Monaco diffs will appear here.
        </p>
      </div>
    );
  }

  const currentDiff = solution.diffs[selectedFileIdx] || solution.diffs[0];

  const handleCopyDiff = () => {
    navigator.clipboard.writeText(currentDiff.newCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl border border-slate-800/90 bg-slate-950/80 shadow-2xl flex flex-col overflow-hidden">
      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 gap-2">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 text-xs">
          <button
            onClick={() => setActiveTab('diff')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === 'diff'
                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            Monaco Diff
          </button>

          <button
            onClick={() => setActiveTab('architecture')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === 'architecture'
                ? 'bg-purple-500/10 text-purple-400 border border-purple-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Network className="w-3.5 h-3.5" />
            Architecture Graph
          </button>

          <button
            onClick={() => setActiveTab('schema')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === 'schema'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            DB Schema
          </button>

          <button
            onClick={() => setActiveTab('api')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === 'api'
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            API Contracts
          </button>

          <button
            onClick={() => setActiveTab('preview')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeTab === 'preview'
                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            Live Preview
          </button>
        </div>

        {/* Right Action Tools */}
        <div className="flex items-center gap-2">
          {activeTab === 'diff' && (
            <button
              onClick={handleCopyDiff}
              className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-mono text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded transition-all"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              {copied ? 'Copied' : 'Copy Patch'}
            </button>
          )}

          <div className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-400 border border-slate-700">
            {solution.filesAffected.length} files modified (+{solution.linesAdded} / -{solution.linesRemoved})
          </div>
        </div>
      </div>

      {/* File Selector Sub-bar (when in diff tab) */}
      {activeTab === 'diff' && (
        <div className="flex items-center gap-1 px-4 py-1.5 bg-slate-950 border-b border-slate-800/60 overflow-x-auto text-[11px] font-mono">
          {solution.diffs.map((diff, idx) => (
            <button
              key={diff.filePath}
              onClick={() => setSelectedFileIdx(idx)}
              className={`px-2.5 py-1 rounded transition-colors flex items-center gap-1.5 ${
                selectedFileIdx === idx
                  ? 'bg-slate-800 text-cyan-300 font-semibold border border-cyan-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <FileCode className="w-3 h-3" />
              {diff.filePath}
            </button>
          ))}
        </div>
      )}

      {/* Tab Content Display */}
      <div className="h-[360px] w-full bg-[#1e1e1e]">
        {activeTab === 'diff' && (
          <DiffEditor
            height="360px"
            language={currentDiff.language || 'python'}
            original={currentDiff.oldCode}
            modified={currentDiff.newCode}
            theme="vs-dark"
            options={{
              readOnly: true,
              renderSideBySide: true,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              fontSize: 12,
              fontFamily: 'JetBrains Mono, monospace',
              wordWrap: 'on',
              lineNumbers: 'on',
              automaticLayout: true,
            }}
          />
        )}

        {activeTab === 'architecture' && (
          <div className="h-full p-6 flex flex-col justify-between bg-slate-950 font-mono text-xs overflow-y-auto">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                <span className="text-purple-400 font-semibold uppercase tracking-wider">
                  Flow Topology & Dependency Impact Graph
                </span>
                <span className="text-[10px] text-slate-500">AST Depth: 4 Layers</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-3.5 rounded-lg border border-purple-500/30 bg-purple-950/20">
                  <div className="text-[11px] font-bold text-purple-300 mb-1">1. Ingress Layer</div>
                  <div className="text-slate-400 text-[11px]">POST /api/v1/auth/refresh</div>
                  <div className="text-slate-500 text-[10px] mt-2">→ rate_limiter.py (10 req/min)</div>
                  <div className="text-slate-500 text-[10px]">→ auth_middleware.py</div>
                </div>

                <div className="p-3.5 rounded-lg border border-cyan-500/30 bg-cyan-950/20">
                  <div className="text-[11px] font-bold text-cyan-300 mb-1">2. Core Mutation (Patched)</div>
                  <div className="text-slate-300 text-[11px]">token_manager.py</div>
                  <div className="text-cyan-400 text-[10px] mt-2">⚡ Redis Atomic Lock [SET NX 10s]</div>
                  <div className="text-cyan-400 text-[10px]">⚡ 15s Grace Cache Deduplicator</div>
                </div>

                <div className="p-3.5 rounded-lg border border-emerald-500/30 bg-emerald-950/20">
                  <div className="text-[11px] font-bold text-emerald-300 mb-1">3. Storage & Revocation</div>
                  <div className="text-slate-300 text-[11px]">PostgreSQL SessionToken</div>
                  <div className="text-emerald-400 text-[10px] mt-2">✓ family_id index tracking</div>
                  <div className="text-emerald-400 text-[10px]">✓ Automatic breach revocation</div>
                </div>
              </div>
            </div>

            <div className="p-3 rounded bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400">
              <span className="text-cyan-400 font-semibold">Architectural Invariant:</span> Zero lock contention on non-refresh endpoints. p99 database commit latency remains under 1.2ms under 200 concurrent threads.
            </div>
          </div>
        )}

        {activeTab === 'schema' && (
          <div className="h-full p-6 bg-slate-950 font-mono text-xs overflow-y-auto">
            <div className="text-emerald-400 font-semibold mb-3 flex items-center gap-2">
              <Database className="w-4 h-4" />
              SQLAlchemy & PostgreSQL Schema Migrations
            </div>
            <pre className="p-4 rounded-lg bg-slate-900/90 border border-slate-800 text-slate-300 text-[11px] leading-relaxed overflow-x-auto">
{`-- Generated Migration: 20261009_001_token_family_rotation.sql
ALTER TABLE session_tokens 
  ADD COLUMN IF NOT EXISTS family_id VARCHAR(64) NOT NULL DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS token_hash VARCHAR(64) UNIQUE,
  ADD COLUMN IF NOT EXISTS revoked_reason VARCHAR(64);

CREATE INDEX IF NOT EXISTS ix_session_tokens_family_id ON session_tokens (family_id);
CREATE INDEX IF NOT EXISTS ix_session_tokens_token_hash ON session_tokens (token_hash);`}
            </pre>
          </div>
        )}

        {activeTab === 'api' && (
          <div className="h-full p-6 bg-slate-950 font-mono text-xs overflow-y-auto">
            <div className="text-amber-400 font-semibold mb-3 flex items-center gap-2">
              <Layers className="w-4 h-4" />
              FastAPI OpenAPI 3.1 Contract Diff
            </div>
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold text-[10px]">POST</span>
                  <span className="text-slate-200">/api/v1/auth/refresh</span>
                </div>
                <p className="text-slate-400 text-[11px]">Rotates active refresh token pair. Supports concurrent idempotency via Redis grace window.</p>
                <div className="mt-2 text-[10px] text-slate-500">Responses: 200 OK (TokenPair), 401 Unauthorized (Breach detected)</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'preview' && (
          <div className="h-full p-6 bg-slate-950 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-3">
              <Eye className="w-6 h-6" />
            </div>
            <h4 className="text-slate-200 font-medium text-sm mb-1">Backend Service / API Sandbox</h4>
            <p className="text-slate-400 text-xs max-w-md">
              Backend runtime running inside container <code className="text-cyan-400">cf-box-94f82a1</code> with live healthchecks passing at <code className="text-emerald-400">127.0.0.1:8000/health</code>.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
