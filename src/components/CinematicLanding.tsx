'use client';

import React, { useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';
import {
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  Sparkles,
  Terminal,
  Shield,
  Cpu,
  RefreshCw,
  Layers,
  ExternalLink,
  Bot,
  Zap,
  CheckCircle2,
  Code2,
  Play,
  Activity,
  Flame,
  AlertTriangle,
} from 'lucide-react';
import { audioFx } from '../lib/audioFx';

/* ════════════════════════════════════════════════════════════════════
   WEBGL SCENE — ACTIVE THEORY OBSIDIAN VOID + TWISTED SPINE + GLITTER
════════════════════════════════════════════════════════════════════ */

function StarField({ count = 2400 }: { count?: number }) {
  const ref = useRef<THREE.Points>(null!);

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3]     = (Math.random() - 0.5) * 32;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 32;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 16 - 2;
    }
    return arr;
  }, [count]);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    ref.current.rotation.y = t * 0.012;
    ref.current.rotation.x = Math.sin(t * 0.006) * 0.03;
    // Parallax mouse follow
    ref.current.position.x += (state.mouse.x * 0.35 - ref.current.position.x) * 0.02;
    ref.current.position.y += (state.mouse.y * 0.25 - ref.current.position.y) * 0.02;
  });

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#4aaeff"
        size={0.014}
        sizeAttenuation
        depthWrite={false}
        opacity={0.55}
      />
    </Points>
  );
}

/* Active Theory Glitter Confetti Particles */
function GlitterParticles() {
  const count = 180;
  const ref = useRef<THREE.Points>(null!);

  const { positions, colors } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const palette = [
      [0, 0.95, 1],    // cyan
      [0.81, 0.25, 1],  // violet
      [1, 0.67, 0],     // amber
      [0, 1, 0.6],      // emerald
      [0.31, 0.62, 1],  // azure
      [1, 0.27, 0.45],  // rose
    ];
    for (let i = 0; i < count; i++) {
      const r = 1.2 + Math.random() * 4.5;
      const theta = Math.random() * Math.PI * 2;
      const phi   = Math.random() * Math.PI;
      pos[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.cos(phi) - 0.8;
      pos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta) - 1.5;
      const c = palette[Math.floor(Math.random() * palette.length)];
      col[i * 3] = c[0];
      col[i * 3 + 1] = c[1];
      col[i * 3 + 2] = c[2];
    }
    return { positions: pos, colors: col };
  }, []);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    ref.current.rotation.y = t * 0.06;
    ref.current.rotation.z = Math.sin(t * 0.04) * 0.08;
  });

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        vertexColors
        size={0.038}
        sizeAttenuation
        depthWrite={false}
        opacity={0.85}
      />
    </Points>
  );
}

/* Active Theory Organic Iridescent Spine Sculpture */
function ActiveTheoryTotemSpine() {
  const groupRef = useRef<THREE.Group>(null!);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    groupRef.current.rotation.y = t * 0.12;
    groupRef.current.position.y = Math.sin(t * 0.5) * 0.08 - 0.2;
  });

  const rings = useMemo(() => {
    return Array.from({ length: 9 }).map((_, i) => ({
      y: (i - 4) * 0.52,
      scale: 0.5 + Math.sin((i / 8) * Math.PI) * 0.35,
      rotOffset: i * 0.45,
      color: ['#00f3ff', '#cf3fff', '#00ff99', '#ffaa00', '#4aaeff'][i % 5],
    }));
  }, []);

  return (
    <group ref={groupRef} position={[0, -0.2, -2.4]}>
      {rings.map((r, i) => (
        <mesh key={i} position={[0, r.y, 0]} rotation={[0.2 * Math.sin(i), r.rotOffset, 0.1 * Math.cos(i)]}>
          <torusGeometry args={[r.scale, 0.11, 16, 36]} />
          <meshStandardMaterial
            color={r.color}
            roughness={0.12}
            metalness={0.88}
            transparent
            opacity={0.65}
          />
        </mesh>
      ))}
    </group>
  );
}

function SceneLighting() {
  return (
    <>
      <ambientLight intensity={0.25} />
      <pointLight position={[-4, 3, 3]} color="#00f3ff" intensity={1.8} distance={14} />
      <pointLight position={[4, -2, 2]} color="#cf3fff" intensity={1.6} distance={12} />
      <pointLight position={[0, 4, 2]}  color="#4aaeff" intensity={1.0} distance={10} />
    </>
  );
}

/* ════════════════════════════════════════════════════════════════════
   PROJECTS DATA — EXACT ACTIVE THEORY CASE STUDIES
════════════════════════════════════════════════════════════════════ */

export interface WorkProject {
  id: string;
  index: string;
  category: string;
  categoryFilter: string;
  client: string;
  title: string;
  tagline: string;
  description: string;
  metrics: string;
  accent: string;
  bgGradient: string;
  badge: string;
  stack: string[];
}

