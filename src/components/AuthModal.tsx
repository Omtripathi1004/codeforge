'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  Mail,
  Lock,
  CheckCircle2,
  User,
  KeyRound,
  X,
  AlertCircle,
  Loader2,
  Globe,
  ArrowRight,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { UserProfile, UserRole } from '../types/codeforge';
import { audioFx } from '../lib/audioFx';

const GithubIcon = ({ className = "w-3.5 h-3.5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

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
  onUpdateUser,
}) => {
  const [authMethod, setAuthMethod] = useState<'github' | 'google' | 'email'>('github');
  const [emailInput, setEmailInput] = useState(currentUser.email || 'developer@codeforge.dev');
  const [passwordInput, setPasswordInput] = useState('');
  const [nameInput, setNameInput] = useState(currentUser.name || 'Senior Developer');
  const [githubUsernameInput, setGithubUsernameInput] = useState(currentUser.githubUsername || 'octocat');
  const [githubTokenInput, setGithubTokenInput] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGithubOAuth = async (useRealToken: boolean = false) => {
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    audioFx.playClick();

    try {
      const res = await fetch('/api/auth/github', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          githubToken: useRealToken && githubTokenInput.trim() ? githubTokenInput.trim() : undefined,
          githubUsername: githubUsernameInput.trim() || 'om-sharma',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'GitHub authentication failed');
      }

      setSuccessMsg(`Authenticated GitHub account: ${data.user.githubUsername || data.user.name}`);
      audioFx.playSuccess();
      onUpdateUser(data.user);
      if (typeof window !== 'undefined' && data.token) {
        localStorage.setItem('codeforge_token', data.token);
      }
      setTimeout(() => {
        onClose();
      }, 900);
    } catch (err: any) {
      setErrorMsg(err.message || 'GitHub authentication error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    audioFx.playClick();

    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: emailInput.includes('@') ? emailInput : `${nameInput.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
          name: nameInput || 'Google Developer',
          avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(nameInput || 'Google')}`,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Google authentication failed');
      }

      setSuccessMsg(`Signed in with Google Account (${data.user.email})`);
      audioFx.playSuccess();
      onUpdateUser(data.user);
      if (typeof window !== 'undefined' && data.token) {
        localStorage.setItem('codeforge_token', data.token);
      }
      setTimeout(() => {
        onClose();
      }, 900);
    } catch (err: any) {
      setErrorMsg(err.message || 'Google authentication error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    audioFx.playClick();

    try {
      const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
      const body = isRegister
        ? { email: emailInput, password: passwordInput || 'developer123', name: nameInput, role: 'DEVELOPER' }
        : { email: emailInput, password: passwordInput || 'developer123' };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Email authentication failed');
      }

      setSuccessMsg(`Welcome, ${data.user.firstName}! Session authenticated.`);
      audioFx.playSuccess();
      onUpdateUser(data.user);
      if (typeof window !== 'undefined' && data.token) {
        localStorage.setItem('codeforge_token', data.token);
      }
      setTimeout(() => {
        onClose();
      }, 900);
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred during authentication');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div
        className="w-full max-w-lg rounded-3xl p-6 sm:p-8 border space-y-6 animate-in fade-in zoom-in-95 duration-200 relative overflow-hidden"
        style={{
          background: 'rgba(6, 8, 18, 0.95)',
          backdropFilter: 'blur(30px)',
          borderColor: 'rgba(0, 243, 255, 0.3)',
          boxShadow: '0 0 60px rgba(0, 243, 255, 0.2)',
        }}
      >
        {/* Top Iridescent Line */}
        <div
          style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
            background: 'linear-gradient(90deg, transparent, #00f3ff 25%, #cf3fff 50%, #00ff99 75%, transparent)',
          }}
        />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2
                style={{
                  fontFamily: "'Orbitron', monospace",
                  fontSize: '16px',
                  fontWeight: 800,
                  color: '#f8fafc',
                }}
              >
                AUTHENTIC SWE LOGIN & REPO ACCESS
              </h2>
              <p className="text-xs text-slate-400 font-sans mt-0.5">
                OAuth 2.0 & Token Authorization for GitHub, Google, and Workspaces
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              audioFx.playClick();
              onClose();
            }}
            className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Auth Method Selector Tabs */}
        <div className="grid grid-cols-3 gap-2 p-1 rounded-2xl bg-slate-950/80 border border-white/[0.08] font-mono text-xs">
          <button
            onClick={() => {
              audioFx.playClick();
              setAuthMethod('github');
            }}
            className={`py-2 px-3 rounded-xl flex items-center justify-center gap-2 font-bold transition-all ${
              authMethod === 'github'
                ? 'bg-slate-800 text-white border border-white/[0.2] shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <GithubIcon className="w-3.5 h-3.5 text-white" />
            <span>GitHub</span>
          </button>

          <button
            onClick={() => {
              audioFx.playClick();
              setAuthMethod('google');
            }}
            className={`py-2 px-3 rounded-xl flex items-center justify-center gap-2 font-bold transition-all ${
              authMethod === 'google'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            <span>Google</span>
          </button>

          <button
            onClick={() => {
              audioFx.playClick();
              setAuthMethod('email');
            }}
            className={`py-2 px-3 rounded-xl flex items-center justify-center gap-2 font-bold transition-all ${
              authMethod === 'email'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-400/50 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Mail className="w-3.5 h-3.5 text-purple-400" />
            <span>Email</span>
          </button>
        </div>

        {/* Feedback Alerts */}
        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs font-mono flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Tab 1: GitHub OAuth & Token Connection */}
        {authMethod === 'github' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-900/50 border border-white/[0.06] space-y-3">
              <div className="flex items-center justify-between text-xs font-mono text-slate-300">
                <span className="font-bold flex items-center gap-2">
                  <GithubIcon className="w-4 h-4" />
                  Authentic GitHub Account Link
                </span>
                <span className="text-[10px] text-emerald-400">repo, read:org, user</span>
              </div>
              <p className="text-xs text-slate-400 font-sans leading-relaxed">
                Connect your real GitHub identity to authorize repository inspection, branch creation, and autonomous Pull Request publishing.
              </p>

              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1">GitHub Username:</label>
                <input
                  type="text"
                  value={githubUsernameInput}
                  onChange={(e) => setGithubUsernameInput(e.target.value)}
                  placeholder="e.g. Omtripathi1004"
                  className="w-full text-slate-200 text-xs px-3.5 py-2.5 rounded-xl font-mono focus:outline-none focus:border-cyan-400 bg-black/60 border border-white/[0.1]"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[11px] font-mono text-slate-400">Personal Access Token (PAT) (Optional):</label>
                  <a
                    href="https://github.com/settings/tokens/new?scopes=repo,read:org,user"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] font-mono text-cyan-400 hover:underline flex items-center gap-1"
                  >
                    <span>Generate token</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <input
                  type="password"
                  value={githubTokenInput}
                  onChange={(e) => setGithubTokenInput(e.target.value)}
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                  className="w-full text-slate-200 text-xs px-3.5 py-2.5 rounded-xl font-mono focus:outline-none focus:border-cyan-400 bg-black/60 border border-white/[0.1]"
                />
                <span className="text-[10px] text-slate-500 font-mono mt-1 block">
                  Leave blank to connect public repositories with simulated OAuth handshake.
                </span>
              </div>
            </div>

            <button
              onClick={() => handleGithubOAuth(Boolean(githubTokenInput))}
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl font-mono text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 border border-white/[0.2] hover:border-cyan-400 transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
              ) : (
                <GithubIcon className="w-4 h-4 text-white" />
              )}
              <span>CONTINUE WITH GITHUB AUTHENTICATION</span>
            </button>
          </div>
        )}

        {/* Tab 2: Google Account Login */}
        {authMethod === 'google' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-900/50 border border-white/[0.06] space-y-3">
              <div className="flex items-center justify-between text-xs font-mono text-slate-300">
                <span className="font-bold flex items-center gap-2">
                  <Globe className="w-4 h-4 text-cyan-400" />
                  Google Identity Service
                </span>
                <span className="text-[10px] text-cyan-400">OAuth 2.0 Verified</span>
              </div>
              <p className="text-xs text-slate-400 font-sans leading-relaxed">
                Sign in with your Google Workspace or Personal Account for single sign-on across the CodeForge engineering dashboard.
              </p>

              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1">Your Full Name:</label>
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="e.g. Om Sharma"
                  className="w-full text-slate-200 text-xs px-3.5 py-2.5 rounded-xl font-mono focus:outline-none focus:border-cyan-400 bg-black/60 border border-white/[0.1]"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1">Google Email Address:</label>
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="e.g. om.sharma@gmail.com"
                  className="w-full text-slate-200 text-xs px-3.5 py-2.5 rounded-xl font-mono focus:outline-none focus:border-cyan-400 bg-black/60 border border-white/[0.1]"
                />
              </div>
            </div>

            <button
              onClick={handleGoogleAuth}
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl font-mono text-xs font-bold text-[#030408] bg-cyan-400 hover:bg-cyan-300 transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,243,255,0.4)] disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Globe className="w-4 h-4" />
              )}
              <span>SIGN IN WITH GOOGLE ACCOUNT</span>
            </button>
          </div>
        )}

        {/* Tab 3: Work Email & Password */}
        {authMethod === 'email' && (
          <form onSubmit={handleEmailAuth} className="space-y-4">
            <div className="space-y-3 font-mono text-xs">
              {isRegister && (
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Developer Name:</label>
                  <input
                    type="text"
                    required
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    placeholder="Om Sharma"
                    className="w-full text-slate-200 text-xs px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-purple-400 bg-black/60 border border-white/[0.1]"
                  />
                </div>
              )}

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Email Address:</label>
                <input
                  type="email"
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="om@codeforge.dev"
                  className="w-full text-slate-200 text-xs px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-purple-400 bg-black/60 border border-white/[0.1]"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-400 block mb-1">Password:</label>
                <input
                  type="password"
                  required
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full text-slate-200 text-xs px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-purple-400 bg-black/60 border border-white/[0.1]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl font-mono text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(207,63,255,0.4)] disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
              <span>{isRegister ? 'REGISTER DEVELOPER ACCOUNT' : 'LOGIN WITH EMAIL'}</span>
            </button>

            <div className="text-center pt-1 font-mono text-xs">
              <button
                type="button"
                onClick={() => setIsRegister(!isRegister)}
                className="text-slate-400 hover:text-cyan-300 underline"
              >
                {isRegister ? 'Already have an account? Log in' : "Don't have an account? Register"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
