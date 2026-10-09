# CodeForge — Autonomous Software Engineering Platform

[![Production Deployment](https://img.shields.io/badge/Production-Live%20on%20Vercel-00f3ff?style=for-the-badge&logo=vercel)](https://codeforge-engine.vercel.app/)
[![Hackathon](https://img.shields.io/badge/Hackathon-Nebius%20%C3%97%20NVIDIA%20Global%20AI-cf3fff?style=for-the-badge)](https://codeforge-engine.vercel.app/)
[![Model](https://img.shields.io/badge/LLM-Qwen3--Coder%20via%20OpenRouter-00ff99?style=for-the-badge)](https://openrouter.ai/)
[![License](https://img.shields.io/badge/License-MIT-ffaa00?style=for-the-badge)](LICENSE)

> **Live Production URL:** [https://codeforge-engine.vercel.app/](https://codeforge-engine.vercel.app/)

---

## ⚡ Overview

**CodeForge** is an autonomous Software Engineering (SWE) engine built for the **Nebius × NVIDIA Global AI Hackathon**. It features an **Active Theory** inspired 3D WebGL aesthetic (`#030408` obsidian void, particle physics, organic sculptural spine totem, and cylindrical 3D work carousel), paired with a multi-agent coding engine.

CodeForge inspects real codebases, formulates dual A/B architectural strategies, writes patches in an isolated test sandbox, dynamic self-repairs failed assertions, and cryptographically seals verified GitHub Pull Requests with SHA-256 evidence.

---

## 🌌 Active Theory 3D Work Showcase

Inspired by [Active Theory](https://activetheory.net/work), the frontend features:
- **3D Interactive Project Carousel**: High-performance cylindrical carousel with inertia drag physics, wheel gestures, and keyboard navigation.
- **Organic Iridescent Spine Totem**: 3D sculpted metallic vertebrae column undulating with dynamic lighting in WebGL.
- **Glitter & Particle Cloud**: Hundreds of multi-colored cosmic glitter particles drifting with mouse parallax.
- **Left HUD Filter Overlay**: *"WHAT ARE YOU LOOKING FOR?"* with deep links to categorized missions and AI Copilot.
- **Glassmorphic HUD Navbar**: Floating capsule with frosted glass (`backdrop-filter: blur(20px)`).

---

## 🏗️ 6-Stage Autonomous Engineering Architecture

```
                                  [ REPOSITORY INGESTION ]
                                             │
                                             ▼
                             [ STAGE 1: REPOSITORY INTELLIGENCE ]
                             AST parsing, dependency graphs & models
                                             │
                                             ▼
                             [ STAGE 2: DUAL A/B SOLUTION DUEL ]
                   Option A: Conservative Lock   vs   Option B: Redis Mutex
                                             │
                                             ▼
                                [ STAGE 3: CODING AGENT ]
                              OpenRouter Qwen3-Coder synthesis
                                             │
                                             ▼
                            [ STAGE 4: CGROUPS-V2 SANDBOX RUNNER ]
                            4096MB memory quota, quarantined network
                                             │
                         ┌───────────────────┴───────────────────┐
                         ▼                                       ▼
                  [ TESTS PASS ]                         [ TESTS FAIL ]
                         │                                       │
                         │                                       ▼
                         │                        [ STAGE 5: BOUNDED SELF-REPAIR ]
                         │                        AST dynamic patch iteration (max 3)
                         │                                       │
                         └───────────────────┬───────────────────┘
                                             │
                                             ▼
                              [ STAGE 6: CRYPTOGRAPHIC PR AGENT ]
                             SHA-256 sealed commit & GitHub PR #143
```

---

## 🌟 Featured Autonomous Missions

1. **Nexus Auth Platform — Concurrency Mutex**
   - *Problem*: High-concurrency mobile app launch token storms causing 401 Unauthorized race conditions.
   - *Solution*: Single-flight `asyncio.Lock` + Redis pipeline mutex with 15-second grace window and RFC 6749 Token Family rotation.
   - *Verification*: 18/18 Passing regression tests, 0% regressions.

2. **Nebius Hyperscale AI — Vector Shard Deadlock Resolver**
   - *Problem*: Lock-ordering inversion across distributed HNSW partition nodes during real-time indexing.
   - *Solution*: Two-phase distributed commit protocol with bounded self-repair cycle.
   - *Verification*: 24/24 Passing tests.

3. **CodeForge Workspace — CRDT AST Self-Repair Engine**
   - *Problem*: Multi-agent branch state divergence causing syntax degradation.
   - *Solution*: Autonomous AST parser injecting structural transforms while preserving code comments and docstrings.
   - *Verification*: 12/12 Passing tests with zero AST loss.

4. **Cryptographic Shield — High-Entropy Secret Leak & Injection Verifier**
   - *Problem*: Accidental leakage of API credentials and SQL injection surfaces.
   - *Solution*: Pre-commit AST scanner and cryptographic SHA-256 seal.
   - *Verification*: CVE-Zero compliance.

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, `@react-three/fiber`, `@react-three/drei`, Three.js, Lucide Icons, Monaco Editor Diff Viewer.
- **Backend**: FastAPI, Python 3.12, Uvicorn, SQLAlchemy, SQLite/PostgreSQL, Redis.
- **AI Core**: Qwen3-Coder via OpenRouter, Bounded Self-Repair Loop.
- **Sandbox**: Linux `cgroups-v2` container isolation, headless Playwright assertion runner.
- **Deployment**: Vercel Serverless Edge, GitHub Actions CI/CD.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Python 3.10+
- OpenRouter API Key (Optional for local AI synthesis)

### Installation

1. **Clone repository:**
   ```bash
   git clone https://github.com/Omtripathi1004/codeforge.git
   cd codeforge
   ```

2. **Install frontend dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment:**
   ```bash
   cp .env.example .env
   ```

4. **Start local development servers:**
   ```bash
   # Frontend (Next.js)
   npm run dev

   # Backend (FastAPI - optional for local python runner)
   cd backend
   pip install -r requirements.txt
   python run.py
   ```

5. **Open in browser:**
   ```
   http://localhost:3000
   ```

---

## 🏆 Hackathon Credits

Built for the **Nebius × NVIDIA Global AI Hackathon** by **Om Sharma** ([@Omtripathi1004](https://github.com/Omtripathi1004)).
Live demo available at [codeforge-engine.vercel.app](https://codeforge-engine.vercel.app/).
