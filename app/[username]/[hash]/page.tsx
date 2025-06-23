import { Metadata } from 'next';
import { headers } from 'next/headers';
import { fetchCastByUrl } from '@/lib/neynar-client';
import { ClientRedirect } from './client-redirect';

interface CastWithReactions {
  author: {
    username: string;
    display_name?: string;
    pfp_url?: string;
  };
  text: string;
  embeds?: Array<{ url?: string }>;
  reactions?: {
    likes_count?: number;
    recasts_count?: number;
  };
}

interface PageProps {
  params: Promise<{
    username: string;
    hash: string;
  }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

// Generate dynamic metadata for Open Graph and Farcaster Frame
export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { username, hash } = await params;
  const urlParams = await searchParams;
  
  // Check preview parameters
  const useSimpleFormat = urlParams.simple === 'true' || urlParams.simple === '1';
  const useStandardPreview = urlParams.preview === 'standard';
  console.log('[Metadata] URL params:', urlParams, 'Use simple format:', useSimpleFormat, 'Use standard preview:', useStandardPreview);
  
  // Get headers to check user agent
  const headersList = await headers();
  const userAgent = headersList.get('user-agent') || '';
  
  // Check if this is Apple Messages or WhatsApp or Telegram or Facebook or LinkedIn
  const isAppleMessages = userAgent.includes('facebookexternalhit/1.1 Facebot Twitterbot/1.0'); // Apple Messages specific pattern
  const isWhatsApp = userAgent.toLowerCase().includes('whatsapp') || 
                     userAgent.includes('WhatsApp') ||
                     (userAgent.includes('facebookexternalhit/1.1') && !userAgent.includes('Twitterbot') && !userAgent.includes('Facebot'));
  const isTelegram = userAgent.toLowerCase().includes('telegram');
  const isFacebook = userAgent.includes('facebookexternalhit') && !isAppleMessages && !isWhatsApp;
  const isLinkedIn = userAgent.toLowerCase().includes('linkedinbot');
  
  // Fetch cast data using Neynar SDK
  const cast = await fetchCastByUrl(username, hash);
  console.log('[Metadata] Cast data:', cast ? 'Found' : 'Not found', 'Author:', cast?.author?.username);
  
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://farlinker.xyz';
  
  // Extract first image from cast embeds if available
  let previewImage: string | undefined;
  let hasEmbeddedImage = false;
  let firstEmbeddedImage: string | undefined;
  let firstEmbeddedImageDimensions: { width: number; height: number } | undefined;
  const embedUrls: string[] = [];
  
  if (cast?.embeds && cast.embeds.length > 0) {
    for (const embed of cast.embeds) {
      if ('url' in embed && embed.url) {
        embedUrls.push(embed.url);
        // Check if this is actually an image URL
        const isImage = embed.url.match(/\.(jpg|jpeg|png|gif|webp)$/i) || 
                       embed.url.includes('imagedelivery.net') ||
                       embed.url.includes('imgur.com') ||
                       embed.url.includes('i.imgur.com');
        
        // Store the first image URL and its dimensions if available
        if (!firstEmbeddedImage && isImage) {
          firstEmbeddedImage = embed.url;
          
          // Check if Neynar provides image dimensions in metadata
          if ('metadata' in embed && embed.metadata?.image) {
            const { width_px, height_px } = embed.metadata.image;
            if (width_px && height_px) {
              firstEmbeddedImageDimensions = { width: width_px, height: height_px };
              console.log('[Metadata] Found image dimensions:', width_px, 'x', height_px);
            }
          }
        }
        
        // Use the first image URL as preview image
        if (!previewImage && isImage) {
          previewImage = embed.url;
          hasEmbeddedImage = true;
        }
      }
    }
  }
  
  // Clean up the cast text by removing embedded URLs first
  let cleanText = cast?.text || '';
  if (cast && embedUrls.length > 0) {
    // Remove any URLs that match embeds to avoid duplication
    embedUrls.forEach(url => {
      cleanText = cleanText.replace(url, '').trim();
    });
    // Clean up any extra whitespace
    cleanText = cleanText.replace(/\s+/g, ' ').trim();
  }
  
  // Track if we're using a composite image
  let isCompositeImage = false;
  let isPostPreview = false;
  let shouldUseSimple = useSimpleFormat;
  
