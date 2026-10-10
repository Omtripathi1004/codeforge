import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/server/auth';
import { Database } from '@/lib/server/db';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const auth = authenticateRequest(req);
    const body = await req.json();
    const { prompt, aspectRatio = '1:1', style = 'cyberpunk', outputFormat = 'image' } = body;

    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    // Check server-side image generation credentials
    const apiKey = process.env.IMAGE_PROVIDER_API_KEY || process.env.OPENAI_API_KEY;

    // If an external image model API is configured, call the real provider
    if (apiKey) {
      try {
        const response = await fetch('https://api.openai.com/v1/images/generations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: 'dall-e-3',
            prompt: `${prompt}, high quality, ${style} aesthetic`,
            n: 1,
            size: aspectRatio === '16:9' ? '1792x1024' : '1024x1024',
            response_format: 'url',
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const imageUrl = data.data?.[0]?.url;

          // Save to Studio Artifact history if authenticated
          if (auth && imageUrl) {
            Database.saveStudioArtifact({
              id: `art_${crypto.randomBytes(6).toString('hex')}`,
              userId: auth.user.id,
              title: prompt.slice(0, 40),
              category: 'ui_concept',
              prompt,
              content: imageUrl,
              previewUrl: imageUrl,
              createdAt: new Date().toISOString(),
            });
          }

          return NextResponse.json({
            success: true,
            imageUrl,
            provider: 'OpenAI DALL-E 3',
            prompt,
            aspectRatio,
          });
        } else {
          const errData = await response.json().catch(() => ({}));
          return NextResponse.json({
            success: false,
            error: errData.error?.message || 'External image provider returned an error',
            status: 'PROVIDER_ERROR',
          }, { status: response.status });
        }
      } catch (err: any) {
        return NextResponse.json({
          success: false,
          error: `Failed to contact image provider: ${err.message}`,
          status: 'NETWORK_ERROR',
        }, { status: 502 });
      }
    }

    // Honest reporting when credentials are missing: Never fake or substitute stock assets
    return NextResponse.json({
      success: false,
      status: 'NOT_CONFIGURED',
      error: 'Image generation provider is not configured.',
      message: 'No active IMAGE_PROVIDER_API_KEY or OPENAI_API_KEY found in server environment variables. CodeForge never substitutes stock images or fabricated output.',
      setupInstructions: [
        '1. Obtain an API key from an image provider (e.g. OpenAI DALL-E 3 or Stability AI).',
        '2. Set IMAGE_PROVIDER_API_KEY=your_key_here in your server environment variables or .env file.',
        '3. Restart the server and retry generation.',
      ],
      supportedAlternatives: [
        'You can use Creative Studio Generative SVG Art mode (powered by the configured text model).',
      ],
    }, { status: 503 });

  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: err.message || 'Image generation endpoint error',
    }, { status: 500 });
  }
}
