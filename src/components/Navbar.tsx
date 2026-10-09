'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Settings, Bot, Volume2, VolumeX } from 'lucide-react';
import { UserProfile, RepositoryContext, MissionStatus } from '../types/codeforge';
import { SAMPLE_REPOSITORIES } from '../services/mockRepositoryData';
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
  onSelectRepo,
  missionStatus,
  onOpenAuth,
  onOpenSettings,
  onToggleCopilot,
  copilotOpen,
  activeTab,
  setActiveTab,
}) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
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

  const isLanding    = activeTab === 'landing';
  const missionLive  = !['IDLE', 'PR_CREATED'].includes(missionStatus);
  const missionDone  = missionStatus === 'PR_CREATED';

  // Sleek floating frosted glass HUD navbar — always accessible
  const navVisible = true;

  const NAV_ITEMS: { id: NavTabType; label: string }[] = [
    { id: 'landing',    label: 'WORK'        },
    { id: 'mission',    label: 'WORKSPACE'   },
    { id: 'studio',     label: 'STUDIO'      },
    { id: 'library',    label: 'LIBRARY'     },
    { id: 'benchmarks', label: 'BENCHMARKS'  },
    { id: 'replay',     label: 'REPLAY'      },
  ];

  return (
    <>
      {/* ── Main Navbar ── */}
      <header
        style={{
          position: 'fixed',
          top: 0, left: 0, right: 0,
          zIndex: 100,
          padding: '16px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          transition: 'opacity 0.5s ease, transform 0.5s ease',
          opacity: navVisible ? 1 : 0,
          transform: navVisible ? 'translateY(0)' : 'translateY(-8px)',
          pointerEvents: navVisible ? 'auto' : 'none',
        }}
      >
        {/* ── Left: Logo (always shown, small) ── */}
        <button
          onClick={() => setActiveTab('landing')}
          style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            cursor: 'pointer',
            padding: '8px 14px', borderRadius: '999px',
            background: 'rgba(6,8,18,0.85)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.08)',
            transition: 'border-color 0.25s ease',
          } as React.CSSProperties}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(0,243,255,0.25)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}
        >
          {/* Logo mark */}
          <div style={{
            width: '22px', height: '22px', borderRadius: '6px',
            background: 'linear-gradient(135deg, #00f3ff, #cf3fff)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2 6L5 3L8 6L5 9L2 6Z" stroke="#000" strokeWidth="1.5" strokeLinejoin="round"/>
              <circle cx="8" cy="6" r="1.5" fill="#000"/>
            </svg>
          </div>
          <div>
            <div style={{
              fontFamily: "'Orbitron', monospace",
              fontSize: '10px', fontWeight: 700, letterSpacing: '0.18em',
              textTransform: 'uppercase', color: '#f8faff', lineHeight: 1,
            }}>
              CodeForge
            </div>
            <div style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: '7px', letterSpacing: '0.2em',
              textTransform: 'uppercase', color: 'rgba(0,243,255,0.6)', lineHeight: 1, marginTop: '2px',
            }}>
              AI SWE
            </div>
          </div>
        </button>

        {/* ── Center nav: Active Theory frosted capsule ── */}
        <nav
          style={{
            display: 'flex', alignItems: 'center', gap: '2px',
            background: 'rgba(6,8,18,0.88)',
            backdropFilter: 'blur(24px)',
            border: '1px solid rgba(255,255,255,0.08)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            borderRadius: '999px',
            padding: '4px',
            position: 'absolute', left: '50%', transform: 'translateX(-50%)',
          }}
        >
          {NAV_ITEMS.map(item => {
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  audioFx.playTabSwitch();
                  setActiveTab(item.id);
                }}
                style={{
                  padding: '7px 14px', borderRadius: '999px',
                  fontFamily: "'Space Mono', monospace",
                  fontSize: '9px', letterSpacing: '0.15em',
                  textTransform: 'uppercase',
                  color: active ? '#00f3ff' : 'rgba(122,130,168,0.7)',
                  background: active ? 'rgba(0,243,255,0.12)' : 'transparent',
                  border: active ? '1px solid rgba(0,243,255,0.25)' : '1px solid transparent',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  position: 'relative',
                }}
              >
                {active && (
                  <span style={{
                    position: 'absolute', bottom: '3px', left: '50%',
                    transform: 'translateX(-50%)',
                    width: '16px', height: '1.5px',
                    background: '#00f3ff',
                    boxShadow: '0 0 8px #00f3ff',
                    borderRadius: '1px',
                    display: 'block',
                  }} />
                )}
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* ── Right: Active Theory style pill ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Mission live indicator */}
          {missionLive && (
            <div
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '7px 14px', borderRadius: '999px',
                background: 'rgba(6,8,18,0.88)', backdropFilter: 'blur(20px)',
                border: '1px solid rgba(0,243,255,0.2)',
                fontFamily: "'Space Mono', monospace",
                fontSize: '8px', letterSpacing: '0.16em',
                textTransform: 'uppercase', color: '#00f3ff',
              }}
            >
              <span className="dot-live" />
              {missionStatus.replace(/_/g, ' ')}
            </div>
          )}

          {missionDone && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '7px 14px', borderRadius: '999px',
              background: 'rgba(6,8,18,0.88)', backdropFilter: 'blur(20px)',
              border: '1px solid rgba(0,255,153,0.25)',
              fontFamily: "'Space Mono', monospace",
              fontSize: '8px', letterSpacing: '0.16em',
              textTransform: 'uppercase', color: '#00ff99',
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#00ff99', boxShadow: '0 0 8px #00ff99' }} />
              PR CREATED
            </div>
          )}

          {/* ── Auto-Stack Engine Indicator (Autonomous Frontend TS / Backend PY Shifting) ── */}
          <div
            className="hide-sm"
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '7px 13px', borderRadius: '999px',
              background: 'rgba(6,8,18,0.88)', backdropFilter: 'blur(20px)',
              border: '1px solid rgba(0,243,255,0.25)',
              fontFamily: "'Space Mono', monospace",
              fontSize: '8px', letterSpacing: '0.12em',
              textTransform: 'uppercase', color: '#00f3ff',
              boxShadow: '0 0 16px -4px rgba(0,243,255,0.25)',
            }}
            title="Auto-Stack Engine Active: Automatically detects prompt intent and shifts server execution between Frontend (TypeScript / Next.js) and Backend (Python / FastAPI / Redis)."
          >
            <span style={{
              width: 6, height: 6, borderRadius: '50%',
              background: activeRepo.language === 'TypeScript' ? '#00f3ff' : '#00ff99',
              boxShadow: `0 0 8px ${activeRepo.language === 'TypeScript' ? '#00f3ff' : '#00ff99'}`,
              display: 'inline-block',
            }} />
            <span style={{ fontWeight: 700 }}>
              AUTO-STACK: {activeRepo.language === 'TypeScript' ? 'FRONTEND (TS)' : 'BACKEND (PY)'}
            </span>
          </div>

          {/* AI Engine Status: Gemini 2.5 Flash + Qwen3 */}
          <button
            onClick={onOpenSettings}
            title="AI Engine Active: Google Gemini 2.5 Flash & Qwen3-Coder"
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '7px 12px', borderRadius: '999px',
              background: 'rgba(6,8,18,0.88)', backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.08)',
              fontFamily: "'Space Mono', monospace",
              fontSize: '8px', letterSpacing: '0.12em',
              textTransform: 'uppercase', color: 'rgba(122,130,168,0.7)',
              cursor: 'pointer', transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(0,255,153,0.4)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'}
          >
            <span style={{
              width: 5, height: 5, borderRadius: '50%',
              background: '#00ff99', boxShadow: '0 0 6px #00ff99',
              display: 'inline-block',
            }} />
            <span>GEMINI 2.5 • QWEN3</span>
          </button>

          {/* Copilot toggle */}
          <button
            onClick={onToggleCopilot}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '7px 14px', borderRadius: '999px',
              background: copilotOpen ? 'rgba(0,243,255,0.1)' : 'rgba(6,8,18,0.88)',
              backdropFilter: 'blur(20px)',
              border: `1px solid ${copilotOpen ? 'rgba(0,243,255,0.3)' : 'rgba(255,255,255,0.06)'}`,
              boxShadow: copilotOpen ? '0 0 20px -5px rgba(0,243,255,0.2)' : 'none',
              fontFamily: "'Space Mono', monospace",
              fontSize: '8px', letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: copilotOpen ? '#00f3ff' : 'rgba(122,130,168,0.7)',
              cursor: 'pointer', transition: 'all 0.2s ease',
            }}
          >
            <Bot size={12} style={{ color: copilotOpen ? '#00f3ff' : 'rgba(122,130,168,0.7)' }} />
            <span className="hide-sm">COPILOT</span>
          </button>

          {/* Settings */}
          <button
            onClick={onOpenSettings}
            style={{
              padding: '7px', borderRadius: '999px',
              background: 'rgba(6,8,18,0.88)', backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.06)',
              cursor: 'pointer', display: 'flex', alignItems: 'center',
              transition: 'border-color 0.2s ease',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'}
          >
            <Settings size={13} style={{ color: 'rgba(122,130,168,0.7)' }} />
          </button>

          {/* Audio FX Toggle */}
          <button
            onClick={toggleSound}
            title={soundOn ? 'Mute Audio FX' : 'Enable Cyber Audio FX'}
            style={{
              padding: '7px', borderRadius: '999px',
              background: soundOn ? 'rgba(0,243,255,0.12)' : 'rgba(6,8,18,0.88)',
              backdropFilter: 'blur(20px)',
              border: `1px solid ${soundOn ? 'rgba(0,243,255,0.3)' : 'rgba(255,255,255,0.06)'}`,
              cursor: 'pointer', display: 'flex', alignItems: 'center',
              transition: 'all 0.2s ease',
            }}
          >
            {soundOn ? (
              <Volume2 size={13} style={{ color: '#00f3ff' }} />
            ) : (
              <VolumeX size={13} style={{ color: 'rgba(122,130,168,0.5)' }} />
            )}
          </button>

          {/* User avatar */}
          <button
            onClick={onOpenAuth}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '5px 12px 5px 6px', borderRadius: '999px',
              background: 'rgba(6,8,18,0.88)', backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.07)',
              cursor: 'pointer', transition: 'border-color 0.2s ease',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(0,243,255,0.25)'}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'}
          >
            <div style={{
              width: '24px', height: '24px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #00f3ff, #cf3fff)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: "'Orbitron', monospace", fontSize: '9px',
              fontWeight: 900, color: '#000', textTransform: 'uppercase',
            }}>
              {user.firstName[0]}
            </div>
            <div className="hide-sm">
              <div style={{
                fontFamily: "'Space Mono', monospace", fontSize: '9px',
                fontWeight: 700, color: '#f8faff', letterSpacing: '0.08em',
              }}>
                {user.firstName}
              </div>
              <div style={{
                fontFamily: "'Space Mono', monospace", fontSize: '7px',
                letterSpacing: '0.16em', textTransform: 'uppercase',
                color: 'rgba(0,243,255,0.6)',
              }}>
                {user.role}
              </div>
            </div>
          </button>
        </div>
      </header>
    </>
  );
};
