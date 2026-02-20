export interface Platform {
  isAppleMessages: boolean;
  isWhatsApp: boolean;
  isTelegram: boolean;
  isFacebook: boolean;
  isLinkedIn: boolean;
  isStandardTarget: boolean; // true if platform prefers standard (non-composite) previews
}

export interface EmbedData {
  embedUrls: string[];
  firstImage: string | undefined;
  firstImageDimensions: { width: number; height: number } | undefined;
  hasEmbeddedImage: boolean;
}

export interface PreviewImageResult {
  previewImage: string | undefined;
  isCompositeImage: boolean;
  isPostPreview: boolean;
  hasEmbeddedImage: boolean;
}
