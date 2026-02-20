import type { Metadata } from 'next';

const miniAppEmbed = {
  version: '1',
  imageUrl: 'https://farlinker.xyz/farlinker-hero.png',
  button: {
    title: 'Open Farlinker',
    action: {
      type: 'launch_miniapp',
      name: 'Farlinker',
      url: 'https://farlinker.xyz/mini-app',
      splashImageUrl: 'https://farlinker.xyz/farlinker.png',
      splashBackgroundColor: '#8B5CF6',
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
