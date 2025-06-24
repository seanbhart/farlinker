import { NextRequest, NextResponse } from 'next/server';
import { fetchCastByHash } from '@/lib/neynar';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    const { hash } = await request.json();
    
    if (!hash) {
      return NextResponse.json(
        { error: 'Missing hash parameter' },
        { status: 400 }
      );
    }
    
    // Ensure hash has 0x prefix
    const formattedHash = hash.startsWith('0x') ? hash : `0x${hash}`;
    
    // Fetch cast data from Neynar
    console.log('[Cast Details API] Fetching cast with hash:', formattedHash);
    const cast = await fetchCastByHash(formattedHash);
    
    if (!cast) {
      console.log('[Cast Details API] Cast not found, returning fallback');
      // Return minimal data if fetch fails
      return NextResponse.json({
        authorUsername: 'user',
        hash: formattedHash
      });
    }
    
    // Return the necessary data for generating the Farlinker URL
    console.log('[Cast Details API] Returning username:', cast.author.username);
    return NextResponse.json({
      authorUsername: cast.author.username,
      hash: formattedHash,
      text: cast.text,
      author: {
        username: cast.author.username,
        display_name: cast.author.display_name,
        pfp_url: cast.author.pfp_url
      },
      embeds: cast.embeds || []
    });
  } catch (error) {
    console.error('[Cast Details API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cast details' },
      { status: 500 }
    );
  }
}