  // If using standard preview OR it's WhatsApp/Telegram/Facebook/LinkedIn, skip composite image generation
  if (useStandardPreview || isWhatsApp || isTelegram || isFacebook || isLinkedIn) {
    // Use the embedded image if available, otherwise use profile picture
    if (!previewImage && cast?.author.pfp_url) {
      previewImage = cast.author.pfp_url;
    }
  }
  // If no embedded image OR we're creating a composite, handle differently based on platform
  else if ((!previewImage || !shouldUseSimple) && cast?.author.pfp_url) {
    const displayName = cast.author.display_name || cast.author.username;
    
    // Default behavior: use composite image with post text
    if (!shouldUseSimple) {
      try {
        // Create composite image with user header and post text
        const encodedPfp = encodeURIComponent(cast.author.pfp_url);
        const encodedName = encodeURIComponent(displayName);
        const encodedText = encodeURIComponent(cleanText);
        const encodedUsername = encodeURIComponent(cast.author.username);
        let compositeUrl = `${baseUrl}/api/og-post.png?pfp=${encodedPfp}&name=${encodedName}&text=${encodedText}&username=${encodedUsername}`;
        
        // Add embedded image if available
        if (firstEmbeddedImage) {
          const encodedImage = encodeURIComponent(firstEmbeddedImage);
          compositeUrl += `&image=${encodedImage}`;
          
          // Add aspect ratio if we have dimensions from Neynar
          if (firstEmbeddedImageDimensions) {
            const aspectRatio = firstEmbeddedImageDimensions.height / firstEmbeddedImageDimensions.width;
            compositeUrl += `&aspectRatio=${aspectRatio}`;
            console.log('[Metadata] Passing aspect ratio:', aspectRatio);
          }
          
          // Pass platform info for platform-specific limits
          if (isWhatsApp || isTelegram) {
            compositeUrl += '&platform=messaging';
          }
        }
        
        previewImage = compositeUrl;
        isCompositeImage = true;
        isPostPreview = true;
        hasEmbeddedImage = false; // Use smaller dimensions
        console.log('[Metadata] Generated post preview image URL:', previewImage);
        console.log('[Metadata] Embedded image included:', !!firstEmbeddedImage);
      } catch (error) {
        console.error('[Metadata] Failed to generate post preview image:', error);
        // Fall back to simple format
        shouldUseSimple = true;
      }
    }
    
    // Simple format (backup option or fallback)
    if (shouldUseSimple) {
      if (isAppleMessages || isWhatsApp) {
        try {
          // Create simple composite image with profile pic and name
          const encodedPfp = encodeURIComponent(cast.author.pfp_url);
          const encodedName = encodeURIComponent(displayName);
          previewImage = `${baseUrl}/api/og-image.png?pfp=${encodedPfp}&name=${encodedName}`;
          isCompositeImage = true;
          console.log('[Metadata] Generated simple composite image URL:', previewImage);
        } catch (error) {
          console.error('[Metadata] Failed to generate simple composite image:', error);
          previewImage = cast.author.pfp_url;
        }
      } else {
        // For other platforms, use the profile picture
        previewImage = cast.author.pfp_url;
      }
    }
    
    // Log for debugging
    console.log(`[Metadata] Platform: ${isAppleMessages ? 'Apple Messages' : isWhatsApp ? 'WhatsApp' : 'Other'}, Using image: ${previewImage || 'none'}, Composite: ${isCompositeImage}, UseSimple: ${useSimpleFormat}`);
  }
  
  // Set metadata according to requirements based on platform
  const displayName = cast?.author.display_name || cast?.author.username || username;
  
  let title: string;
  let description: string;
  
  if (useStandardPreview || isWhatsApp || isTelegram || isFacebook || isLinkedIn) {
    if (isAppleMessages) {
      // Apple Messages with standard preview still gets special title format
      title = cast ? `${displayName} on Farcaster\n\n${cleanText}` : 'Loading cast content...';
      description = '';
    } else {
      // Other platforms get standard format
      title = cast ? cleanText || 'Farcaster' : 'Loading cast content...';
      description = cast ? `${displayName} on Farcaster` : 'View on Farcaster';
    }
  } else if (isAppleMessages) {
    // Apple Messages without standard preview: special format
    title = cast ? `${displayName} on Farcaster\n\n${cleanText}` : 'Loading cast content...';
    description = '';
  } else if (isPostPreview) {
    // When using composite post preview, no title or description (everything is in the image)
    // Exception: WhatsApp needs title/description to show preview
    title = '';
    description = '';
  } else if (isCompositeImage) {
    // For platforms using composite image: just the cast text, no description
    title = cleanText || 'Loading cast content...';
    description = '';
  } else {
    // For all other platforms: clean title, display name in description
    title = cleanText || 'Loading cast content...';
    description = cast ? `${displayName} on Farcaster` : 'Loading...';
  }
  
