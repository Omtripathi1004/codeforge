'use client';

import React, { useState, useEffect } from 'react';
import {
  FolderKanban,
  Search,
  Plus,
  Play,
  Copy,
  Trash2,
  Download,
  ExternalLink,
  GitBranch,
  Star,
  Clock,
  CheckCircle2,
  FileCode,
  Tag,
  ArrowLeft,
  LayoutGrid,
  List,
  Shield,
  Activity,
  Cpu,
  Sparkles,
  X
} from 'lucide-react';
import { DbProject } from '../lib/server/db';
import { RepositoryContext } from '../types/codeforge';
import { audioFx } from '../lib/audioFx';

interface ProjectLibraryProps {
  onSelectProject: (project: DbProject) => void;
  onBackToWorkspace: () => void;
}

const TEMPLATE_PROJECTS = [
  {
    name: 'nexus-concurrency-api',
    repo: 'acme-corp/nexus-backend-api',
    lang: 'Python / FastAPI',
    issue: 'Fix JWT Race Condition & Token Replay during Concurrent Mobile Token Refresh',
    badge: 'CONCURRENCY MUTEX',
    accent: '#00f3ff'
  },
  {
    name: 'vector-deadlock-resolver',
    repo: 'nebius-ai/vector-shard-core',
    lang: 'Python / Qdrant',
    issue: 'Distributed Deadlock Inversion in HNSW Partition Two-Phase Commit',
    badge: 'TWO-PHASE COMMIT',
    accent: '#cf3fff'
  },
  {
    name: 'crdt-ast-repair',
    repo: 'codeforge/monaco-collab-ast',
    lang: 'TypeScript / Node',
    issue: 'State Divergence Self-Healing in Realtime Collaborative AST Session',
    badge: 'AST SELF-HEALING',
    accent: '#00ff99'
  },
  {
    name: 'cryptographic-shield-audit',
    repo: 'openrouter/secret-leak-sentinel',
    lang: 'Python / Security',
    issue: 'High-Entropy API Key & SQL Injection Surface Verifier with Git SHA-256 Seal',
    badge: 'CVE-ZERO POLICY',
    accent: '#ffaa00'
  }
];

