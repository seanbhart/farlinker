import { NextRequest } from 'next/server';
import { fetchCastByIdentifier } from '@/lib/neynar';

export const runtime = 'edge';

export async function GET() {
  // This is not used anymore - we'll use the static image
  return new Response('Not needed', { status: 404 });
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
    
    // Handle button clicks
    const formattedHash = castId.startsWith('0x') ? castId : `0x${castId}`;
    const cast = await fetchCastByIdentifier(formattedHash);
    
    const authorUsername = cast?.author?.username || 'user';
    // Button 1 = standard farlinker, button 2 = with ?preview=standard
    const isStandard = buttonIndex === 2;
    const farlinkerUrl = `${baseUrl}/${authorUsername}/${formattedHash}${isStandard ? '?preview=standard' : ''}`;
    const linkType = isStandard ? 'Standard' : 'Farlinker';
    
    // Return frame with the URL displayed and a button to open it
    const html = `<!DOCTYPE html>
<html>
<head>
  <meta property="fc:frame" content="vNext" />
  <meta property="fc:frame:image" content="${baseUrl}/api/actions/success?message=${encodeURIComponent(`${linkType} link ready!`)}&url=${encodeURIComponent(farlinkerUrl)}" />
  <meta property="fc:frame:image:aspect_ratio" content="1.91:1" />
  <meta property="fc:frame:input:text" content="${farlinkerUrl}" />
  <meta property="fc:frame:button:1" content="Open Link" />
  <meta property="fc:frame:button:1:action" content="link" />
  <meta property="fc:frame:button:1:target" content="${farlinkerUrl}" />
  <meta property="og:title" content="${linkType} link ready!" />
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