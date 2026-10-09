'use client';

import React, { useState } from 'react';
import { CheckCircle2, Zap, Sliders, ArrowRight } from 'lucide-react';
import { SolutionOption } from '../types/codeforge';

interface SolutionArchitectCardProps {
  solutionA: SolutionOption;
  solutionB: SolutionOption;
  selectedSolutionId?: 'solution_a' | 'solution_b' | 'custom';
  onSelectSolution: (id: 'solution_a' | 'solution_b' | 'custom', customPrompt?: string) => void;
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
  solutionA, solutionB, selectedSolutionId, onSelectSolution, disabled = false,
}) => {
  const [activeTab, setActiveTab] = useState<'A' | 'B' | 'CUSTOM'>('B');
  const [customPrompt, setCustomPrompt] = useState(
    "Use B's security token family improvement but keep database migrations isolated in a separate transaction."
  );

  const tabs = [
    { id: 'A' as const,      label: 'SOLUTION A',     color: '#00f3ff' },
    { id: 'B' as const,      label: 'SOLUTION B',     color: '#cf3fff', recommended: true },
    { id: 'CUSTOM' as const, label: 'HYBRID',         color: '#ffaa00' },
  ];

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
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <rect x="1" y="2" width="4" height="10" rx="1" stroke="#cf3fff" strokeWidth="1.2"/>
              <rect x="9" y="2" width="4" height="10" rx="1" stroke="#00f3ff" strokeWidth="1.2"/>
              <line x1="5" y1="7" x2="9" y2="7" stroke="#424868" strokeWidth="0.8" strokeDasharray="1.5,1.5"/>
            </svg>
          </div>
          <div>
            <h3 style={{
              fontFamily: "'Orbitron', monospace", fontSize: '11px',
              fontWeight: 700, letterSpacing: '0.08em', color: '#f8faff',
            }}>
              Solution Architect Engine
            </h3>
            <p style={{
              fontFamily: "'Space Mono', monospace", fontSize: '9px',
              color: '#424868', marginTop: '2px',
            }}>
              Two verified approaches generated and pre-validated against the repository AST
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
                background: activeTab === tab.id ? `${tab.color}12` : 'transparent',
                color: activeTab === tab.id ? tab.color : '#424868',
                border: 'none', cursor: 'pointer', transition: 'all 0.2s ease',
                display: 'flex', alignItems: 'center', gap: '5px',
              }}
            >
              {tab.recommended && activeTab === tab.id && (
                <Zap size={9} style={{ color: '#ffaa00' }} />
              )}
              {tab.label}
              {tab.recommended && (
                <span style={{
                  fontSize: '7px', padding: '1px 5px', borderRadius: '999px',
                  background: 'rgba(207,63,255,0.15)', color: '#cf3fff',
                  letterSpacing: '0.1em',
                }}>
                  REC
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Solution Cards */}
      <div style={{ padding: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        {/* ─ Solution A ─ */}
        {(['A', 'B'] as const).map(which => {
          const sol = which === 'A' ? solutionA : solutionB;
          const color = which === 'A' ? '#00f3ff' : '#cf3fff';
          const selId = which === 'A' ? 'solution_a' : 'solution_b';
          const isSelected = selectedSolutionId === selId;
          const isActive = activeTab === which;

          return (
            <div
              key={which}
              onClick={() => setActiveTab(which)}
              style={{
                padding: '20px', borderRadius: '14px', cursor: 'pointer',
                background: isActive ? `${color}07` : 'rgba(255,255,255,0.02)',
                border: `1px solid ${isActive ? `${color}30` : 'rgba(255,255,255,0.05)'}`,
                boxShadow: isActive ? `0 0 30px -15px ${color}50` : 'none',
                transition: 'all 0.3s ease', position: 'relative', overflow: 'hidden',
              }}
            >
              {/* Top accent */}
              {isActive && (
                <div style={{
                  position: 'absolute', top: 0, left: 0, right: 0, height: '1px',
                  background: `linear-gradient(90deg, transparent, ${color}60, transparent)`,
                }} />
              )}

              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div>
                  <span style={{
                    fontFamily: "'Space Mono', monospace", fontSize: '8px',
                    letterSpacing: '0.2em', textTransform: 'uppercase',
                    padding: '3px 10px', borderRadius: '999px',
                    background: `${color}0d`, border: `1px solid ${color}25`,
                    color: color, display: 'inline-block',
                  }}>
                    {which === 'A' ? 'Conservative / Minimal' : 'Architectural — Recommended'}
                  </span>
                </div>
                <span style={{
                  fontFamily: "'Space Mono', monospace", fontSize: '8px',
                  color: '#424868', whiteSpace: 'nowrap', marginLeft: '8px',
                }}>
                  +{sol.linesAdded}/{sol.linesRemoved}L
                </span>
              </div>

              <h4 style={{
                fontFamily: "'Orbitron', monospace", fontSize: '11px',
                fontWeight: 700, color: '#f8faff', marginBottom: '8px',
                letterSpacing: '0.04em', lineHeight: 1.3,
              }}>
                {sol.title}
              </h4>

              <p style={{
                fontFamily: "'Space Mono', monospace", fontSize: '9px',
                color: '#7a82a8', lineHeight: 1.75, letterSpacing: '0.03em',
                marginBottom: '14px',
              }}>
                {sol.description}
              </p>

              {/* Meta grid */}
              <div style={{
                paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.04)',
                display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px',
              }}>
                <MetaRow label="Blast Radius" value={`${sol.filesAffected.length} files`} color={color} />
                <MetaRow label="Risk Level"   value={sol.risk}       color={which === 'A' ? '#00ff99' : '#ffaa00'} />
                <MetaRow label="Effort"       value={sol.estimatedEffort} color="#7a82a8" />
                <MetaRow label="Security"     value={sol.securityImpact}  color="#7a82a8" />
              </div>

              {/* Execute button */}
              <button
                disabled={disabled}
                onClick={e => { e.stopPropagation(); onSelectSolution(selId); }}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  width: '100%', justifyContent: 'center',
                  marginTop: '14px', padding: '9px 0', borderRadius: '10px',
                  fontFamily: "'Space Mono', monospace", fontSize: '9px',
                  letterSpacing: '0.14em', textTransform: 'uppercase',
                  cursor: disabled ? 'not-allowed' : 'pointer',
                  transition: 'all 0.25s ease', border: 'none',
                  background: isSelected
                    ? 'rgba(0,255,153,0.12)'
                    : `${color}14`,
                  color: isSelected ? '#00ff99' : color,
                  boxShadow: isSelected
                    ? '0 0 15px -5px rgba(0,255,153,0.3)'
                    : `0 0 15px -8px ${color}40`,
                  outline: isSelected ? '1px solid rgba(0,255,153,0.3)' : `1px solid ${color}30`,
                  opacity: disabled ? 0.5 : 1,
                }}
              >
                {isSelected ? (
                  <>
                    <CheckCircle2 size={11} />
                    SELECTED
                  </>
                ) : (
                  <>
                    EXECUTE SOLUTION {which}
                    <ArrowRight size={11} />
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Hybrid / Custom section */}
      {activeTab === 'CUSTOM' && (
        <div style={{
          margin: '0 16px 16px',
          padding: '20px', borderRadius: '14px',
          background: 'rgba(255,170,0,0.04)',
          border: '1px solid rgba(255,170,0,0.18)',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(255,170,0,0.4), transparent)',
          }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Sliders size={13} style={{ color: '#ffaa00' }} />
            <h4 style={{
              fontFamily: "'Orbitron', monospace", fontSize: '10px',
              fontWeight: 700, color: '#ffaa00', letterSpacing: '0.08em',
            }}>
              Custom Architectural Hybrid Synthesis
            </h4>
          </div>
          <p style={{
            fontFamily: "'Space Mono', monospace", fontSize: '9px',
            color: '#424868', lineHeight: 1.7, marginBottom: '12px',
          }}>
            Blend features from Solution A and B, or introduce domain-specific constraints.
          </p>
          <textarea
            value={customPrompt}
            onChange={e => setCustomPrompt(e.target.value)}
            rows={2}
            className="cf-input"
            style={{ resize: 'none', fontFamily: "'Space Mono', monospace", fontSize: '10px' }}
            placeholder="e.g. Use B's security improvement but keep token storage in DynamoDB..."
          />
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
            <button
              disabled={disabled || !customPrompt.trim()}
              onClick={() => onSelectSolution('custom', customPrompt)}
              style={{
                display: 'flex', alignItems: 'center', gap: '7px',
                padding: '9px 20px', borderRadius: '999px',
                fontFamily: "'Space Mono', monospace", fontSize: '9px',
                letterSpacing: '0.14em', textTransform: 'uppercase',
                background: 'rgba(255,170,0,0.12)', color: '#ffaa00',
                border: '1px solid rgba(255,170,0,0.3)', cursor: 'pointer',
                transition: 'all 0.2s ease',
                opacity: disabled ? 0.5 : 1,
              }}
            >
              SYNTHESIZE HYBRID
              <ArrowRight size={11} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
