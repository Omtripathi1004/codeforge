'use client';

import React, { useState } from 'react';
import { GitPullRequest, CheckCircle2, ShieldCheck, Copy, ExternalLink, GitBranch, X, Award } from 'lucide-react';
import { PullRequestEvidence, VerificationReport } from '../types/codeforge';

interface PullRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  pullRequest?: PullRequestEvidence;
  verificationReport?: VerificationReport;
}

export const PullRequestModal: React.FC<PullRequestModalProps> = ({
  isOpen,
  onClose,
  pullRequest,
  verificationReport
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !pullRequest) return null;

  const handleCopyPR = () => {
    navigator.clipboard.writeText(pullRequest.bodyMarkdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="relative w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <GitPullRequest className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                GitHub Pull Request #{pullRequest.number}
                <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/40">
                  Open & Verified
                </span>
              </h3>
              <p className="text-xs text-slate-400 font-mono">{pullRequest.title}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Branch & Verification Hash Banner */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-mono">
          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2">
            <GitBranch className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-400">Branch:</span>
            <span className="text-cyan-300 truncate">{pullRequest.branch}</span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-slate-400">Seal:</span>
            <span className="text-emerald-300 truncate font-mono text-[10px]">
              {verificationReport?.cryptographicEvidenceHash?.substring(0, 24)}...
            </span>
          </div>
        </div>

        {/* PR Markdown Body Preview */}
        <div className="flex-1 min-h-[220px] overflow-y-auto p-4 rounded-xl bg-slate-900/80 border border-slate-800 font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
          {pullRequest.bodyMarkdown}
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={handleCopyPR}
            className="px-3.5 py-2 rounded-lg text-xs font-mono text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-700 flex items-center gap-1.5 transition-all"
          >
            <Copy className="w-3.5 h-3.5" />
            {copied ? 'PR Body Copied!' : 'Copy Markdown Evidence'}
          </button>

          <a
            href={pullRequest.htmlUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-lg shadow-emerald-950"
          >
            Open on GitHub <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
