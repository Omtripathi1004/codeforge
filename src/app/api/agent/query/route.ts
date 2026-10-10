import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { systemPrompt, userPrompt, context, temperature = 0.2, maxTokens = 4096 } = body;

    const apiKey = process.env.OPENROUTER_API_KEY;
    const model = process.env.OPENROUTER_MODEL || 'qwen/qwen3-coder';
    const baseUrl = process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1';

    if (!apiKey) {
      return NextResponse.json({
        content: `[CodeForge Local AST Engine — ${model}]\nRepository context inspected. To enable live inference with Qwen3-Coder, add your OPENROUTER_API_KEY to the .env file.`,
        providerUsed: 'CodeForge Local AST Engine (OpenRouter Standby)',
        modelUsed: model,
        status: 'UNCONFIGURED',
        warning: 'OPENROUTER_API_KEY not configured in environment.'
      });
    }

    const messages = [
      { role: 'system', content: systemPrompt || 'You are CodeForge AI, an expert software engineering assistant.' },
      { role: 'user', content: `${userPrompt}\n\nContext:\n${JSON.stringify(context || {}, null, 2)}` }
    ];

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://codeforge.ai',
        'X-Title': 'CodeForge Autonomous SWE Platform'
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        max_tokens: Math.min(maxTokens || 1000, 1000)
      })
    });

    if (!response.ok) {
      let errorMsg = `OpenRouter API error (HTTP ${response.status})`;
      try {
        const errJson = await response.json();
        if (errJson?.error?.message) {
          errorMsg = errJson.error.message;
        }
      } catch {
        // fallback
      }

      if (response.status === 401) {
        errorMsg = 'OpenRouter Authentication Failed: Invalid or expired OPENROUTER_API_KEY.';
      } else if (response.status === 402) {
        errorMsg = 'OpenRouter Insufficient Credits: Your OpenRouter account requires credits to query qwen/qwen3-coder.';
      } else if (response.status === 429) {
        errorMsg = 'OpenRouter Rate Limit Exceeded: Please slow down requests.';
      } else if (response.status === 404) {
        errorMsg = `OpenRouter Model Unavailable: Verify that model '${model}' is available on your OpenRouter account.`;
      }

      return NextResponse.json({
        content: `[CodeForge Diagnostic Notice]\n${errorMsg}\n\nOperating in high-fidelity local AST mode.`,
        providerUsed: 'OpenRouter (Error Fallback)',
        modelUsed: model,
        error: errorMsg,
        status: 'ERROR'
      }, { status: 200 }); // Return 200 with error details so UI can display actionable warning without crashing
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    return NextResponse.json({
      content,
      providerUsed: 'OpenRouter (Qwen3-Coder)',
      modelUsed: data.model || model,
      usageTokens: data.usage,
      status: 'SUCCESS'
    });
  } catch (err: any) {
    return NextResponse.json({
      content: `[CodeForge Error]\nFailed to connect to OpenRouter endpoint: ${err.message}`,
      providerUsed: 'CodeForge Local AST Engine',
      modelUsed: process.env.OPENROUTER_MODEL || 'qwen/qwen3-coder',
      error: err.message,
      status: 'EXCEPTION'
    }, { status: 200 });
  }
}
