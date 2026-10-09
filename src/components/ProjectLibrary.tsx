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
  ArrowLeft
} from 'lucide-react';
import { DbProject } from '../lib/server/db';
import { RepositoryContext } from '../types/codeforge';

interface ProjectLibraryProps {
  onSelectProject: (project: DbProject) => void;
  onBackToWorkspace: () => void;
}

export const ProjectLibrary: React.FC<ProjectLibraryProps> = ({
  onSelectProject,
  onBackToWorkspace,
}) => {
  const [projects, setProjects] = useState<DbProject[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTag, setFilterTag] = useState<string>('ALL');
  const [loading, setLoading] = useState(false);

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
    try {
      const res = await fetch(`/api/projects/${projectId}/duplicate`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setProjects((prev) => [data.project, ...prev]);
      }
    } catch (err) {
      console.warn('Duplication failed:', err);
    }
  };

  const handleDelete = async (projectId: string) => {
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
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(project, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute('href', dataStr);
    dlAnchorElem.setAttribute('download', `${project.name.replace(/\s+/g, '_')}_codeforge_export.json`);
    dlAnchorElem.click();
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
    return true;
  });

  return (
    <div
      className="cf-panel relative overflow-hidden rounded-2xl p-6 space-y-6 shadow-2xl transition-all max-w-7xl mx-auto"
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

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToWorkspace}
            className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-white/[0.08] text-slate-300 hover:text-white transition-all shadow-md flex items-center gap-1.5 font-mono text-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-cyan-400" />
            <span>Workspace</span>
          </button>
          <div>
            <h2
              style={{
                fontFamily: "'Orbitron', monospace",
                fontSize: '15px',
                fontWeight: 800,
                letterSpacing: '0.04em',
                color: '#f8fafc',
              }}
            >
              PROJECT ARCHIVE & MISSIONS
            </h2>
            <p className="text-xs text-slate-400 font-sans mt-0.5">
              Durable project library, archived telemetry, execution snapshots, and export
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 text-xs font-mono font-bold">
            {projects.length} Saved Projects
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 font-mono text-xs">
        <div className="flex items-center gap-2">
          {['ALL', 'PYTHON', 'TYPESCRIPT'].map((tag) => (
            <button
              key={tag}
              onClick={() => setFilterTag(tag)}
              className={`px-3 py-1.5 rounded-full transition-all text-xs font-bold ${
                filterTag === tag
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 shadow-[0_0_10px_rgba(0,243,255,0.2)]'
                  : 'bg-slate-900/40 text-slate-400 border border-white/[0.06] hover:text-white'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        <div className="relative min-w-[260px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects or repositories..."
            className="w-full text-slate-200 text-xs pl-9 pr-3 py-2 rounded-xl focus:outline-none focus:border-cyan-400 font-sans"
            style={{
              background: 'rgba(3, 4, 8, 0.7)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          />
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredProjects.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-500 font-mono text-xs">
            No projects match the selected criteria.
          </div>
        ) : (
          filteredProjects.map((proj) => (
            <div
              key={proj.id}
              className="frosted-slab group relative rounded-2xl p-5 space-y-4 transition-all duration-300 hover:-translate-y-1"
              style={{
                background: 'rgba(6, 8, 18, 0.75)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-900 text-cyan-300 border border-cyan-500/30 font-bold">
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
                <p className="text-xs text-slate-400 mt-1 line-clamp-2 font-sans">
                  {proj.description || proj.mission?.issueTitle || 'Autonomous engineering task.'}
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-white/[0.05] font-mono text-[11px] text-slate-400 flex items-center justify-between">
                <span className="truncate pr-2">{proj.repository?.fullName}</span>
                <span className="text-emerald-400 font-bold">
                  {proj.mission?.status === 'PR_CREATED' ? '✓ VERIFIED' : 'ACTIVE'}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2 border-t border-white/[0.06]">
                <button
                  onClick={() => onSelectProject(proj)}
                  className="flex-1 py-2 px-3 rounded-xl font-mono text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                  style={{
                    background: 'linear-gradient(135deg, rgba(0,243,255,0.2), rgba(207,63,255,0.2))',
                    border: '1px solid rgba(0,243,255,0.4)',
                    color: '#ffffff',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#00f3ff';
                    e.currentTarget.style.color = '#000';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0,243,255,0.2), rgba(207,63,255,0.2))';
                    e.currentTarget.style.color = '#ffffff';
                  }}
                >
                  <Play className="w-3 h-3" />
                  LOAD MISSION
                </button>

                <button
                  onClick={() => handleDuplicate(proj.id)}
                  className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-white/[0.08] text-slate-400 hover:text-white transition-all"
                  title="Duplicate project"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => handleExport(proj)}
                  className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-white/[0.08] text-slate-400 hover:text-white transition-all"
                  title="Export JSON"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => handleDelete(proj.id)}
                  className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-white/[0.08] text-slate-400 hover:text-rose-400 transition-all"
                  title="Delete project"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
