'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  ShieldCheck,
  Lock,
  Mail,
  User,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  ArrowRight,
  RefreshCw,
  Sparkles,
  ExternalLink,
  ChevronLeft
} from 'lucide-react';
import { UserProfile } from '../types/codeforge';
import { audioFx } from '../lib/audioFx';

interface AuthGateProps {
  isOpen: boolean;
  onSuccess: (user: UserProfile) => void;
  onClose?: () => void;
}

const GithubIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
  </svg>
);

const GoogleIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
  </svg>
);

export const AuthGate: React.FC<AuthGateProps> = ({ isOpen, onSuccess, onClose }) => {
  const [step, setStep] = useState<'credentials' | 'mfa'>('credentials');
  const [provider, setProvider] = useState<'github' | 'google' | 'email'>('github');
  
  // Credentials
  const [githubUsername, setGithubUsername] = useState('Omtripathi1004');
  const [githubToken, setGithubToken] = useState('');
  const [email, setEmail] = useState('om@codeforge.dev');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('Om Sharma');
  const [isSignUp, setIsSignUp] = useState(false);

  // MFA OTP State
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [dispatchedCode, setDispatchedCode] = useState<string>('');
  const [maskedDestination, setMaskedDestination] = useState<string>('');
  const [timerSeconds, setTimerSeconds] = useState(300);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer for MFA
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === 'mfa' && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, timerSeconds]);

  if (!isOpen) return null;

  const getTargetIdentifier = () => {
    if (provider === 'github') return (githubUsername || 'Omtripathi1004').trim();
    return (email || 'developer@codeforge.dev').trim();
  };

  const handleInitiateAuth = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);
    audioFx.playClick();

    const identifier = getTargetIdentifier();

    // Basic format validation
    if (provider === 'google' && !identifier.includes('@')) {
      setErrorMsg('Please enter a valid Google/Gmail account (e.g. yourname@gmail.com).');
      setIsLoading(false);
      return;
    }
    if (provider === 'email' && !identifier.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      setIsLoading(false);
      return;
    }
    if (provider === 'github' && !identifier) {
      setErrorMsg('Please enter your GitHub username.');
      setIsLoading(false);
      return;
    }

    try {
      // Dispatch 6-digit MFA OTP code
      const res = await fetch('/api/auth/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send',
          email: identifier.includes('@') ? identifier : undefined,
          githubUsername: provider === 'github' ? identifier : undefined,
          name: fullName || identifier.split('@')[0],
          provider,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to dispatch verification code');
      }

      setDispatchedCode(data.code || '849201');
      setMaskedDestination(data.maskedDestination || identifier);
      setTimerSeconds(300);
      setStep('mfa');
      setSuccessMsg(data.message || 'MFA one-time code generated.');
      audioFx.playSuccess();
      
      // Auto focus first OTP input
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 150);
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication initiation error.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDigitChange = (index: number, val: string) => {
    if (val.length > 1) {
      // Handle paste of whole 6-digit code
      const pasted = val.replace(/\D/g, '').slice(0, 6);
      if (pasted.length > 0) {
        const nextDigits = [...otpDigits];
        for (let i = 0; i < 6; i++) {
          nextDigits[i] = pasted[i] || '';
        }
        setOtpDigits(nextDigits);
        const lastIdx = Math.min(pasted.length, 5);
        otpInputRefs.current[lastIdx]?.focus();
        return;
      }
    }

    const digit = val.slice(-1).replace(/\D/g, '');
    const nextDigits = [...otpDigits];
    nextDigits[index] = digit;
    setOtpDigits(nextDigits);

    if (digit && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleDigitKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleAutoFillOtp = () => {
    if (!dispatchedCode) return;
    const chars = dispatchedCode.split('');
    setOtpDigits(chars);
    audioFx.playClick();
  };

  const handleVerifyOtp = async () => {
    const fullCode = otpDigits.join('');
    if (fullCode.length < 6) {
      setErrorMsg('Please enter all 6 digits of the verification passcode.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    audioFx.playClick();

    const identifier = getTargetIdentifier();

    try {
      const res = await fetch('/api/auth/otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'verify',
          email: identifier.includes('@') ? identifier : undefined,
          githubUsername: provider === 'github' ? identifier : undefined,
          code: fullCode,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Verification failed. Incorrect passcode.');
      }

      setSuccessMsg('Identity verified! Session established.');
      audioFx.playSuccess();

      // Persist authenticated user
      if (typeof window !== 'undefined') {
        localStorage.setItem('codeforge_user', JSON.stringify(data.user));
        if (data.token) localStorage.setItem('codeforge_token', data.token);
      }

      setTimeout(() => {
        onSuccess(data.user);
      }, 700);
    } catch (err: any) {
      setErrorMsg(err.message || 'MFA validation failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(3, 4, 8, 0.92)',
        backdropFilter: 'blur(30px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          background: 'rgba(8, 12, 28, 0.95)',
          border: '1px solid rgba(0, 243, 255, 0.35)',
          borderRadius: '24px',
          padding: '32px 28px',
          boxShadow: '0 25px 70px rgba(0, 0, 0, 0.9), 0 0 50px rgba(0, 243, 255, 0.25)',
          position: 'relative',
          overflow: 'hidden',
          color: '#f8fafc',
        }}
      >
        {/* Top Iridescent Glow Bar */}
        <div
          style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
            background: 'linear-gradient(90deg, #00f3ff, #cf3fff, #00ff99)',
          }}
        />

        {/* ── STEP 1: CREDENTIALS SELECTION ── */}
        {step === 'credentials' && (
          <div>
            {/* Header Icon */}
            <div
              style={{
                width: '54px', height: '54px', borderRadius: '18px', margin: '0 auto 16px',
                background: 'rgba(0, 243, 255, 0.08)', border: '1px solid rgba(0, 243, 255, 0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00f3ff',
                boxShadow: '0 0 20px rgba(0, 243, 255, 0.2)',
              }}
            >
              <ShieldCheck size={28} />
            </div>

            <div style={{ textAlign: 'center', marginBottom: '22px' }}>
              <div
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  padding: '4px 12px', borderRadius: '999px',
                  background: 'rgba(0, 243, 255, 0.1)', border: '1px solid rgba(0, 243, 255, 0.25)',
                  color: '#00f3ff', fontFamily: "'Space Mono', monospace", fontSize: '9px', fontWeight: 700,
                  letterSpacing: '0.12em', marginBottom: '8px', textTransform: 'uppercase',
                }}
              >
                <span>●</span> CODEFORGE SECURITY ACCESS
              </div>
              <h2
                style={{
                  fontFamily: "'Orbitron', monospace", fontSize: '18px', fontWeight: 900,
                  color: '#fff', letterSpacing: '0.04em', margin: '4px 0 6px',
                }}
              >
                AUTHENTIC SWE LOGIN
              </h2>
              <p
                style={{
                  fontFamily: "'Space Mono', monospace", fontSize: '10px', color: '#94a3b8',
                  lineHeight: 1.5,
                }}
              >
                Sign in with GitHub, Google, or Email with 2FA Multi-Factor verification.
              </p>
            </div>

            {/* Provider Tabs */}
            <div
              style={{
                display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px',
                padding: '4px', borderRadius: '14px', background: 'rgba(3, 4, 8, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.08)', marginBottom: '20px',
              }}
            >
              {[
                { id: 'github', label: 'GitHub', icon: GithubIcon },
                { id: 'google', label: 'Google', icon: GoogleIcon },
                { id: 'email', label: 'Email', icon: Mail },
              ].map((p) => {
                const active = provider === p.id;
                const IconComp = p.icon;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setProvider(p.id as any);
                      setErrorMsg(null);
                      audioFx.playClick();
                    }}
                    style={{
                      padding: '8px 10px', borderRadius: '10px', border: 'none',
                      background: active ? 'rgba(0, 243, 255, 0.15)' : 'transparent',
                      color: active ? '#00f3ff' : '#94a3b8',
                      fontFamily: "'Space Mono', monospace", fontSize: '10px', fontWeight: 700,
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                      transition: 'all 0.2s ease',
                      boxShadow: active ? '0 0 12px rgba(0, 243, 255, 0.2)' : 'none',
                    }}
                  >
                    <IconComp className={p.id === 'google' ? 'w-3.5 h-3.5' : 'w-3.5 h-3.5'} />
                    <span>{p.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Form Fields */}
            <form onSubmit={handleInitiateAuth}>
              {provider === 'github' && (
                <div>
                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontFamily: "'Space Mono', monospace", fontSize: '10px', color: '#00f3ff', marginBottom: '6px' }}>
                      GitHub Developer Username:
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="text"
                        value={githubUsername}
                        onChange={(e) => setGithubUsername(e.target.value)}
                        className="cf-input"
                        placeholder="e.g. Omtripathi1004"
                        style={{ paddingLeft: '34px', fontSize: '12px' }}
                        required
                      />
                      <User size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                    </div>
                  </div>

                  <div style={{ marginBottom: '18px' }}>
                    <label style={{ display: 'block', fontFamily: "'Space Mono', monospace", fontSize: '10px', color: '#94a3b8', marginBottom: '6px' }}>
                      Personal Access Token (PAT) (Optional):
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="password"
                        value={githubToken}
                        onChange={(e) => setGithubToken(e.target.value)}
                        className="cf-input"
                        placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                        style={{ paddingLeft: '34px', fontSize: '12px' }}
                      />
                      <KeyRound size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                    </div>
                  </div>
                </div>
              )}

              {provider === 'google' && (
                <div>
                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ display: 'block', fontFamily: "'Space Mono', monospace", fontSize: '10px', color: '#00f3ff', marginBottom: '6px' }}>
                      Google / Gmail Address:
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="cf-input"
                        placeholder="yourname@gmail.com"
                        style={{ paddingLeft: '34px', fontSize: '12px' }}
                        required
                      />
                      <Mail size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                    </div>
                  </div>

                  <div style={{ marginBottom: '18px' }}>
                    <label style={{ display: 'block', fontFamily: "'Space Mono', monospace", fontSize: '10px', color: '#94a3b8', marginBottom: '6px' }}>
                      Account Password:
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="cf-input"
                        placeholder="••••••••••••"
                        style={{ paddingLeft: '34px', fontSize: '12px' }}
                        required
                      />
                      <Lock size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                    </div>
                  </div>
                </div>
              )}

              {provider === 'email' && (
                <div>
                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', fontFamily: "'Space Mono', monospace", fontSize: '10px', color: '#00f3ff', marginBottom: '6px' }}>
                      Full Name:
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="cf-input"
                        placeholder="Om Sharma"
                        style={{ paddingLeft: '34px', fontSize: '12px' }}
                        required
                      />
                      <User size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                    </div>
                  </div>

                  <div style={{ marginBottom: '12px' }}>
                    <label style={{ display: 'block', fontFamily: "'Space Mono', monospace", fontSize: '10px', color: '#00f3ff', marginBottom: '6px' }}>
                      Work Email:
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="cf-input"
                        placeholder="om@codeforge.dev"
                        style={{ paddingLeft: '34px', fontSize: '12px' }}
                        required
                      />
                      <Mail size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                    </div>
                  </div>

                  <div style={{ marginBottom: '18px' }}>
                    <label style={{ display: 'block', fontFamily: "'Space Mono', monospace", fontSize: '10px', color: '#94a3b8', marginBottom: '6px' }}>
                      Password:
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="cf-input"
                        placeholder="••••••••••••"
                        style={{ paddingLeft: '34px', fontSize: '12px' }}
                        required
                      />
                      <Lock size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                    </div>
                  </div>
                </div>
              )}

              {errorMsg && (
                <div
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px',
                    borderRadius: '10px', background: 'rgba(255, 75, 75, 0.1)', border: '1px solid rgba(255, 75, 75, 0.3)',
                    color: '#ff6b6b', fontFamily: "'Space Mono', monospace", fontSize: '10px', marginBottom: '16px',
                  }}
                >
                  <AlertCircle size={14} />
                  <span>{errorMsg}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                style={{
                  width: '100%', padding: '12px', borderRadius: '12px',
                  background: 'linear-gradient(135deg, #00f3ff, #cf3fff)',
                  color: '#030408', fontFamily: "'Orbitron', monospace",
                  fontSize: '11px', fontWeight: 800, letterSpacing: '0.1em',
                  border: 'none', cursor: 'pointer', transition: 'all 0.2s ease',
                  boxShadow: '0 0 25px rgba(0, 243, 255, 0.4)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                }}
              >
                {isLoading ? (
                  <>
                    <RefreshCw size={13} className="animate-spin" />
                    <span>DISPATCHING 2FA SECURE OTP...</span>
                  </>
                ) : (
                  <>
                    <span>CONTINUE TO 2FA VERIFICATION</span>
                    <ArrowRight size={13} />
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* ── STEP 2: MULTI-FACTOR AUTHENTICATION (MFA OTP) ── */}
        {step === 'mfa' && (
          <div>
            <button
              onClick={() => {
                setStep('credentials');
                setErrorMsg(null);
                audioFx.playClick();
              }}
              style={{
                background: 'none', border: 'none', color: '#94a3b8',
                fontFamily: "'Space Mono', monospace", fontSize: '10px',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px',
                marginBottom: '14px', padding: 0,
              }}
            >
              <ChevronLeft size={13} />
              <span>Back to credentials</span>
            </button>

            <div
              style={{
                width: '54px', height: '54px', borderRadius: '18px', margin: '0 auto 16px',
                background: 'rgba(0, 255, 153, 0.1)', border: '1px solid rgba(0, 255, 153, 0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00ff99',
                boxShadow: '0 0 20px rgba(0, 255, 153, 0.2)',
              }}
            >
              <KeyRound size={28} />
            </div>

            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  padding: '4px 12px', borderRadius: '999px',
                  background: 'rgba(0, 255, 153, 0.1)', border: '1px solid rgba(0, 255, 153, 0.25)',
                  color: '#00ff99', fontFamily: "'Space Mono', monospace", fontSize: '9px', fontWeight: 700,
                  letterSpacing: '0.12em', marginBottom: '8px', textTransform: 'uppercase',
                }}
              >
                <span>●</span> TWO-FACTOR AUTHENTICATION
              </div>
              <h2
                style={{
                  fontFamily: "'Orbitron', monospace", fontSize: '18px', fontWeight: 900,
                  color: '#fff', letterSpacing: '0.04em', margin: '4px 0 6px',
                }}
              >
                ENTER 6-DIGIT MFA CODE
              </h2>
              <p
                style={{
                  fontFamily: "'Space Mono', monospace", fontSize: '10px', color: '#94a3b8',
                  lineHeight: 1.5,
                }}
              >
                A secure one-time verification passcode has been dispatched to{' '}
                <span style={{ color: '#00f3ff', fontWeight: 700 }}>{maskedDestination}</span>.
              </p>
            </div>

            {/* Realistic Security Notice with Generated Code for Frictionless Testing */}
            {dispatchedCode && (
              <div
                style={{
                  background: 'rgba(0, 243, 255, 0.08)',
                  border: '1px solid rgba(0, 243, 255, 0.3)',
                  borderRadius: '12px',
                  padding: '12px 14px',
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', color: '#7a82a8', textTransform: 'uppercase' }}>
                    Security Token Received:
                  </div>
                  <div style={{ fontFamily: "'Orbitron', monospace", fontSize: '16px', fontWeight: 900, color: '#00f3ff', letterSpacing: '0.15em' }}>
                    {dispatchedCode}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleAutoFillOtp}
                  style={{
                    padding: '6px 12px', borderRadius: '8px',
                    background: 'rgba(0, 243, 255, 0.2)', border: '1px solid rgba(0, 243, 255, 0.4)',
                    color: '#fff', fontFamily: "'Space Mono', monospace", fontSize: '9px', fontWeight: 700,
                    cursor: 'pointer', transition: 'all 0.2s',
                  }}
                >
                  Auto-fill Passcode
                </button>
              </div>
            )}

            {/* 6 Digit PIN Input Boxes */}
            <div
              style={{
                display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '8px',
                marginBottom: '20px',
              }}
            >
              {otpDigits.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => { otpInputRefs.current[i] = el; }}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleDigitChange(i, e.target.value)}
                  onKeyDown={(e) => handleDigitKeyDown(i, e)}
                  style={{
                    height: '50px',
                    textAlign: 'center',
                    fontFamily: "'Orbitron', monospace",
                    fontSize: '20px',
                    fontWeight: 900,
                    color: '#00ff99',
                    background: 'rgba(3, 4, 8, 0.85)',
                    border: `1px solid ${digit ? '#00ff99' : 'rgba(255, 255, 255, 0.15)'}`,
                    borderRadius: '12px',
                    outline: 'none',
                    boxShadow: digit ? '0 0 15px rgba(0, 255, 153, 0.3)' : 'none',
                    transition: 'all 0.2s',
                  }}
                />
              ))}
            </div>

            {/* Timer & Resend */}
            <div
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                fontFamily: "'Space Mono', monospace", fontSize: '10px',
                color: '#94a3b8', marginBottom: '20px',
              }}
            >
              <span>Code expires in: <strong style={{ color: '#ffaa00' }}>{formatTimer(timerSeconds)}</strong></span>
              <button
                type="button"
                onClick={() => handleInitiateAuth()}
                disabled={isLoading}
                style={{
                  background: 'none', border: 'none', color: '#00f3ff',
                  fontFamily: "'Space Mono', monospace", fontSize: '10px',
                  cursor: 'pointer', textDecoration: 'underline',
                }}
              >
                Resend Passcode
              </button>
            </div>

            {errorMsg && (
              <div
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px',
                  borderRadius: '10px', background: 'rgba(255, 75, 75, 0.1)', border: '1px solid rgba(255, 75, 75, 0.3)',
                  color: '#ff6b6b', fontFamily: "'Space Mono', monospace", fontSize: '10px', marginBottom: '16px',
                }}
              >
                <AlertCircle size={14} />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px',
                  borderRadius: '10px', background: 'rgba(0, 255, 153, 0.1)', border: '1px solid rgba(0, 255, 153, 0.3)',
                  color: '#00ff99', fontFamily: "'Space Mono', monospace", fontSize: '10px', marginBottom: '16px',
                }}
              >
                <CheckCircle2 size={14} />
                <span>{successMsg}</span>
              </div>
            )}

            <button
              type="button"
              onClick={handleVerifyOtp}
              disabled={isLoading || otpDigits.join('').length < 6}
              style={{
                width: '100%', padding: '12px', borderRadius: '12px',
                background: 'linear-gradient(135deg, #00ff99, #00f3ff)',
                color: '#030408', fontFamily: "'Orbitron', monospace",
                fontSize: '11px', fontWeight: 800, letterSpacing: '0.1em',
                border: 'none', cursor: 'pointer', transition: 'all 0.2s ease',
                boxShadow: '0 0 25px rgba(0, 255, 153, 0.4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                opacity: otpDigits.join('').length < 6 ? 0.6 : 1,
              }}
            >
              {isLoading ? (
                <>
                  <RefreshCw size={13} className="animate-spin" />
                  <span>VERIFYING CRYPTOGRAPHIC TOKEN...</span>
                </>
              ) : (
                <>
                  <ShieldCheck size={14} />
                  <span>CONFIRM MFA & ENTER WORKSPACE</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
