'use client';

import React, { useState, useEffect } from 'react';
import { Settings, Bot, Volume2, VolumeX, ArrowUpRight, ShieldCheck, Sparkles } from 'lucide-react';
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
    const fn = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const isLanding = activeTab === 'landing';
  const missionLive = !['IDLE', 'PR_CREATED'].includes(missionStatus);
  const missionDone = missionStatus === 'PR_CREATED';

  // ══════════════════════════════════════════════════════════════════
  // 1. SPECIAL LANDING PAGE NAVIGATION BAR (Tailored specifically for Landing)
  // ══════════════════════════════════════════════════════════════════
  if (isLanding) {
    return (
      <header
        style={{
          position: 'fixed',
          top: 0, left: 0, right: 0,
          zIndex: 100,
          padding: '18px 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: scrolled ? 'rgba(3, 4, 8, 0.85)' : 'rgba(3, 4, 8, 0.65)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          transition: 'all 0.3s ease',
        }}
      >
        {/* Top-Left: Sleek Logo Branding */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '28px', height: '28px', borderRadius: '8px',
              background: 'linear-gradient(135deg, #00f3ff, #cf3fff)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 15px rgba(0, 243, 255, 0.35)',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 12 12" fill="none">
              <path d="M2 6L5 3L8 6L5 9L2 6Z" stroke="#000" strokeWidth="1.6" strokeLinejoin="round"/>
              <circle cx="8" cy="6" r="1.5" fill="#000"/>
            </svg>
          </div>
          <div>
            <div style={{
              fontFamily: "'Orbitron', monospace",
              fontSize: '13px', fontWeight: 900, letterSpacing: '0.15em',
              textTransform: 'uppercase', color: '#f8fafc',
            }}>
              CODEFORGE
            </div>
            <div style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: '8px', letterSpacing: '0.2em',
              textTransform: 'uppercase', color: '#00f3ff', marginTop: '1px',
            }}>
              ACTIVE THEORY SWE
            </div>
          </div>
        </div>

        {/* Top-Right: Dedicated Landing Navigation Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <nav
            style={{
              display: 'flex', alignItems: 'center', gap: '4px',
              padding: '4px 6px', borderRadius: '999px',
              background: 'rgba(6, 8, 18, 0.85)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              backdropFilter: 'blur(24px)',
            }}
          >
            {[
              { id: 'mission', label: 'WORKSPACE' },
              { id: 'studio', label: 'STUDIO' },
              { id: 'library', label: 'LIBRARY' },
              { id: 'benchmarks', label: 'BENCHMARKS' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  audioFx.playTabSwitch();
                  setActiveTab(tab.id as NavTabType);
                }}
                style={{
                  padding: '7px 15px', borderRadius: '999px',
                  fontFamily: "'Space Mono', monospace", fontSize: '9px',
                  letterSpacing: '0.14em', textTransform: 'uppercase',
                  color: '#94a3b8', background: 'transparent',
                  border: 'none', cursor: 'pointer', transition: 'all 0.2s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.color = '#00f3ff';
                  e.currentTarget.style.background = 'rgba(0, 243, 255, 0.08)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.color = '#94a3b8';
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                {tab.label}
              </button>
            ))}
          </nav>

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            title={soundOn ? 'Mute Cyber Audio FX' : 'Enable Cyber Audio FX'}
            style={{
              padding: '8px', borderRadius: '999px',
              background: soundOn ? 'rgba(0, 243, 255, 0.1)' : 'rgba(6, 8, 18, 0.85)',
              border: `1px solid ${soundOn ? 'rgba(0, 243, 255, 0.3)' : 'rgba(255, 255, 255, 0.08)'}`,
              cursor: 'pointer', display: 'flex', alignItems: 'center',
            }}
          >
            {soundOn ? <Volume2 size={13} style={{ color: '#00f3ff' }} /> : <VolumeX size={13} style={{ color: '#64748b' }} />}
          </button>

          {/* User Account / Auth Status */}
          <button
            onClick={onOpenAuth}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '6px 14px 6px 8px', borderRadius: '999px',
              background: 'rgba(6, 8, 18, 0.85)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              cursor: 'pointer', transition: 'border-color 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(0, 243, 255, 0.35)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
          >
            <div style={{
              width: '20px', height: '20px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #00f3ff, #cf3fff)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: "'Orbitron', monospace", fontSize: '8px', fontWeight: 900, color: '#000',
            }}>
              {user.firstName[0]}
            </div>
            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', fontWeight: 700, color: '#f8fafc' }}>
              {user.firstName}
            </span>
          </button>

          {/* Primary CTA: Launch In Workspace */}
          <button
            onClick={() => {
              audioFx.playClick();
              setActiveTab('mission');
            }}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '8px 18px', borderRadius: '999px',
              background: 'linear-gradient(135deg, #00f3ff, #cf3fff)',
              color: '#030408', fontFamily: "'Orbitron', monospace",
              fontSize: '10px', fontWeight: 800, letterSpacing: '0.1em',
              border: 'none', cursor: 'pointer',
              boxShadow: '0 0 20px rgba(0, 243, 255, 0.4)',
              transition: 'transform 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <span>LAUNCH ENGINE</span>
            <ArrowUpRight size={13} />
          </button>
        </div>
      </header>
    );
  }

  // ══════════════════════════════════════════════════════════════════
  // 2. REDESIGNED WORKSPACE NAVBAR (ZERO OVERLAP, COHESIVE THEME)
  // ══════════════════════════════════════════════════════════════════
  const NAV_ITEMS: { id: NavTabType; label: string }[] = [
    { id: 'landing',    label: 'HOME'        },
    { id: 'mission',    label: 'WORKSPACE'   },
    { id: 'studio',     label: 'STUDIO'      },
    { id: 'library',    label: 'LIBRARY'     },
    { id: 'benchmarks', label: 'BENCHMARKS'  },
    { id: 'replay',     label: 'REPLAY'      },
  ];

  return (
    <header
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0,
        zIndex: 100,
        padding: '14px 28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'rgba(3, 4, 8, 0.88)',
        backdropFilter: 'blur(24px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
      }}
    >
      {/* ── Left: Logo ── */}
      <button
        onClick={() => setActiveTab('landing')}
        style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          background: 'none', border: 'none', cursor: 'pointer', padding: 0,
        }}
      >
        <div style={{
          width: '26px', height: '26px', borderRadius: '7px',
          background: 'linear-gradient(135deg, #00f3ff, #cf3fff)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 6L5 3L8 6L5 9L2 6Z" stroke="#000" strokeWidth="1.5" strokeLinejoin="round"/>
            <circle cx="8" cy="6" r="1.5" fill="#000"/>
          </svg>
        </div>
        <div style={{ textAlign: 'left' }}>
          <div style={{
            fontFamily: "'Orbitron', monospace", fontSize: '11px',
            fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#f8faff',
          }}>
            CodeForge
          </div>
          <div style={{
            fontFamily: "'Space Mono', monospace", fontSize: '7px',
            letterSpacing: '0.2em', textTransform: 'uppercase', color: '#00f3ff',
          }}>
            AI SWE ENGINE
          </div>
        </div>
      </button>

      {/* ── Center: Clean Floating Pill Navigation (No overlapping absolute positions) ── */}
      <nav
        style={{
          display: 'flex', alignItems: 'center', gap: '3px',
          background: 'rgba(6, 8, 18, 0.9)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
          borderRadius: '999px',
          padding: '4px',
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
                padding: '6px 14px', borderRadius: '999px',
                fontFamily: "'Space Mono', monospace",
                fontSize: '9px', letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: active ? '#00f3ff' : 'rgba(148, 163, 184, 0.8)',
                background: active ? 'rgba(0, 243, 255, 0.12)' : 'transparent',
                border: active ? '1px solid rgba(0, 243, 255, 0.3)' : '1px solid transparent',
                cursor: 'pointer', transition: 'all 0.2s ease',
                position: 'relative',
              }}
            >
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* ── Right: Telemetry & Actions (Clean, minimal, no duplicate language switchers) ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {/* Mission Status indicator if active */}
        {missionLive && (
          <div
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '6px 12px', borderRadius: '999px',
              background: 'rgba(0, 243, 255, 0.08)', border: '1px solid rgba(0, 243, 255, 0.25)',
              fontFamily: "'Space Mono', monospace", fontSize: '8px', letterSpacing: '0.12em',
              textTransform: 'uppercase', color: '#00f3ff',
            }}
          >
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#00f3ff', boxShadow: '0 0 6px #00f3ff' }} />
            <span>{missionStatus.replace(/_/g, ' ')}</span>
          </div>
        )}

        {/* Copilot toggle */}
        <button
          onClick={onToggleCopilot}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '6px 12px', borderRadius: '999px',
            background: copilotOpen ? 'rgba(0, 243, 255, 0.15)' : 'rgba(6, 8, 18, 0.88)',
            border: `1px solid ${copilotOpen ? 'rgba(0, 243, 255, 0.35)' : 'rgba(255, 255, 255, 0.08)'}`,
            fontFamily: "'Space Mono', monospace", fontSize: '8px', letterSpacing: '0.12em',
            textTransform: 'uppercase', color: copilotOpen ? '#00f3ff' : '#94a3b8',
            cursor: 'pointer', transition: 'all 0.2s ease',
          }}
        >
          <Bot size={12} style={{ color: copilotOpen ? '#00f3ff' : '#94a3b8' }} />
          <span>COPILOT</span>
        </button>

        {/* Audio FX Toggle */}
        <button
          onClick={toggleSound}
          title={soundOn ? 'Mute Cyber Audio FX' : 'Enable Cyber Audio FX'}
          style={{
            padding: '7px', borderRadius: '999px',
            background: soundOn ? 'rgba(0, 243, 255, 0.1)' : 'rgba(6, 8, 18, 0.88)',
            border: `1px solid ${soundOn ? 'rgba(0, 243, 255, 0.3)' : 'rgba(255, 255, 255, 0.08)'}`,
            cursor: 'pointer', display: 'flex', alignItems: 'center',
          }}
        >
          {soundOn ? <Volume2 size={13} style={{ color: '#00f3ff' }} /> : <VolumeX size={13} style={{ color: '#64748b' }} />}
        </button>

        {/* Settings modal */}
        <button
          onClick={onOpenSettings}
          title="Engine Configuration"
          style={{
            padding: '7px', borderRadius: '999px',
            background: 'rgba(6, 8, 18, 0.88)', border: '1px solid rgba(255, 255, 255, 0.08)',
            cursor: 'pointer', display: 'flex', alignItems: 'center',
          }}
        >
          <Settings size={13} style={{ color: '#94a3b8' }} />
        </button>

        {/* User avatar & name */}
        <button
          onClick={onOpenAuth}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '4px 12px 4px 5px', borderRadius: '999px',
            background: 'rgba(6, 8, 18, 0.88)', border: '1px solid rgba(255, 255, 255, 0.08)',
            cursor: 'pointer', transition: 'border-color 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(0, 243, 255, 0.3)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)'}
        >
          <div style={{
            width: '22px', height: '22px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #00f3ff, #cf3fff)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: "'Orbitron', monospace", fontSize: '9px', fontWeight: 900, color: '#000',
          }}>
            {user.firstName[0]}
          </div>
          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', fontWeight: 700, color: '#f8fafc' }}>
            {user.firstName}
          </span>
        </button>
      </div>
    </header>
  );
};
