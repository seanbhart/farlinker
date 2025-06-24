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
    
    // Return modal response instead of frame
    const modalUrl = `${protocol}://${host}/actions/modal?castId=${castId.hash}&fid=${castId.fid}`;
    console.log('[Farlinker Action] Returning modal URL:', modalUrl);
    
    return NextResponse.json({
      type: 'modal',
      modalUrl: modalUrl
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
    icon: 'link-external',
    description: 'create enhanced link previews',
    aboutUrl: 'https://www.farlinker.xyz',
    action: {
      type: 'post',
      postUrl: 'https://www.farlinker.xyz/api/actions/farlinker'
    }
  });
}