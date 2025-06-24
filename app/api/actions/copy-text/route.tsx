import { NextRequest } from 'next/server';
import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url') || '';
  const type = searchParams.get('type') || 'enhanced';
  
  // If URL is provided, show the copy URL interface
  if (url) {
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
            fontFamily: 'monospace',
            padding: '40px',
          }}
        >
          <div
            style={{
              display: 'flex',
              fontSize: 14,
              color: '#9ca3af',
              marginBottom: 20,
            }}
          >
            Select and copy the URL below:
          </div>
          <div
            style={{
              display: 'flex',
              background: '#1c1a24',
              border: '2px solid #3b82f6',
              borderRadius: 8,
              padding: '16px 24px',
              width: '90%',
              maxWidth: '900px',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <div
              style={{
                display: 'flex',
                fontSize: 18,
                color: '#fff',
                fontFamily: 'monospace',
                wordBreak: 'break-all',
                textAlign: 'center',
              }}
            >
              {decodeURIComponent(url)}
            </div>
          </div>
          <div
            style={{
              display: 'flex',
              fontSize: 12,
              color: '#6b7280',
              marginTop: 20,
            }}
          >
            Tip: Long press on mobile to select text
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  }
  
  // Otherwise show the link type confirmation
  const isStandard = type === 'standard';
  const title = isStandard ? 'Standard Link Generated' : 'Farlinker Link Generated';
  const description = isStandard 
    ? 'Similar to website link preview' 
    : 'Similar to Twitter link preview';
  
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
          padding: '40px',
        }}
      >
        <div
          style={{
            display: 'flex',
            fontSize: 48,
            fontWeight: 'bold',
            color: '#fff',
            marginBottom: 20,
          }}
        >
          {title}
        </div>
        <div
          style={{
            display: 'flex',
            fontSize: 24,
            color: '#9ca3af',
            marginBottom: 40,
          }}
        >
          {description}
        </div>
        <div
          style={{
            display: 'flex',
            background: '#8b5cf6',
            color: '#fff',
            padding: '16px 32px',
            borderRadius: 8,
            fontSize: 20,
            fontWeight: 'bold',
          }}
        >
          Click "View Link" to see your link
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}