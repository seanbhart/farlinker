import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  // Return the initial frame for GET requests
  const host = request.headers.get('host') || 'www.farlinker.xyz';
  const protocol = host.includes('localhost') ? 'http' : 'https';
  const baseUrl = `${protocol}://${host}`;
  
  // Get cast ID from URL params
  const { searchParams } = new URL(request.url);
  const castId = searchParams.get('castId') || '';
  const formattedHash = castId.startsWith('0x') ? castId : `0x${castId}`;
  
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta property="fc:frame" content="vNext" />
  <meta property="fc:frame:image" content="${baseUrl}/farlinker-options.png" />
  <meta property="fc:frame:image:aspect_ratio" content="1.91:1" />
  <meta property="fc:frame:button:1" content="Copy Enhanced Link" />
  <meta property="fc:frame:button:1:action" content="link" />
  <meta property="fc:frame:button:1:target" content="${baseUrl}/actions/copy-v2?castId=${formattedHash}&type=enhanced" />
  <meta property="fc:frame:button:2" content="Copy Open Graph Link" />
  <meta property="fc:frame:button:2:action" content="link" />
  <meta property="fc:frame:button:2:target" content="${baseUrl}/actions/copy-v2?castId=${formattedHash}&type=standard" />
  <meta property="og:title" content="Farlinker - Choose Link Format" />
  <meta property="og:image" content="${baseUrl}/farlinker-options.png" />
</head>
<body></body>
</html>`;
  
  return new Response(html, {
    headers: {
      'Content-Type': 'text/html',
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('[Farlinker Frame] Received:', JSON.stringify(body, null, 2));
    
    // Get cast ID and button index from the request
    const { searchParams } = new URL(request.url);
    const castId = searchParams.get('castId') || '';
    const buttonIndex = body.untrustedData?.buttonIndex || 1;
    
    // Get the host
    const host = request.headers.get('host') || 'www.farlinker.xyz';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const baseUrl = `${protocol}://${host}`;
    
    // If this is the initial frame load (no button clicked yet)
    if (!buttonIndex || buttonIndex === 0) {
      // Return the initial frame with two buttons that link directly to copy pages
      const formattedHash = castId.startsWith('0x') ? castId : `0x${castId}`;
      
      const html = `<!DOCTYPE html>
<html>
<head>
  <meta property="fc:frame" content="vNext" />
  <meta property="fc:frame:image" content="${baseUrl}/farlinker-options.png" />
  <meta property="fc:frame:image:aspect_ratio" content="1.91:1" />
  <meta property="fc:frame:button:1" content="Copy Enhanced Link" />
  <meta property="fc:frame:button:1:action" content="link" />
  <meta property="fc:frame:button:1:target" content="${baseUrl}/actions/copy-v2?castId=${formattedHash}&type=enhanced" />
  <meta property="fc:frame:button:2" content="Copy Open Graph Link" />
  <meta property="fc:frame:button:2:action" content="link" />
  <meta property="fc:frame:button:2:target" content="${baseUrl}/actions/copy-v2?castId=${formattedHash}&type=standard" />
  <meta property="og:title" content="Farlinker - Choose Link Format" />
  <meta property="og:image" content="${baseUrl}/farlinker-options.png" />
</head>
<body></body>
</html>`;
      
      return new Response(html, {
        headers: {
          'Content-Type': 'text/html',
        },
      });
    }
    
    // Since we're using link buttons, we shouldn't get button clicks
    // Just return the same frame
    const formattedHash = castId.startsWith('0x') ? castId : `0x${castId}`;
    
    const html = `<!DOCTYPE html>
<html>
<head>
  <meta property="fc:frame" content="vNext" />
  <meta property="fc:frame:image" content="${baseUrl}/farlinker-options.png" />
  <meta property="fc:frame:image:aspect_ratio" content="1.91:1" />
  <meta property="fc:frame:button:1" content="Copy Enhanced Link" />
  <meta property="fc:frame:button:1:action" content="link" />
  <meta property="fc:frame:button:1:target" content="${baseUrl}/actions/copy-v2?castId=${formattedHash}&type=enhanced" />
  <meta property="fc:frame:button:2" content="Copy Open Graph Link" />
  <meta property="fc:frame:button:2:action" content="link" />
  <meta property="fc:frame:button:2:target" content="${baseUrl}/actions/copy-v2?castId=${formattedHash}&type=standard" />
  <meta property="og:title" content="Farlinker - Choose Link Format" />
  <meta property="og:image" content="${baseUrl}/farlinker-options.png" />
</head>
<body></body>
</html>`;
    
    return new Response(html, {
      headers: {
        'Content-Type': 'text/html',
      },
    });
  } catch (error) {
    console.error('[Farlinker Frame] Error:', error);
    
    const host = request.headers.get('host') || 'www.farlinker.xyz';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const baseUrl = `${protocol}://${host}`;
    
    // Return error frame
    const html = `<!DOCTYPE html>
<html>
<head>
  <meta property="fc:frame" content="vNext" />
  <meta property="fc:frame:image" content="${baseUrl}/api/og-image.png?title=Error&description=Failed%20to%20generate%20link" />
</head>
<body></body>
</html>`;
    
    return new Response(html, {
      status: 200, // Frames should return 200 even for errors
      headers: {
        'Content-Type': 'text/html',
      },
    });
  }
}