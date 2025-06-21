import { Metadata } from 'next';
import { headers } from 'next/headers';
import { fetchCastByUrl } from '@/lib/neynar-client';
import { ClientRedirect } from './client-redirect';

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
    console.log('Checking embeds for images, total embeds:', cast.embeds.length);
    // Look through all embeds to find one with a URL
    for (let i = 0; i < cast.embeds.length; i++) {
      const embed = cast.embeds[i];
      console.log(`Embed ${i}:`, JSON.stringify(embed, null, 2));
      if ('url' in embed && embed.url) {
        previewImage = embed.url;
        console.log('Found embed URL for preview:', previewImage);
        break;
      }
    }
  }
  
  // Only use author's profile picture as fallback if no embed URL found
  if (!previewImage && cast?.author.pfp_url) {
    console.log('No embed image found, using profile picture:', cast.author.pfp_url);
    previewImage = cast.author.pfp_url;
  }
  
  console.log('Final preview image:', previewImage);
  
  // Use real cast data for metadata if available
  const authorName = cast?.author.display_name || cast?.author.username || username;
  
  // Format like Twitter: split long text between title and description
  // Twitter shows ~70 chars in title and ~200 chars in description
  let title: string;
  let description: string;
  
  if (cast?.text) {
    if (cast.text.length <= 70) {
      // Short text: use full text as title, author as description
      title = cast.text;
      description = `${authorName} on Farcaster`;
    } else {
      // Long text: split between title and description
      title = cast.text.substring(0, 70);
      // Continue the text in description, showing up to 200 more characters
      const remainingText = cast.text.substring(70);
      if (remainingText.length > 0) {
        description = remainingText.length > 200 ? 
          remainingText.substring(0, 197) + '...' : 
          remainingText;
      } else {
        description = `${authorName} on Farcaster`;
      }
    }
  } else {
    title = 'View this cast on Farcaster';
    description = `${authorName} on Farcaster`;
  }
  
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
      locale: 'en_US',
      alternateLocale: 'en',
    },
    twitter: {
      card: previewImage ? 'summary_large_image' : 'summary',
      title,
      description,
      creator: `@${cast?.author.username || username}`,
      site: '@farlinker',
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
  
  console.log('CastPage - User Agent:', userAgent);
  
  // Check if this is a bot/crawler (for preview generation)
  // Use word boundaries to avoid false matches
  const isBot = /\b(bot|crawler|spider|crawling|facebookexternalhit|twitterbot|telegrambot|discordbot|slackbot|linkedinbot|opengraph|metainspector|whatsapp|telegram)\b/i.test(userAgent);
  
  console.log('CastPage - Is Bot:', isBot);
  
  // Prepare the redirect URL for non-bot users
  const originalUrl = `https://farcaster.xyz/${username}/${hash}`;
  const shouldRedirect = !isBot;
  
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
    <>
      {shouldRedirect && <ClientRedirect url={originalUrl} delay={1000} />}
      <div className="min-h-screen bg-purple-50 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-2xl font-bold text-purple-900 mb-4">
            Farcaster Cast Preview
          </h1>
          {shouldRedirect && (
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-700">Redirecting to Farcaster in a moment...</p>
            </div>
          )}
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
            href={originalUrl}
            className="inline-block bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
          >
            View on Farcaster
          </a>
          {debugInfo}
        </div>
      </div>
    </>
  );
}