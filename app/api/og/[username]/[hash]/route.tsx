import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';
import { fetchCastByIdentifier } from '@/lib/neynar';

export const runtime = 'edge';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string; hash: string }> }
) {
  const { username, hash } = await params;

  try {
    // Fetch actual cast data
    const formattedHash = hash.startsWith('0x') ? hash : `0x${hash}`;
    const cast = await fetchCastByIdentifier(formattedHash);
    
    // Use real cast data or fallback
    const castText = cast?.text || `Cast ${hash.slice(0, 8)}... - Click to view the full cast with all replies and reactions.`;
    const authorUsername = cast?.author.username || username;
    const authorDisplayName = cast?.author.display_name || username;
    const pfpUrl = cast?.author.pfp_url;
    const likesCount = cast?.reactions.likes_count || 0;
    const recastsCount = cast?.reactions.recasts_count || 0;
    const repliesCount = cast?.replies.count || 0;
    
    return new ImageResponse(
      (
        <div
          style={{
            background: 'linear-gradient(to bottom right, #8B5CF6, #6D28D9)',
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          <div
            style={{
              background: 'white',
              borderRadius: '16px',
              padding: '48px',
              margin: '32px',
              width: '90%',
              maxWidth: '800px',
              display: 'flex',
              flexDirection: 'column',
              gap: '24px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              {pfpUrl ? (
                // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
                <img
                  src={pfpUrl}
                  alt={`${authorDisplayName} avatar`}
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                  }}
                />
              ) : (
                <div
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: '#8B5CF6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '24px',
                    fontWeight: 'bold',
                  }}
                >
                  {authorUsername.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1F2937' }}>
                  {authorDisplayName}
                </div>
                <div style={{ fontSize: '16px', color: '#6B7280' }}>
                  @{authorUsername}
                </div>
              </div>
            </div>
            
            <div
              style={{
                fontSize: '20px',
                lineHeight: '1.6',
                color: '#374151',
                maxHeight: '120px',
                overflow: 'hidden',
              }}
            >
              {castText}
            </div>
            
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '32px',
                color: '#6B7280',
                fontSize: '18px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
                </svg>
                <span>{likesCount.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.707 3.293a1 1 0 010 1.414L5.414 7H11a7 7 0 017 7v2a1 1 0 11-2 0v-2a5 5 0 00-5-5H5.414l2.293 2.293a1 1 0 11-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>{recastsCount.toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2z" clipRule="evenodd" />
                </svg>
                <span>{repliesCount.toLocaleString()}</span>
              </div>
            </div>
            
            <div
              style={{
                borderTop: '1px solid #E5E7EB',
                paddingTop: '24px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div style={{ fontSize: '16px', color: '#8B5CF6', fontWeight: 'bold' }}>
                farlinker.xyz
              </div>
              <div style={{ fontSize: '14px', color: '#6B7280' }}>
                Click to view on Farcaster →
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
  } catch (e) {
    console.error('Failed to generate image:', e);
    return new Response('Failed to generate image', { status: 500 });
  }
}