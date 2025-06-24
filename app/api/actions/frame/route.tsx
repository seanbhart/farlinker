import { NextRequest } from 'next/server';
import { fetchCastByIdentifier } from '@/lib/neynar';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  // Return the initial frame for GET requests
  const host = request.headers.get('host') || 'www.farlinker.xyz';
  const protocol = host.includes('localhost') ? 'http' : 'https';
  const baseUrl = `${protocol}://${host}`;
  
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta property="fc:frame" content="vNext" />
  <meta property="fc:frame:image" content="${baseUrl}/farlinker-options.png" />
  <meta property="fc:frame:image:aspect_ratio" content="1.91:1" />
  <meta property="fc:frame:button:1" content="Copy Farlinker Link" />
  <meta property="fc:frame:button:2" content="Copy Standard Link" />
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
      // Return the initial frame with two buttons
      const html = `<!DOCTYPE html>
<html>
<head>
  <meta property="fc:frame" content="vNext" />
  <meta property="fc:frame:image" content="${baseUrl}/farlinker-options.png" />
  <meta property="fc:frame:image:aspect_ratio" content="1.91:1" />
  <meta property="fc:frame:button:1" content="Copy Farlinker Link" />
  <meta property="fc:frame:button:2" content="Copy Standard Link" />
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
    
    // Handle button clicks - fetch cast details and redirect
    const formattedHash = castId.startsWith('0x') ? castId : `0x${castId}`;
    const cast = await fetchCastByIdentifier(formattedHash);
    
    const authorUsername = cast?.author?.username || 'user';
    // Button 1 = enhanced farlinker, button 2 = standard
    const isStandard = buttonIndex === 2;
    const previewType = isStandard ? 'standard' : 'enhanced';
    
    // Generate the copy page URL
    const copyPageUrl = `${baseUrl}/actions/copy-v2?castId=${formattedHash}&type=${previewType}`;
    
    // Return frame that auto-opens the link
    const html = `<!DOCTYPE html>
<html>
<head>
  <meta property="fc:frame" content="vNext" />
  <meta property="fc:frame:image" content="${baseUrl}/api/actions/copy-text?type=${previewType}" />
  <meta property="fc:frame:image:aspect_ratio" content="1.91:1" />
  <meta property="fc:frame:button:1" content="Open Link" />
  <meta property="fc:frame:button:1:action" content="link" />
  <meta property="fc:frame:button:1:target" content="${copyPageUrl}" />
  <meta property="og:title" content="${isStandard ? 'Standard' : 'Farlinker'} Link Ready" />
  <meta http-equiv="refresh" content="0; url=${copyPageUrl}" />
</head>
<body>
  <script>window.location.href = "${copyPageUrl}";</script>
</body>
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