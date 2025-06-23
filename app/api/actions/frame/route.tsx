import { NextRequest } from 'next/server';
import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  // Get the host for absolute image URLs
  const host = request.headers.get('host') || 'www.farlinker.xyz';
  const protocol = host.includes('localhost') ? 'http' : 'https';
  const baseUrl = `${protocol}://${host}`;
  
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
          padding: '40px',
        }}
      >
        <div
          style={{
            fontSize: 40,
            fontWeight: 'bold',
            color: '#fff',
            marginBottom: 20,
          }}
        >
          Choose your link format
        </div>
        
        <div
          style={{
            display: 'flex',
            gap: 40,
            alignItems: 'center',
            marginBottom: 20,
          }}
        >
          {/* Enhanced Preview Example */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <div
              style={{
                width: 400,
                height: 240,
                background: '#000',
                borderRadius: 12,
                overflow: 'hidden',
                border: '2px solid #2d2b35',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <img 
                src={`${baseUrl}/apple_messages_farlinker.png`}
                width={400}
                height={240}
                style={{
                  objectFit: 'contain',
                }}
              />
            </div>
            <div
              style={{
                fontSize: 16,
                color: '#9ca3af',
                textAlign: 'center',
              }}
            >
              Enhanced Preview
            </div>
            <div
              style={{
                fontSize: 14,
                color: '#6b7280',
                textAlign: 'center',
              }}
            >
              Similar to Twitter previews
            </div>
          </div>
          
          {/* Standard Preview Example */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <div
              style={{
                width: 400,
                height: 240,
                background: '#000',
                borderRadius: 12,
                overflow: 'hidden',
                border: '2px solid #2d2b35',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <img 
                src={`${baseUrl}/apple_messages_farlinker_standard.png`}
                width={400}
                height={240}
                style={{
                  objectFit: 'contain',
                }}
              />
            </div>
            <div
              style={{
                fontSize: 16,
                color: '#9ca3af',
                textAlign: 'center',
              }}
            >
              Standard Preview
            </div>
            <div
              style={{
                fontSize: 14,
                color: '#6b7280',
                textAlign: 'center',
              }}
            >
              Similar to website previews
            </div>
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
  <meta property="fc:frame:button:1" content="Copy Enhanced Link" />
  <meta property="fc:frame:button:2" content="Copy Standard Link" />
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