'use client';

import React, { useState } from 'react';
import { Settings, Cpu, Shield, Zap, Bell, Check, X, GitBranch, CloudUpload, Mail, MessageSquare } from 'lucide-react';
import { AIProviderSettings } from '../types/codeforge';
import { AIProviderService } from '../services/aiProvider';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (settings: AIProviderSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, onSave }) => {
  const [settings, setSettings] = useState<AIProviderSettings>(() => AIProviderService.getSettings());
  const [activeTab, setActiveTab] = useState<'ai' | 'github' | 'deploy' | 'notifications' | 'sandbox'>('ai');
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    AIProviderService.saveSettings(settings);
    setSaved(true);
    if (onSave) onSave(settings);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-100">CodeForge Integrations & Provider Adapters</h3>
              <p className="text-xs text-slate-400">Nebius Token Factory, GitHub, Vercel, Notifications & Sandbox Limits</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex rounded-xl bg-slate-900 p-1 border border-slate-800 text-xs font-mono">
          <button
            onClick={() => setActiveTab('ai')}
            className={`flex-1 py-1.5 rounded-lg font-medium flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'ai' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            AI Model
          </button>
          <button
            onClick={() => setActiveTab('github')}
            className={`flex-1 py-1.5 rounded-lg font-medium flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'github' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5" />
            GitHub
          </button>
          <button
            onClick={() => setActiveTab('deploy')}
            className={`flex-1 py-1.5 rounded-lg font-medium flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'deploy' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <CloudUpload className="w-3.5 h-3.5" />
            Deploy
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`flex-1 py-1.5 rounded-lg font-medium flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'notifications' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            Notify
          </button>
          <button
            onClick={() => setActiveTab('sandbox')}
            className={`flex-1 py-1.5 rounded-lg font-medium flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'sandbox' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            Sandbox
          </button>
        </div>

        {/* Tab 1: AI Provider & OpenRouter × Qwen3-Coder */}
        {activeTab === 'ai' && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <button
                onClick={() => setSettings({ ...settings, provider: 'openrouter' })}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  settings.provider === 'openrouter'
                    ? 'border-emerald-500 bg-emerald-950/30 text-emerald-300 ring-1 ring-emerald-500/50'
                    : 'border-slate-800 bg-slate-900/50 text-slate-400'
                }`}
              >
                <div className="font-bold text-slate-200">OpenRouter (Active)</div>
                <div className="text-[10px] text-emerald-400 mt-0.5">Qwen3-Coder Primary</div>
              </button>

              <button
                onClick={() => setSettings({ ...settings, provider: 'openai' })}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  settings.provider === 'openai'
                    ? 'border-cyan-500 bg-cyan-950/30 text-cyan-300 ring-1 ring-cyan-500/50'
                    : 'border-slate-800 bg-slate-900/50 text-slate-400'
                }`}
              >
                <div className="font-bold text-slate-200">OpenAI Fallback</div>
                <div className="text-[10px] text-slate-400 mt-0.5">GPT-4o / o1-mini</div>
              </button>
            </div>

            {settings.provider === 'openrouter' && (
              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2.5 text-xs font-mono">
                <div>
                  <label className="text-slate-400 text-[11px] block mb-1">OpenRouter Primary Model:</label>
                  <select
                    value={settings.openrouterModel || 'qwen/qwen3-coder'}
                    onChange={(e) => setSettings({ ...settings, openrouterModel: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:border-cyan-500"
                  >
                    <option value="qwen/qwen3-coder">qwen/qwen3-coder (Primary Model)</option>
                    <option value="qwen/qwen-2.5-coder-32b-instruct">qwen/qwen-2.5-coder-32b-instruct</option>
                    <option value="qwen/qwen-2.5-coder-7b-instruct">qwen/qwen-2.5-coder-7b-instruct</option>
                  </select>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300 text-[11px] font-semibold">Server-Side Credentials:</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-emerald-500/20 text-emerald-400">
                      SECURED (.env)
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    OpenRouter API key is securely loaded from your local <code className="text-cyan-400">.env</code> file (<code className="text-emerald-400">OPENROUTER_API_KEY</code>). Client requests are executed server-side with zero browser token exposure.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: GitHub Integration */}
        {activeTab === 'github' && (
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3 text-xs font-mono">
            <div className="flex justify-between items-center">
              <div>
                <div className="font-bold text-slate-200">GitHub Provider Integration</div>
                <div className="text-[11px] text-slate-400 mt-0.5">Dispatches real pull requests to authorized repositories</div>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${settings.githubToken ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
                {settings.githubToken ? 'AUTHORIZED' : 'NOT CONFIGURED'}
              </span>
            </div>

            <div>
              <label className="text-slate-400 text-[11px] block mb-1">GitHub Personal Access Token (repo scope):</label>
              <input
                type="password"
                value={settings.githubToken || ''}
                onChange={(e) => setSettings({ ...settings, githubToken: e.target.value })}
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:border-cyan-500"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">When unconfigured, PRs are sealed locally with cryptographic SHA256 evidence.</span>
            </div>
          </div>
        )}

        {/* Tab 3: Deployment Integration */}
        {activeTab === 'deploy' && (
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3 text-xs font-mono">
            <div className="flex justify-between items-center">
              <div>
                <div className="font-bold text-slate-200">Vercel Deployment Provider</div>
                <div className="text-[11px] text-slate-400 mt-0.5">Automated production preview & build deployment</div>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${settings.vercelToken ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
                {settings.vercelToken ? 'READY' : 'NOT CONFIGURED'}
              </span>
            </div>

            <div>
              <label className="text-slate-400 text-[11px] block mb-1">Vercel API Token:</label>
              <input
                type="password"
                value={settings.vercelToken || ''}
                onChange={(e) => setSettings({ ...settings, vercelToken: e.target.value })}
                placeholder="vercel_tok_..."
                className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="text-slate-400 text-[11px] block mb-1">Vercel Project ID (Optional):</label>
              <input
                type="text"
                value={settings.vercelProjectId || ''}
                onChange={(e) => setSettings({ ...settings, vercelProjectId: e.target.value })}
                placeholder="prj_..."
                className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-lg p-2 text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>
        )}

        {/* Tab 4: Notification Adapters */}
        {activeTab === 'notifications' && (
          <div className="space-y-3 text-xs font-mono">
            {/* Webhook */}
            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-200">Webhook Adapter (n8n / Slack)</span>
                <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-slate-300">
                  <input
                    type="checkbox"
                    checked={settings.n8nEnabled}
                    onChange={(e) => setSettings({ ...settings, n8nEnabled: e.target.checked })}
                    className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-0"
                  />
                  Active
                </label>
              </div>
              <input
                type="text"
                value={settings.n8nWebhookUrl}
                onChange={(e) => setSettings({ ...settings, n8nWebhookUrl: e.target.value })}
                placeholder="https://n8n.domain.com/webhook/codeforge-events"
                className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-lg p-2 text-xs"
              />
            </div>

            {/* Email */}
            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-200">Email Adapter (Resend API)</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${settings.resendApiKey ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
                  {settings.resendApiKey ? 'CONFIGURED' : 'NOT CONFIGURED'}
                </span>
              </div>
              <input
                type="password"
                value={settings.resendApiKey || ''}
                onChange={(e) => setSettings({ ...settings, resendApiKey: e.target.value })}
                placeholder="re_xxxxxxxxxxxx"
                className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-lg p-2 text-xs"
              />
            </div>

            {/* SMS */}
            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-200">SMS Adapter (Twilio API)</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${settings.twilioSid ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
                  {settings.twilioSid ? 'CONFIGURED' : 'NOT CONFIGURED'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={settings.twilioSid || ''}
                  onChange={(e) => setSettings({ ...settings, twilioSid: e.target.value })}
                  placeholder="Twilio Account SID"
                  className="bg-slate-950 border border-slate-700 text-slate-200 rounded-lg p-2 text-xs"
                />
                <input
                  type="password"
                  value={settings.twilioAuthToken || ''}
                  onChange={(e) => setSettings({ ...settings, twilioAuthToken: e.target.value })}
                  placeholder="Twilio Auth Token"
                  className="bg-slate-950 border border-slate-700 text-slate-200 rounded-lg p-2 text-xs"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: Sandbox Limits */}
        {activeTab === 'sandbox' && (
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3 text-xs font-mono">
            <div className="font-bold text-slate-200">Isolated Sandbox Container Limits (cgroups v2)</div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 text-[10px] block mb-1">CPU Quota Limit</label>
                <input
                  type="text"
                  value={settings.sandboxCpuLimit}
                  onChange={(e) => setSettings({ ...settings, sandboxCpuLimit: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-lg p-2 text-xs"
                />
              </div>
              <div>
                <label className="text-slate-400 text-[10px] block mb-1">RAM Memory Limit</label>
                <input
                  type="text"
                  value={settings.sandboxMemoryLimit}
                  onChange={(e) => setSettings({ ...settings, sandboxMemoryLimit: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded-lg p-2 text-xs"
                />
              </div>
            </div>
          </div>
        )}

        {/* Save & Footer */}
        <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-lg shadow-cyan-950"
          >
            {saved ? <Check className="w-4 h-4" /> : null}
            {saved ? 'Saved Successfully' : 'Apply Configuration'}
          </button>
        </div>
      </div>
    </div>
  );
};
