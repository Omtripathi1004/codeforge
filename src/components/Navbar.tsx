'use client';

/* SPECIAL LANDING PAGE NAVIGATION BAR */
import React, { useState, useEffect } from 'react';
import { 
  Settings, Bot, Volume2, VolumeX, ArrowUpRight, ShieldCheck, Sparkles, 
  Home, Wrench, Palette, FolderGit2, BarChart3, History, User
} from 'lucide-react';
import { UserProfile, RepositoryContext, MissionStatus } from '../types/codeforge';
import { audioFx } from '../lib/audioFx';

export type NavTabType = 'landing' | 'mission' | 'studio' | 'library' | 'benchmarks' | 'replay';

interface NavbarProps {
  user: UserProfile;
  activeRepo: RepositoryContext;
  onSelectRepo: (repo: RepositoryContext) => void;
  missionStatus: MissionStatus;
  onOpenAuth: () => void;
  onOpenSettings: () => void;
  onToggleCopilot: () => void;
  copilotOpen: boolean;
  activeTab: NavTabType;
  setActiveTab: (tab: NavTabType) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  activeRepo,
  missionStatus,
  onOpenAuth,
  onOpenSettings,
  onToggleCopilot,
  copilotOpen,
  activeTab,
  setActiveTab,
}) => {
  const [scrolled, setScrolled] = useState(false);
  const [soundOn, setSoundOn] = useState(true);

  const toggleSound = () => {
    const next = audioFx.toggle();
    setSoundOn(next);
    if (next) audioFx.playSuccess();
  };

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const missionLive = !['IDLE', 'PR_CREATED'].includes(missionStatus);

  const NAV_ITEMS: { id: NavTabType; label: string; icon: React.ReactNode }[] = [
    { id: 'landing',    label: 'Home',       icon: <Home className="w-3.5 h-3.5" /> },
    { id: 'mission',    label: 'Workshop',   icon: <Wrench className="w-3.5 h-3.5" /> },
    { id: 'studio',     label: 'Studio',     icon: <Palette className="w-3.5 h-3.5" /> },
    { id: 'library',    label: 'Library',    icon: <FolderGit2 className="w-3.5 h-3.5" /> },
    { id: 'benchmarks', label: 'Benchmarks', icon: <BarChart3 className="w-3.5 h-3.5" /> },
    { id: 'replay',     label: 'Replay',     icon: <History className="w-3.5 h-3.5" /> },
  ];

  return (
    <header
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        padding: '12px 28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'rgba(6, 10, 24, 0.96)',
        backdropFilter: 'blur(24px)',
        borderBottom: '1px solid rgba(0, 243, 255, 0.22)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.8), 0 0 20px rgba(0, 243, 255, 0.1)',
        transition: 'all 0.25s ease',
      }}
    >
      {/* ── Top Neon Horizon Line ── */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '2px',
          background: 'linear-gradient(90deg, transparent, #00f3ff 25%, #cf3fff 50%, #00ff99 75%, transparent)',
        }}
      />

      {/* ── Left: Brand & Logo ── */}
      <button
        onClick={() => {
          audioFx.playClick();
          setActiveTab('landing');
        }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '4px 8px',
          borderRadius: '12px',
          transition: 'transform 0.2s ease',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.02)')}
        onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
      >
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #00f3ff, #cf3fff)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 18px rgba(0, 243, 255, 0.45)',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 12 12" fill="none">
            <path d="M2 6L5 3L8 6L5 9L2 6Z" stroke="#000" strokeWidth="1.8" strokeLinejoin="round" />
            <circle cx="8" cy="6" r="1.5" fill="#000" />
          </svg>
        </div>
        <div style={{ textAlign: 'left' }}>
          <div
            style={{
              fontFamily: "'Orbitron', monospace",
              fontSize: '14px',
              fontWeight: 900,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: '#ffffff',
              textShadow: '0 0 12px rgba(255, 255, 255, 0.4)',
            }}
          >
            CODEFORGE
          </div>
          <div
            style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: '9px',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: '#00f3ff',
              fontWeight: 700,
            }}
          >
            AI AGENT PLATFORM
          </div>
        </div>
      </button>

      {/* ── Center: High-Contrast Navigation Pill Bar ── */}
      <nav
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          background: 'rgba(3, 6, 16, 0.95)',
          border: '1px solid rgba(255, 255, 255, 0.14)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.6), inset 0 0 15px rgba(0, 243, 255, 0.05)',
          borderRadius: '999px',
          padding: '5px 8px',
        }}
      >
        {NAV_ITEMS.map((item) => {
          const active = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                audioFx.playTabSwitch();
                setActiveTab(item.id);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '7px',
                padding: '7px 16px',
                borderRadius: '999px',
                fontFamily: "'Space Mono', monospace",
                fontSize: '12px',
                fontWeight: active ? 700 : 500,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: active ? '#ffffff' : '#cbd5e1',
                background: active
                  ? 'linear-gradient(135deg, rgba(0, 243, 255, 0.28), rgba(207, 63, 255, 0.28))'
                  : 'transparent',
                border: active ? '1px solid rgba(0, 243, 255, 0.6)' : '1px solid transparent',
                boxShadow: active ? '0 0 16px rgba(0, 243, 255, 0.35)' : 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  e.currentTarget.style.color = '#ffffff';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  e.currentTarget.style.color = '#cbd5e1';
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.borderColor = 'transparent';
                }
              }}
            >
              <span style={{ color: active ? '#00f3ff' : '#94a3b8' }}>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* ── Right: Telemetry Controls & Profile ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* Mission Status indicator if active */}
        {missionLive && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 14px',
              borderRadius: '999px',
              background: 'rgba(0, 243, 255, 0.12)',
              border: '1px solid rgba(0, 243, 255, 0.4)',
              fontFamily: "'Space Mono', monospace",
              fontSize: '10px',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: '#00f3ff',
            }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: '#00f3ff',
                boxShadow: '0 0 8px #00f3ff',
              }}
            />
            <span>{missionStatus.replace(/_/g, ' ')}</span>
          </div>
        )}

        {/* Copilot Toggle */}
        <button
          onClick={onToggleCopilot}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '7px',
            padding: '7px 14px',
            borderRadius: '999px',
            background: copilotOpen ? 'rgba(0, 243, 255, 0.22)' : 'rgba(15, 23, 42, 0.9)',
            border: `1px solid ${copilotOpen ? 'rgba(0, 243, 255, 0.6)' : 'rgba(255, 255, 255, 0.16)'}`,
            fontFamily: "'Space Mono', monospace",
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '0.06em',
            color: copilotOpen ? '#00f3ff' : '#f8fafc',
            boxShadow: copilotOpen ? '0 0 16px rgba(0, 243, 255, 0.3)' : 'none',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#00f3ff')}
          onMouseLeave={(e) =>
            (e.currentTarget.style.borderColor = copilotOpen
              ? 'rgba(0, 243, 255, 0.6)'
              : 'rgba(255, 255, 255, 0.16)')
          }
        >
          <Bot size={15} style={{ color: copilotOpen ? '#00f3ff' : '#38bdf8' }} />
          <span>COPILOT</span>
        </button>

        {/* Audio FX Toggle */}
        <button
          onClick={toggleSound}
          title={soundOn ? 'Mute Cyber Audio FX' : 'Enable Cyber Audio FX'}
          style={{
            padding: '8px',
            borderRadius: '999px',
            background: soundOn ? 'rgba(0, 243, 255, 0.12)' : 'rgba(15, 23, 42, 0.9)',
            border: `1px solid ${soundOn ? 'rgba(0, 243, 255, 0.4)' : 'rgba(255, 255, 255, 0.16)'}`,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            color: soundOn ? '#00f3ff' : '#94a3b8',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#00f3ff')}
          onMouseLeave={(e) =>
            (e.currentTarget.style.borderColor = soundOn
              ? 'rgba(0, 243, 255, 0.4)'
              : 'rgba(255, 255, 255, 0.16)')
          }
        >
          {soundOn ? <Volume2 size={16} /> : <VolumeX size={16} />}
        </button>

        {/* Settings modal */}
        <button
          onClick={onOpenSettings}
          title="Engine Configuration"
          style={{
            padding: '8px',
            borderRadius: '999px',
            background: 'rgba(15, 23, 42, 0.9)',
            border: '1px solid rgba(255, 255, 255, 0.16)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            color: '#f8fafc',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#cf3fff';
            e.currentTarget.style.color = '#cf3fff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.16)';
            e.currentTarget.style.color = '#f8fafc';
          }}
        >
          <Settings size={16} />
        </button>

        {/* User avatar & name */}
        <button
          onClick={onOpenAuth}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '9px',
            padding: '5px 14px 5px 6px',
            borderRadius: '999px',
            background: 'rgba(15, 23, 42, 0.9)',
            border: '1px solid rgba(255, 255, 255, 0.16)',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#00f3ff')}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.16)')}
        >
          <div
            style={{
              width: '26px',
              height: '26px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #00f3ff, #cf3fff)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: "'Orbitron', monospace",
              fontSize: '11px',
              fontWeight: 900,
              color: '#000',
              boxShadow: '0 0 10px rgba(0, 243, 255, 0.4)',
            }}
          >
            {user?.firstName?.[0] || 'U'}
          </div>
          <span
            style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: '11px',
              fontWeight: 700,
              color: '#ffffff',
            }}
          >
            {user?.firstName || 'Account'}
          </span>
        </button>
      </div>
    </header>
  );
};
