'use client';

import React, { useState, useEffect } from 'react';
import {
  Palette,
  Sparkles,
  Download,
  Save,
  Trash2,
  RefreshCw,
  Layers,
  FileCode,
  Image as ImageIcon,
  BookOpen,
  Code2,
  Check,
  Plus,
  Loader2,
  ArrowLeft
} from 'lucide-react';
import { DbStudioArtifact } from '../lib/server/db';

interface CreativeStudioProps {
  onBackToWorkspace: () => void;
}

const DEFAULT_SEED_ARTIFACTS: DbStudioArtifact[] = [
  {
    id: 'art_seed_arch',
    userId: 'usr_om_sharma',
    title: 'Nexus API Concurrency Architecture & Redis Grace Window',
    category: 'architecture',
    prompt: 'Nexus API Concurrency Architecture & Redis Grace Window',
    createdAt: new Date().toISOString(),
    content: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="100%" height="100%">
  <defs>
    <linearGradient id="neonGlow" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#00f3ff"/>
      <stop offset="100%" stop-color="#cf3fff"/>
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="8" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  <rect width="800" height="450" fill="#030408" rx="16"/>
  <!-- Grid background lines -->
  <path d="M 0 75 L 800 75 M 0 150 L 800 150 M 0 225 L 800 225 M 0 300 L 800 300 M 0 375 L 800 375" stroke="rgba(255,255,255,0.03)" stroke-width="1"/>
  <path d="M 160 0 L 160 450 M 320 0 L 320 450 M 480 0 L 480 450 M 640 0 L 640 450" stroke="rgba(255,255,255,0.03)" stroke-width="1"/>
  
  <!-- Client Ingress -->
  <rect x="40" y="170" width="160" height="100" fill="#080c18" stroke="#00f3ff" stroke-width="1.5" rx="10"/>
  <circle cx="65" cy="195" r="5" fill="#00f3ff"/>
  <text x="80" y="200" fill="#f8fafc" font-size="12" font-family="'Orbitron', monospace" font-weight="bold">CONCURRENT CLIENTS</text>
  <text x="120" y="225" fill="#64748b" font-size="10" font-family="'Space Mono', monospace" text-anchor="middle">Mobile iOS / Android</text>
  <text x="120" y="245" fill="#00f3ff" font-size="10" font-family="'Space Mono', monospace" text-anchor="middle">Burst /refresh HTTP/2</text>
  
  <!-- Flow Arrow -->
  <path d="M 200 220 L 290 220" stroke="#00f3ff" stroke-width="2" stroke-dasharray="4,4"/>
  
  <!-- Single-Flight Mutex / Token Manager -->
  <rect x="290" y="125" width="220" height="190" fill="#0c1024" stroke="url(#neonGlow)" stroke-width="2" rx="12" filter="url(#glow)"/>
  <text x="400" y="160" fill="#cf3fff" font-size="13" font-family="'Orbitron', monospace" text-anchor="middle" font-weight="bold">TOKEN ENGINE & MUTEX</text>
  <text x="400" y="190" fill="#38bdf8" font-size="11" font-family="'Space Mono', monospace" text-anchor="middle">Single-Flight asyncio.Lock</text>
  <text x="400" y="220" fill="#00ff99" font-size="11" font-family="'Space Mono', monospace" text-anchor="middle">Redis Pipeline Mutex (NX)</text>
  <text x="400" y="250" fill="#ffaa00" font-size="10" font-family="'Space Mono', monospace" text-anchor="middle">15s Grace Cache Window</text>
  <text x="400" y="280" fill="#f43f5e" font-size="10" font-family="'Space Mono', monospace" text-anchor="middle">RFC-6749 Token Family Rotation</text>

  <!-- Flow to Redis & DB -->
  <path d="M 510 190 L 590 155" stroke="#cf3fff" stroke-width="1.5"/>
  <path d="M 510 250 L 590 285" stroke="#00ff99" stroke-width="1.5"/>

  <!-- Redis Cache -->
  <rect x="590" y="115" width="170" height="85" fill="#080c18" stroke="#ff4466" stroke-width="1.5" rx="8"/>
  <text x="675" y="148" fill="#ff6b8b" font-size="12" font-family="'Orbitron', monospace" text-anchor="middle" font-weight="bold">REDIS CLUSTER</text>
  <text x="675" y="170" fill="#94a3b8" font-size="10" font-family="'Space Mono', monospace" text-anchor="middle">Atomic Hash & TTL</text>
  <text x="675" y="188" fill="#00ff99" font-size="9" font-family="'Space Mono', monospace" text-anchor="middle">&lt; 1.2ms Grace Hit</text>

  <!-- DB Session Store -->
  <rect x="590" y="245" width="170" height="85" fill="#080c18" stroke="#00ff99" stroke-width="1.5" rx="8"/>
  <text x="675" y="278" fill="#00ff99" font-size="12" font-family="'Orbitron', monospace" text-anchor="middle" font-weight="bold">POSTGRESQL DB</text>
  <text x="675" y="300" fill="#94a3b8" font-size="10" font-family="'Space Mono', monospace" text-anchor="middle">session_tokens Table</text>
  <text x="675" y="318" fill="#64748b" font-size="9" font-family="'Space Mono', monospace" text-anchor="middle">Row-Level Invalidation</text>
</svg>`,
  },
  {
    id: 'art_seed_wireframe',
    userId: 'usr_om_sharma',
    title: 'CodeForge Mission Control UI Wireframe & Split Monaco HUD',
    category: 'ui_concept',
    prompt: 'CodeForge Dual-Pane Monaco IDE & Verification HUD',
    createdAt: new Date().toISOString(),
    content: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="100%" height="100%">
  <defs>
    <linearGradient id="hudGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#00f3ff"/>
      <stop offset="50%" stop-color="#cf3fff"/>
      <stop offset="100%" stop-color="#00ff99"/>
    </linearGradient>
  </defs>
  <rect width="800" height="500" fill="#030408" rx="16"/>
  <!-- Top Navigation Pill -->
  <rect x="40" y="30" width="720" height="46" fill="#080c18" stroke="rgba(255,255,255,0.08)" rx="12"/>
  <circle cx="65" cy="53" r="6" fill="#00f3ff"/>
  <text x="85" y="58" fill="#00f3ff" font-size="13" font-family="'Orbitron', monospace" font-weight="bold">CODEFORGE HUD</text>
  <rect x="480" y="40" width="80" height="26" fill="rgba(0,243,255,0.15)" stroke="#00f3ff" rx="6"/>
  <text x="520" y="57" fill="#00f3ff" font-size="10" font-family="'Space Mono', monospace" text-anchor="middle">LIVE DUAL</text>
  <rect x="575" y="40" width="80" height="26" fill="rgba(207,63,255,0.15)" stroke="#cf3fff" rx="6"/>
  <text x="615" y="57" fill="#cf3fff" font-size="10" font-family="'Space Mono', monospace" text-anchor="middle">DIFF AST</text>
  <rect x="670" y="40" width="75" height="26" fill="rgba(0,255,153,0.15)" stroke="#00ff99" rx="6"/>
  <text x="707" y="57" fill="#00ff99" font-size="10" font-family="'Space Mono', monospace" text-anchor="middle">REPLAY</text>

  <!-- Left Sidebar: Architecture Formulation -->
  <rect x="40" y="90" width="220" height="370" fill="#080c18" stroke="rgba(255,255,255,0.06)" rx="10"/>
  <text x="60" y="120" fill="#00f3ff" font-size="11" font-family="'Orbitron', monospace" font-weight="bold">A/B SOLUTION DUEL</text>
  
  <rect x="55" y="135" width="190" height="135" fill="#0c1024" stroke="#cf3fff" stroke-width="1.5" rx="8"/>
  <text x="70" y="160" fill="#cf3fff" font-size="10" font-family="'Orbitron', monospace" font-weight="bold">OPTION B (SELECTED)</text>
  <text x="70" y="180" fill="#f8fafc" font-size="9" font-family="'Space Mono', monospace">Redis Mutex + Grace</text>
  <text x="70" y="200" fill="#00ff99" font-size="9" font-family="'Space Mono', monospace">Confidence: 98.4%</text>
  <text x="70" y="220" fill="#94a3b8" font-size="8" font-family="'Space Mono', monospace">SWE-bench: Verified</text>
  <rect x="70" y="235" width="85" height="20" fill="#cf3fff" rx="4"/>
  <text x="112" y="249" fill="#030408" font-size="8" font-family="'Space Mono', monospace" font-weight="bold" text-anchor="middle">DEPLOYED</text>

  <rect x="55" y="285" width="190" height="100" fill="#080c18" stroke="rgba(255,255,255,0.06)" rx="8"/>
  <text x="70" y="310" fill="#64748b" font-size="10" font-family="'Orbitron', monospace">OPTION A</text>
  <text x="70" y="330" fill="#94a3b8" font-size="9" font-family="'Space Mono', monospace">DB Pessimistic Lock</text>
  <text x="70" y="350" fill="#f59e0b" font-size="9" font-family="'Space Mono', monospace">Latency +42ms</text>

  <!-- Right Area: Monaco Diff & Sandbox Preview -->
  <rect x="275" y="90" width="485" height="240" fill="#060914" stroke="rgba(255,255,255,0.08)" rx="10"/>
  <text x="295" y="115" fill="#94a3b8" font-size="10" font-family="'Space Mono', monospace">MONACO AST DIFF: app/auth/service.py</text>
  
  <rect x="295" y="130" width="445" height="35" fill="rgba(244,63,94,0.15)" stroke="rgba(244,63,94,0.3)" rx="4"/>
  <text x="310" y="152" fill="#fb7185" font-size="9" font-family="'Space Mono', monospace">- session = await db.execute(select(Token).filter(Token.id == tid))</text>
  
  <rect x="295" y="175" width="445" height="50" fill="rgba(0,255,153,0.15)" stroke="rgba(0,255,153,0.3)" rx="4"/>
  <text x="310" y="195" fill="#34d399" font-size="9" font-family="'Space Mono', monospace">+ async with redis.pipeline_lock(f"mutex:{token_family}"):</text>
  <text x="310" y="212" fill="#34d399" font-size="9" font-family="'Space Mono', monospace">+     cached = await redis.get_grace_token(token_family, ttl=15)</text>

  <!-- Bottom Terminal Strip -->
  <rect x="275" y="340" width="485" height="120" fill="#04060d" stroke="rgba(0,243,255,0.2)" rx="10"/>
  <text x="295" y="365" fill="#00f3ff" font-size="10" font-family="'Space Mono', monospace">SANDBOX TELEMETRY: cgroups-v2 isolated</text>
  <text x="295" y="388" fill="#f8fafc" font-size="9" font-family="'Space Mono', monospace">$ pytest tests/test_concurrency_race.py -v</text>
  <text x="295" y="408" fill="#00ff99" font-size="9" font-family="'Space Mono', monospace">PASSED tests/test_concurrency_race.py::test_burst_refresh (18/18)</text>
  <text x="295" y="428" fill="#38bdf8" font-size="9" font-family="'Space Mono', monospace">100% assertions satisfied • Sealed commit SHA: 9f4f82a1b72e</text>
</svg>`,
  },
  {
    id: 'art_seed_poster',
    userId: 'usr_om_sharma',
    title: 'CodeForge Autonomous Cyber Poster & Hackathon Shield',
    category: 'poster',
    prompt: 'CodeForge Obsidian Cyber Poster & Visual Brand Assets',
    createdAt: new Date().toISOString(),
    content: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 800" width="100%" height="100%">
  <defs>
    <linearGradient id="cyberGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#00f3ff"/>
      <stop offset="50%" stop-color="#cf3fff"/>
      <stop offset="100%" stop-color="#00ff99"/>
    </linearGradient>
    <radialGradient id="cyberGlow" cx="50%" cy="45%" r="60%">
      <stop offset="0%" stop-color="rgba(0, 243, 255, 0.25)"/>
      <stop offset="50%" stop-color="rgba(207, 63, 255, 0.1)"/>
      <stop offset="100%" stop-color="rgba(3, 4, 8, 0)"/>
    </radialGradient>
  </defs>
  <rect width="600" height="800" fill="#030408"/>
  <rect width="600" height="800" fill="url(#cyberGlow)"/>

  <!-- Orbital Rings -->
  <circle cx="300" cy="380" r="220" fill="none" stroke="rgba(255, 255, 255, 0.05)" stroke-width="1"/>
  <circle cx="300" cy="380" r="170" fill="none" stroke="url(#cyberGrad)" stroke-width="2" opacity="0.7"/>
  <circle cx="300" cy="380" r="115" fill="none" stroke="#00f3ff" stroke-width="1.5" stroke-dasharray="6,6" opacity="0.5"/>
  <circle cx="300" cy="380" r="60" fill="none" stroke="#cf3fff" stroke-width="2" opacity="0.8"/>

  <!-- Logo Core Center -->
  <polygon points="300,345 330,395 270,395" fill="none" stroke="#00f3ff" stroke-width="3"/>
  <polygon points="300,415 330,365 270,365" fill="none" stroke="#cf3fff" stroke-width="2"/>

  <!-- Brand Typography -->
  <text x="300" y="160" fill="#00f3ff" font-size="11" font-family="'Space Mono', monospace" text-anchor="middle" letter-spacing="6">AUTONOMOUS SOFTWARE ENGINEERING ENGINE</text>
  <text x="300" y="210" fill="#ffffff" font-size="36" font-family="'Orbitron', monospace" text-anchor="middle" font-weight="900" letter-spacing="4">CODEFORGE</text>
  
  <text x="300" y="580" fill="#f8fafc" font-size="13" font-family="'Orbitron', monospace" text-anchor="middle" font-weight="700" letter-spacing="2">ACTIVE THEORY OBSIDIAN RUNTIME</text>
  <text x="300" y="615" fill="#64748b" font-size="10" font-family="'Space Mono', monospace" text-anchor="middle">Single-Flight Mutex • CRDT AST Repair • cgroups-v2 Sandbox</text>
  
  <!-- Footer Hackathon Tag -->
  <text x="300" y="730" fill="#38bdf8" font-size="10" font-family="'Space Mono', monospace" text-anchor="middle" letter-spacing="2">NEBIUS × NVIDIA GLOBAL AI HACKATHON</text>
</svg>`,
  },
  {
    id: 'art_seed_storyboard',
    userId: 'usr_om_sharma',
    title: 'Nexus Concurrency Self-Repair Mission Storyboard',
    category: 'storyboard',
    prompt: 'Autonomous SWE Mission Storyboard & Test Regression Cycle',
    createdAt: new Date().toISOString(),
    content: `# CodeForge Autonomous SWE Mission Storyboard
## Scenario: Concurrency Token Race & Dynamic Self-Repair Loop

### 🎬 Scene 1: Anomaly Discovery & Telemetry Ingestion
- Continuous telemetry captures a burst of 401 Unauthorized errors in high-concurrency mobile authentication logs.
- Agent analyzes stack trace:
  \`\`\`python
  Race Condition: RefreshToken(id='f98a') marked expired during parallel HTTP/2 /refresh requests
  \`\`\`
- Issue automatically classified with Severity: HIGH, Blast Radius: Auth Token Pipeline.

---

### 🏛️ Scene 2: Dual A/B Architectural Formulation
- The Solution Architect evaluates two competing designs:
  - **Option A (DB Pessimistic Lock)**: \`SELECT FOR UPDATE\` on Token row.
    - *Verdict*: Latency penalty (+42ms), high risk of DB connection pool starvation.
  - **Option B (Redis Pipeline Mutex + 15s Grace Window)**:
    - Single-flight \`asyncio.Lock\` with Redis NX atomic lock.
    - 15-second grace window cache returns current active token to concurrent requests.
    - *Verdict*: Recommended (Latency: 1.2ms, Confidence: 98.4%).

---

### 🧪 Scene 3: Sandbox Verification & Self-Repair Injection
- The isolated \`cgroups-v2\` container executes 18 unit and integration tests.
- After a simulated test failure on test 14, the self-repair loop dynamically injects an atomic Redis pipeline cache.
- Full regression suite passes with 0 side-effects (18/18 Passing).

---

### 🔒 Scene 4: Cryptographically Sealed Pull Request
- SHA-256 sealed commit \`9f4f82a1b72e\` pushed to repository.
- Verification badge: **PASS (100% assertions satisfied)**.`,
  },
];

