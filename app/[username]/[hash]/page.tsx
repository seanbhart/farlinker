import { Metadata } from 'next';
import { headers } from 'next/headers';
import { fetchCastByUrl } from '@/lib/neynar';
import { detectPlatform, extractEmbedData, cleanCastText, selectPreviewImage, buildTitleDescription, buildImageDimensions } from '@/lib/metadata';
import { ClientRedirect } from './client-redirect';
import { track } from '@vercel/analytics/server';

interface PageProps {
  params: Promise<{ username: string; hash: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { username, hash } = await params;
  const urlParams = await searchParams;

  const useSimpleFormat = urlParams.simple === 'true' || urlParams.simple === '1';
  const useStandardPreview = urlParams.preview === 'standard';

  const headersList = await headers();
  const userAgent = headersList.get('user-agent') || '';
  const platform = detectPlatform(userAgent);

  const cast = await fetchCastByUrl(username, hash);
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://farlinker.xyz';

  // Extract embed data
  const embedData = cast?.embeds && cast.embeds.length > 0
    ? extractEmbedData(cast.embeds)
    : { embedUrls: [], firstImage: undefined, firstImageDimensions: undefined, hasEmbeddedImage: false };

  const cleanText = cleanCastText(cast?.text || '', embedData.embedUrls);

  // Select preview image
  const preview = selectPreviewImage({
    platform,
    useStandardPreview,
    useSimpleFormat,
    baseUrl,
    embedData,
    cleanText,
    author: {
      pfp_url: cast?.author.pfp_url,
      display_name: cast?.author.display_name,
      username: cast?.author.username || username,
    },
  });

  const displayName = cast?.author.display_name || cast?.author.username || username;

  // Build title and description
  const { title, description } = buildTitleDescription({
    platform,
    useStandardPreview,
    isPostPreview: preview.isPostPreview,
    isCompositeImage: preview.isCompositeImage,
    displayName,
    cleanText,
    hasCast: !!cast,
  });

  const metadata: Metadata = {
    title,
    description,
    metadataBase: new URL(baseUrl),
    openGraph: {
      title,
      description,
      url: `${baseUrl}/${username}/${hash}`,
      siteName: (preview.isPostPreview && !useStandardPreview) ? '' : 'Farcaster',
      type: 'article',
      locale: 'en_US',
      alternateLocale: 'en',
    },
    twitter: {
      card: (preview.hasEmbeddedImage || preview.isCompositeImage) ? 'summary_large_image' : 'summary',
      title,
      description,
      creator: `@${cast?.author.username || username}`,
      site: '@farcaster',
    },
  };

  if (preview.previewImage) {
    const dims = buildImageDimensions({
      platform,
      useStandardPreview,
      isPostPreview: preview.isPostPreview,
      isCompositeImage: preview.isCompositeImage,
      hasEmbeddedImage: preview.hasEmbeddedImage,
      displayName,
    });

    const imageData: { url: string; width: number; alt: string; height?: number } = {
      url: preview.previewImage,
      width: dims.width,
      alt: dims.alt,
    };
    if (dims.height !== undefined) {
      imageData.height = dims.height;
    }

    metadata.openGraph!.images = [imageData];
    metadata.twitter!.images = [preview.previewImage];
  }

  metadata.icons = {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/farlinker.png', type: 'image/png' }
    ],
    apple: '/farlinker.png',
    other: [{ rel: 'icon', url: '/farlinker.png' }],
  };

  return metadata;
}

export default async function CastPage({ params, searchParams }: PageProps) {
  const { username, hash } = await params;
  const urlParams = await searchParams;
  const headersList = await headers();
  const userAgent = headersList.get('user-agent') || '';

  const isBot = /\b(bot|crawler|spider|crawling|facebookexternalhit|twitterbot|telegrambot|discordbot|slackbot|linkedinbot|opengraph|metainspector|whatsapp|telegram)\b/i.test(userAgent);
  const originalUrl = `https://farcaster.xyz/${username}/${hash}`;
  const shouldRedirect = !isBot;

  if (!isBot) {
    await track('farlinker_link_visited', {
      username,
      hash,
      format: urlParams.preview === 'standard' ? 'standard' : 'enhanced',
      userAgent: userAgent.substring(0, 100),
    });
  }

  const cast = await fetchCastByUrl(username, hash);

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
              {cast ? (
                <div className="mb-6">
                  <p className="text-sm text-gray-500 mb-2">@{cast.author.username}</p>
                  <p className="text-gray-700">{cast.text}</p>
                </div>
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
