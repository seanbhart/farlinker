import { NextRequest, NextResponse } from 'next/server';
import { fetchCastByIdentifier } from '@/lib/neynar';

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
    const cast = await fetchCastByIdentifier(formattedHash);
    
    if (!cast) {
      // Return minimal data if fetch fails
      return NextResponse.json({
        authorUsername: 'user',
        hash: formattedHash
      });
    }
    
    // Return the necessary data for generating the Farlinker URL
    return NextResponse.json({
      authorUsername: cast.author.username,
      hash: formattedHash,
      text: cast.text,
      author: {
        username: cast.author.username,
        display_name: cast.author.display_name,
        pfp_url: cast.author.pfp_url
      }
    });
  } catch (error) {
    console.error('[Cast Details API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cast details' },
      { status: 500 }
    );
  }
}