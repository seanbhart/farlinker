import { NextRequest } from 'next/server';
import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const message = searchParams.get('message') || 'Success!';
  const url = searchParams.get('url') || '';
  
  return new ImageResponse(
    (
      <div
        style={{
          background: '#17101f',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
          padding: '40px',
        }}
      >
        <div
          style={{
            fontSize: 64,
            fontWeight: 'bold',
            color: '#10b981',
            marginBottom: 30,
          }}
        >
          ✓
        </div>
        <div
          style={{
            fontSize: 36,
            fontWeight: 'bold',
            color: '#fff',
            marginBottom: 20,
          }}
        >
          {message}
        </div>
        {url && (
          <div
            style={{
              background: '#1c1a24',
              border: '2px solid #2d2b35',
              borderRadius: 12,
              padding: '20px 40px',
              marginTop: 20,
            }}
          >
            <div
              style={{
                fontSize: 18,
                color: '#9ca3af',
                textAlign: 'center',
                wordBreak: 'break-all',
                maxWidth: '800px',
              }}
            >
              {decodeURIComponent(url)}
            </div>
          </div>
        )}
        <div
          style={{
            fontSize: 16,
            color: '#6b7280',
            marginTop: 40,
          }}
        >
          Click &quot;Open Link&quot; to visit
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}