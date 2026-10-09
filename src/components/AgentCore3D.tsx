'use client';

import React, { useRef, useEffect } from 'react';
import { MissionStatus } from '../types/codeforge';

interface AgentCore3DProps {
  status: MissionStatus;
  repairCycles: number;
}

export const AgentCore3D: React.FC<AgentCore3DProps> = ({ status, repairCycles }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let animationFrameId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = canvas.parentElement?.clientWidth || 400);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 280);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };

    window.addEventListener('resize', handleResize);

    // Node graph simulation for 3D visual feel
    const numNodes = 36;
    const nodes: Array<{
      x: number;
      y: number;
      z: number;
      vx: number;
      vy: number;
      vz: number;
      radius: number;
      baseColor: string;
    }> = [];

    // State color mapping
    const getStateColor = (currentStatus: MissionStatus) => {
      switch (currentStatus) {
        case 'IDLE':
          return { primary: '#06b6d4', glow: 'rgba(6, 182, 212, 0.4)', label: 'IDLE / LISTENING' };
        case 'REPOSITORY_ANALYZED':
          return { primary: '#3b82f6', glow: 'rgba(59, 130, 246, 0.5)', label: 'ANALYZING AST & DEPS' };
        case 'SOLUTIONS_GENERATED':
        case 'SOLUTION_SELECTED':
          return { primary: '#8b5cf6', glow: 'rgba(139, 92, 246, 0.5)', label: 'SOLUTION ARCHITECTURE DUAL-PATH' };
        case 'CODING_STARTED':
          return { primary: '#10b981', glow: 'rgba(16, 185, 129, 0.5)', label: 'WORKSPACE SYNTHESIS' };
        case 'SANDBOX_STARTED':
          return { primary: '#f59e0b', glow: 'rgba(245, 158, 11, 0.5)', label: 'SANDBOX CONTAINER ISOLATION' };
        case 'TEST_STARTED':
          return { primary: '#38bdf8', glow: 'rgba(56, 189, 248, 0.5)', label: 'EXECUTING CONCURRENCY SUITE' };
        case 'TEST_FAILED':
          return { primary: '#f43f5e', glow: 'rgba(244, 63, 94, 0.6)', label: 'DIAGNOSING TEST FAILURE' };
        case 'FAILURE_DIAGNOSED':
        case 'REPAIR_STARTED':
          return { primary: '#eab308', glow: 'rgba(234, 179, 8, 0.6)', label: `AUTONOMOUS REPAIR CYCLE #${repairCycles || 1}` };
        case 'REPAIR_COMPLETED':
        case 'REGRESSION_STARTED':
          return { primary: '#10b981', glow: 'rgba(16, 185, 129, 0.6)', label: 'VERIFYING ZERO REGRESSIONS' };
        case 'SECURITY_SCAN_COMPLETED':
          return { primary: '#a855f7', glow: 'rgba(168, 85, 247, 0.6)', label: 'SECURITY & CVE AUDIT PASSED' };
        case 'VERIFICATION_COMPLETED':
        case 'PR_CREATED':
          return { primary: '#22c55e', glow: 'rgba(34, 197, 94, 0.7)', label: 'CRYPTOGRAPHICALLY VERIFIED & PR CREATED' };
        case 'MISSION_FAILED':
          return { primary: '#ef4444', glow: 'rgba(239, 68, 68, 0.6)', label: 'MISSION TERMINATED' };
        default:
          return { primary: '#06b6d4', glow: 'rgba(6, 182, 212, 0.4)', label: 'READY' };
      }
    };

    for (let i = 0; i < numNodes; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 55 + Math.random() * 45;
      const sinPhi = Math.sin(phi);

      nodes.push({
        x: r * sinPhi * Math.cos(theta),
        y: r * sinPhi * Math.sin(theta),
        z: r * Math.cos(phi),
        vx: (Math.random() - 0.5) * 0.008,
        vy: (Math.random() - 0.5) * 0.008,
        vz: (Math.random() - 0.5) * 0.008,
        radius: 2 + Math.random() * 2,
        baseColor: '#60a5fa'
      });
    }

    let angleX = 0;
    let angleY = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const theme = getStateColor(status);
      const centerX = width / 2;
      const centerY = height / 2;

      // Rotation speed depends on status
      const rotSpeed = status === 'CODING_STARTED' || status === 'REPAIR_STARTED' ? 0.015 : 0.007;
      angleY += rotSpeed;
      angleX += rotSpeed * 0.4;

      const cosY = Math.cos(angleY);
      const sinY = Math.sin(angleY);
      const cosX = Math.cos(angleX);
      const sinX = Math.sin(angleX);

      // Central core pulsing sphere
      const pulse = Math.sin(Date.now() * 0.003) * 6;
      const coreRadius = 24 + pulse;

      // Draw subtle orbital guide rings
      ctx.beginPath();
      ctx.ellipse(centerX, centerY, 80, 26, angleY * 0.5, 0, Math.PI * 2);
      ctx.strokeStyle = theme.glow;
      ctx.lineWidth = 1.2;
      ctx.stroke();

      ctx.beginPath();
      ctx.ellipse(centerX, centerY, 100, 36, -angleY * 0.3, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Project 3D nodes
      const projected: Array<{ x: number; y: number; z: number; r: number; alpha: number }> = [];

      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        // Rotate around Y
        const x1 = n.x * cosY - n.z * sinY;
        const z1 = n.z * cosY + n.x * sinY;
        // Rotate around X
        const y2 = n.y * cosX - z1 * sinX;
        const z2 = z1 * cosX + n.y * sinX;

        const fov = 260;
        const scale = fov / (fov + z2 + 80);
        const px = centerX + x1 * scale;
        const py = centerY + y2 * scale;
        const alpha = Math.max(0.15, Math.min(1, (z2 + 100) / 200));

        projected.push({ x: px, y: py, z: z2, r: n.radius * scale, alpha });
      }

      // Draw lines between nearby nodes
      for (let i = 0; i < projected.length; i++) {
        for (let j = i + 1; j < projected.length; j++) {
          const dx = projected[i].x - projected[j].x;
          const dy = projected[i].y - projected[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 46) {
            const lineAlpha = (1 - dist / 46) * 0.25 * projected[i].alpha;
            ctx.beginPath();
            ctx.moveTo(projected[i].x, projected[i].y);
            ctx.lineTo(projected[j].x, projected[j].y);
            ctx.strokeStyle = theme.primary;
            ctx.globalAlpha = lineAlpha;
            ctx.lineWidth = 0.8;
            ctx.stroke();
            ctx.globalAlpha = 1.0;
          }
        }
      }

      // Draw core glow
      const radialGlow = ctx.createRadialGradient(centerX, centerY, 4, centerX, centerY, coreRadius * 2.2);
      radialGlow.addColorStop(0, theme.primary);
      radialGlow.addColorStop(0.5, theme.glow);
      radialGlow.addColorStop(1, 'rgba(0,0,0,0)');

      ctx.beginPath();
      ctx.arc(centerX, centerY, coreRadius * 2.2, 0, Math.PI * 2);
      ctx.fillStyle = radialGlow;
      ctx.fill();

      // Draw core solid center
      ctx.beginPath();
      ctx.arc(centerX, centerY, coreRadius * 0.6, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = theme.primary;
      ctx.shadowBlur = 16;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Draw projected nodes
      for (let i = 0; i < projected.length; i++) {
        const p = projected[i];
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(1.2, p.r), 0, Math.PI * 2);
        ctx.fillStyle = theme.primary;
        ctx.globalAlpha = p.alpha;
        ctx.fill();
        ctx.globalAlpha = 1.0;
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [status, repairCycles]);

  return (
    <div className="relative w-full h-full min-h-[220px] rounded-xl overflow-hidden bg-slate-950/70 border border-slate-800/80 backdrop-blur-md flex flex-col justify-between p-3.5 shadow-2xl">
      {/* Top Telemetry HUD */}
      <div className="flex items-center justify-between z-10">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
              status === 'TEST_FAILED' ? 'bg-rose-400' : status === 'PR_CREATED' ? 'bg-emerald-400' : 'bg-cyan-400'
            }`}></span>
            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
              status === 'TEST_FAILED' ? 'bg-rose-500' : status === 'PR_CREATED' ? 'bg-emerald-500' : 'bg-cyan-500'
            }`}></span>
          </span>
          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-300 font-semibold">
            3D Autonomous Agent Core
          </span>
        </div>

        <div className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800/90 border border-slate-700 text-slate-300">
          R3F Engine • FPS: 60
        </div>
      </div>

      {/* 3D Canvas Centerpiece */}
      <div className="relative w-full h-[180px] flex items-center justify-center">
        <canvas ref={canvasRef} className="w-full h-full block" />
      </div>

      {/* Bottom Status Banner */}
      <div className="z-10 flex items-center justify-between pt-2 border-t border-slate-800/60 text-[11px]">
        <span className="text-slate-400 font-mono">Agent State:</span>
        <span className={`font-mono font-medium px-2 py-0.5 rounded text-[10px] ${
          status === 'PR_CREATED'
            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
            : status === 'TEST_FAILED'
            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
            : status === 'REPAIR_STARTED' || status === 'FAILURE_DIAGNOSED'
            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
            : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
        }`}>
          {status}
        </span>
      </div>
    </div>
  );
};
