import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/server/auth';
import { Database } from '@/lib/server/db';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const auth = authenticateRequest(req);
    const body = await req.json();
    const { prompt, category = 'chat', modelPreference, history = [] } = body;

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    const baseUrl = process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1';

    // Model selection: support Gemini, Qwen, or DeepSeek
    let model = 'google/gemini-2.5-flash';
    if (modelPreference === 'qwen') model = 'qwen/qwen3-coder';
    else if (modelPreference === 'deepseek') model = 'deepseek/deepseek-chat';
    else if (modelPreference === 'gemini') model = 'google/gemini-2.5-flash';

    let systemPrompt = '';
    if (category === 'story') {
      systemPrompt = `You are an acclaimed creative novelist and narrative architect. Craft immersive, atmospheric, cinematic stories with vivid character development, dialogue, and gripping emotional pacing. Use markdown formatting with expressive titles and scene dividers.`;
    } else if (category === 'joke') {
      systemPrompt = `You are a legendary comedy writer and witty stand-up comedian. Create punchy, laugh-out-loud humor, witty tech observations, sharp sarcasm, hilarious jokes, and one-liners. Keep the delivery tight, clever, and engaging.`;
    } else if (category === 'art') {
      systemPrompt = `You are a digital artist and generative SVG designer. When given a theme or prompt:
1. Provide a stunning, self-contained raw SVG illustration enclosed in \`\`\`xml ... \`\`\` (use gradients, glow filters, viewBox="0 0 800 500").
2. Provide a photorealistic Midjourney v6 / DALL-E 3 image generation prompt with lighting, camera lens, and aesthetic styling.`;
    } else {
      systemPrompt = `You are Antigravity Creative AI — a brilliant, imaginative conversational companion. You excel at brainstorming wild concepts, writing poetry, scripting dialogue, storytelling, and freeform creative ideation. Answer engagingly with markdown formatting.`;
    }

    const messages = [
      { role: 'system', content: systemPrompt },
      ...history.slice(-4),
      { role: 'user', content: prompt }
    ];

    if (apiKey) {
      try {
        const response = await fetch(`${baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
            'HTTP-Referer': 'https://codeforge.ai',
            'X-Title': 'CodeForge Creative Studio'
          },
          body: JSON.stringify({
            model,
            messages,
            temperature: 0.8,
            max_tokens: 3000
          })
        });

        if (response.ok) {
          const data = await response.json();
          const content = data.choices?.[0]?.message?.content;
          if (content) {
            if (auth) {
              try {
                Database.saveStudioArtifact({
                  id: `art_${crypto.randomBytes(6).toString('hex')}`,
                  userId: auth.user.id,
                  title: prompt.slice(0, 40),
                  category: category === 'art' ? 'ui_concept' : 'storyboard',
                  prompt,
                  content,
                  createdAt: new Date().toISOString(),
                });
              } catch {}
            }
            return NextResponse.json({
              reply: content,
              modelUsed: model,
              category,
              provider: 'OpenRouter AI Engine'
            });
          }
        }
      } catch (apiErr) {
        console.warn('External AI call failed, falling back to built-in creative generator:', apiErr);
      }
    }

    // High quality intelligent fallback creative responses for each category
    let fallbackReply = '';
    if (category === 'joke') {
      const jokes = [
        `### Why do programmers prefer dark mode?\nBecause light attracts bugs! 🐛\n\n**Bonus joke:**\nA software engineer walks into a bar and orders 1 beer.\nThen orders 0 beers.\nThen orders 999999999 beers.\nThen orders a lizard.\nThen orders -1 beers.\nThen orders a sfdeljkfh.\n\nThe bartender pours each drink without issue.\n\nThen a real user walks in and asks where the restroom is. The entire bar catches fire and explodes! 💥`,
        `### The 3 Hardest Problems in Computer Science:\n1. Cache invalidation\n2. Naming things\n3. Off-by-one errors\n\n*Why did the developer go broke?*\nBecause they used up all their cache and couldn't resolve their merge conflicts! 😂`
      ];
      fallbackReply = jokes[Math.floor(Math.random() * jokes.length)];
    } else if (category === 'story') {
      fallbackReply = `## The Midnight Pulse: Neon Horizon 2088\n\nThe rain over Sector 9 didn't fall; it vibrated against the electromagnetic shield domes in iridescent sheets of cyan and magenta.\n\nKael adjusted his neural optic visor. The terminal in front of him wasn't running ordinary assembly code—it was transmitting pure consciousness packets. Across the void of the neural link, an ancient sub-routine stirred.\n\n*"Are you seeking creation, or escape?"* whispered the synthesizer in a harmonic frequency.\n\nKael leaned closer to the holographic console. *"Neither,"* he replied, keying in the decryption cipher. *"I'm here to build something that outlasts the machines."*\n\nThe core pulsed. A cascade of three-dimensional starlight illuminated the dark obsidian room, transforming raw data into pure imagination.`;
    } else if (category === 'art') {
      fallbackReply = `### Generative SVG Art & Midjourney Prompt\n\n\`\`\`xml\n<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450" width="100%" height="100%">\n  <defs>\n    <radialGradient id="cyberSun" cx="50%" cy="50%" r="50%">\n      <stop offset="0%" stop-color="#ffaa00"/>\n      <stop offset="60%" stop-color="#ff4466"/>\n      <stop offset="100%" stop-color="#030408" stop-opacity="0"/>\n    </radialGradient>\n    <linearGradient id="neonCyan" x1="0%" y1="0%" x2="100%" y2="100%">\n      <stop offset="0%" stop-color="#00f3ff"/>\n      <stop offset="100%" stop-color="#cf3fff"/>\n    </linearGradient>\n  </defs>\n  <rect width="800" height="450" fill="#030408"/>\n  <circle cx="400" cy="225" r="140" fill="url(#cyberSun)"/>\n  <!-- Cyberpunk Mountain Grid -->\n  <polygon points="400,120 180,380 620,380" fill="none" stroke="url(#neonCyan)" stroke-width="2.5"/>\n  <line x1="0" y1="380" x2="800" y2="380" stroke="#00f3ff" stroke-width="2"/>\n  <line x1="400" y1="380" x2="400" y2="450" stroke="#00f3ff" stroke-width="1.5" stroke-dasharray="4,4"/>\n</svg>\n\`\`\`\n\n**Midjourney v6 Prompt:**\n> \`/imagine prompt: Neo-Tokyo cyberpunk stargate floating in quantum nebula, iridescent particle fluid dynamics, cinematic volumetric lighting, 8k octane render, hyper-detailed, neon cyan and magenta accents --ar 16:9 --style raw\``;
    } else {
      fallbackReply = `I am your **Antigravity Creative Companion**. Whether you want to write an epic sci-fi screenplay, tell side-splitting tech jokes, compose poetry, or architect visual aesthetics, I am ready!\n\nWhat would you like us to create right now? Choose an inspiration or prompt me freely!`;
    }

    return NextResponse.json({
      reply: fallbackReply,
      modelUsed: 'Antigravity Creative Engine (Autonomous Fallback)',
      category,
      provider: 'CodeForge Creative Studio'
    });

  } catch (err: any) {
    console.error('Creative chat API error:', err);
    return NextResponse.json({
      reply: "The creative engine encountered a temporary hiccup, but your imagination is boundless. Let's try another creative idea!",
      error: err.message
    }, { status: 500 });
  }
}
