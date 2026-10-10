'use client';

import React, { useState } from 'react';
import { CheckCircle2, Zap, Sliders, ArrowRight, Eye, ShieldCheck, Sparkles, Layers } from 'lucide-react';
import { SolutionOption } from '../types/codeforge';

interface SolutionArchitectCardProps {
  solutionA: SolutionOption;
  solutionB: SolutionOption;
  selectedSolutionId?: 'solution_a' | 'solution_b' | 'custom';
  onSelectSolution: (id: 'solution_a' | 'solution_b' | 'custom', customPrompt?: string) => void;
  onPreviewTemplate?: (mode: 'minimum' | 'recommended' | 'custom', customPrompt?: string) => void;
  disabled?: boolean;
}

const MetaRow = ({
  label, value, color = '#7a82a8'
}: { label: string; value: string; color?: string }) => (
  <div style={{ marginBottom: '8px' }}>
    <div style={{
      fontFamily: "'Space Mono', monospace", fontSize: '8px',
      letterSpacing: '0.16em', textTransform: 'uppercase', color: '#424868',
      marginBottom: '2px',
    }}>
      {label}
    </div>
    <div style={{
      fontFamily: "'Space Mono', monospace", fontSize: '10px',
      color: color, letterSpacing: '0.04em',
    }}>
      {value}
    </div>
  </div>
);

