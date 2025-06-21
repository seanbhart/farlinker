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
  
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://farlinker.vercel.app';
  
  // Extract first image from cast embeds if available
  let previewImage: string | undefined;
  const embedUrls: string[] = [];
  
  if (cast?.embeds && cast.embeds.length > 0) {
    for (const embed of cast.embeds) {
      if ('url' in embed && embed.url) {
        embedUrls.push(embed.url);
        // Use the first embed URL as preview image (only if it's actually an image)
        if (!previewImage) {
          previewImage = embed.url;
        }
      }
    }
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
  
  // Set metadata according to requirements:
  // - Title: Full post text (without embedded URLs)
  // - Description: Username
  const title = cleanText || 'Loading cast content...';
  const description = cast ? `@${cast.author.username}` : `@${username}`;
  
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
      card: previewImage ? 'summary_large_image' : 'summary',
      title,
      description,
      creator: `@${cast?.author.username || username}`,
      site: '@farcaster',
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
  const isBot = /\b(bot|crawler|spider|crawling|facebookexternalhit|twitterbot|telegrambot|discordbot|slackbot|linkedinbot|opengraph|metainspector|whatsapp|telegram)\b/i.test(userAgent);
  
  // Prepare the redirect URL for non-bot users
  const originalUrl = `https://farcaster.xyz/${username}/${hash}`;
  const shouldRedirect = !isBot;
  
  // Fetch cast data for display
  const castData = await fetchCastByUrl(username, hash);
  
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
        </div>
      </div>
    </>
  );
}