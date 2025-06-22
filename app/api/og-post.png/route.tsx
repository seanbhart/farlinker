import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pfp = searchParams.get('pfp');
    const displayName = searchParams.get('name');
    const postText = searchParams.get('text');
    
    console.log('[OG Post Image] Generating image for:', { pfp, displayName, postText });
    
    if (!pfp || !displayName || !postText) {
      console.error('[OG Post Image] Missing parameters');
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
      console.error('[OG Post Image] Invalid profile picture URL:', pfp);
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
            flexDirection: 'column',
            padding: '30px 40px',
          }}
        >
          {/* User header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '25px',
            }}
          >
            {/* Profile picture */}
            {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
            <img
              src={pfp}
              width={48}
              height={48}
              style={{
                borderRadius: '50%',
                marginRight: '15px',
                objectFit: 'cover',
              }}
            />
            
            {/* Username */}
            <div
              style={{
                fontSize: 28,
                fontWeight: 600,
                color: 'white',
              }}
            >
              {displayName}
            </div>
          </div>
          
          {/* Post text */}
          <div
            style={{
              fontSize: 36,
              lineHeight: '48px',
              fontWeight: 400,
              color: 'white',
              flex: 1,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {postText}
          </div>
        </div>
      ),
      {
        width: 600,
        height: 315,
      }
    );
    
    // Add cache headers to the response
    response.headers.set('Cache-Control', 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400');
    
    console.log('[OG Post Image] Successfully generated image');
    return response;
  } catch (error) {
    console.error('OG Post Image generation failed:', error);
    return new Response('Failed to generate image', { 
      status: 500,
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  }
}