  const metadata: Metadata = {
    title,
    description,
    metadataBase: new URL(baseUrl),
    openGraph: {
      title,
      description,
      url: `${baseUrl}/${username}/${hash}`,
      siteName: (isPostPreview && !useStandardPreview) ? '' : 'Farcaster',
      type: 'article',
      locale: 'en_US',
      alternateLocale: 'en',
    },
    twitter: {
      // Use large image card for embedded images and composite images
      card: (hasEmbeddedImage || isCompositeImage) ? 'summary_large_image' : 'summary',
      title,
      description,
      creator: `@${cast?.author.username || username}`,
      site: '@farcaster',
    },
  };
  
  // Only add images if we have them
  if (previewImage) {
    // Determine appropriate dimensions based on image type
    let imageWidth: number;
    let imageHeight: number | undefined;
    let imageAlt: string;
    
    if (useStandardPreview || isWhatsApp || isTelegram || isFacebook || isLinkedIn) {
      // Standard preview uses appropriate dimensions based on image type
      if (hasEmbeddedImage) {
        imageWidth = 1200;
        imageHeight = 630;
        imageAlt = `Post by ${displayName}`;
      } else {
        // Profile picture
        imageWidth = 400;
        imageHeight = 400;
        imageAlt = displayName;
      }
    } else if (isPostPreview) {
      // Post preview images have dynamic height, only set width
      imageWidth = 600;
      // Don't set height for dynamic images
      imageHeight = undefined;
      imageAlt = `${displayName} on Farcaster`;
    } else if (isCompositeImage) {
      // Composite images are horizontal format
      imageWidth = 1200;
      imageHeight = 300;
      imageAlt = `${displayName} on Farcaster`;
    } else if (hasEmbeddedImage) {
      // Embedded images use large format
      imageWidth = 1200;
      imageHeight = 630;
      imageAlt = `Post by ${displayName}`;
    } else {
      // Profile pictures use square format
      imageWidth = 400;
      imageHeight = 400;
      imageAlt = displayName;
    }
    
    interface ImageData {
      url: string;
      width: number;
      alt: string;
      height?: number;
    }
    
    const imageData: ImageData = {
      url: previewImage,
      width: imageWidth,
      alt: imageAlt,
    };
    
    // Only add height if it's defined (not for dynamic height images)
    if (imageHeight !== undefined) {
      imageData.height = imageHeight;
    }
    
    metadata.openGraph!.images = [imageData];
    metadata.twitter!.images = [previewImage];
  }
  
  // Add comprehensive favicon references
  metadata.icons = {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/fc.png', type: 'image/png' }
    ],
    apple: '/fc.png',
    other: [
      {
        rel: 'icon',
        url: '/fc.png',
      },
    ],
  };
  
  return metadata;
}

export default async function CastPage({ params }: PageProps) {
  const { username, hash } = await params;
  const headersList = await headers();
  const userAgent = headersList.get('user-agent') || '';
  
  // Check if this is a bot/crawler (for preview generation)
  const isBot = /\b(bot|crawler|spider|crawling|facebookexternalhit|twitterbot|telegrambot|discordbot|slackbot|linkedinbot|opengraph|metainspector|whatsapp|telegram)\b/i.test(userAgent);
  
  // Prepare the redirect URL for non-bot users
  const originalUrl = `https://farcaster.xyz/${username}/${hash}`;
  const shouldRedirect = !isBot;
  
  // Fetch cast data for display
  const castData = await fetchCastByUrl(username, hash) as CastWithReactions | null;
  
  return (
    <>
      {shouldRedirect && <ClientRedirect url={originalUrl} delay={10} />}
      <div className="min-h-screen" style={{ backgroundColor: '#17101f' }}>
        {shouldRedirect ? (
          <p className="text-white text-sm p-4">navigating to farcaster.xyz...</p>
        ) : (
          <div className="flex items-center justify-center min-h-screen p-4">
            <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8">
              <h1 className="text-2xl font-bold text-purple-900 mb-4">
                Farcaster Cast Preview
              </h1>
              {castData ? (
                <>
                  <div className="mb-6">
                    <p className="text-sm text-gray-500 mb-2">@{castData.author.username}</p>
                    <p className="text-gray-700">{castData.text}</p>
                  </div>
                  <p className="text-sm text-gray-500 mb-6">
                    {castData.reactions?.likes_count || 0} likes · {castData.reactions?.recasts_count || 0} recasts
                  </p>
                </>
              ) : (
                <>
                  <p className="text-gray-600 mb-6">
                    Loading cast from @{username}...
                  </p>
                  <p className="text-sm text-gray-500 mb-6">
                    Hash: {hash}
                  </p>
                </>
              )}
              <a 
                href={originalUrl}
                className="inline-block bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
              >
                View on Farcaster
              </a>
            </div>
          </div>
        )}
      </div>
    </>
  );
}