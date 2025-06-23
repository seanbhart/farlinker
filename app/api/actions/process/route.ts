import { NextRequest, NextResponse } from 'next/server';
import { fetchCastByIdentifier } from '@/lib/neynar';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('[Farlinker Process] Received:', JSON.stringify(body, null, 2));
    
    const { untrustedData } = body;
    const buttonIndex = untrustedData.buttonIndex;
    
    // Get cast ID from URL
    const { searchParams } = new URL(request.url);
    const castId = searchParams.get('castId') || '';
    
    // Fetch cast data to get author username
    const formattedHash = castId.startsWith('0x') ? castId : `0x${castId}`;
    const cast = await fetchCastByIdentifier(formattedHash);
    
    const authorUsername = cast?.author?.username || 'user';
    const isStandard = buttonIndex === 2;
    const farlinkerUrl = `https://www.farlinker.xyz/${authorUsername}/${formattedHash}${isStandard ? '?preview=standard' : ''}`;
    
    // Return message with the link
    return NextResponse.json({
      type: 'message',
      message: isStandard ? 'Standard link copied!' : 'Enhanced link copied!',
      link: farlinkerUrl
    });
  } catch (error) {
    console.error('[Farlinker Process] Error:', error);
    return NextResponse.json(
      { message: 'Failed to generate link' },
      { status: 400 }
    );
  }
}