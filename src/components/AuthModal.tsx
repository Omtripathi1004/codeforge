'use client';

import React, { useState } from 'react';
import { ShieldCheck, Mail, Lock, CheckCircle2, User, KeyRound, X, AlertCircle, Loader2 } from 'lucide-react';
import { UserProfile, UserRole } from '../types/codeforge';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onUpdateUser: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUpdateUser
}) => {
  const [mode, setMode] = useState<'login' | 'register' | 'github'>('login');
  const [emailInput, setEmailInput] = useState('om@codeforge.dev');
  const [passwordInput, setPasswordInput] = useState('developer123');
  const [nameInput, setNameInput] = useState('Om Sharma');
  const [githubTokenInput, setGithubTokenInput] = useState('');
  const [roleInput, setRoleInput] = useState<UserRole>('DEVELOPER');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const endpoint = mode === 'register' ? '/api/auth/register' : '/api/auth/login';
      const body = mode === 'register'
        ? { email: emailInput, password: passwordInput, name: nameInput, role: roleInput }
        : { email: emailInput, password: passwordInput };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      setSuccessMsg(`Welcome, ${data.user.firstName}! Session authenticated.`);
      onUpdateUser(data.user);
      if (typeof window !== 'undefined' && data.token) {
        localStorage.setItem('codeforge_token', data.token);
      }
      setTimeout(() => {
        onClose();
      }, 700);
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred during authentication');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGithubAuth = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch('/api/auth/github', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          githubToken: githubTokenInput.trim() || undefined,
          githubUsername: nameInput.toLowerCase().replace(/\s+/g, '-') || 'om-sharma',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'GitHub authorization failed');
      }

      setSuccessMsg(`Connected GitHub account for ${data.user.name}`);
      onUpdateUser(data.user);
      if (typeof window !== 'undefined' && data.token) {
        localStorage.setItem('codeforge_token', data.token);
      }
      setTimeout(() => {
        onClose();
      }, 700);
    } catch (err: any) {
      setErrorMsg(err.message || 'GitHub authentication error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-md rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Title */}
        <div className="flex items-center gap-2.5 mb-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center text-white">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100">CodeForge Identity & RBAC</h3>
            <p className="text-xs text-slate-400">Durable Authentication & Session Storage</p>
          </div>
        </div>

        {/* Mode Tabs */}
        <div className="flex rounded-xl bg-slate-900 p-1 border border-slate-800 my-4 text-xs font-mono">
          <button
            onClick={() => { setMode('login'); setErrorMsg(null); }}
            className={`flex-1 py-1.5 rounded-lg font-medium transition-all ${
              mode === 'login' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => { setMode('register'); setErrorMsg(null); }}
            className={`flex-1 py-1.5 rounded-lg font-medium transition-all ${
              mode === 'register' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Register
          </button>
          <button
            onClick={() => { setMode('github'); setErrorMsg(null); }}
            className={`flex-1 py-1.5 rounded-lg font-medium transition-all ${
              mode === 'github' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            GitHub PAT
          </button>
        </div>

        {/* Feedback Alert */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-xs text-red-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-xs text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* GitHub PAT Mode */}
        {mode === 'github' ? (
          <div className="space-y-4">
            <div>
              <label className="text-[11px] font-mono text-slate-400 block mb-1">GitHub Personal Access Token (PAT)</label>
              <input
                type="password"
                value={githubTokenInput}
                onChange={(e) => setGithubTokenInput(e.target.value)}
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                className="w-full text-xs bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Requires \`repo\` scope to inspect authorized private and public repos.</span>
            </div>

            <div>
              <label className="text-[11px] font-mono text-slate-400 block mb-1">GitHub Username</label>
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="e.g. om-sharma"
                className="w-full text-xs bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>

            <button
              onClick={handleGithubAuth}
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-100 font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-md"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
              )}
              Authorize GitHub Repository Access
            </button>
          </div>
        ) : (
          <form onSubmit={handleEmailAuth} className="space-y-3">
            {mode === 'register' && (
              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="e.g. Om Sharma"
                  className="w-full text-xs bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>
            )}

            <div>
              <label className="text-[11px] font-mono text-slate-400 block mb-1">Email Address</label>
              <input
                type="email"
                required
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="developer@codeforge.dev"
                className="w-full text-xs bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>

            <div>
              <label className="text-[11px] font-mono text-slate-400 block mb-1">Password</label>
              <input
                type="password"
                required
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="••••••••"
                className="w-full text-xs bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>

            {mode === 'register' && (
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">RBAC Role:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRoleInput('USER')}
                    className={`p-2 rounded-xl border text-left text-xs transition-all ${
                      roleInput === 'USER'
                        ? 'border-cyan-500 bg-cyan-950/30 text-cyan-200 ring-1 ring-cyan-500/50'
                        : 'border-slate-800 bg-slate-900/50 text-slate-400'
                    }`}
                  >
                    <div className="font-bold text-slate-200">User</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRoleInput('DEVELOPER')}
                    className={`p-2 rounded-xl border text-left text-xs transition-all ${
                      roleInput === 'DEVELOPER'
                        ? 'border-purple-500 bg-purple-950/30 text-purple-200 ring-1 ring-purple-500/50'
                        : 'border-slate-800 bg-slate-900/50 text-slate-400'
                    }`}
                  >
                    <div className="font-bold text-slate-200">Developer (Admin)</div>
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-950 mt-4"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
              {mode === 'register' ? 'Create Account & Start Session' : 'Authenticate Session'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
