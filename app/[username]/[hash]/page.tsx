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
}

// Generate dynamic metadata for Open Graph and Farcaster Frame
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username, hash } = await params;
  
  // Get headers to check user agent
  const headersList = await headers();
  const userAgent = headersList.get('user-agent') || '';
  
  // Check if this is Apple Messages or WhatsApp
  const isAppleMessages = userAgent.includes('facebookexternalhit/1.1 Facebot Twitterbot/1.0'); // Apple Messages pattern
  const isWhatsApp = userAgent.toLowerCase().includes('whatsapp');
  
  // Fetch cast data using Neynar SDK
  const cast = await fetchCastByUrl(username, hash);
  
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://farlinker.xyz';
  
  // Extract first image from cast embeds if available
  let previewImage: string | undefined;
  let hasEmbeddedImage = false;
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
        
        // Use the first image URL as preview image
        if (!previewImage && isImage) {
          previewImage = embed.url;
          hasEmbeddedImage = true;
        }
      }
    }
  }
  
  // Track if we're using a composite image
  let isCompositeImage = false;
  
  // If no embedded image, handle differently based on platform
  if (!previewImage && cast?.author.pfp_url) {
    const displayName = cast.author.display_name || cast.author.username;
    
    // For Apple Messages and WhatsApp without embedded images, try composite image
    if ((isAppleMessages || isWhatsApp) && !hasEmbeddedImage) {
      try {
        // Create composite image with profile pic and name
        const ogImageUrl = new URL('/api/og-image', baseUrl);
        ogImageUrl.searchParams.set('pfp', cast.author.pfp_url);
        ogImageUrl.searchParams.set('name', displayName);
        previewImage = ogImageUrl.toString();
        isCompositeImage = true;
        console.log('[Metadata] Generated composite image URL:', previewImage);
        console.log('[Metadata] Profile pic URL:', cast.author.pfp_url);
        console.log('[Metadata] Display name:', displayName);
      } catch (error) {
        console.error('[Metadata] Failed to generate composite image:', error);
        // Fall back to no image for Apple Messages
        if (!isAppleMessages) {
          previewImage = cast.author.pfp_url;
        }
      }
    } else if (!isAppleMessages) {
      // For other platforms (not Apple Messages), use the profile picture
      previewImage = cast.author.pfp_url;
      // Keep hasEmbeddedImage as false so it uses the small card format
    }
    
    // Log for debugging
    console.log(`[Metadata] Platform: ${isAppleMessages ? 'Apple Messages' : isWhatsApp ? 'WhatsApp' : 'Other'}, Using image: ${previewImage || 'none'}, Composite: ${isCompositeImage}`);
  }
  
  // Clean up the cast text by removing embedded URLs
  let cleanText = cast?.text || '';
  if (cast && embedUrls.length > 0) {
    // Remove any URLs that match embeds to avoid duplication
    embedUrls.forEach(url => {
      cleanText = cleanText.replace(url, '').trim();
    });
    // Clean up any extra whitespace
    cleanText = cleanText.replace(/\s+/g, ' ').trim();
  }
  
  // Set metadata according to requirements based on platform
  const displayName = cast?.author.display_name || cast?.author.username || username;
  
  let title: string;
  let description: string;
  
  if (isAppleMessages) {
    // For Apple Messages: put display name at beginning of title, no description
    title = cast ? `${displayName} on Farcaster\n\n${cleanText}` : 'Loading cast content...';
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
      siteName: 'Farcaster',
      type: 'article',
      locale: 'en_US',
      alternateLocale: 'en',
    },
    twitter: {
      // Use large image card only for embedded images, small card for profile pics and composite images
      card: (hasEmbeddedImage && !isCompositeImage) ? 'summary_large_image' : 'summary',
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
    let imageHeight: number;
    let imageAlt: string;
    
    if (isCompositeImage) {
      // Composite images are 320x80
      imageWidth = 320;
      imageHeight = 80;
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
    
    metadata.openGraph!.images = [{
      url: previewImage,
      width: imageWidth,
      height: imageHeight,
      alt: imageAlt,
    }];
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