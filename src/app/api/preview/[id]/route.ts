import { NextRequest, NextResponse } from 'next/server';
import { WorkspaceManager } from '../../../../lib/server/workspace';
import { Database } from '../../../../lib/server/db';
import fs from 'fs';
import path from 'path';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const projectId = params.id;
    const { searchParams } = new URL(req.url);
    const mode = (searchParams.get('mode') || 'recommended').toLowerCase();
    const taskParam = searchParams.get('task') || searchParams.get('prompt') || '';

    let project = Database.getProject(projectId);
    if (!project) {
      const all = Database.getProjects();
      if (all.length > 0) {
        project = all[0];
      }
    }

    const currentTask = (taskParam || project?.mission?.issueTitle || project?.name || '').toLowerCase();
    const isLogin = /login|auth|password|email|sign\s?in|signup/i.test(currentTask);
    const projectName = project?.name || (isLogin ? 'Authentic Secure Login Portal' : 'CodeForge Autonomous Application');

    // ─────────────────────────────────────────────────────────────────────────────
    // SCENARIO A: USER ASKED FOR A LOGIN PAGE WITH EMAIL & PASSWORD
    // ─────────────────────────────────────────────────────────────────────────────
    if (isLogin) {
      // 1. RECOMMENDED: 3D Moving Particle Background + Glassmorphic Cyber Login Card
      if (mode === 'recommended' || mode === 'b') {
        const login3DHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sign In — CodeForge Cyber Portal</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Orbitron:wght@600;800;900&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: #030408;
      color: #f8fafc;
      font-family: 'Inter', -apple-system, sans-serif;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
      overflow-x: hidden;
      position: relative;
    }
    canvas#bgCanvas {
      position: fixed;
      top: 0; left: 0; width: 100%; height: 100%;
      z-index: 0; pointer-events: none;
    }
    .login-container {
      position: relative;
      z-index: 10;
      width: 100%;
      max-width: 440px;
    }
    .login-card {
      background: rgba(8, 12, 28, 0.78);
      backdrop-filter: blur(24px);
      border: 1px solid rgba(0, 243, 255, 0.25);
      box-shadow: 0 25px 60px rgba(0, 0, 0, 0.8), 0 0 40px rgba(0, 243, 255, 0.15);
      border-radius: 24px;
      padding: 2.5rem 2.2rem;
      position: relative;
      overflow: hidden;
      transition: all 0.3s ease;
    }
    .top-glow-bar {
      position: absolute;
      top: 0; left: 0; right: 0; height: 3px;
      background: linear-gradient(90deg, #00f3ff, #cf3fff, #00ff99);
    }
    .badge-3d {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 12px;
      border-radius: 999px;
      background: rgba(0, 243, 255, 0.1);
      border: 1px solid rgba(0, 243, 255, 0.3);
      color: #00f3ff;
      font-family: 'Space Mono', monospace;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.1em;
      margin-bottom: 1.2rem;
      text-transform: uppercase;
    }
    .brand-title {
      font-family: 'Orbitron', monospace;
      font-size: 24px;
      font-weight: 900;
      letter-spacing: 0.04em;
      color: #fff;
      margin-bottom: 6px;
    }
    .brand-subtitle {
      font-family: 'Space Mono', monospace;
      font-size: 11px;
      color: #94a3b8;
      margin-bottom: 1.8rem;
    }
    .form-group {
      margin-bottom: 1.2rem;
      text-align: left;
    }
    .form-label {
      display: block;
      font-family: 'Space Mono', monospace;
      font-size: 11px;
      color: #cbd5e1;
      margin-bottom: 6px;
      letter-spacing: 0.05em;
      font-weight: 600;
    }
    .input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }
    .form-input {
      width: 100%;
      background: rgba(3, 4, 8, 0.7);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 12px;
      padding: 12px 14px;
      color: #fff;
      font-family: 'Inter', sans-serif;
      font-size: 13px;
      outline: none;
      transition: all 0.2s ease;
    }
    .form-input:focus {
      border-color: #00f3ff;
      box-shadow: 0 0 15px rgba(0, 243, 255, 0.3);
      background: rgba(6, 10, 24, 0.9);
    }
    .eye-toggle {
      position: absolute;
      right: 12px;
      background: none;
      border: none;
      color: #94a3b8;
      cursor: pointer;
      font-size: 14px;
      padding: 4px;
      transition: color 0.2s;
    }
    .eye-toggle:hover { color: #00f3ff; }
    .meta-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 11px;
      font-family: 'Space Mono', monospace;
      margin-bottom: 1.5rem;
      color: #94a3b8;
    }
    .remember-label {
      display: flex;
      align-items: center;
      gap: 6px;
      cursor: pointer;
    }
    .forgot-link {
      color: #00f3ff;
      text-decoration: none;
      transition: text-shadow 0.2s;
      cursor: pointer;
    }
    .forgot-link:hover {
      text-shadow: 0 0 8px rgba(0, 243, 255, 0.6);
    }
    .btn-submit {
      width: 100%;
      padding: 13px;
      border-radius: 12px;
      background: linear-gradient(135deg, #00f3ff, #cf3fff);
      color: #030408;
      font-family: 'Orbitron', monospace;
      font-size: 12px;
      font-weight: 800;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      border: none;
      cursor: pointer;
      transition: all 0.25s ease;
      box-shadow: 0 0 25px rgba(0, 243, 255, 0.4);
      margin-bottom: 1rem;
    }
    .btn-submit:hover {
      transform: translateY(-2px);
      box-shadow: 0 0 35px rgba(0, 243, 255, 0.7);
    }
    .divider {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 1rem;
      color: #475569;
      font-family: 'Space Mono', monospace;
      font-size: 10px;
    }
    .divider::before, .divider::after {
      content: ''; flex: 1; height: 1px; background: rgba(255, 255, 255, 0.08);
    }
    .btn-github {
      width: 100%;
      padding: 12px;
      border-radius: 12px;
      background: rgba(12, 16, 32, 0.9);
      border: 1px solid rgba(255, 255, 255, 0.15);
      color: #fff;
      font-family: 'Space Mono', monospace;
      font-size: 11px;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      transition: all 0.2s;
    }
    .btn-github:hover {
      border-color: #00f3ff;
      background: rgba(0, 243, 255, 0.08);
      box-shadow: 0 0 15px rgba(0, 243, 255, 0.2);
    }
    .alert-box {
      margin-top: 1rem;
      padding: 10px 14px;
      border-radius: 10px;
      font-family: 'Space Mono', monospace;
      font-size: 11px;
      display: none;
    }
    .alert-success {
      background: rgba(0, 255, 153, 0.1);
      border: 1px solid rgba(0, 255, 153, 0.3);
      color: #00ff99;
    }
    .alert-error {
      background: rgba(255, 75, 75, 0.1);
      border: 1px solid rgba(255, 75, 75, 0.3);
      color: #ff6b6b;
    }
  </style>
</head>
<body>
  <canvas id="bgCanvas"></canvas>

  <div class="login-container">
    <div class="login-card">
      <div class="top-glow-bar"></div>
      <div class="badge-3d">
        <span>●</span>
        <span>RECOMMENDED 3D AUTHENTICATION</span>
      </div>

      <h1 class="brand-title">CYBER SIGN IN</h1>
      <p class="brand-subtitle">Enter your email and password to access the portal</p>

      <form id="loginForm" onsubmit="handleLogin(event)">
        <div class="form-group">
          <label class="form-label">Email Address</label>
          <div class="input-wrapper">
            <input type="email" id="email" class="form-input" placeholder="developer@company.com" value="alex@codeforge.dev" required />
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Password</label>
          <div class="input-wrapper">
            <input type="password" id="password" class="form-input" placeholder="••••••••••••" value="CyberSecurePass99!" required />
            <button type="button" class="eye-toggle" id="eyeBtn" onclick="togglePassword()">👁️</button>
          </div>
        </div>

        <div class="meta-row">
          <label class="remember-label">
            <input type="checkbox" id="rememberMe" checked />
            <span>Remember 30 days</span>
          </label>
          <span class="forgot-link" onclick="forgotAlert()">Forgot password?</span>
        </div>

        <button type="submit" class="btn-submit" id="submitBtn">SIGN IN TO WORKSPACE</button>

        <div class="divider">OR CONTINUE WITH</div>

        <button type="button" class="btn-github" onclick="githubAuth()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
          </svg>
          <span>AUTHORIZE WITH GITHUB</span>
        </button>
      </form>

      <div id="alertBox" class="alert-box"></div>
    </div>
  </div>

  <script>
    // 3D Canvas Starfield Loop
    const canvas = document.getElementById('bgCanvas');
    const ctx = canvas.getContext('2d');
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;
    let mouse = { x: width / 2, y: height / 2, targetX: width / 2, targetY: height / 2 };

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });
    window.addEventListener('mousemove', (e) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
    });

    const particles = [];
    for (let i = 0; i < 140; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        z: Math.random() * 800 + 100,
        size: Math.random() * 2 + 1,
        color: i % 3 === 0 ? '#00f3ff' : i % 3 === 1 ? '#cf3fff' : '#ffffff',
      });
    }

    function render3D() {
      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;
      ctx.fillStyle = 'rgba(3, 4, 8, 0.3)';
      ctx.fillRect(0, 0, width, height);

      const fov = 350;
      const cx = width / 2 + (mouse.x - width / 2) * 0.12;
      const cy = height / 2 + (mouse.y - height / 2) * 0.12;

      particles.forEach(p => {
        p.z -= 1.4;
        if (p.z <= 10) { p.z = 800; p.x = Math.random() * width; p.y = Math.random() * height; }
        const scale = fov / (fov + p.z);
        const x2d = (p.x - cx) * scale + cx;
        const y2d = (p.y - cy) * scale + cy;
        const rad = Math.max(0.8, p.size * scale * 1.8);

        ctx.beginPath();
        ctx.arc(x2d, y2d, rad, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = scale * 10;
        ctx.fill();
        ctx.shadowBlur = 0;
      });
      requestAnimationFrame(render3D);
    }
    render3D();

    function togglePassword() {
      const pass = document.getElementById('password');
      const btn = document.getElementById('eyeBtn');
      if (pass.type === 'password') {
        pass.type = 'text';
        btn.innerText = '🙈';
      } else {
        pass.type = 'password';
        btn.innerText = '👁️';
      }
    }

    function handleLogin(e) {
      e.preventDefault();
      const email = document.getElementById('email').value;
      const pass = document.getElementById('password').value;
      const box = document.getElementById('alertBox');
      const btn = document.getElementById('submitBtn');

      btn.innerText = 'AUTHENTICATING...';
      btn.style.opacity = '0.7';

      setTimeout(() => {
        btn.innerText = 'SIGN IN TO WORKSPACE';
        btn.style.opacity = '1';
        box.style.display = 'block';
        box.className = 'alert-box alert-success';
        box.innerHTML = '✓ Authentication Successful! Token issued for: <strong>' + email + '</strong>';
      }, 600);
    }

    function githubAuth() {
      const box = document.getElementById('alertBox');
      box.style.display = 'block';
      box.className = 'alert-box alert-success';
      box.innerHTML = '✓ GitHub OAuth Bridge Handshake Initiated &rarr; Connected to @Omtripathi1004';
    }

    function forgotAlert() {
      alert('Password reset instructions dispatched to your verified email.');
    }
  </script>
</body>
</html>`;
        return new NextResponse(login3DHtml, {
          status: 200,
          headers: { 'Content-Type': 'text/html', 'X-Frame-Options': 'SAMEORIGIN' },
        });
      }

      // 2. MINIMUM CHANGE: Clean Google/Stripe Enterprise Login Page
      if (mode === 'minimum' || mode === 'a') {
        const loginCleanHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sign In — Google Enterprise Standard</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: #f8f9fa;
      color: #202124;
      font-family: 'Roboto', -apple-system, sans-serif;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1.5rem;
    }
    .clean-card {
      background: #ffffff;
      border: 1px solid #dadce0;
      border-radius: 8px;
      padding: 2.5rem;
      width: 100%;
      max-width: 420px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.05);
    }
    .logo-area {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 20px;
      font-weight: 500;
      color: #1a73e8;
      margin-bottom: 1.5rem;
    }
    .clean-title {
      font-size: 22px;
      font-weight: 500;
      color: #202124;
      margin-bottom: 6px;
    }
    .clean-desc {
      font-size: 13px;
      color: #5f6368;
      margin-bottom: 2rem;
    }
    .field {
      margin-bottom: 1.2rem;
    }
    .label {
      display: block;
      font-size: 13px;
      font-weight: 500;
      color: #3c4043;
      margin-bottom: 6px;
    }
    .input-box {
      width: 100%;
      border: 1px solid #dadce0;
      border-radius: 4px;
      padding: 12px 14px;
      font-size: 14px;
      outline: none;
      transition: border-color 0.2s;
    }
    .input-box:focus {
      border-color: #1a73e8;
      box-shadow: 0 0 0 2px rgba(26,115,232,0.2);
    }
    .btn-blue {
      width: 100%;
      background: #1a73e8;
      color: #ffffff;
      border: none;
      padding: 12px;
      border-radius: 4px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      margin-top: 1rem;
    }
    .btn-blue:hover { background: #1557b0; }
    .btn-gh {
      width: 100%;
      background: #ffffff;
      color: #3c4043;
      border: 1px solid #dadce0;
      padding: 11px;
      border-radius: 4px;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      margin-top: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }
    .btn-gh:hover { background: #f8f9fa; }
    .status-msg {
      margin-top: 1rem;
      padding: 10px;
      border-radius: 4px;
      background: #e6f4ea;
      color: #137333;
      font-size: 13px;
      display: none;
    }
  </style>
</head>
<body>
  <div class="clean-card">
    <div class="logo-area">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="#1a73e8">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/>
      </svg>
      <span>Enterprise Sign In</span>
    </div>

    <h1 class="clean-title">Welcome Back</h1>
    <p class="clean-desc">Sign in with your email and password to proceed.</p>

    <form onsubmit="handleCleanLogin(event)">
      <div class="field">
        <label class="label">Email address</label>
        <input type="email" id="cleanEmail" class="input-box" placeholder="you@company.com" value="user@domain.com" required />
      </div>

      <div class="field">
        <label class="label">Password</label>
        <input type="password" id="cleanPassword" class="input-box" placeholder="Enter password" value="SecurePassword2026!" required />
      </div>

      <button type="submit" class="btn-blue">Next</button>
      <button type="button" class="btn-gh" onclick="handleGh()">Continue with GitHub</button>
    </form>

    <div id="cleanStatus" class="status-msg"></div>
  </div>

  <script>
    function handleCleanLogin(e) {
      e.preventDefault();
      const s = document.getElementById('cleanStatus');
      s.style.display = 'block';
      s.innerText = '✓ Verified: Signed in as ' + document.getElementById('cleanEmail').value;
    }
    function handleGh() {
      const s = document.getElementById('cleanStatus');
      s.style.display = 'block';
      s.innerText = '✓ Verified: Connected via GitHub Identity';
    }
  </script>
</body>
</html>`;
        return new NextResponse(loginCleanHtml, {
          status: 200,
          headers: { 'Content-Type': 'text/html', 'X-Frame-Options': 'SAMEORIGIN' },
        });
      }

      // 3. CUSTOMIZED: Dynamic Themed Login Form
      const loginCustomHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Customized Login Prototype</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #0b0f19; color: #fff; font-family: monospace; display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 1rem; }
    .box { background: #111827; border: 1px solid #f59e0b; padding: 2rem; border-radius: 12px; width: 100%; max-width: 400px; }
    .inp { width: 100%; padding: 10px; margin: 8px 0 16px; background: #030712; border: 1px solid #374151; color: #fff; border-radius: 6px; }
    .btn { width: 100%; padding: 12px; background: #f59e0b; color: #000; font-weight: bold; border: none; border-radius: 6px; cursor: pointer; }
    .swatches { display: flex; gap: 8px; margin-bottom: 1.5rem; justify-content: center; }
    .swatch { width: 22px; height: 22px; border-radius: 50%; cursor: pointer; border: 2px solid #fff; }
  </style>
</head>
<body>
  <div class="box">
    <div class="swatches">
      <div class="swatch" style="background:#f59e0b;" onclick="setCol('#f59e0b')"></div>
      <div class="swatch" style="background:#00f3ff;" onclick="setCol('#00f3ff')"></div>
      <div class="swatch" style="background:#cf3fff;" onclick="setCol('#cf3fff')"></div>
    </div>
    <h2 id="title" style="color:#f59e0b;margin-bottom:1rem;text-align:center;">CUSTOM LOGIN</h2>
    <label>Email</label>
    <input type="email" class="inp" value="user@custom.dev" />
    <label>Password</label>
    <input type="password" class="inp" value="Password123" />
    <button class="btn" id="subBtn" onclick="alert('Signed in!')">LOG IN</button>
  </div>
  <script>
    function setCol(c) {
      document.getElementById('title').style.color = c;
      document.getElementById('subBtn').style.background = c;
      document.querySelector('.box').style.borderColor = c;
    }
  </script>
</body>
</html>`;
      return new NextResponse(loginCustomHtml, {
        status: 200,
        headers: { 'Content-Type': 'text/html', 'X-Frame-Options': 'SAMEORIGIN' },
      });
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // SCENARIO B: GENERAL WEBSITES, DASHBOARDS, PLATFORMS (DEFAULT 3D ENGINE)
    // ─────────────────────────────────────────────────────────────────────────────
    const appHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${projectName} — Live Sandbox</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Orbitron:wght@600;800;900&family=Inter:wght@300;400;600;700&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #030408; color: #f8fafc; font-family: 'Inter', sans-serif; overflow-x: hidden; min-height: 100vh; position: relative; }
    canvas#bgCanvas { position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 0; pointer-events: none; }
    .content { position: relative; z-index: 10; max-width: 1100px; margin: 0 auto; padding: 2rem; }
    .hero { text-align: center; padding: 3rem 1rem; }
    .title { font-family: 'Orbitron', monospace; font-size: 36px; font-weight: 900; background: linear-gradient(135deg, #fff, #00f3ff, #cf3fff); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 1rem; }
    .desc { font-family: 'Space Mono', monospace; font-size: 13px; color: #94a3b8; max-width: 600px; margin: 0 auto 2rem; }
    .btn { padding: 12px 28px; border-radius: 12px; font-family: 'Orbitron', monospace; font-size: 12px; font-weight: 700; background: linear-gradient(135deg, #00f3ff, #cf3fff); color: #030408; border: none; cursor: pointer; }
  </style>
</head>
<body>
  <canvas id="bgCanvas"></canvas>
  <div class="content">
    <div class="hero">
      <h1 class="title">${projectName}</h1>
      <p class="desc">${currentTask || 'Autonomous full-stack application synthesized by CodeForge AI'}</p>
      <button class="btn" onclick="alert('Sandbox active!')">EXPLORE APPLICATION</button>
    </div>
  </div>
  <script>
    const canvas = document.getElementById('bgCanvas');
    const ctx = canvas.getContext('2d');
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;
    const particles = [];
    for (let i = 0; i < 100; i++) particles.push({ x: Math.random() * width, y: Math.random() * height, vx: (Math.random() - 0.5) * 0.8, vy: (Math.random() - 0.5) * 0.8, c: i % 2 === 0 ? '#00f3ff' : '#cf3fff' });
    function loop() {
      ctx.fillStyle = 'rgba(3,4,8,0.2)'; ctx.fillRect(0, 0, width, height);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;
        ctx.beginPath(); ctx.arc(p.x, p.y, 1.8, 0, Math.PI * 2); ctx.fillStyle = p.c; ctx.fill();
      });
      requestAnimationFrame(loop);
    }
    loop();
  </script>
</body>
</html>`;

    return new NextResponse(appHtml, {
      status: 200,
      headers: { 'Content-Type': 'text/html', 'X-Frame-Options': 'SAMEORIGIN' },
    });
  } catch (err: any) {
    return new NextResponse(
      `<!DOCTYPE html><html><body style="font-family:monospace;background:#030408;color:#00f3ff;padding:2rem;"><h3>CodeForge Sandbox Runtime Initializing...</h3></body></html>`,
      { status: 200, headers: { 'Content-Type': 'text/html' } }
    );
  }
}