interface CreativeStudioProps {
  onBackToWorkspace: () => void;
}

export const CreativeStudio: React.FC<CreativeStudioProps> = ({ onBackToWorkspace }) => {
  const [activeCategory, setActiveCategory] = useState<'architecture' | 'ui_concept' | 'poster' | 'storyboard'>('architecture');
  const [promptInput, setPromptInput] = useState('Nexus API Concurrency Architecture & Redis Grace Window');
  const [artifacts, setArtifacts] = useState<DbStudioArtifact[]>(DEFAULT_SEED_ARTIFACTS);
  const [selectedArtifact, setSelectedArtifact] = useState<DbStudioArtifact | null>(DEFAULT_SEED_ARTIFACTS[0]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    fetchArtifacts();
  }, []);

  const fetchArtifacts = async () => {
    try {
      const res = await fetch('/api/studio/artifacts');
      if (res.ok) {
        const data = await res.json();
        if (data.artifacts && data.artifacts.length > 0) {
          // Merge server artifacts with seeds (avoiding duplicates)
          const serverIds = new Set(data.artifacts.map((a: DbStudioArtifact) => a.id));
          const remainingSeeds = DEFAULT_SEED_ARTIFACTS.filter((s) => !serverIds.has(s.id));
          const combined = [...data.artifacts, ...remainingSeeds];
          setArtifacts(combined);
          setSelectedArtifact(combined[0]);
        }
      }
    } catch (err) {
      console.warn('Could not load studio artifacts, using defaults:', err);
    }
  };

  const handleSelectCategory = (cat: 'architecture' | 'ui_concept' | 'poster' | 'storyboard') => {
    setActiveCategory(cat);
    // Find matching seed or artifact if available
    const match = artifacts.find((a) => a.category === cat);
    if (match) {
      setSelectedArtifact(match);
      setPromptInput(match.prompt || match.title);
    } else {
      if (cat === 'architecture') setPromptInput('Nexus API Concurrency Architecture & Redis Grace Window');
      else if (cat === 'poster') setPromptInput('CodeForge Obsidian Cyber Poster & Visual Brand Assets');
      else if (cat === 'storyboard') setPromptInput('Autonomous SWE Mission Storyboard & Test Regression Cycle');
      else if (cat === 'ui_concept') setPromptInput('CodeForge Dual-Pane Monaco IDE & Verification HUD');
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptInput.trim()) return;

    setIsGenerating(true);
    try {
      let content = '';
      if (activeCategory === 'architecture') {
        content = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="100%" height="100%">
  <rect width="800" height="450" fill="#030408" rx="16"/>
  <!-- Client Ingress -->
  <rect x="40" y="180" width="160" height="90" fill="#080c18" stroke="#00f3ff" stroke-width="1.5" rx="10"/>
  <text x="120" y="220" fill="#f8fafc" font-size="13" font-family="'Orbitron', monospace" text-anchor="middle" font-weight="bold">MOBILE CLIENTS</text>
  <text x="120" y="240" fill="#64748b" font-size="11" font-family="'Space Mono', monospace" text-anchor="middle">Concurrent /refresh</text>
  
  <!-- Flow Arrow -->
  <path d="M 200 225 L 300 225" stroke="#00f3ff" stroke-width="2" stroke-dasharray="4,4"/>
  
  <!-- Single-Flight Mutex / Token Manager -->
  <rect x="300" y="140" width="200" height="170" fill="#0c1024" stroke="#cf3fff" stroke-width="1.5" rx="12"/>
  <text x="400" y="175" fill="#cf3fff" font-size="13" font-family="'Orbitron', monospace" text-anchor="middle" font-weight="bold">TOKEN MANAGER</text>
  <text x="400" y="200" fill="#f8fafc" font-size="11" font-family="'Space Mono', monospace" text-anchor="middle">asyncio.Lock()</text>
  <text x="400" y="230" fill="#00ff99" font-size="11" font-family="'Space Mono', monospace" text-anchor="middle">Redis Pipeline Mutex</text>
  <text x="400" y="260" fill="#64748b" font-size="10" font-family="'Space Mono', monospace" text-anchor="middle">15s Grace Cache</text>
  <text x="400" y="285" fill="#ffaa00" font-size="10" font-family="'Space Mono', monospace" text-anchor="middle">Token Family Rotation</text>

  <!-- Flow to Redis & DB -->
  <path d="M 500 200 L 600 160" stroke="#cf3fff" stroke-width="1.5"/>
  <path d="M 500 250 L 600 290" stroke="#00ff99" stroke-width="1.5"/>

  <!-- Redis Cache -->
  <rect x="600" y="120" width="160" height="80" fill="#080c18" stroke="#ff4466" stroke-width="1.5" rx="8"/>
  <text x="680" y="155" fill="#ff6b8b" font-size="12" font-family="'Orbitron', monospace" text-anchor="middle" font-weight="bold">REDIS CACHE</text>
  <text x="680" y="175" fill="#64748b" font-size="10" font-family="'Space Mono', monospace" text-anchor="middle">Atomic Grace TTL</text>

  <!-- DB Session Store -->
  <rect x="600" y="250" width="160" height="80" fill="#080c18" stroke="#00ff99" stroke-width="1.5" rx="8"/>
  <text x="680" y="285" fill="#00ff99" font-size="12" font-family="'Orbitron', monospace" text-anchor="middle" font-weight="bold">SQL DATABASE</text>
  <text x="680" y="305" fill="#64748b" font-size="10" font-family="'Space Mono', monospace" text-anchor="middle">SessionToken Table</text>
</svg>`;
      } else if (activeCategory === 'poster') {
        content = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 800" width="100%" height="100%">
  <defs>
    <linearGradient id="cyberGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#00f3ff"/>
      <stop offset="50%" stop-color="#cf3fff"/>
      <stop offset="100%" stop-color="#00ff99"/>
    </linearGradient>
  </defs>
  <rect width="600" height="800" fill="#030408"/>
  <circle cx="300" cy="380" r="180" fill="none" stroke="url(#cyberGrad)" stroke-width="2" opacity="0.6"/>
  <circle cx="300" cy="380" r="120" fill="none" stroke="#00f3ff" stroke-width="1" stroke-dasharray="6,4" opacity="0.4"/>
  <text x="300" y="370" fill="#ffffff" font-size="32" font-family="'Orbitron', monospace" text-anchor="middle" font-weight="900" letter-spacing="4">CODEFORGE</text>
  <text x="300" y="410" fill="#00f3ff" font-size="14" font-family="'Space Mono', monospace" text-anchor="middle" letter-spacing="3">AUTONOMOUS SOFTWARE ENG</text>
  <text x="300" y="700" fill="#64748b" font-size="11" font-family="'Space Mono', monospace" text-anchor="middle">NEBIUS × NVIDIA GLOBAL AI HACKATHON</text>
</svg>`;
      } else if (activeCategory === 'storyboard') {
        content = `# CodeForge Autonomous SWE Mission Storyboard
## Scenario: Concurrency Token Race & Dynamic Self-Repair
### Objective: ${promptInput.trim()}

### Scene 1: Anomaly Discovery
- Continuous monitoring captures burst of 401 Unauthorized errors in high-concurrency mobile authentication logs.
- Agent analyzes stack trace and flags race condition in token refresh logic during concurrent mobile app launches.

### Scene 2: Architectural Formulation
- The Solution Architect evaluates two competing designs:
  - Option A: Database pessimistic locking with row-level locks (Minimal blast radius, but higher latency).
  - Option B: Redis atomic single-flight mutex with a 15-second grace window and RFC 6749 Token Family rotation.

### Scene 3: Sandbox Verification & Sealed PR
- The isolated container executes 18 unit and integration tests.
- After a simulated test failure, the self-repair loop injects an atomic Redis pipeline cache.
- Full regression suite passes with 0 side-effects, generating a SHA-256 cryptographically sealed Pull Request.`;
      } else {
        content = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 500" width="100%" height="100%">
  <rect width="800" height="500" fill="#030408" rx="16"/>
  <rect x="40" y="40" width="720" height="50" fill="#080c18" stroke="rgba(255,255,255,0.08)" rx="8"/>
  <text x="70" y="70" fill="#00f3ff" font-size="14" font-family="'Orbitron', monospace" font-weight="bold">CODEFORGE HUD: ${promptInput.slice(0, 30)}</text>
  <rect x="40" y="110" width="220" height="350" fill="#080c18" stroke="rgba(255,255,255,0.06)" rx="8"/>
  <text x="60" y="140" fill="#64748b" font-size="11" font-family="'Space Mono', monospace">REPOSITORY INTEL</text>
  <rect x="280" y="110" width="480" height="350" fill="#080c18" stroke="rgba(255,255,255,0.06)" rx="8"/>
  <text x="310" y="140" fill="#64748b" font-size="11" font-family="'Space Mono', monospace">DUAL A/B ARCHITECTURE</text>
</svg>`;
      }

      const generatedArt: DbStudioArtifact = {
        id: `art_${Date.now()}`,
        userId: 'usr_om_sharma',
        title: promptInput.trim(),
        category: activeCategory,
        content: content,
        prompt: promptInput.trim(),
        createdAt: new Date().toISOString(),
      };

      // Optimistically update client state immediately
      setArtifacts((prev) => [generatedArt, ...prev]);
      setSelectedArtifact(generatedArt);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);

      // Persist to server in background
      try {
        await fetch('/api/studio/artifacts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: promptInput.trim(),
            category: activeCategory,
            content: content,
            prompt: promptInput.trim(),
          }),
        });
      } catch (postErr) {
        console.warn('Background sync warning:', postErr);
      }
    } catch (err) {
      console.warn('Generation failed:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/studio/artifacts?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setArtifacts((prev) => prev.filter((a) => a.id !== id));
        if (selectedArtifact?.id === id) {
          setSelectedArtifact(artifacts.find((a) => a.id !== id) || null);
        }
      }
    } catch (err) {
      console.warn('Delete failed:', err);
    }
  };

  const handleDownload = () => {
    if (!selectedArtifact) return;
    const blob = new Blob([selectedArtifact.content], {
      type: selectedArtifact.category === 'storyboard' ? 'text/markdown' : 'image/svg+xml',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedArtifact.title.replace(/\s+/g, '_')}.${selectedArtifact.category === 'storyboard' ? 'md' : 'svg'}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="cf-panel relative overflow-hidden rounded-2xl p-6 space-y-6 shadow-2xl transition-all"
      style={{
        background: 'rgba(6, 8, 18, 0.85)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
      }}
    >
      {/* Top Iridescent Edge Glow */}
      <div
        style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
          background: 'linear-gradient(90deg, transparent, #cf3fff 30%, #00f3ff 70%, transparent)',
        }}
      />

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToWorkspace}
            className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-white/[0.08] text-slate-300 hover:text-white transition-all shadow-md flex items-center gap-1.5 font-mono text-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-cyan-400" />
            <span>Workspace</span>
          </button>
          <div>
            <h2
              style={{
                fontFamily: "'Orbitron', monospace",
                fontSize: '15px',
                fontWeight: 800,
                letterSpacing: '0.04em',
                color: '#f8fafc',
              }}
            >
              CREATIVE STUDIO & VISION LAB
            </h2>
            <p className="text-xs text-slate-400 font-sans mt-0.5">
              Vector architectural topologies, UI concepts, posters, and engineering storyboards
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {savedSuccess && (
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-mono flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5" />
              Artifact Generated & Saved
            </span>
          )}
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 4 Cols: Controls & Artifact List */}
        <div className="lg:col-span-4 space-y-4">
          <div
            className="p-4 rounded-xl border space-y-4"
            style={{
              background: 'rgba(3, 4, 8, 0.7)',
              borderColor: 'rgba(255, 255, 255, 0.08)',
            }}
          >
            <div className="text-xs font-bold text-slate-200 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>Concept Generator</span>
            </div>

            {/* Workflow Category */}
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <button
                type="button"
                onClick={() => handleSelectCategory('architecture')}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  activeCategory === 'architecture'
                    ? 'border-cyan-400/60 bg-cyan-950/40 text-cyan-300 shadow-[0_0_10px_rgba(0,243,255,0.2)]'
                    : 'border-white/[0.06] bg-slate-900/40 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="font-bold">Architecture</div>
                <div className="text-[10px] text-slate-500">System topology</div>
              </button>

              <button
                type="button"
                onClick={() => handleSelectCategory('poster')}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  activeCategory === 'poster'
                    ? 'border-purple-400/60 bg-purple-950/40 text-purple-300 shadow-[0_0_10px_rgba(207,63,255,0.2)]'
                    : 'border-white/[0.06] bg-slate-900/40 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="font-bold">Poster & UI</div>
                <div className="text-[10px] text-slate-500">Visual vectors</div>
              </button>

              <button
                type="button"
                onClick={() => handleSelectCategory('storyboard')}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  activeCategory === 'storyboard'
                    ? 'border-emerald-400/60 bg-emerald-950/40 text-emerald-300 shadow-[0_0_10px_rgba(0,255,153,0.2)]'
                    : 'border-white/[0.06] bg-slate-900/40 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="font-bold">Storyboard</div>
                <div className="text-[10px] text-slate-500">Engineering script</div>
              </button>

              <button
                type="button"
                onClick={() => handleSelectCategory('ui_concept')}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  activeCategory === 'ui_concept'
                    ? 'border-amber-400/60 bg-amber-950/40 text-amber-300 shadow-[0_0_10px_rgba(255,170,0,0.2)]'
                    : 'border-white/[0.06] bg-slate-900/40 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="font-bold">UI Wireframe</div>
                <div className="text-[10px] text-slate-500">Component layout</div>
              </button>
            </div>

            <form onSubmit={handleGenerate} className="space-y-3">
              <div>
                <label className="text-[11px] font-mono text-slate-400 block mb-1">Concept Objective / Prompt:</label>
                <textarea
                  rows={3}
                  value={promptInput}
                  onChange={(e) => setPromptInput(e.target.value)}
                  placeholder="Describe architecture topology, UI poster, or system storyboard..."
                  className="w-full text-slate-200 rounded-xl p-3 text-xs font-sans focus:outline-none focus:border-purple-400"
                  style={{
                    background: 'rgba(6, 8, 18, 0.9)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={isGenerating}
                className="w-full py-2.5 rounded-xl text-white font-mono font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg"
                style={{
                  background: 'linear-gradient(135deg, #cf3fff, #4aaeff)',
                }}
              >
                {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                Generate Creative Artifact
              </button>
            </form>
          </div>

          {/* Artifact Library List */}
          <div
            className="p-4 rounded-xl border space-y-3"
            style={{
              background: 'rgba(3, 4, 8, 0.7)',
              borderColor: 'rgba(255, 255, 255, 0.08)',
            }}
          >
            <div className="flex items-center justify-between text-xs font-bold text-slate-200">
              <span>Saved Studio Artifacts</span>
              <span className="text-[10px] font-mono text-slate-500">{artifacts.length} items</span>
            </div>

            <div className="space-y-1.5 max-h-60 overflow-y-auto font-mono text-xs">
              {artifacts.length === 0 ? (
                <div className="text-slate-500 text-xs py-4 text-center">No studio artifacts created yet.</div>
              ) : (
                artifacts.map((art) => (
                  <div
                    key={art.id}
                    onClick={() => setSelectedArtifact(art)}
                    className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      selectedArtifact?.id === art.id
                        ? 'border-purple-400/50 bg-purple-950/30 text-purple-200'
                        : 'border-white/[0.05] bg-slate-900/40 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="truncate pr-2">
                      <div className="font-semibold truncate text-[11px]">{art.title}</div>
                      <div className="text-[9px] text-slate-500 uppercase">{art.category}</div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(art.id);
                      }}
                      className="p-1 text-slate-500 hover:text-rose-400 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right 8 Cols: Interactive Canvas Viewer */}
        <div
          className="lg:col-span-8 p-5 rounded-xl border shadow-2xl space-y-4"
          style={{
            background: 'rgba(3, 4, 8, 0.7)',
            borderColor: 'rgba(255, 255, 255, 0.08)',
          }}
        >
          <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
            <div>
              <h3 className="text-sm font-bold text-slate-200">
                {selectedArtifact?.title || 'Interactive Canvas Workspace'}
              </h3>
              <p className="text-xs text-slate-400">
                Category: <span className="font-mono text-purple-400 uppercase">{selectedArtifact?.category || activeCategory}</span>
              </p>
            </div>

            {selectedArtifact && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownload}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-white/[0.08] text-slate-300 font-mono text-xs flex items-center gap-1.5 transition-all shadow-md"
                >
                  <Download className="w-3.5 h-3.5 text-cyan-400" />
                  Export
                </button>
              </div>
            )}
          </div>

          {/* Canvas Render Frame */}
          <div
            className="w-full min-h-[480px] rounded-xl border p-4 flex items-center justify-center overflow-auto shadow-inner"
            style={{
              background: '#030408',
              borderColor: 'rgba(255, 255, 255, 0.06)',
            }}
          >
            {selectedArtifact ? (
              selectedArtifact.category === 'storyboard' ? (
                <div
                  className="w-full text-left font-sans text-slate-200 text-sm whitespace-pre-wrap p-5 rounded-xl border leading-relaxed"
                  style={{
                    background: 'rgba(6, 8, 18, 0.9)',
                    borderColor: 'rgba(255, 255, 255, 0.08)',
                  }}
                >
                  {selectedArtifact.content}
                </div>
              ) : (
                <div
                  className="w-full flex items-center justify-center"
                  dangerouslySetInnerHTML={{ __html: selectedArtifact.content }}
                />
              )
            ) : (
              <div className="text-center space-y-2 text-slate-500">
                <Palette className="w-8 h-8 mx-auto text-slate-600" />
                <p className="text-xs font-mono">Select or generate an artifact from the panel on the left.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