export const SolutionArchitectCard: React.FC<SolutionArchitectCardProps> = ({
  solutionA, solutionB, selectedSolutionId, onSelectSolution, onPreviewTemplate, disabled = false,
}) => {
  const [activeTab, setActiveTab] = useState<'minimum' | 'recommended' | 'custom'>('recommended');
  const [customPrompt, setCustomPrompt] = useState(
    "Synthesize recommended components with custom UI styling, responsive controls, and domain parameters."
  );

  const tabs = [
    { id: 'minimum' as const,     label: '1. MINIMUM CHANGE',  color: '#00f3ff', tag: 'CONSERVATIVE' },
    { id: 'recommended' as const, label: '2. RECOMMENDED',     color: '#cf3fff', tag: '3D ACTIVE THEORY', recommended: true },
    { id: 'custom' as const,      label: '3. CUSTOMIZED',      color: '#ffaa00', tag: 'USER TAILORED' },
  ];

  const handlePreview = (mode: 'minimum' | 'recommended' | 'custom') => {
    if (onPreviewTemplate) {
      onPreviewTemplate(mode, mode === 'custom' ? customPrompt : undefined);
    } else {
      const el = document.getElementById('sec-preview');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="cf-panel" style={{ overflow: 'hidden' }}>
      {/* Header */}
      <div className="panel-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '8px',
            background: 'rgba(207,63,255,0.08)', border: '1px solid rgba(207,63,255,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Layers size={16} color="#cf3fff" />
          </div>
          <div>
            <h3 style={{
              fontFamily: "'Orbitron', monospace", fontSize: '11px',
              fontWeight: 700, letterSpacing: '0.08em', color: '#f8faff',
            }}>
              Solution Architect — 3 Strategic Opinions
            </h3>
            <p style={{
              fontFamily: "'Space Mono', monospace", fontSize: '9px',
              color: '#424868', marginTop: '2px',
            }}>
              Choose from Minimum Change, Recommended 3D Gaming UI, or Customized hybrid synthesis
            </p>
          </div>
        </div>

        {/* Tab switcher */}
        <div style={{
          display: 'flex', gap: '2px',
          background: 'rgba(3,4,8,0.8)', borderRadius: '999px', padding: '3px',
          border: '1px solid rgba(255,255,255,0.05)',
        }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '6px 14px', borderRadius: '999px',
                fontFamily: "'Space Mono', monospace",
                fontSize: '8px', letterSpacing: '0.15em', textTransform: 'uppercase',
                background: activeTab === tab.id ? `${tab.color}15` : 'transparent',
                color: activeTab === tab.id ? tab.color : '#424868',
                border: 'none', cursor: 'pointer', transition: 'all 0.2s ease',
                display: 'flex', alignItems: 'center', gap: '5px',
              }}
            >
              {tab.recommended && <Zap size={9} style={{ color: '#ffaa00' }} />}
              {tab.label}
              <span style={{
                fontSize: '7px', padding: '1px 5px', borderRadius: '999px',
                background: `${tab.color}18`, color: tab.color,
                letterSpacing: '0.1em',
              }}>
                {tab.tag}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 3 Strategy Columns Grid */}
      <div style={{ padding: '16px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
        
        {/* OPTION 1: MINIMUM CHANGE */}
        <div
          onClick={() => setActiveTab('minimum')}
          style={{
            padding: '20px', borderRadius: '14px', cursor: 'pointer',
            background: activeTab === 'minimum' ? 'rgba(0,243,255,0.06)' : 'rgba(255,255,255,0.02)',
            border: `1px solid ${activeTab === 'minimum' ? 'rgba(0,243,255,0.35)' : 'rgba(255,255,255,0.06)'}`,
            boxShadow: activeTab === 'minimum' ? '0 0 30px -15px rgba(0,243,255,0.4)' : 'none',
            transition: 'all 0.3s ease', position: 'relative', overflow: 'hidden',
          }}
        >
          {activeTab === 'minimum' && (
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
              background: 'linear-gradient(90deg, transparent, #00f3ff, transparent)',
            }} />
          )}

          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{
              fontFamily: "'Space Mono', monospace", fontSize: '8px',
              letterSpacing: '0.2em', textTransform: 'uppercase',
              padding: '3px 10px', borderRadius: '999px',
              background: 'rgba(0,243,255,0.1)', border: '1px solid rgba(0,243,255,0.25)',
              color: '#00f3ff', display: 'inline-block',
            }}>
              1. MINIMUM CHANGE
            </span>
            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '8px', color: '#424868' }}>
              +{solutionA.linesAdded || 12}/-{solutionA.linesRemoved || 4}L
            </span>
          </div>

          <h4 style={{
            fontFamily: "'Orbitron', monospace", fontSize: '11px',
            fontWeight: 700, color: '#f8faff', marginBottom: '8px',
            letterSpacing: '0.04em', lineHeight: 1.3,
          }}>
            {solutionA.title || 'Conservative AST Patch & Clean Enterprise Layout'}
          </h4>

          <p style={{
            fontFamily: "'Space Mono', monospace", fontSize: '9px',
            color: '#7a82a8', lineHeight: 1.7, letterSpacing: '0.03em',
            marginBottom: '14px',
          }}>
            Google/Stripe-style enterprise layout with zero visual bloat. Minimal blast radius isolating token rotation to a single file.
          </p>

          <div style={{
            paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.04)',
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px',
          }}>
            <MetaRow label="Blast Radius" value={`${solutionA.filesAffected?.length || 1} file`} color="#00f3ff" />
            <MetaRow label="Risk Level"   value={solutionA.risk || 'Low'} color="#00ff99" />
            <MetaRow label="Effort"       value="15m execution" color="#7a82a8" />
            <MetaRow label="Security"     value="Audit 100/100" color="#7a82a8" />
          </div>

          <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
            <button
              onClick={e => { e.stopPropagation(); handlePreview('minimum'); }}
              style={{
                flex: 1, padding: '9px 0', borderRadius: '10px',
                fontFamily: "'Space Mono', monospace", fontSize: '8px',
                letterSpacing: '0.12em', textTransform: 'uppercase',
                background: 'rgba(0,243,255,0.08)', color: '#00f3ff',
                border: '1px solid rgba(0,243,255,0.25)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
              }}
            >
              <Eye size={10} />
              PREVIEW TEMPLATE
            </button>
            <button
              disabled={disabled}
              onClick={e => { e.stopPropagation(); onSelectSolution('solution_a'); }}
              style={{
                flex: 1.2, padding: '9px 0', borderRadius: '10px',
                fontFamily: "'Space Mono', monospace", fontSize: '8px',
                letterSpacing: '0.12em', textTransform: 'uppercase',
                background: selectedSolutionId === 'solution_a' ? 'rgba(0,255,153,0.15)' : 'rgba(0,243,255,0.2)',
                color: selectedSolutionId === 'solution_a' ? '#00ff99' : '#fff',
                border: selectedSolutionId === 'solution_a' ? '1px solid rgba(0,255,153,0.4)' : '1px solid rgba(0,243,255,0.4)',
                cursor: disabled ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
              }}
            >
              {selectedSolutionId === 'solution_a' ? <CheckCircle2 size={10} /> : <ArrowRight size={10} />}
              {selectedSolutionId === 'solution_a' ? 'SELECTED' : 'EXECUTE'}
            </button>
          </div>
        </div>

        {/* OPTION 2: RECOMMENDED (3D ACTIVE THEORY / GAMING) */}
        <div
          onClick={() => setActiveTab('recommended')}
          style={{
            padding: '20px', borderRadius: '14px', cursor: 'pointer',
            background: activeTab === 'recommended' ? 'rgba(207,63,255,0.07)' : 'rgba(255,255,255,0.02)',
            border: `1px solid ${activeTab === 'recommended' ? 'rgba(207,63,255,0.4)' : 'rgba(255,255,255,0.06)'}`,
            boxShadow: activeTab === 'recommended' ? '0 0 35px -12px rgba(207,63,255,0.45)' : 'none',
            transition: 'all 0.3s ease', position: 'relative', overflow: 'hidden',
          }}
        >
          {activeTab === 'recommended' && (
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
              background: 'linear-gradient(90deg, transparent, #cf3fff, transparent)',
            }} />
          )}

          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{
              fontFamily: "'Space Mono', monospace", fontSize: '8px',
              letterSpacing: '0.2em', textTransform: 'uppercase',
              padding: '3px 10px', borderRadius: '999px',
              background: 'rgba(207,63,255,0.12)', border: '1px solid rgba(207,63,255,0.3)',
              color: '#cf3fff', display: 'inline-flex', alignItems: 'center', gap: '4px',
            }}>
              <Zap size={8} color="#ffaa00" />
              2. RECOMMENDED (3D MOTION)
            </span>
            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '8px', color: '#424868' }}>
              +{solutionB.linesAdded || 48}/-{solutionB.linesRemoved || 12}L
            </span>
          </div>

          <h4 style={{
            fontFamily: "'Orbitron', monospace", fontSize: '11px',
            fontWeight: 700, color: '#f8faff', marginBottom: '8px',
            letterSpacing: '0.04em', lineHeight: 1.3,
          }}>
            {solutionB.title || '3D WebGL Particle Dynamics & Concurrency Mutex'}
          </h4>

          <p style={{
            fontFamily: "'Space Mono', monospace", fontSize: '9px',
            color: '#7a82a8', lineHeight: 1.7, letterSpacing: '0.03em',
            marginBottom: '14px',
          }}>
            High-end 3D moving particle canvas, neon accents, gaming aesthetics, RFC-6749 token family rotation, and redis single-flight lock.
          </p>

          <div style={{
            paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.04)',
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px',
          }}>
            <MetaRow label="Blast Radius" value={`${solutionB.filesAffected?.length || 4} files`} color="#cf3fff" />
            <MetaRow label="Risk Level"   value={solutionB.risk || 'Architectural'} color="#ffaa00" />
            <MetaRow label="Effort"       value="Full overhaul" color="#7a82a8" />
            <MetaRow label="Security"     value="Zero race condition" color="#00ff99" />
          </div>

          <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
            <button
              onClick={e => { e.stopPropagation(); handlePreview('recommended'); }}
              style={{
                flex: 1, padding: '9px 0', borderRadius: '10px',
                fontFamily: "'Space Mono', monospace", fontSize: '8px',
                letterSpacing: '0.12em', textTransform: 'uppercase',
                background: 'rgba(207,63,255,0.1)', color: '#cf3fff',
                border: '1px solid rgba(207,63,255,0.3)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
              }}
            >
              <Eye size={10} />
              PREVIEW 3D TEMPLATE
            </button>
            <button
              disabled={disabled}
              onClick={e => { e.stopPropagation(); onSelectSolution('solution_b'); }}
              style={{
                flex: 1.2, padding: '9px 0', borderRadius: '10px',
                fontFamily: "'Space Mono', monospace", fontSize: '8px',
                letterSpacing: '0.12em', textTransform: 'uppercase',
                background: selectedSolutionId === 'solution_b' ? 'rgba(0,255,153,0.15)' : 'linear-gradient(135deg, rgba(207,63,255,0.25), rgba(0,243,255,0.25))',
                color: selectedSolutionId === 'solution_b' ? '#00ff99' : '#fff',
                border: selectedSolutionId === 'solution_b' ? '1px solid rgba(0,255,153,0.4)' : '1px solid rgba(207,63,255,0.4)',
                cursor: disabled ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
              }}
            >
              {selectedSolutionId === 'solution_b' ? <CheckCircle2 size={10} /> : <ArrowRight size={10} />}
              {selectedSolutionId === 'solution_b' ? 'SELECTED' : 'EXECUTE'}
            </button>
          </div>
        </div>

        {/* OPTION 3: CUSTOMIZED */}
        <div
          onClick={() => setActiveTab('custom')}
          style={{
            padding: '20px', borderRadius: '14px', cursor: 'pointer',
            background: activeTab === 'custom' ? 'rgba(255,170,0,0.06)' : 'rgba(255,255,255,0.02)',
            border: `1px solid ${activeTab === 'custom' ? 'rgba(255,170,0,0.35)' : 'rgba(255,255,255,0.06)'}`,
            boxShadow: activeTab === 'custom' ? '0 0 30px -15px rgba(255,170,0,0.4)' : 'none',
            transition: 'all 0.3s ease', position: 'relative', overflow: 'hidden',
          }}
        >
          {activeTab === 'custom' && (
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
              background: 'linear-gradient(90deg, transparent, #ffaa00, transparent)',
            }} />
          )}

          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{
              fontFamily: "'Space Mono', monospace", fontSize: '8px',
              letterSpacing: '0.2em', textTransform: 'uppercase',
              padding: '3px 10px', borderRadius: '999px',
              background: 'rgba(255,170,0,0.1)', border: '1px solid rgba(255,170,0,0.25)',
              color: '#ffaa00', display: 'inline-block',
            }}>
              3. CUSTOMIZED HYBRID
            </span>
            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '8px', color: '#ffaa00' }}>
              PROMPT SYNTHESIS
            </span>
          </div>

          <h4 style={{
            fontFamily: "'Orbitron', monospace", fontSize: '11px',
            fontWeight: 700, color: '#f8faff', marginBottom: '8px',
            letterSpacing: '0.04em', lineHeight: 1.3,
          }}>
            User-Guided Architectural Constraints
          </h4>

          <p style={{
            fontFamily: "'Space Mono', monospace", fontSize: '9px',
            color: '#7a82a8', lineHeight: 1.7, letterSpacing: '0.03em',
            marginBottom: '10px',
          }}>
            Input your exact domain needs, corporate color preferences, or database backend restrictions:
          </p>

          <textarea
            value={customPrompt}
            onChange={e => setCustomPrompt(e.target.value)}
            rows={2}
            className="cf-input"
            style={{
              width: '100%', resize: 'none', fontFamily: "'Space Mono', monospace",
              fontSize: '9px', padding: '8px 10px', borderRadius: '8px',
              background: 'rgba(3,4,8,0.8)', border: '1px solid rgba(255,170,0,0.2)',
              color: '#fff', marginBottom: '10px'
            }}
            placeholder="e.g. Build with corporate Google white palette and DynamoDB..."
          />

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={e => { e.stopPropagation(); handlePreview('custom'); }}
              style={{
                flex: 1, padding: '9px 0', borderRadius: '10px',
                fontFamily: "'Space Mono', monospace", fontSize: '8px',
                letterSpacing: '0.12em', textTransform: 'uppercase',
                background: 'rgba(255,170,0,0.08)', color: '#ffaa00',
                border: '1px solid rgba(255,170,0,0.25)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
              }}
            >
              <Eye size={10} />
              PREVIEW CUSTOM
            </button>
            <button
              disabled={disabled || !customPrompt.trim()}
              onClick={e => { e.stopPropagation(); onSelectSolution('custom', customPrompt); }}
              style={{
                flex: 1.2, padding: '9px 0', borderRadius: '10px',
                fontFamily: "'Space Mono', monospace", fontSize: '8px',
                letterSpacing: '0.12em', textTransform: 'uppercase',
                background: selectedSolutionId === 'custom' ? 'rgba(0,255,153,0.15)' : 'rgba(255,170,0,0.2)',
                color: selectedSolutionId === 'custom' ? '#00ff99' : '#ffaa00',
                border: selectedSolutionId === 'custom' ? '1px solid rgba(0,255,153,0.4)' : '1px solid rgba(255,170,0,0.4)',
                cursor: disabled ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px',
              }}
            >
              {selectedSolutionId === 'custom' ? <CheckCircle2 size={10} /> : <ArrowRight size={10} />}
              {selectedSolutionId === 'custom' ? 'SELECTED' : 'SYNTHESIZE'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
