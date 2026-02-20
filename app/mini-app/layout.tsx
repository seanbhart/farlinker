import type { Metadata } from 'next';

const miniAppEmbed = {
  version: '1',
  imageUrl: 'https://farlinker.xyz/farlinker-hero-v2.png',
  button: {
    title: 'Open Farlinker',
    action: {
      type: 'launch_miniapp',
      name: 'Farlinker',
      url: 'https://farlinker.xyz/mini-app',
      splashImageUrl: 'https://farlinker.xyz/farlinker-200-v2.png',
      splashBackgroundColor: '#8A63D2',
    },
  },
};

export const metadata: Metadata = {
  title: 'Farlinker',
  description: 'Share Farcaster posts with rich link previews',
  other: {
    'fc:miniapp': JSON.stringify(miniAppEmbed),
  },
};

export default function MiniAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
