import { NextResponse } from 'next/server';
import { fetchCastByIdentifier } from '@/lib/neynar';

export async function GET() {
  const testHash = '0xf71a74c3';
  
  console.log('Test Neynar API - Starting');
  console.log('NEYNAR_API_KEY exists:', !!process.env.NEYNAR_API_KEY);
  
  try {
    const cast = await fetchCastByIdentifier(testHash);
    
    return NextResponse.json({
      success: true,
      apiKeyExists: !!process.env.NEYNAR_API_KEY,
      castFound: !!cast,
      cast: cast ? {
        text: cast.text,
        author: cast.author.username,
        likes: cast.reactions.likes_count,
      } : null
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