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
    const embeddedImage = searchParams.get('image');
    
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
    
    // Calculate embedded image height if present
    let embeddedImageHeight = 0;
    if (embeddedImage) {
      // Default aspect ratio 16:9 if we can't determine
      // In production, you might want to fetch image dimensions
      embeddedImageHeight = Math.round(600 * 9 / 16); // 337.5 -> 338px for 16:9
    }

    // Calculate dynamic height based on text length
    // More accurate calculation based on average character width
    const avgCharWidth = 12; // Average for 32px font
    const containerWidth = 520; // 600px - 80px padding
    const charsPerLine = Math.floor(containerWidth / avgCharWidth);
    const lineHeight = 42;
    const topPadding = 25;
    const bottomPadding = 25; // Increased bottom padding
    const headerHeight = 60; // profile section height
    const headerMarginTop = 25; // Increased from 15
    const minHeight = 160; // Even smaller minimum for very short text
    const maxHeight = 800;
    
    // Estimate number of lines more accurately
    const words = text.split(' ');
    let currentLineLength = 0;
    let lines = 1;
    
    for (const word of words) {
      const wordLength = word.length + 1; // +1 for space
      if (currentLineLength + wordLength > charsPerLine && currentLineLength > 0) {
        lines++;
        currentLineLength = wordLength;
      } else {
        currentLineLength += wordLength;
      }
    }
    
    // Don't add extra line for short text
    if (text.length > charsPerLine * 2) {
      lines += 0.5; // Add half line for word wrapping safety on longer text
    }
    
    const textHeight = Math.ceil(lines) * lineHeight;
    const textTopPadding = embeddedImage ? 25 : topPadding; // Add padding after image
    const calculatedHeight = embeddedImageHeight + textTopPadding + textHeight + headerMarginTop + headerHeight + bottomPadding;
    
    // Use calculated height with min/max constraints
    const dynamicHeight = Math.max(minHeight, Math.min(calculatedHeight, maxHeight));
    
    console.log(`[OG-Post] Text: "${text}", Lines: ${lines}, Embedded image: ${embeddedImageHeight}px, Calculated height: ${calculatedHeight}, Final height: ${dynamicHeight}`);

    const response = new ImageResponse(
      (
        <div
          style={{
            background: '#17101f',
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            padding: embeddedImage ? '0' : '25px 40px 15px 40px',
          }}
        >
          {/* Embedded image if present */}
          {embeddedImage && (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
              <img
                src={embeddedImage}
                width={600}
                height={embeddedImageHeight}
                style={{
                  objectFit: 'cover',
                }}
              />
            </>
          )}
          
          {/* Content wrapper for padding when image is present */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              padding: embeddedImage ? '25px 40px 25px 40px' : '0',
              flex: 1,
            }}
          >
            {/* Post text */}
            <div
              style={{
                fontSize: 32,
                lineHeight: '42px',
                fontWeight: 400,
                color: 'white',
                overflow: 'hidden',
                display: 'block',
                marginBottom: 'auto',
              }}
            >
              {text}
            </div>

            {/* User header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                marginTop: '25px',
                marginBottom: '10px',
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