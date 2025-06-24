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
            fontSize: 36,
            fontWeight: 'bold',
            color: '#fff',
            marginBottom: 30,
          }}
        >
          Choose your link format
        </div>
        
        <div
          style={{
            display: 'flex',
            gap: 50,
            alignItems: 'flex-start',
            justifyContent: 'center',
          }}
        >
          {/* Enhanced Preview Example */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 15,
            }}
          >
            <div
              style={{
                width: 480,
                height: 320,
                background: '#000',
                borderRadius: 16,
                overflow: 'hidden',
                border: '3px solid #2d2b35',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
              }}
            >
              <img 
                src={`${baseUrl}/apple_messages_farlinker.png`}
                width={480}
                height={320}
                style={{
                  objectFit: 'contain',
                }}
                alt="Enhanced preview example"
              />
            </div>
            <div
              style={{
                fontSize: 20,
                color: '#fff',
                textAlign: 'center',
                fontWeight: '600',
              }}
            >
              Enhanced Preview
            </div>
            <div
              style={{
                fontSize: 16,
                color: '#9ca3af',
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
              gap: 15,
            }}
          >
            <div
              style={{
                width: 480,
                height: 320,
                background: '#000',
                borderRadius: 16,
                overflow: 'hidden',
                border: '3px solid #2d2b35',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
              }}
            >
              <img 
                src={`${baseUrl}/apple_messages_farlinker_standard.png`}
                width={480}
                height={320}
                style={{
                  objectFit: 'contain',
                }}
                alt="Standard preview example"
              />
            </div>
            <div
              style={{
                fontSize: 20,
                color: '#fff',
                textAlign: 'center',
                fontWeight: '600',
              }}
            >
              Standard Preview
            </div>
            <div
              style={{
                fontSize: 16,
                color: '#9ca3af',
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
  <meta property="fc:frame:image:aspect_ratio" content="1.91:1" />
  <meta property="fc:frame:button:1" content="Copy Enhanced Link" />
  <meta property="fc:frame:button:1:action" content="post" />
  <meta property="fc:frame:button:2" content="Copy Standard Link" />
  <meta property="fc:frame:button:2:action" content="post" />
  <meta property="fc:frame:post_url" content="${baseUrl}/api/actions/process?castId=${castId}&fid=${fid}" />
  <meta property="fc:frame:image:tap_action" content="post" />
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