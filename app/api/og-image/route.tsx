import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pfp = searchParams.get('pfp');
    const displayName = searchParams.get('name');
    
    if (!pfp || !displayName) {
      return new Response('Missing parameters', { status: 400 });
    }

    return new ImageResponse(
      (
        <div
          style={{
            background: 'transparent',
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            padding: '12px',
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
              marginRight: '12px',
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
            <span
              style={{
                fontSize: '20px',
                fontWeight: 600,
              }}
            >
              {displayName}
            </span>
            <span
              style={{
                fontSize: '16px',
                color: '#9CA3AF',
              }}
            >
              on Farcaster
            </span>
          </div>
        </div>
      ),
      {
        width: 320,
        height: 80,
      }
    );
  } catch (e) {
    console.error('OG Image generation failed:', e);
    return new Response('Failed to generate image', { status: 500 });
  }
}