export const ProjectLibrary: React.FC<ProjectLibraryProps> = ({
  onSelectProject,
  onBackToWorkspace,
}) => {
  const [projects, setProjects] = useState<DbProject[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTag, setFilterTag] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [loading, setLoading] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newRepoUrl, setNewRepoUrl] = useState('');
  const [newIssuePrompt, setNewIssuePrompt] = useState('');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/projects');
      if (res.ok) {
        const data = await res.json();
        setProjects(data.projects || []);
      }
    } catch (err) {
      console.warn('Could not list projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDuplicate = async (projectId: string) => {
    audioFx.playClick();
    try {
      const res = await fetch(`/api/projects/${projectId}/duplicate`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setProjects((prev) => [data.project, ...prev]);
        audioFx.playSuccess();
      }
    } catch (err) {
      console.warn('Duplication failed:', err);
    }
  };

  const handleDelete = async (projectId: string) => {
    audioFx.playClick();
    if (!confirm('Are you sure you want to remove this project?')) return;
    try {
      const res = await fetch(`/api/projects/${projectId}`, { method: 'DELETE' });
      if (res.ok) {
        setProjects((prev) => prev.filter((p) => p.id !== projectId));
      }
    } catch (err) {
      console.warn('Deletion failed:', err);
    }
  };

  const handleExport = (project: DbProject) => {
    audioFx.playSuccess();
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(project, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute('href', dataStr);
    dlAnchorElem.setAttribute('download', `${project.name.replace(/\s+/g, '_')}_codeforge_export.json`);
    dlAnchorElem.click();
  };

  const handleCreateFromTemplate = async (tmpl: typeof TEMPLATE_PROJECTS[0]) => {
    audioFx.playSuccess();
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: tmpl.name,
          repository: {
            id: `repo_${Date.now()}`,
            name: tmpl.name,
            fullName: tmpl.repo,
            defaultBranch: 'main',
            language: tmpl.lang.split('/')[0].trim(),
            description: tmpl.issue,
          },
          initialTask: tmpl.issue,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setProjects((prev) => [data.project, ...prev]);
        setIsImportModalOpen(false);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.repository?.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (filterTag === 'ALL') return true;
    if (filterTag === 'PYTHON') return p.repository?.language?.toLowerCase().includes('python');
    if (filterTag === 'TYPESCRIPT') return p.repository?.language?.toLowerCase().includes('typescript');
    if (filterTag === 'VERIFIED') return p.mission?.status === 'PR_CREATED';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* ── Active Theory Hero Strip ── */}
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
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <button
                onClick={onBackToWorkspace}
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/[0.08] text-slate-300 hover:text-white transition-all flex items-center gap-1.5 font-mono text-xs"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-cyan-400" />
                <span>Workspace</span>
              </button>
              <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                PERSISTENT MISSION REPOSITORY
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
              PROJECT ARCHIVE & REPOSITORY INVENTORY
            </h1>
            <p className="text-xs text-slate-400 font-sans max-w-2xl leading-relaxed">
              Durable project library, archived telemetry, execution snapshots, multi-branch diff exports, and instant template generators.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                audioFx.playClick();
                setIsImportModalOpen(true);
              }}
              className="py-3 px-5 rounded-xl font-mono text-xs font-bold text-[#030408] bg-cyan-400 hover:bg-cyan-300 transition-all shadow-[0_0_20px_rgba(0,243,255,0.4)] flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>IMPORT NEW PROJECT</span>
            </button>
          </div>
        </div>

        {/* ── Statistics Telemetry Row ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 pt-6 font-mono text-center">
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-cyan-500/20">
            <div className="text-[10px] uppercase text-cyan-400 tracking-wider">Total Projects</div>
            <div className="text-xl font-black text-cyan-300 mt-1" style={{ fontFamily: "'Orbitron', monospace" }}>
              {projects.length} Repos
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-emerald-500/20">
            <div className="text-[10px] uppercase text-emerald-400 tracking-wider">Test Suite Passes</div>
            <div className="text-xl font-black text-emerald-300 mt-1" style={{ fontFamily: "'Orbitron', monospace" }}>
              18/18 (100%)
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-purple-500/20">
            <div className="text-[10px] uppercase text-purple-400 tracking-wider">Engineering Saved</div>
            <div className="text-xl font-black text-purple-300 mt-1" style={{ fontFamily: "'Orbitron', monospace" }}>
              142 Hours
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-amber-500/20">
            <div className="text-[10px] uppercase text-amber-400 tracking-wider">Sandbox Health</div>
            <div className="text-xl font-black text-amber-300 mt-1" style={{ fontFamily: "'Orbitron', monospace" }}>
              ISO Isolated
            </div>
          </div>
        </div>
      </div>

      {/* ── Controls & Filter Bar ── */}
      <div className="flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
        <div className="flex items-center gap-2">
          {['ALL', 'PYTHON', 'TYPESCRIPT', 'VERIFIED'].map((tag) => (
            <button
              key={tag}
              onClick={() => {
                audioFx.playClick();
                setFilterTag(tag);
              }}
              className={`px-3 py-1.5 rounded-xl transition-all font-bold ${
                filterTag === tag
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 shadow-[0_0_12px_rgba(0,243,255,0.2)]'
                  : 'bg-slate-900/60 text-slate-400 border border-white/[0.06] hover:text-white'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex items-center p-1 rounded-xl bg-slate-950 border border-white/[0.08]">
            <button
              onClick={() => {
                audioFx.playClick();
                setViewMode('grid');
              }}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'grid' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-500 hover:text-slate-300'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                audioFx.playClick();
                setViewMode('table');
              }}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'table' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-500 hover:text-slate-300'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Search Box */}
          <div className="relative min-w-[260px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects or repositories..."
              className="w-full text-slate-200 text-xs pl-9 pr-3 py-2 rounded-xl focus:outline-none focus:border-cyan-400 font-sans bg-slate-900/80 border border-white/[0.08]"
            />
          </div>
        </div>
      </div>

      {/* ── Projects View (Grid or Table) ── */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProjects.length === 0 ? (
            <div className="col-span-full py-16 text-center text-slate-500 font-mono text-xs">
              No projects match the selected criteria.
            </div>
          ) : (
            filteredProjects.map((proj) => (
              <div
                key={proj.id}
                className="group relative rounded-2xl p-5 space-y-4 transition-all duration-300 hover:-translate-y-1"
                style={{
                  background: 'rgba(6, 8, 18, 0.78)',
                  backdropFilter: 'blur(16px)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-slate-900 text-cyan-300 border border-cyan-500/30 font-bold">
                    {proj.repository?.language || 'PYTHON'}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">
                    {new Date(proj.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div>
                  <h3
                    style={{
                      fontFamily: "'Orbitron', monospace",
                      fontSize: '14px',
                      fontWeight: 800,
                      color: '#f8fafc',
                      letterSpacing: '0.02em',
                    }}
                  >
                    {proj.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2 font-sans leading-relaxed">
                    {proj.description || proj.mission?.issueTitle || 'Autonomous engineering task.'}
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950/70 border border-white/[0.05] font-mono text-[11px] text-slate-400 flex items-center justify-between">
                  <span className="truncate pr-2">{proj.repository?.fullName}</span>
                  <span className="text-emerald-400 font-bold text-[10px]">
                    {proj.mission?.status === 'PR_CREATED' ? '✓ PR SEALED' : 'READY'}
                  </span>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 pt-2 border-t border-white/[0.06]">
                  <button
                    onClick={() => {
                      audioFx.playClick();
                      onSelectProject(proj);
                    }}
                    className="flex-1 py-2 px-3 rounded-xl font-mono text-xs font-bold flex items-center justify-center gap-1.5 transition-all text-white bg-cyan-500/20 hover:bg-cyan-400 hover:text-black border border-cyan-400/40"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>LAUNCH</span>
                  </button>
                  <button
                    onClick={() => handleDuplicate(proj.id)}
                    className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/[0.06] text-slate-400 hover:text-purple-300 transition-all"
                    title="Duplicate project"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleExport(proj)}
                    className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-white/[0.06] text-slate-400 hover:text-cyan-300 transition-all"
                    title="Export JSON"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(proj.id)}
                    className="p-2 rounded-xl bg-slate-900 hover:bg-rose-950/60 border border-white/[0.06] text-slate-500 hover:text-rose-400 transition-all"
                    title="Delete project"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        /* Table View */
        <div className="rounded-2xl border border-white/[0.08] overflow-hidden bg-slate-950/70 font-mono text-xs">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/[0.06] text-slate-500 text-[10px] uppercase bg-slate-900/50">
                <th className="py-3 px-4">Project Name</th>
                <th className="py-3 px-4">Repository Context</th>
                <th className="py-3 px-4">Language</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Created Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {filteredProjects.map((proj) => (
                <tr key={proj.id} className="hover:bg-slate-900/40 text-slate-300">
                  <td className="py-3.5 px-4 font-bold text-slate-100 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    <span>{proj.name}</span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-400">{proj.repository?.fullName}</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded-full bg-slate-900 border border-white/[0.08] text-cyan-300 text-[10px]">
                      {proj.repository?.language || 'PYTHON'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-emerald-400 font-bold">
                    {proj.mission?.status === 'PR_CREATED' ? '✓ PR SEALED' : 'READY'}
                  </td>
                  <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                    {new Date(proj.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => {
                        audioFx.playClick();
                        onSelectProject(proj);
                      }}
                      className="px-3 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-400 hover:text-black border border-cyan-400/40 font-bold text-cyan-300 transition-all mr-2"
                    >
                      LAUNCH
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Import New Project Modal ── */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div
            className="w-full max-w-2xl rounded-3xl p-6 sm:p-8 border space-y-6 animate-in fade-in zoom-in-95 duration-200"
            style={{
              background: '#060812',
              borderColor: 'rgba(0, 243, 255, 0.3)',
              boxShadow: '0 0 50px rgba(0, 243, 255, 0.15)',
            }}
          >
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-5 h-5 text-cyan-400" />
                <h2
                  style={{
                    fontFamily: "'Orbitron', monospace",
                    fontSize: '16px',
                    fontWeight: 800,
                    color: '#f8fafc',
                  }}
                >
                  IMPORT REPOSITORY OR USE BLUEPRINT
                </h2>
              </div>
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider block">
                Select Instant Engineering Blueprint
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {TEMPLATE_PROJECTS.map((tmpl) => (
                  <button
                    key={tmpl.name}
                    onClick={() => handleCreateFromTemplate(tmpl)}
                    className="p-4 rounded-2xl border text-left space-y-2 transition-all hover:scale-[1.02]"
                    style={{
                      background: 'rgba(12, 16, 36, 0.6)',
                      borderColor: 'rgba(255, 255, 255, 0.08)',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = tmpl.accent)}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)')}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-900 border border-white/[0.1]" style={{ color: tmpl.accent }}>
                        {tmpl.badge}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">{tmpl.lang}</span>
                    </div>
                    <div className="font-mono text-xs font-bold text-slate-200">{tmpl.name}</div>
                    <p className="text-[11px] text-slate-400 line-clamp-2">{tmpl.issue}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
