import { NextResponse } from 'next/server';
import { fetchCastByUrl } from '@/lib/neynar-client';

export async function GET() {
  console.log('Test Neynar API - Starting');
  console.log('NEYNAR_API_KEY exists:', !!process.env.NEYNAR_API_KEY);
  
  try {
    // Test URL lookup for swabbie.eth/0xf71a74c3
    console.log('Testing URL lookup for swabbie.eth/0xf71a74c3');
    const cast = await fetchCastByUrl('swabbie.eth', '0xf71a74c3');
    
    return NextResponse.json({
      success: true,
      apiKeyExists: !!process.env.NEYNAR_API_KEY,
      castFound: !!cast,
      cast: cast ? {
        text: cast.text,
        author: cast.author.username,
        likes: cast.reactions.likes_count,
        hash: cast.hash,
        embeds: cast.embeds,
        author_pfp: cast.author.pfp_url,
      } : null,
      testedUrl: 'swabbie.eth/0xf71a74c3'
    });
  } catch (error) {
    console.error('Test Neynar API - Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      apiKeyExists: !!process.env.NEYNAR_API_KEY,
    });
  }
}