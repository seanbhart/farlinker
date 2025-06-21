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
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '40px',
            }}
          >
            {/* Profile picture */}
            <div
              style={{
                width: 200,
                height: 200,
                borderRadius: '50%',
                backgroundImage: `url(${pfp})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                flexShrink: 0,
              }}
            />
            
            {/* Text */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                color: 'white',
              }}
            >
              <div
                style={{
                  fontSize: 72,
                  fontWeight: 700,
                  lineHeight: '80px',
                  marginBottom: '10px',
                }}
              >
                {displayName}
              </div>
              <div
                style={{
                  fontSize: 48,
                  color: '#9CA3AF',
                  lineHeight: '56px',
                }}
              >
                on Farcaster
              </div>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
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