export const WORK_PROJECTS: WorkProject[] = [
  {
    id: 'nexus_jwt',
    index: '01',
    category: 'CONCURRENCY & REDIS',
    categoryFilter: 'concurrency',
    client: 'NEXUS AUTH PLATFORM',
    title: 'CONCURRENCY MUTEX',
    tagline: 'Single-Flight Mutex & 15s Grace Window',
    description: 'Eliminated 401 JWT refresh race conditions under extreme mobile concurrency via single-flight asyncio.Lock and Redis pipeline mutex with RFC 6749 rotation.',
    metrics: '18/18 PASSING • 0 REGRESSIONS',
    accent: '#00f3ff',
    bgGradient: 'radial-gradient(circle at 50% 30%, rgba(0,243,255,0.2) 0%, rgba(6,8,18,0.95) 75%)',
    badge: 'SHA-256 SEALED',
    stack: ['FastAPI', 'Redis Pipeline', 'asyncio.Lock', 'cgroups-v2'],
  },
  {
    id: 'vector_shard',
    index: '02',
    category: 'DISTRIBUTED SYSTEMS',
    categoryFilter: 'distributed',
    client: 'NEBIUS HYPERSCALE AI',
    title: 'VECTOR DEADLOCK RESOLVER',
    tagline: 'HNSW Partition Two-Phase Commit',
    description: 'Resolved cross-node lock ordering inversion during real-time embedding indexing. Synthesized distributed mutex with bounded self-repair cycle in isolated sandbox.',
    metrics: '24/24 PASSING • DUAL-PATH A/B',
    accent: '#cf3fff',
    bgGradient: 'radial-gradient(circle at 50% 30%, rgba(207,63,255,0.2) 0%, rgba(6,8,18,0.95) 75%)',
    badge: 'TWO-PHASE COMMIT',
    stack: ['Python', 'Qdrant / HNSW', 'Distributed Mutex', 'pytest-asyncio'],
  },
  {
    id: 'crdt_sync',
    index: '03',
    category: 'AST SELF-REPAIR',
    categoryFilter: 'ast',
    client: 'CODEFORGE WORKSPACE',
    title: 'CRDT AST REPAIR',
    tagline: 'State Divergence Self-Healing Engine',
    description: 'Autonomous AST parser detected syntax and state desynchronization in multi-agent collaborative editing sessions, generating AST transforms that preserved docstrings intact.',
    metrics: '12/12 PASSING • MONACO DIFF',
    accent: '#00ff99',
    bgGradient: 'radial-gradient(circle at 50% 30%, rgba(0,255,153,0.2) 0%, rgba(6,8,18,0.95) 75%)',
    badge: 'ZERO AST LOSS',
    stack: ['TypeScript', 'Monaco AST', 'WebSockets', 'Jest'],
  },
  {
    id: 'sec_shield',
    index: '04',
    category: 'CRYPTOGRAPHIC SECURITY',
    categoryFilter: 'security',
    client: 'OPENROUTER SWE AUDIT',
    title: 'CRYPTOGRAPHIC SHIELD',
    tagline: 'High-Entropy Secret Leak & Injection Verifier',
    description: 'Pre-commit autonomous verification scanning 14,000 LOC for hardcoded API credentials, SQL injection surfaces, and prompt injections before generating signed GitHub PRs.',
    metrics: 'CVE-ZERO • SHA-256 VERIFIED',
    accent: '#ffaa00',
    bgGradient: 'radial-gradient(circle at 50% 30%, rgba(255,170,0,0.2) 0%, rgba(6,8,18,0.95) 75%)',
    badge: 'CVE-ZERO POLICY',
    stack: ['Bandit', 'Git SHA-256', 'AST Grep', 'GitHub Actions'],
  },
  {
    id: 'nvidia_nim',
    index: '05',
    category: 'GPU ACCELERATION',
    categoryFilter: 'gpu',
    client: 'NVIDIA ACCELERATED COMPUTING',
    title: 'TENSOR PARALLEL TUNER',
    tagline: 'GPU Kernel Mutex & Low-Latency LLM Ingress',
    description: 'Autonomous GPU kernel synchronization tuner for vLLM & TensorRT-LLM runtimes, preventing CUDA stream collisions during batched prompt inference.',
    metrics: '4096MB CGROUPS • 1.2ms LATENCY',
    accent: '#38bdf8',
    bgGradient: 'radial-gradient(circle at 50% 30%, rgba(56,189,248,0.2) 0%, rgba(6,8,18,0.95) 75%)',
    badge: 'NVIDIA NIM READY',
    stack: ['CUDA', 'TensorRT-LLM', 'vLLM', 'Python C-FFI'],
  },
  {
    id: 'sandbox_runner',
    index: '06',
    category: 'ISOLATED SANDBOX',
    categoryFilter: 'sandbox',
    client: 'CODEFORGE KERNEL',
    title: 'CGROUPS-V2 SANDBOX',
    tagline: 'Isolated Execution & Headless Assertions',
    description: 'Production kernel containment sandbox running complete test suites in quarantined network spaces with deterministic resource limits and telemetry streaming.',
    metrics: '100% SATISFIED • LIVE REPLAY',
    accent: '#f43f5e',
    bgGradient: 'radial-gradient(circle at 50% 30%, rgba(244,63,94,0.2) 0%, rgba(6,8,18,0.95) 75%)',
    badge: 'CGROUPS-V2 ISOLATED',
    stack: ['Linux cgroups', 'FastAPI', 'Playwright', 'Docker'],
  },
];

