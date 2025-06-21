import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pfp = searchParams.get('pfp');
    const displayName = searchParams.get('name');
    
    console.log('[OG Image] Generating image for:', { pfp, displayName });
    
    if (!pfp || !displayName) {
      console.error('[OG Image] Missing parameters');
      return new Response('Missing parameters', { 
        status: 400,
        headers: {
          'Content-Type': 'text/plain',
        },
      });
    }

    // Validate the profile picture URL
    try {
      new URL(pfp);
    } catch {
      console.error('[OG Image] Invalid profile picture URL:', pfp);
      return new Response('Invalid profile picture URL', { 
        status: 400,
        headers: {
          'Content-Type': 'text/plain',
        },
      });
    }

    const response = new ImageResponse(
      (
        <div
          style={{
            background: '#17101f',
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            padding: '10px',
          }}
        >
          {/* Profile picture */}
          <div
            style={{
              width: 60,
              height: 60,
              borderRadius: '50%',
              backgroundImage: `url(${pfp})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              marginRight: '12px',
              flexShrink: 0,
            }}
          />
          
          {/* Text */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              color: 'white',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                fontSize: 20,
                fontWeight: 600,
                lineHeight: '24px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {displayName}
            </div>
            <div
              style={{
                fontSize: 16,
                color: '#9CA3AF',
                lineHeight: '20px',
              }}
            >
              on Farcaster
            </div>
          </div>
        </div>
      ),
      {
        width: 320,
        height: 80,
      }
    );
    
    // Add cache headers to the response
    response.headers.set('Cache-Control', 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400');
    
    console.log('[OG Image] Successfully generated image');
    return response;
  } catch (error) {
    console.error('OG Image generation failed:', error);
    return new Response('Failed to generate image', { 
      status: 500,
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  }
}