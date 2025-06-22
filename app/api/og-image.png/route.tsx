import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pfp = searchParams.get('pfp');
    const displayName = searchParams.get('name');
    
    if (!pfp || !displayName) {
      return new Response('Missing parameters', { 
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
            padding: '60px',
          }}
        >
          {/* Profile picture */}
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img
            src={pfp}
            width={180}
            height={180}
            style={{
              borderRadius: '50%',
              marginRight: '50px',
              objectFit: 'cover',
            }}
          />
          
          {/* Text */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              color: 'white',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                fontSize: 80,
                fontWeight: 700,
                lineHeight: '88px',
                marginBottom: '12px',
              }}
            >
              {displayName}
            </div>
            <div
              style={{
                fontSize: 50,
                color: '#9CA3AF',
                lineHeight: '60px',
              }}
            >
              on Farcaster
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 300,
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