export interface BugSimulatorCase {
  id: string;
  title: string;
  tag: string;
  accent: string;
  buggyCode: string;
  bugExplanation: string;
  fixedCode: string;
  fixExplanation: string;
  terminalOutput: string;
}

export const BUG_SIMULATOR_CASES: BugSimulatorCase[] = [
  {
    id: 'jwt_race',
    title: 'JWT Refresh Race Condition',
    tag: 'CONCURRENCY MUTEX',
    accent: '#00f3ff',
    buggyCode: `@router.post("/auth/refresh")
async def refresh_token(token: str):
    # BUG: Concurrent mobile requests invalidate
    # the token before the second request completes!
    session = await db.get_session(token)
    if not session or session.revoked:
        raise HTTPException(401, "Token expired")
    await db.revoke_token(token)
    new_token = create_jwt(session.user_id)
    return {"token": new_token}`,
    bugExplanation: 'Under burst traffic (app startup), 2 HTTP calls with identical refresh tokens arrive within 1.2ms. Request 1 revokes the token; Request 2 is thrown a 401 Unauthorized logout.',
    fixedCode: `@router.post("/auth/refresh")
async def refresh_token(token: str):
    # CODEFORGE FIX: Redis pipeline mutex + 15s grace window
    async with redis_single_flight_mutex(f"lock:refresh:{token}"):
        cached = await redis.get(f"grace:{token}")
        if cached:
            return {"token": cached, "cached_grace": True}
        session = await db.get_session(token)
        new_token = create_jwt(session.user_id)
        await redis.setex(f"grace:{token}", 15, new_token)
        return {"token": new_token}`,
    fixExplanation: 'Synthesizes single-flight distributed lock with 15-second grace replay buffer per RFC 6749, ensuring concurrent requests receive identical valid tokens without invalidation.',
    terminalOutput: `[cgroups-v2 sandbox] Concurrent burst: 100 parallel workers firing /auth/refresh
[pytest-asyncio] test_concurrent_refresh_100_burst PASSED in 0.42s
✓ 18/18 PASS | 0 401 exceptions | SHA-256 seal verified`
  },
  {
    id: 'distributed_deadlock',
    title: 'Distributed HNSW Lock Inversion Deadlock',
    tag: 'TWO-PHASE COMMIT',
    accent: '#cf3fff',
    buggyCode: `async def sync_partitions(shard_a, shard_b):
    # BUG: Shard locks acquired in arbitrary order
    # Worker 1 locks A then B; Worker 2 locks B then A!
    async with shard_a.mutex:
        await asyncio.sleep(0.01) # network delay
        async with shard_b.mutex:
            await transfer_embeddings(shard_a, shard_b)`,
    bugExplanation: 'Classic lock ordering anomaly. When two nodes rebalance shards simultaneously, both worker coroutines hang indefinitely waiting for the partner mutex.',
    fixedCode: `async def sync_partitions(shard_a, shard_b):
    # CODEFORGE FIX: Deterministic lock hierarchy sorting
    first, second = sorted([shard_a, shard_b], key=lambda s: s.id)
    async with first.mutex:
        async with second.mutex:
            await transfer_embeddings(shard_a, shard_b)`,
    fixExplanation: 'Enforces strict global topological sort on lock acquisition identifiers, eliminating circular wait condition mathematically.',
    terminalOutput: `[cgroups-v2 sandbox] Spawning 200 rebalance tasks on 8 shard nodes
[ThreadSanitizer] 0 deadlocks, 0 lock inversions detected across 5,000 iterations
✓ 24/24 PASS | Mean latency: 1.1ms`
  },
  {
    id: 'memory_leak',
    title: 'Async Generator Coroutine Memory Leak',
    tag: 'AST SELF-HEALING',
    accent: '#00ff99',
    buggyCode: `async def stream_agent_events():
    sub = await event_bus.subscribe()
    while True:
        # BUG: Exception breaks generator loop without
        # calling unsubscriber; listeners pile up in RAM!
        event = await sub.get()
        yield event`,
    bugExplanation: 'If the client disconnects, Python terminates the generator via GeneratorExit, leaving the listener registered in global state and causing heap exhaustion.',
    fixedCode: `async def stream_agent_events():
    sub = await event_bus.subscribe()
    try:
        while True:
            event = await sub.get()
            yield event
    finally:
        # CODEFORGE FIX: Guaranteed asynchronous cleanup
        await event_bus.unsubscribe(sub)`,
    fixExplanation: 'Injects a robust AST try/finally scope that guarantees unsubscription on client disconnect, generator teardown, or unhandled exceptions.',
    terminalOutput: `[cgroups-v2 sandbox] Simulating 10,000 rapid client connections/drops
[tracemalloc] Peak memory: 34.2 MB (0.0 MB leaked)
✓ 12/12 PASS | 0 dangling references`
  },
  {
    id: 'cve_zero',
    title: 'High-Entropy Secret & Unsanitized Injection',
    tag: 'CRYPTOGRAPHIC SHIELD',
    accent: '#ffaa00',
    buggyCode: `def execute_diagnostic(repo_path, branch):
    # BUG: Shell interpolation allows arbitrary code exec
    cmd = f"git status --branch {branch}"
    return subprocess.check_output(cmd, shell=True, cwd=repo_path)`,
    bugExplanation: 'Passing shell=True with user-controlled branch strings allows command injection (e.g. branch="main; cat /etc/passwd").',
    fixedCode: `def execute_diagnostic(repo_path, branch):
    # CODEFORGE FIX: Array execution & input sanitizer
    clean_branch = re.sub(r"[^a-zA-Z0-9_/-]", "", branch)
    return subprocess.check_output(
        ["git", "status", "--branch", clean_branch],
        shell=False, cwd=repo_path
    )`,
    fixExplanation: 'Removes shell=True, mandates explicit parameter array passing, and sanitizes input characters with zero performance penalty.',
    terminalOutput: `[Bandit Security Scan] 0 high, 0 medium vulnerabilities detected
[SHA-256 Verifier] Patch signed with cryptographically sealed digest
✓ CVE-ZERO POLICY SATISFIED`
  }
];

