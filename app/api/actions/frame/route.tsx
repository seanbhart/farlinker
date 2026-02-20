import { NextRequest } from 'next/server';

export const runtime = 'edge';

function getBaseUrl(request: NextRequest): string {
  const host = request.headers.get('host') || 'www.farlinker.xyz';
  const protocol = host.includes('localhost') ? 'http' : 'https';
  return `${protocol}://${host}`;
}

function buildFrameHtml(baseUrl: string, castHash: string): string {
  const formattedHash = castHash.startsWith('0x') ? castHash : `0x${castHash}`;
  return `<!DOCTYPE html>
<html>
<head>
  <meta property="fc:frame" content="vNext" />
  <meta property="fc:frame:image" content="${baseUrl}/farlinker-options.png" />
  <meta property="fc:frame:image:aspect_ratio" content="1.91:1" />
  <meta property="fc:frame:button:1" content="Enhanced Link" />
  <meta property="fc:frame:button:1:action" content="link" />
  <meta property="fc:frame:button:1:target" content="${baseUrl}/actions/copy-v2?castId=${formattedHash}&type=enhanced" />
  <meta property="fc:frame:button:2" content="Open Graph Link" />
  <meta property="fc:frame:button:2:action" content="link" />
  <meta property="fc:frame:button:2:target" content="${baseUrl}/actions/copy-v2?castId=${formattedHash}&type=standard" />
  <meta property="og:title" content="Farlinker - Choose Link Format" />
  <meta property="og:image" content="${baseUrl}/farlinker-options.png" />
</head>
<body></body>
</html>`;
}

function htmlResponse(html: string, status = 200): Response {
  return new Response(html, { status, headers: { 'Content-Type': 'text/html' } });
}

export async function GET(request: NextRequest) {
  const baseUrl = getBaseUrl(request);
  const castId = new URL(request.url).searchParams.get('castId') || '';
  return htmlResponse(buildFrameHtml(baseUrl, castId));
}

export async function POST(request: NextRequest) {
  try {
    await request.json(); // consume body
    const baseUrl = getBaseUrl(request);
    const castId = new URL(request.url).searchParams.get('castId') || '';
    return htmlResponse(buildFrameHtml(baseUrl, castId));
  } catch (error) {
    console.error('[Farlinker Frame] Error:', error);
    const baseUrl = getBaseUrl(request);
    const errorHtml = `<!DOCTYPE html>
<html>
<head>
  <meta property="fc:frame" content="vNext" />
  <meta property="fc:frame:image" content="${baseUrl}/api/og-image.png?title=Error&description=Failed%20to%20generate%20link" />
</head>
<body></body>
</html>`;
    return htmlResponse(errorHtml);
  }
}
