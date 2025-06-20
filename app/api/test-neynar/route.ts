import { NextResponse } from 'next/server';
import { fetchCastByIdentifier, fetchCastByUrl } from '@/lib/neynar';

export async function GET() {
  console.log('Test Neynar API - Starting');
  console.log('NEYNAR_API_KEY exists:', !!process.env.NEYNAR_API_KEY);
  
  try {
    // Test 1: Try with a short hash like the one in the example
    const shortHash = '0xf71a74c3';
    let cast = await fetchCastByIdentifier(shortHash);
    
    // Test 2: If that fails, try URL lookup
    if (!cast) {
      console.log('Testing URL lookup for swabbie.eth/0xf71a74c3');
      cast = await fetchCastByUrl('swabbie.eth', '0xf71a74c3');
    }
    
    return NextResponse.json({
      success: true,
      apiKeyExists: !!process.env.NEYNAR_API_KEY,
      castFound: !!cast,
      cast: cast ? {
        text: cast.text,
        author: cast.author.username,
        likes: cast.reactions.likes_count,
        hash: cast.hash,
      } : null,
      testedUrl: 'swabbie.eth/0xf71a74c3'
    });
  } catch (error: any) {
    console.error('Test Neynar API - Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      apiKeyExists: !!process.env.NEYNAR_API_KEY,
    });
  }
}