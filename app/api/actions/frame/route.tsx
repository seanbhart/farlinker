import { NextRequest } from 'next/server';
import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#17101f',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            fontSize: 48,
            fontWeight: 'bold',
            color: '#fff',
            marginBottom: 20,
          }}
        >
          Farlinker
        </div>
        <div
          style={{
            fontSize: 24,
            color: '#9ca3af',
            marginBottom: 40,
            textAlign: 'center',
          }}
        >
          Choose your link format
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 20,
            alignItems: 'center',
          }}
        >
          <div
            style={{
              background: '#8b5cf6',
              color: '#fff',
              padding: '12px 24px',
              borderRadius: 8,
              fontSize: 18,
            }}
          >
            Enhanced Preview (with images)
          </div>
          <div
            style={{
              background: '#6366f1',
              color: '#fff',
              padding: '12px 24px',
              borderRadius: 8,
              fontSize: 18,
            }}
          >
            Standard Preview (text only)
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('[Farlinker Frame] Received:', JSON.stringify(body, null, 2));
    
    // Get cast ID from URL
    const { searchParams } = new URL(request.url);
    const castId = searchParams.get('castId') || '';
    const fid = searchParams.get('fid') || '';
    
    // Get the host
    const host = request.headers.get('host') || 'www.farlinker.xyz';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const baseUrl = `${protocol}://${host}`;
    
    // Generate the frame HTML
    const html = `<!DOCTYPE html>
<html>
<head>
  <meta property="fc:frame" content="vNext" />
  <meta property="fc:frame:image" content="${baseUrl}/api/actions/frame?castId=${castId}&fid=${fid}" />
  <meta property="fc:frame:button:1" content="📋 Copy Enhanced Link" />
  <meta property="fc:frame:button:2" content="📄 Copy Standard Link" />
  <meta property="fc:frame:post_url" content="${baseUrl}/api/actions/process?castId=${castId}&fid=${fid}" />
  <meta property="og:title" content="Farlinker - Choose Link Format" />
  <meta property="og:image" content="${baseUrl}/api/actions/frame?castId=${castId}&fid=${fid}" />
</head>
<body>
  <h1>Choose your Farlinker format</h1>
</body>
</html>`;
    
    return new Response(html, {
      headers: {
        'Content-Type': 'text/html',
      },
    });
  } catch (error) {
    console.error('[Farlinker Frame] Error:', error);
    return new Response('Error processing frame', { status: 400 });
  }
}