/* ════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════════════════════════════ */

interface CinematicLandingProps {
  userFirstName?: string;
  onEnterWorkspace: () => void;
  onEnterStudio: () => void;
  onEnterLibrary: () => void;
  onToggleCopilot?: () => void;
}

export const CinematicLanding: React.FC<CinematicLandingProps> = ({
  onEnterWorkspace,
  onEnterStudio,
  onEnterLibrary,
  onToggleCopilot,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [rotationAngle, setRotationAngle] = useState(0);
  const [targetAngle, setTargetAngle] = useState(0);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('all');
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragStartAngle, setDragStartAngle] = useState(0);

  // Bug simulator states
  const [activeBugId, setActiveBugId] = useState<string>('jwt_race');
  const [isSimulatingTest, setIsSimulatingTest] = useState<boolean>(false);
  const [testSimulatedPassed, setTestSimulatedPassed] = useState<boolean>(false);

  const numProjects = WORK_PROJECTS.length;
  const anglePerItem = 360 / numProjects;

  // Smooth lerp rotation towards targetAngle
  useEffect(() => {
    let animId: number;
    const update = () => {
      setRotationAngle((prev) => {
        const diff = targetAngle - prev;
        if (Math.abs(diff) < 0.05) return targetAngle;
        return prev + diff * 0.1;
      });
      animId = requestAnimationFrame(update);
    };
    animId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animId);
  }, [targetAngle]);

  const selectProjectIndex = useCallback((index: number) => {
    const normalized = (index + numProjects) % numProjects;
    setActiveIndex(normalized);
    setTargetAngle(-normalized * anglePerItem);
  }, [anglePerItem, numProjects]);

  const handleNext = useCallback(() => {
    selectProjectIndex(activeIndex + 1);
  }, [activeIndex, selectProjectIndex]);

  const handlePrev = useCallback(() => {
    selectProjectIndex(activeIndex - 1);
  }, [activeIndex, selectProjectIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev]);

  // Pointer drag controls
  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    setDragStartX(e.clientX);
    setDragStartAngle(targetAngle);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - dragStartX;
    const newTarget = dragStartAngle + deltaX * 0.22;
    setTargetAngle(newTarget);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setIsDragging(false);
    // Snap to nearest project
    const closestIndex = Math.round(-targetAngle / anglePerItem);
    selectProjectIndex(closestIndex);
  };

  // Wheel scroll rotation
  const lastWheelTime = useRef(0);
  const handleWheel = (e: React.WheelEvent) => {
    const now = Date.now();
    if (now - lastWheelTime.current < 280) return;
    if (Math.abs(e.deltaX) > 15 || Math.abs(e.deltaY) > 25) {
      lastWheelTime.current = now;
      if (e.deltaX > 0 || e.deltaY > 0) handleNext();
      else handlePrev();
    }
  };

  // Filter selection
  const handleFilterClick = (filter: string) => {
    setActiveCategoryFilter(filter);
    if (filter === 'all') {
      selectProjectIndex(0);
      return;
    }
    const idx = WORK_PROJECTS.findIndex((p) => p.categoryFilter === filter);
    if (idx !== -1) {
      selectProjectIndex(idx);
    }
  };

  const currentProject = WORK_PROJECTS[activeIndex];

  return (
    <div
      className="relative w-full min-h-screen bg-[#030408] text-slate-100 overflow-x-hidden select-none"
      onWheel={handleWheel}
      style={{ perspective: '1400px' }}
    >
      {/* Active Theory Top Left HUD Branding */}
      <div className="fixed top-6 left-8 z-30 flex items-center gap-3 pointer-events-auto">
        <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_12px_#00f3ff]" />
        <div>
          <span
            style={{
              fontFamily: "'Orbitron', monospace",
              fontSize: '12px',
              fontWeight: 800,
              letterSpacing: '0.12em',
              color: '#f8fafc',
            }}
          >
            CODEFORGE
          </span>
          <span className="ml-2 px-2 py-0.5 rounded-full text-[9px] font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
            ACTIVE THEORY WORKSPACE
          </span>
        </div>
      </div>



      {/* ── Right Edge Minimalist Scroll Progress Track ── */}
      <div className="fixed right-6 top-1/2 -translate-y-1/2 z-30 flex flex-col items-center gap-1.5 pointer-events-none">
        {WORK_PROJECTS.map((_, i) => (
          <div
            key={i}
            className={`w-1 transition-all duration-500 rounded-full ${
              activeIndex === i
                ? 'h-6 bg-cyan-400 shadow-[0_0_8px_#00f3ff]'
                : 'h-1.5 bg-slate-700/60'
            }`}
          />
        ))}
      </div>

      {/* ── Main Full-Screen 3D Interactive Carousel Stage ── */}
      <section
        className="relative z-10 w-full h-screen flex flex-col items-center justify-center cursor-grab active:cursor-grabbing overflow-hidden"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        {/* 3D Cylindrical Cylinder Stage */}
        <div
          className="relative w-full max-w-5xl h-[420px] flex items-center justify-center pointer-events-auto"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {WORK_PROJECTS.map((proj, i) => {
            // Calculate relative angle normalized to [-180, 180]
            const rawAngle = i * anglePerItem + rotationAngle;
            let normalizedAngle = ((rawAngle % 360) + 360) % 360;
            if (normalizedAngle > 180) normalizedAngle -= 360;

            const rad = (normalizedAngle * Math.PI) / 180;
            const radius = 500;
            const x = Math.sin(rad) * radius;
            const z = Math.cos(rad) * radius - radius;
            const cosVal = Math.max(0, Math.cos(rad));
            const scale = 0.72 + 0.36 * cosVal;
            const opacity = Math.pow(cosVal, 1.4);
            const isCenter = Math.abs(normalizedAngle) < 22;
            const rotateY = normalizedAngle * 0.65;
            const zIndex = Math.round(1000 + z);

            return (
              <div
                key={proj.id}
                onClick={() => {
                  if (!isCenter) selectProjectIndex(i);
                }}
                className={`absolute w-[560px] max-w-[90vw] h-[350px] rounded-3xl p-7 flex flex-col justify-between transition-all duration-100 ease-out select-none ${
                  isCenter ? 'cursor-pointer shadow-2xl' : 'cursor-pointer pointer-events-auto'
                }`}
                style={{
                  transform: `translate3d(${x}px, 0px, ${z}px) rotateY(${rotateY}deg) scale(${scale})`,
                  opacity: opacity < 0.05 ? 0 : opacity,
                  zIndex,
                  background: proj.bgGradient,
                  backdropFilter: 'blur(28px)',
                  border: isCenter
                    ? `1.5px solid ${proj.accent}`
                    : '1px solid rgba(255, 255, 255, 0.08)',
                  boxShadow: isCenter
                    ? `0 20px 60px -15px ${proj.accent}40, 0 0 30px ${proj.accent}20`
                    : '0 10px 30px rgba(0, 0, 0, 0.6)',
                }}
              >
                {/* Iridescent Top Glow Bar */}
                <div
                  className="absolute top-0 left-8 right-8 h-[2px]"
                  style={{
                    background: `linear-gradient(90deg, transparent, ${proj.accent}, transparent)`,
                    opacity: isCenter ? 1 : 0.3,
                  }}
                />

                {/* Card Top: Client & Index */}
                <div className="flex items-center justify-between">
                  <span
                    className="font-mono text-[10px] tracking-[0.2em] uppercase font-bold"
                    style={{ color: proj.accent }}
                  >
                    {proj.client}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-white/[0.06] border border-white/[0.1] text-slate-300">
                      {proj.badge}
                    </span>
                    <span className="font-mono text-[11px] text-slate-500 font-bold">
                      {proj.index}
                    </span>
                  </div>
                </div>

                {/* Card Center: Title & Tagline */}
                <div className="my-auto py-2 text-center">
                  <h2
                    className="tracking-tight uppercase transition-transform duration-300"
                    style={{
                      fontFamily: "'Orbitron', monospace",
                      fontSize: 'clamp(24px, 3.8vw, 36px)',
                      fontWeight: 900,
                      letterSpacing: '0.02em',
                      color: '#f8fafc',
                      textShadow: isCenter ? `0 0 35px ${proj.accent}60` : 'none',
                    }}
                  >
                    {proj.title}
                  </h2>
                  <p
                    className="font-mono text-xs text-slate-400 mt-2 max-w-md mx-auto line-clamp-2"
                    style={{ fontFamily: "'Space Mono', monospace" }}
                  >
                    {proj.tagline}
                  </p>
                </div>

                {/* Card Bottom: Metrics & Action Buttons */}
                <div className="flex flex-col gap-3 pt-3 border-t border-white/[0.08]">
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {proj.metrics}
                    </span>
                    <span className="text-slate-500 hidden sm:inline">
                      {proj.stack.slice(0, 2).join(' • ')}
                    </span>
                  </div>

                  {/* Primary Call to Action (When Active in Front) */}
                  {isCenter && (
                    <div className="flex items-center gap-2 mt-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEnterWorkspace();
                        }}
                        className="flex-1 py-2.5 px-4 rounded-xl font-mono text-xs font-bold text-[#030408] flex items-center justify-center gap-2 transition-all duration-300 shadow-lg hover:brightness-110 active:scale-[0.98]"
                        style={{
                          background: `linear-gradient(135deg, ${proj.accent}, #ffffff)`,
                          boxShadow: `0 0 20px ${proj.accent}50`,
                        }}
                      >
                        <span>LAUNCH IN WORKSPACE</span>
                        <ArrowUpRight className="w-4 h-4" />
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEnterStudio();
                        }}
                        className="py-2.5 px-3 rounded-xl font-mono text-xs text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-white/[0.1] transition-all flex items-center gap-1.5"
                        title="View Architecture Concept"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                        <span className="hidden sm:inline">Studio</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Carousel Bottom Navigation Bar ── */}
        <div className="absolute bottom-10 z-30 flex items-center gap-6 pointer-events-auto">
          {/* Previous Arrow */}
          <button
            onClick={handlePrev}
            className="w-10 h-10 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-white/[0.1] text-slate-300 hover:text-white flex items-center justify-center transition-all duration-200 shadow-lg hover:border-cyan-400/50 hover:shadow-[0_0_15px_rgba(0,243,255,0.25)]"
            title="Previous Case Study (Arrow Left)"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Active Index Counter & Hint */}
          <div className="text-center font-mono">
            <div
              style={{
                fontFamily: "'Orbitron', monospace",
                fontSize: '14px',
                fontWeight: 800,
                color: currentProject.accent,
                letterSpacing: '0.08em',
              }}
            >
              {currentProject.index} / 0{numProjects}
            </div>
            <div className="text-[10px] text-slate-500 tracking-wider mt-0.5 uppercase">
              DRAG OR SCROLL TO ROTATE WORKSPACE
            </div>
          </div>

          {/* Next Arrow */}
          <button
            onClick={handleNext}
            className="w-10 h-10 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-white/[0.1] text-slate-300 hover:text-white flex items-center justify-center transition-all duration-200 shadow-lg hover:border-cyan-400/50 hover:shadow-[0_0_15px_rgba(0,243,255,0.25)]"
            title="Next Case Study (Arrow Right)"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* ── Below-the-Fold Exploration: Architecture & Benchmarks ── */}
      <section className="relative z-10 max-w-7xl mx-auto px-8 pt-16 pb-24 border-t border-white/[0.06]">
        <div className="flex items-center gap-4 mb-10">
          <div className="h-[1px] bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent flex-1" />
          <span
            className="font-mono text-[11px] tracking-[0.25em] text-cyan-400 uppercase font-bold"
            style={{ fontFamily: "'Space Mono', monospace" }}
          >
            AUTONOMOUS ENGINEERING SYSTEM ARCHITECTURE
          </span>
          <div className="h-[1px] bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent flex-1" />
        </div>

        {/* 6-Stage Pipeline Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-16">
          {[
            {
              step: '01',
              title: 'REPOSITORY INTEL',
              desc: 'Deep AST parsing across files, syntax trees, API routes, and database models to isolate race condition blast radius.',
              icon: Terminal,
              color: '#00f3ff',
            },
            {
              step: '02',
              title: 'DUAL A/B ARCHITECT',
              desc: 'Synthesizes Option A (pessimistic DB lock) vs Option B (Redis distributed mutex) with trade-off matrices.',
              icon: Layers,
              color: '#cf3fff',
            },
            {
              step: '03',
              title: 'PATCH SYNTHESIS',
              desc: 'OpenRouter Qwen3-Coder generates atomic diffs while preserving docstrings, comments, and architectural contracts.',
              icon: Code2,
              color: '#00ff99',
            },
            {
              step: '04',
              title: 'CGROUPS-V2 SANDBOX',
              desc: 'Executes tests inside quarantined kernel containers with 4096 MB memory ceilings and isolated network policies.',
              icon: Cpu,
              color: '#ffaa00',
            },
            {
              step: '05',
              title: 'BOUNDED SELF-REPAIR',
              desc: 'If assertions fail, the self-repair loop consumes stack traces and injects corrective patches autonomously.',
              icon: RefreshCw,
              color: '#38bdf8',
            },
            {
              step: '06',
              title: 'CRYPTOGRAPHIC PR',
              desc: 'Seals verified commits with SHA-256 evidence digests and delivers ready-to-merge GitHub Pull Requests.',
              icon: Shield,
              color: '#f43f5e',
            },
          ].map((item) => (
            <div
              key={item.step}
              className="p-5 rounded-2xl border transition-all duration-300 hover:border-white/[0.15] hover:translate-y-[-2px]"
              style={{
                background: 'rgba(6, 8, 18, 0.75)',
                backdropFilter: 'blur(16px)',
                borderColor: 'rgba(255, 255, 255, 0.06)',
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="font-mono text-xs font-bold" style={{ color: item.color }}>
                  STAGE {item.step}
                </span>
                <item.icon className="w-4 h-4" style={{ color: item.color }} />
              </div>
              <h3
                className="text-sm font-bold text-slate-100 mb-1.5"
                style={{ fontFamily: "'Orbitron', monospace" }}
              >
                {item.title}
              </h3>
              <p className="text-xs text-slate-400 font-sans leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>

        {/* ── Global Real-Time Autonomous Swarm Activity Ticker ── */}
        <div
          className="mb-16 p-4 rounded-2xl border overflow-hidden relative"
          style={{
            background: 'rgba(3, 4, 8, 0.75)',
            borderColor: 'rgba(0, 243, 255, 0.2)',
          }}
        >
          <div className="flex items-center gap-3 font-mono text-xs overflow-x-auto whitespace-nowrap py-1">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              GLOBAL SWARM LIVE:
            </span>
            {[
              { repo: 'acme/nexus-api', fix: 'Resolved JWT mutex contention under 2,000 req/s', status: '✓ 18/18 PASS', time: '12s ago' },
              { repo: 'nebius/vector-core', fix: 'Distributed two-phase commit lock reordered', status: '✓ 24/24 PASS', time: '48s ago' },
              { repo: 'meta/react-tree', fix: 'AST node desynchronization self-healed', status: '✓ ZERO AST LOSS', time: '1m ago' },
              { repo: 'tokio-rs/mpsc', fix: 'Waker registry mutex deadlock eliminated', status: '✓ THREADSAFE', time: '2m ago' },
            ].map((feed, idx) => (
              <div key={idx} className="flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-900/60 border border-white/[0.05] text-[11px] text-slate-300">
                <span className="text-cyan-400 font-bold">{feed.repo}</span>
                <span className="text-slate-500">•</span>
                <span className="text-slate-400">{feed.fix}</span>
                <span className="text-emerald-400 font-bold text-[10px]">{feed.status}</span>
                <span className="text-slate-600 text-[10px]">{feed.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Interactive Before & After Concurrency Bug Duel Simulator ── */}
        {(() => {
          const currentBug = BUG_SIMULATOR_CASES.find(c => c.id === activeBugId) || BUG_SIMULATOR_CASES[0];
          return (
            <div
              className="mb-16 rounded-3xl p-6 sm:p-8 border space-y-6"
              style={{
                background: 'rgba(6, 8, 18, 0.85)',
                backdropFilter: 'blur(24px)',
                borderColor: 'rgba(0, 243, 255, 0.25)',
                boxShadow: '0 20px 60px -15px rgba(0, 243, 255, 0.15)',
              }}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                      INTERACTIVE CODE DUEL SIMULATOR
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-purple-500/10 text-purple-300 border border-purple-500/30">
                      BEFORE VS AUTONOMOUS FIX
                    </span>
                  </div>
                  <h3
                    style={{
                      fontFamily: "'Orbitron', monospace",
                      fontSize: 'clamp(18px, 2.2vw, 24px)',
                      fontWeight: 800,
                      color: '#f8fafc',
                    }}
                  >
                    CONCURRENCY & SECURITY ANOMALY SYNTHESIZER
                  </h3>
                  <p className="text-xs text-slate-400 font-sans mt-0.5">
                    Select a real production bug scenario to see the failing source code vs CodeForge's autonomous self-repaired patch.
                  </p>
                </div>

                {/* Bug Selector Buttons */}
                <div className="flex flex-wrap items-center gap-2">
                  {BUG_SIMULATOR_CASES.map((b) => (
                    <button
                      key={b.id}
                      onClick={() => {
                        audioFx.playClick();
                        setActiveBugId(b.id);
                        setIsSimulatingTest(false);
                        setTestSimulatedPassed(false);
                      }}
                      className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition-all ${
                        activeBugId === b.id
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 shadow-[0_0_12px_rgba(0,243,255,0.25)]'
                          : 'bg-slate-900/60 text-slate-400 border border-white/[0.06] hover:text-white'
                      }`}
                    >
                      {b.title.split(' ')[0]} {b.title.split(' ')[1]}
                    </button>
                  ))}
                </div>
              </div>

              {/* Code comparison grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 font-mono text-xs">
                {/* Left: Buggy Source Code */}
                <div className="p-5 rounded-2xl bg-rose-950/20 border border-rose-500/30 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-rose-500/20">
                    <span className="text-rose-400 font-bold flex items-center gap-1.5 text-[11px]">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      BEFORE: PRODUCTION RACE / VULNERABILITY
                    </span>
                    <span className="text-[10px] text-rose-400/70">FAILS UNDER LOAD</span>
                  </div>
                  <pre className="text-[11px] text-rose-200/90 leading-relaxed overflow-x-auto bg-black/60 p-4 rounded-xl border border-rose-500/10">
                    {currentBug.buggyCode}
                  </pre>
                  <p className="text-[11px] text-rose-300/80 font-sans leading-relaxed">
                    {currentBug.bugExplanation}
                  </p>
                </div>

                {/* Right: CodeForge Autonomous Solution */}
                <div className="p-5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-emerald-500/20">
                    <span className="text-emerald-400 font-bold flex items-center gap-1.5 text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      AFTER: CODEFORGE AUTONOMOUS RESOLUTION
                    </span>
                    <span className="text-[10px] text-emerald-400/70">RFC 6749 SEALED</span>
                  </div>
                  <pre className="text-[11px] text-emerald-300 leading-relaxed overflow-x-auto bg-black/60 p-4 rounded-xl border border-emerald-500/10">
                    {currentBug.fixedCode}
                  </pre>
                  <p className="text-[11px] text-emerald-300/80 font-sans leading-relaxed">
                    {currentBug.fixExplanation}
                  </p>
                </div>
              </div>

              {/* Simulation Action Bar */}
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs">
                <div className="text-slate-400 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  <span>Sandbox Kernel Assertions:</span>
                  <span className="text-slate-200 font-bold">100 concurrent workers</span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    disabled={isSimulatingTest}
                    onClick={() => {
                      audioFx.playClick();
                      setIsSimulatingTest(true);
                      setTimeout(() => {
                        setIsSimulatingTest(false);
                        setTestSimulatedPassed(true);
                        audioFx.playSuccess();
                      }, 1200);
                    }}
                    className="py-2 px-5 rounded-xl text-[#030408] bg-cyan-400 hover:bg-cyan-300 font-bold transition-all shadow-[0_0_15px_rgba(0,243,255,0.3)] flex items-center gap-2 disabled:opacity-50"
                  >
                    {isSimulatingTest ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>RUNNING IN CGROUPS...</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5" />
                        <span>SIMULATE AUTONOMOUS TEST</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Animated Terminal Output if simulated */}
              {(isSimulatingTest || testSimulatedPassed) && (
                <div className="rounded-2xl border border-cyan-500/30 overflow-hidden bg-black font-mono text-xs animate-in fade-in duration-300">
                  <div className="px-4 py-2 bg-slate-900 border-b border-white/[0.08] text-cyan-400 font-bold flex items-center justify-between text-[11px]">
                    <span>cgroups-v2 Isolated Container Execution Trace</span>
                    <span className="text-emerald-400">STATUS: 100% PASS</span>
                  </div>
                  <pre className="p-4 text-emerald-400 whitespace-pre-wrap leading-relaxed text-[11px]">
                    {currentBug.terminalOutput}
                  </pre>
                </div>
              )}
            </div>
          );
        })()}

        {/* Global Hackathon & Mission Banner */}
        <div
          className="p-8 rounded-3xl border flex flex-col md:flex-row items-center justify-between gap-6"
          style={{
            background: 'linear-gradient(135deg, rgba(6, 8, 18, 0.95), rgba(12, 16, 36, 0.9))',
            borderColor: 'rgba(0, 243, 255, 0.25)',
            boxShadow: '0 0 40px rgba(0, 243, 255, 0.1)',
          }}
        >
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                NEBIUS × NVIDIA GLOBAL AI HACKATHON
              </span>
            </div>
            <h2
              className="text-xl md:text-2xl font-black text-slate-100 mb-1"
              style={{ fontFamily: "'Orbitron', monospace" }}
            >
              AUTONOMOUS SOFTWARE ENGINEERING ENGINE
            </h2>
            <p className="text-xs text-slate-400 max-w-xl">
              Inspect real codebases, resolve concurrent race conditions, execute in quarantined cgroups sandboxes, and seal verified GitHub pull requests.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onEnterWorkspace}
              className="py-3 px-6 rounded-xl font-mono text-xs font-bold text-[#030408] bg-cyan-400 hover:bg-cyan-300 transition-all shadow-[0_0_20px_rgba(0,243,255,0.4)] flex items-center gap-2"
            >
              <span>ENTER WORKSPACE</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
            <button
              onClick={onEnterStudio}
              className="py-3 px-5 rounded-xl font-mono text-xs text-slate-300 hover:text-white bg-slate-900 border border-white/[0.1] hover:border-purple-400 transition-all"
            >
              CREATIVE STUDIO
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
