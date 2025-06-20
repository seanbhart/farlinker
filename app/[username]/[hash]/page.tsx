import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { fetchCastByIdentifier } from '@/lib/neynar';

interface PageProps {
  params: Promise<{
    username: string;
    hash: string;
  }>;
}

// Generate dynamic metadata for Open Graph and Farcaster Frame
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username, hash } = await params;
  
  // Try to fetch cast data for better metadata
  const formattedHash = hash.startsWith('0x') ? hash : `0x${hash}`;
  const cast = await fetchCastByIdentifier(formattedHash);
  
  console.log('Metadata generation - Cast found:', !!cast);
  console.log('Metadata generation - Cast text:', cast?.text?.substring(0, 100));
  
  // Use the actual deployment URL
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://farlinker.vercel.app';
  
  // Extract image from cast embeds if available
  let previewImage: string | undefined;
  if (cast?.embeds && cast.embeds.length > 0) {
    // Look for direct image URLs
    const imageEmbed = cast.embeds.find(embed => 
      embed.url && (
        embed.url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ||
        embed.metadata?.content_type?.startsWith('image/')
      )
    );
    
    if (imageEmbed?.url) {
      previewImage = imageEmbed.url;
    } else {
      // Look for Open Graph images from HTML embeds
      const htmlEmbed = cast.embeds.find(embed => embed.metadata?.html?.ogImage);
      if (htmlEmbed?.metadata?.html?.ogImage) {
        previewImage = htmlEmbed.metadata.html.ogImage;
      }
    }
  }
  
  // Use author's profile picture as fallback
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
  const castData = await fetchCastByIdentifier(hash.startsWith('0x') ? hash : `0x${hash}`);
  
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