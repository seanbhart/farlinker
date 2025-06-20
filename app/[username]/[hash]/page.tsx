import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { fetchCastByUrl } from '@/lib/neynar-client';

interface PageProps {
  params: Promise<{
    username: string;
    hash: string;
  }>;
}

// Generate dynamic metadata for Open Graph and Farcaster Frame
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username, hash } = await params;
  
  // Fetch cast data using Neynar SDK
  const cast = await fetchCastByUrl(username, hash);
  
  console.log('Metadata generation - Cast found:', !!cast);
  console.log('Metadata generation - Cast text:', cast?.text?.substring(0, 100));
  
  // Use the actual deployment URL
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://farlinker.vercel.app';
  
  // Extract image from cast embeds if available
  let previewImage: string | undefined;
  if (cast?.embeds && cast.embeds.length > 0) {
    console.log('Cast embeds:', JSON.stringify(cast.embeds, null, 2));
    // Look for image embeds
    for (const embed of cast.embeds) {
      // Check if it's a URL embed
      if ('url' in embed && embed.url) {
        console.log('Found URL embed:', embed.url);
        
        // Check if it has image metadata
        if ('metadata' in embed && embed.metadata) {
          const metadata = embed.metadata as any;
          if (metadata.content_type && metadata.content_type.startsWith('image/')) {
            previewImage = embed.url;
            console.log('Using embed image (via metadata):', previewImage);
            break;
          }
        }
        
        // Fallback to URL pattern matching
        if (!previewImage && (
            embed.url.match(/\.(jpg|jpeg|png|gif|webp)$/i) || 
            embed.url.includes('imgur.com') ||
            embed.url.includes('i.imgur.com') ||
            embed.url.includes('imagedelivery.net') ||
            embed.url.includes('mypinata.cloud'))) {
          previewImage = embed.url;
          console.log('Using embed image (via URL pattern):', previewImage);
          break;
        }
      }
      
      // Check for cast embeds with images
      if ('cast' in embed && embed.cast && 'embeds' in embed.cast && embed.cast.embeds) {
        // Check embeds within quoted cast
        for (const innerEmbed of embed.cast.embeds as any[]) {
          if (innerEmbed.url && innerEmbed.metadata?.content_type?.startsWith('image/')) {
            previewImage = innerEmbed.url;
            console.log('Using image from quoted cast:', previewImage);
            break;
          }
        }
      }
    }
  }
  
  // Only use author's profile picture as fallback if no embed image found
  if (!previewImage && cast?.author.pfp_url) {
    previewImage = cast.author.pfp_url;
  }
  
  // Use real cast data for metadata if available
  const authorName = cast?.author.display_name || cast?.author.username || username;
  const title = `${authorName} on Farcaster`;
  const description = cast?.text ? 
    (cast.text.length > 160 ? cast.text.substring(0, 157) + '...' : cast.text) : 
    'View this cast on Farcaster';
  
  const metadata: Metadata = {
    title,
    description,
    metadataBase: new URL(baseUrl),
    openGraph: {
      title,
      description,
      url: `${baseUrl}/${username}/${hash}`,
      siteName: 'Farlinker',
      type: 'website',
    },
    twitter: {
      card: previewImage ? 'summary_large_image' : 'summary',
      title,
      description,
      creator: `@${cast?.author.username || username}`,
    },
  };
  
  // Only add images if we have them
  if (previewImage) {
    metadata.openGraph!.images = [previewImage];
    metadata.twitter!.images = [previewImage];
  }
  
  return metadata;
}

export default async function CastPage({ params }: PageProps) {
  const { username, hash } = await params;
  const headersList = await headers();
  const userAgent = headersList.get('user-agent') || '';
  
  // Check if this is a bot/crawler (for preview generation)
  // Use word boundaries to avoid false matches
  const isBot = /\b(bot|crawler|spider|crawling|facebookexternalhit|twitterbot|telegrambot|discordbot|slackbot|linkedinbot)\b/i.test(userAgent);
  
  // Log for debugging (remove in production)
  console.log('User Agent:', userAgent);
  console.log('Is Bot:', isBot);
  
  // If not a bot, redirect to the original Farcaster URL
  if (!isBot) {
    const originalUrl = `https://farcaster.xyz/${username}/${hash}`;
    redirect(originalUrl);
  }
  
  // Fetch cast data for display
  const castData = await fetchCastByUrl(username, hash);
  
  // For bots, render a simple preview page with debug info
  const debugInfo = (
    <div className="mt-4 p-4 bg-gray-100 rounded text-xs text-gray-600">
      <p>Debug: User Agent: {userAgent.substring(0, 50)}...</p>
      <p>Is Bot: {isBot ? 'Yes' : 'No'}</p>
      <p>Base URL: {process.env.NEXT_PUBLIC_BASE_URL}</p>
      <p>Cast found: {castData ? 'Yes' : 'No'}</p>
      {castData && <p>Cast text: {castData.text.substring(0, 100)}...</p>}
    </div>
  );
  
  return (
    <div className="min-h-screen bg-purple-50 flex items-center justify-center p-4">
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
              {castData.reactions.likes_count} likes · {castData.reactions.recasts_count} recasts
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
          href={`https://farcaster.xyz/${username}/${hash}`}
          className="inline-block bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
        >
          View on Farcaster
        </a>
        {debugInfo}
      </div>
    </div>
  );
}