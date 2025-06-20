import { NextRequest, NextResponse } from 'next/server';
import { fetchCastByIdentifier } from '@/lib/neynar';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string; hash: string }> }
) {
  try {
    const { username, hash } = await params;
    
    // Ensure hash has 0x prefix
    const formattedHash = hash.startsWith('0x') ? hash : `0x${hash}`;
    
    // Fetch cast data from Neynar
    const cast = await fetchCastByIdentifier(formattedHash);
    
    if (!cast) {
      // Return placeholder data if fetch fails
      return NextResponse.json({
        text: `Unable to load cast ${hash}`,
        author: {
          username: username,
          display_name: username,
          pfp_url: ""
        },
        timestamp: new Date().toISOString(),
        likes_count: 0,
        recasts_count: 0,
        replies_count: 0
      });
    }

    // Transform Neynar data to our format
    const castData = {
      text: cast.text,
      author: {
        username: cast.author.username,
        display_name: cast.author.display_name,
        pfp_url: cast.author.pfp_url
      },
      timestamp: cast.timestamp,
      likes_count: cast.reactions.likes_count,
      recasts_count: cast.reactions.recasts_count,
      replies_count: cast.replies.count
    };

    return NextResponse.json(castData);
  } catch {
    return NextResponse.json(
      { error: 'Failed to fetch cast data' },
      { status: 500 }
    );
  }
}