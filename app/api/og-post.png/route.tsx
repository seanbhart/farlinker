import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pfp = searchParams.get('pfp');
    const displayName = searchParams.get('name');
    const postText = searchParams.get('text');
    
    if (!pfp || !displayName || !postText) {
      return new Response('Missing parameters', { 
        status: 400,
        headers: {
          'Content-Type': 'text/plain',
        },
      });
    }

    // Skip URL validation for speed - let the image tag handle invalid URLs

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
          {/* Post text */}
          <div
            style={{
              fontSize: 27,
              lineHeight: '39px',
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
                fontWeight: 700,
                color: 'white',
              }}
            >
              {displayName} on Farcaster
            </div>
          </div>
        </div>
      ),
      {
        width: 600,
        height: 315,
      }
    );
    
    // Add aggressive cache headers for faster loading
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    response.headers.set('X-Robots-Tag', 'noindex');
    
    return response;
  } catch {
    return new Response('Failed to generate image', { 
      status: 500,
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  }
}