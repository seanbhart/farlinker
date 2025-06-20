import { ImageResponse } from '@vercel/og';

export const runtime = 'edge';

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(to bottom right, #8B5CF6, #6D28D9)',
        }}
      >
        <div
          style={{
            fontSize: '96px',
            fontWeight: 'bold',
            color: 'white',
            fontFamily: 'system-ui, sans-serif',
            marginBottom: '24px',
          }}
        >
          Farlinker
        </div>
        <div
          style={{
            fontSize: '32px',
            color: 'rgba(255, 255, 255, 0.9)',
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          Better link previews for Farcaster
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}