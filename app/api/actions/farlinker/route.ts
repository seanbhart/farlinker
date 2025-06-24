import { NextRequest, NextResponse } from 'next/server';
import { track } from '@vercel/analytics/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('[Farlinker Action] Received request:', JSON.stringify(body, null, 2));
    
    const { untrustedData } = body;
    const { castId } = untrustedData;
    
    // Track action usage
    await track('farlinker_action_triggered', {
      castHash: castId.hash,
      fid: castId.fid
    });
    
    // Get the host from headers for local testing
    const host = request.headers.get('host') || 'www.farlinker.xyz';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    
    // Generate the frame HTML response with direct links
    const imageUrl = `${protocol}://${host}/farlinker-options.png`;
    const enhancedUrl = `${protocol}://${host}/actions/copy-v2?castId=${castId.hash}&type=enhanced`;
    const standardUrl = `${protocol}://${host}/actions/copy-v2?castId=${castId.hash}&type=standard`;
    
    const html = `<!DOCTYPE html>
<html>
<head>
  <meta property="fc:frame" content="vNext" />
  <meta property="fc:frame:image" content="${imageUrl}" />
  <meta property="fc:frame:image:aspect_ratio" content="1.91:1" />
  <meta property="fc:frame:button:1" content="Enhanced Share Preview" />
  <meta property="fc:frame:button:1:action" content="link" />
  <meta property="fc:frame:button:1:target" content="${enhancedUrl}" />
  <meta property="fc:frame:button:2" content="Standard Open Graph Preview" />
  <meta property="fc:frame:button:2:action" content="link" />
  <meta property="fc:frame:button:2:target" content="${standardUrl}" />
  <meta property="og:title" content="Farlinker - Choose Link Format" />
  <meta property="og:image" content="${imageUrl}" />
</head>
<body>Choose your Farlinker preview format</body>
</html>`;
    
    console.log('[Farlinker Action] Returning frame HTML');
    
    return new Response(html, {
      headers: {
        'Content-Type': 'text/html',
      },
    });
  } catch (error) {
    console.error('[Farlinker Action] Error:', error);
    return NextResponse.json(
      { message: 'Failed to process action' },
      { status: 400 }
    );
  }
}

// Metadata endpoint for the action
export async function GET() {
  return NextResponse.json({
    name: 'Farlinker',
    icon: 'link-45deg',
    description: 'Create enhanced link previews',
    aboutUrl: 'https://www.farlinker.xyz',
    action: {
      type: 'post'
    }
  });
}