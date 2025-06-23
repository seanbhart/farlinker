import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pfp = searchParams.get('pfp');
    const displayName = searchParams.get('name');
    const postText = searchParams.get('text');
    const username = searchParams.get('username');
    
    if (!pfp || !displayName || !username) {
      return new Response('Missing parameters', { 
        status: 400,
        headers: {
          'Content-Type': 'text/plain',
        },
      });
    }
    
    // Handle empty text
    const text = postText || '';

    // Calculate dynamic height based on text length
    // More accurate calculation based on average character width
    const avgCharWidth = 16; // Average character width in pixels for 28px font
    const containerWidth = 520; // 600px - 80px padding
    const charsPerLine = Math.floor(containerWidth / avgCharWidth);
    const lineHeight = 40;
    const topBottomPadding = 60; // 30px top + 30px bottom
    const headerHeight = 80; // profile section height including margin
    const minHeight = 315;
    const maxHeight = 800;
    
    // Estimate number of lines (add extra line for word wrapping safety)
    const estimatedLines = Math.ceil(text.length / charsPerLine) + 1;
    const textHeight = estimatedLines * lineHeight;
    const calculatedHeight = topBottomPadding + textHeight + headerHeight;
    
    // Use calculated height with min/max constraints
    const dynamicHeight = Math.max(minHeight, Math.min(calculatedHeight, maxHeight));

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
              fontSize: 28,
              lineHeight: '40px',
              fontWeight: 400,
              color: 'white',
              flex: 1,
              overflow: 'hidden',
              display: 'block',
            }}
          >
            {postText}
          </div>

          {/* User header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginTop: '20px',
            }}
          >
            {/* Profile picture */}
            {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
            <img
              src={pfp}
              width={60}
              height={60}
              style={{
                borderRadius: '50%',
                marginRight: '15px',
                objectFit: 'cover',
              }}
            />
            
            {/* Username and site */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
              }}
            >
              <div
                style={{
                  fontSize: 28,
                  fontWeight: 700,
                  color: 'white',
                  display: 'block',
                }}
              >
                {`${displayName} (@${username})`}
              </div>
              <div
                style={{
                  fontSize: 20,
                  fontWeight: 400,
                  color: '#999',
                  display: 'block',
                }}
              >
                farcaster.xyz
              </div>
            </div>
          </div>
        </div>
      ),
      {
        width: 600,
        height: dynamicHeight,
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