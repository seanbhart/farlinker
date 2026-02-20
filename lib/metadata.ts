import type { Platform, EmbedData, PreviewImageResult } from './types';

export function detectPlatform(userAgent: string): Platform {
  const isAppleMessages = userAgent.includes('facebookexternalhit/1.1 Facebot Twitterbot/1.0');
  const isWhatsApp = userAgent.toLowerCase().includes('whatsapp') ||
                     userAgent.includes('WhatsApp') ||
                     (userAgent.includes('facebookexternalhit/1.1') && !userAgent.includes('Twitterbot') && !userAgent.includes('Facebot'));
  const isTelegram = userAgent.toLowerCase().includes('telegram');
  const isFacebook = userAgent.includes('facebookexternalhit') && !isAppleMessages && !isWhatsApp;
  const isLinkedIn = userAgent.toLowerCase().includes('linkedinbot');

  return {
    isAppleMessages,
    isWhatsApp,
    isTelegram,
    isFacebook,
    isLinkedIn,
    isStandardTarget: isWhatsApp || isTelegram || isFacebook || isLinkedIn,
  };
}

function isImageUrl(url: string): boolean {
  return !!(
    url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ||
    url.includes('imagedelivery.net') ||
    url.includes('imgur.com') ||
    url.includes('i.imgur.com')
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function extractEmbedData(embeds: any[]): EmbedData {
  const embedUrls: string[] = [];
  let firstImage: string | undefined;
  let firstImageDimensions: { width: number; height: number } | undefined;
  let hasEmbeddedImage = false;

  for (const embed of embeds) {
    if (!('url' in embed) || !embed.url) continue;

    embedUrls.push(embed.url);

    if (!firstImage && isImageUrl(embed.url)) {
      firstImage = embed.url;
      hasEmbeddedImage = true;

      if ('metadata' in embed && embed.metadata?.image) {
        const { width_px, height_px } = embed.metadata.image;
        if (width_px && height_px) {
          firstImageDimensions = { width: width_px, height: height_px };
        }
      }
    }
  }

  return { embedUrls, firstImage, firstImageDimensions, hasEmbeddedImage };
}

export function cleanCastText(text: string, embedUrls: string[]): string {
  let cleaned = text;
  for (const url of embedUrls) {
    cleaned = cleaned.replace(url, '').trim();
  }
  return cleaned.replace(/\s+/g, ' ').trim();
}

interface PreviewImageInput {
  platform: Platform;
  useStandardPreview: boolean;
  useSimpleFormat: boolean;
  baseUrl: string;
  embedData: EmbedData;
  cleanText: string;
  author: {
    pfp_url?: string;
    display_name?: string;
    username: string;
  };
}

export function selectPreviewImage(input: PreviewImageInput): PreviewImageResult {
  const { platform, useStandardPreview, baseUrl, embedData, cleanText, author } = input;
  let { useSimpleFormat } = input;
  const displayName = author.display_name || author.username;

  let previewImage: string | undefined = embedData.hasEmbeddedImage ? embedData.firstImage : undefined;
  let isCompositeImage = false;
  let isPostPreview = false;
  let hasEmbeddedImage = embedData.hasEmbeddedImage;

  // Standard preview or standard-target platforms: use embedded image or profile pic
  if (useStandardPreview || platform.isStandardTarget) {
    if (!previewImage && author.pfp_url) {
      previewImage = author.pfp_url;
    }
    return { previewImage, isCompositeImage, isPostPreview, hasEmbeddedImage };
  }

  // Enhanced preview: build composite image
  if ((!previewImage || !useSimpleFormat) && author.pfp_url) {
    if (!useSimpleFormat) {
      try {
        const encodedPfp = encodeURIComponent(author.pfp_url);
        const encodedName = encodeURIComponent(displayName);
        const encodedText = encodeURIComponent(cleanText);
        const encodedUsername = encodeURIComponent(author.username);
        let compositeUrl = `${baseUrl}/api/og-post.png?pfp=${encodedPfp}&name=${encodedName}&text=${encodedText}&username=${encodedUsername}`;

        if (embedData.firstImage) {
          compositeUrl += `&image=${encodeURIComponent(embedData.firstImage)}`;
          if (embedData.firstImageDimensions) {
            const aspectRatio = embedData.firstImageDimensions.height / embedData.firstImageDimensions.width;
            compositeUrl += `&aspectRatio=${aspectRatio}`;
          }
          if (platform.isWhatsApp || platform.isTelegram) {
            compositeUrl += '&platform=messaging';
          }
        }

        previewImage = compositeUrl;
        isCompositeImage = true;
        isPostPreview = true;
        hasEmbeddedImage = false;
      } catch {
        useSimpleFormat = true;
      }
    }

    // Simple format fallback
    if (useSimpleFormat) {
      if (platform.isAppleMessages || platform.isWhatsApp) {
        try {
          const encodedPfp = encodeURIComponent(author.pfp_url);
          const encodedName = encodeURIComponent(displayName);
          previewImage = `${baseUrl}/api/og-image.png?pfp=${encodedPfp}&name=${encodedName}`;
          isCompositeImage = true;
        } catch {
          previewImage = author.pfp_url;
        }
      } else {
        previewImage = author.pfp_url;
      }
    }
  }

  return { previewImage, isCompositeImage, isPostPreview, hasEmbeddedImage };
}

interface TitleDescInput {
  platform: Platform;
  useStandardPreview: boolean;
  isPostPreview: boolean;
  isCompositeImage: boolean;
  displayName: string;
  cleanText: string;
  hasCast: boolean;
}

export function buildTitleDescription(input: TitleDescInput): { title: string; description: string } {
  const { platform, useStandardPreview, isPostPreview, isCompositeImage, displayName, cleanText, hasCast } = input;

  if (useStandardPreview || platform.isStandardTarget) {
    if (platform.isAppleMessages) {
      return {
        title: hasCast ? `${displayName} on Farcaster\n\n${cleanText}` : 'Loading cast content...',
        description: '',
      };
    }
    return {
      title: hasCast ? cleanText || 'Farcaster' : 'Loading cast content...',
      description: hasCast ? `${displayName} on Farcaster` : 'View on Farcaster',
    };
  }

  if (platform.isAppleMessages || isPostPreview) {
    return { title: '', description: '' };
  }

  if (isCompositeImage) {
    return { title: cleanText || 'Loading cast content...', description: '' };
  }

  return {
    title: cleanText || 'Loading cast content...',
    description: hasCast ? `${displayName} on Farcaster` : 'Loading...',
  };
}

interface ImageDimsInput {
  platform: Platform;
  useStandardPreview: boolean;
  isPostPreview: boolean;
  isCompositeImage: boolean;
  hasEmbeddedImage: boolean;
  displayName: string;
}

export function buildImageDimensions(input: ImageDimsInput): { width: number; height?: number; alt: string } {
  const { platform, useStandardPreview, isPostPreview, isCompositeImage, hasEmbeddedImage, displayName } = input;

  if (useStandardPreview || platform.isStandardTarget) {
    if (hasEmbeddedImage) {
      return { width: 1200, height: 630, alt: `Post by ${displayName}` };
    }
    return { width: 400, height: 400, alt: displayName };
  }

  if (isPostPreview) {
    return { width: 600, alt: `${displayName} on Farcaster` };
  }

  if (isCompositeImage) {
    return { width: 1200, height: 300, alt: `${displayName} on Farcaster` };
  }

  if (hasEmbeddedImage) {
    return { width: 1200, height: 630, alt: `Post by ${displayName}` };
  }

  return { width: 400, height: 400, alt: displayName };
}
