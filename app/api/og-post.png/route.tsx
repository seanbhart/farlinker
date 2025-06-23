import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';
import { track } from '@vercel/analytics/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pfp = searchParams.get('pfp');
    const displayName = searchParams.get('name');
    const postText = searchParams.get('text');
    const username = searchParams.get('username');
    const embeddedImage = searchParams.get('image');
    const platform = searchParams.get('platform');
    
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
    
    // Track OG post image generation
    await track('og_image_generated', {
      type: 'post',
      hasProfile: !!pfp,
      hasText: !!postText,
      hasEmbeddedImage: !!embeddedImage,
      platform: platform || 'default'
    });
    
    // Calculate embedded image height if present
    let embeddedImageHeight = 0;
    
    if (embeddedImage) {
      // Get aspect ratio from URL parameters (passed from Neynar data)
      const aspectRatioParam = searchParams.get('aspectRatio');
      let aspectRatio = 0.75; // Default to 4:3
      
      if (aspectRatioParam) {
        aspectRatio = parseFloat(aspectRatioParam);
        // Validate aspect ratio is reasonable
        if (isNaN(aspectRatio) || aspectRatio <= 0 || aspectRatio > 3) {
          aspectRatio = 0.75; // Fall back to 4:3
        }
      }
      
      // Calculate height for 600px width
      embeddedImageHeight = Math.round(600 * aspectRatio);
      
      // Cap maximum height based on platform
      const maxEmbedHeight = platform === 'messaging' ? 400 : 1200;
      embeddedImageHeight = Math.min(embeddedImageHeight, maxEmbedHeight);
      
      console.log(`[OG-Post] Platform: ${platform || 'default'}, Embedded image - Aspect ratio: ${aspectRatio}, Height: ${embeddedImageHeight}px`);
    }

    // Calculate dynamic height based on text length
    // More accurate calculation based on average character width
    const avgCharWidth = 14; // Adjusted for 32px font (was too small)
    const containerWidth = 520; // 600px - 80px padding
    const charsPerLine = Math.floor(containerWidth / avgCharWidth);
    const lineHeight = 42;
    const topPadding = 25;
    const bottomPadding = 25; // Increased bottom padding
    const headerHeight = 60; // profile section height
    const headerMarginTop = 25; // Increased from 15
    const minHeight = 160; // Even smaller minimum for very short text
    // Platform-specific max height - messaging apps have stricter limits
    const maxHeight = platform === 'messaging' ? 800 : 2000;
    
    // Estimate number of lines more accurately
    // First, split by newlines to handle explicit line breaks
    const textLines = text.split('\n');
    let lines = 0;
    
    for (const line of textLines) {
      if (line.length === 0) {
        lines += 1; // Empty line
        continue;
      }
      
      const words = line.split(' ');
      let currentLineLength = 0;
      let lineCount = 1;
      
      for (const word of words) {
        const wordLength = word.length + 1; // +1 for space
        if (currentLineLength + wordLength > charsPerLine && currentLineLength > 0) {
          lineCount++;
          currentLineLength = wordLength;
        } else {
          currentLineLength += wordLength;
        }
      }
      
      lines += lineCount;
    }
    
    // Add a bit of buffer for safety
    lines = Math.max(lines, 1) + 0.5;
    
    // Calculate text height - minimize if no text (except for platforms that need it)
    let textHeight = Math.ceil(lines) * lineHeight;
    let textTopPadding = embeddedImage ? 25 : topPadding;
    
    // If no text, minimize the text area (but keep some space for WhatsApp)
    if (!text || text.trim().length === 0) {
      if (platform === 'messaging') {
        // WhatsApp needs some text area even if empty
        textHeight = lineHeight; // One line height
      } else {
        // Other platforms can have minimal text area
        textHeight = 0;
        textTopPadding = embeddedImage ? 15 : 10; // Reduce padding too
      }
    }
    
    const headerBottomMargin = 10; // Additional margin on username div
    const calculatedHeight = embeddedImageHeight + textTopPadding + textHeight + headerMarginTop + headerHeight + headerBottomMargin + bottomPadding;
    
    // Use calculated height with min/max constraints
    // For messaging platforms with embedded images, prioritize showing content over strict limits
    let dynamicHeight = calculatedHeight;
    if (platform === 'messaging' && embeddedImage) {
      // Allow slightly more height for messaging apps with images to show full content
      dynamicHeight = Math.max(minHeight, Math.min(calculatedHeight, 1000));
    } else {
      dynamicHeight = Math.max(minHeight, Math.min(calculatedHeight, maxHeight));
    }
    
    console.log(`[OG-Post] Platform: ${platform}, Text: "${text}", Lines: ${lines}, Text height: ${textHeight}px, Embedded image: ${embeddedImageHeight}px, Calculated height: ${calculatedHeight}, Final height: ${dynamicHeight}, Max height: ${maxHeight}`);

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
                  width: '600px',
                  height: `${embeddedImageHeight}px`,
                  objectFit: 'contain',
                  backgroundColor: '#17101f',
                }}
              />
            </>
          )}
          
          {/* Content wrapper for padding when image is present */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              padding: embeddedImage 
                ? (text && text.trim() ? '25px 40px 25px 40px' : '15px 40px 25px 40px')
                : '0',
              flex: 1,
            }}
          >
            {/* Post text - only render if there's actual text */}
            {text && text.trim() && (
              <div
                style={{
                  fontSize: 32,
                  lineHeight: '42px',
                  fontWeight: 400,
                  color: 'white',
                  display: 'block',
                  marginBottom: 'auto',
                  wordBreak: 'break-word',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {text}
              </div>
            )}

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