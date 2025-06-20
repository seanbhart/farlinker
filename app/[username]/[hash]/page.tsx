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
  
  // Construct the original Farcaster URL
  const originalUrl = `https://farcaster.xyz/${username}/${hash}`;
  const previewImageUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://farlinker.xyz'}/api/og/${username}/${hash}`;
  
  // Farcaster Frame Embed JSON
  const frameEmbed = {
    version: "next",
    imageUrl: previewImageUrl,
    button: {
      title: "View on Farcaster",
      action: {
        type: "launch_frame",
        name: "Farlinker",
        url: originalUrl,
        splashImageUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://farlinker.xyz'}/splash.png`,
        splashBackgroundColor: "#8B5CF6"
      }
    }
  };
  
  // Use real cast data for metadata if available
  const authorName = cast?.author.display_name || cast?.author.username || username;
  const title = `${authorName} on Farcaster`;
  const description = cast?.text ? 
    (cast.text.length > 160 ? cast.text.substring(0, 157) + '...' : cast.text) : 
    'View this cast on Farcaster';
  
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [previewImageUrl],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [previewImageUrl],
    },
    other: {
      'fc:frame': JSON.stringify(frameEmbed),
    },
  };
}

export default async function CastPage({ params }: PageProps) {
  const { username, hash } = await params;
  const headersList = await headers();
  const userAgent = headersList.get('user-agent') || '';
  
  // Check if this is a bot/crawler (for preview generation)
  const isBot = /bot|crawler|spider|crawling|facebook|twitter|telegram|discord|slack/i.test(userAgent);
  
  // If not a bot, redirect to the original Farcaster URL
  if (!isBot) {
    const originalUrl = `https://farcaster.xyz/${username}/${hash}`;
    redirect(originalUrl);
  }
  
  // For bots, render a simple preview page
  return (
    <div className="min-h-screen bg-purple-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold text-purple-900 mb-4">
          Farcaster Cast Preview
        </h1>
        <p className="text-gray-600 mb-6">
          Loading cast from @{username}...
        </p>
        <a 
          href={`https://farcaster.xyz/${username}/${hash}`}
          className="inline-block bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
        >
          View on Farcaster
        </a>
      </div>
    </div>
  );
}