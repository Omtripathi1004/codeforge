'use client';

import React from 'react';
import { GitFork, Star, FileCode, AlertTriangle, Database, Cpu, Shield, Layers } from 'lucide-react';
import { RepositoryContext } from '../types/codeforge';

interface RepositoryIntelligenceProps {
  repo: RepositoryContext;
}

const IntelBlock = ({
  label, color, children
}: { label: string; color: string; children: React.ReactNode }) => (
  <div
    style={{
      padding: '16px', borderRadius: '12px',
      background: `${color}06`,
      border: `1px solid ${color}18`,
      position: 'relative', overflow: 'hidden',
    }}
  >
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0, height: '1px',
      background: `linear-gradient(90deg, transparent, ${color}40, transparent)`,
    }} />
    <div style={{
      fontFamily: "'Space Mono', monospace", fontSize: '8px',
      letterSpacing: '0.2em', textTransform: 'uppercase',
      color: color, marginBottom: '10px',
      display: 'flex', alignItems: 'center', gap: '6px',
    }}>
      {label}
    </div>
    {children}
  </div>
);

export const RepositoryIntelligence: React.FC<RepositoryIntelligenceProps> = ({ repo }) => {
  return (
    <div
      className="cf-panel"
      style={{ padding: '0', overflow: 'hidden' }}
    >
      {/* Header */}
      <div className="panel-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '8px',
            background: 'rgba(0,243,255,0.08)', border: '1px solid rgba(0,243,255,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Cpu size={14} style={{ color: '#00f3ff' }} />
          </div>
          <div>
            <h3 style={{
              fontFamily: "'Orbitron', monospace", fontSize: '11px',
              fontWeight: 700, letterSpacing: '0.08em', color: '#f8faff',
            }}>
              Repository Intelligence AST
            </h3>
            <p style={{
              fontFamily: "'Space Mono', monospace", fontSize: '9px',
              color: '#424868', marginTop: '2px',
            }}>
              Static + dynamic index for{' '}
              <span style={{ color: '#00f3ff' }}>{repo.fullName}</span>
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            className="tag-cyan"
            style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
          >
            <Star size={9} style={{ color: '#ffaa00' }} />
            {repo.stats.stars}
          </span>
          <span className="tag-cyan">
            {repo.framework}
          </span>
          <span className="tag-cyan">
            {repo.language}
          </span>
        </div>
      </div>

      {/* Intel grid */}
      <div style={{ padding: '16px', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
        <IntelBlock label="Entry Points" color="#00f3ff">
          <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
            {repo.structure.entryPoints.map(ep => (
              <li key={ep} style={{
                fontFamily: "'Space Mono', monospace", fontSize: '9px',
                color: '#7a82a8', marginBottom: '4px', letterSpacing: '0.04em',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                <span style={{ color: '#00f3ff', marginRight: '5px' }}>›</span>
                {ep}
              </li>
            ))}
          </ul>
        </IntelBlock>

        <IntelBlock label={`APIs (${repo.structure.apiEndpoints.length})`} color="#cf3fff">
          <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
            {repo.structure.apiEndpoints.slice(0, 3).map(api => (
              <li key={api} style={{
                fontFamily: "'Space Mono', monospace", fontSize: '9px',
                color: '#7a82a8', marginBottom: '4px',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                <span style={{ color: '#cf3fff', marginRight: '5px' }}>›</span>
                {api}
              </li>
            ))}
            {repo.structure.apiEndpoints.length > 3 && (
              <li style={{
                fontFamily: "'Space Mono', monospace", fontSize: '8px',
                color: '#424868', letterSpacing: '0.1em',
              }}>
                +{repo.structure.apiEndpoints.length - 3} more
              </li>
            )}
          </ul>
        </IntelBlock>

        <IntelBlock label="DB Schema" color="#00ff99">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
            {repo.structure.databaseModels.map(m => (
              <span key={m} className="tag-emerald" style={{ fontSize: '8px', padding: '2px 8px' }}>
                {m}
              </span>
            ))}
          </div>
        </IntelBlock>

        <IntelBlock label="High Risk Files" color="#ff6b6b">
          <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
            {repo.structure.riskyFiles.map(rf => (
              <li key={rf} style={{
                fontFamily: "'Space Mono', monospace", fontSize: '9px',
                color: '#ff6b6b', marginBottom: '4px',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                <span style={{ marginRight: '5px' }}>!</span>
                {rf}
              </li>
            ))}
          </ul>
        </IntelBlock>
      </div>
    </div>
  );
};
