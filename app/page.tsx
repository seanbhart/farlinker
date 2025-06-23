'use client';

import Image from 'next/image';
import { track } from '@vercel/analytics';

export default function Home() {
  const shareViaMessages = (url: string, format: 'enhanced' | 'standard') => {
    // Track the share action
    track('share_button_clicked', {
      format,
      url,
      method: navigator.share ? 'native_share' : 'clipboard'
    });

    // Use native share API if available (mobile)
    if (navigator.share) {
      navigator.share({
        text: url,
      }).catch(() => {
        // Fallback to SMS on mobile if share fails
        window.location.href = `sms:?body=${encodeURIComponent(url)}`;
      });
    } else {
      // Desktop fallback - copy to clipboard
      navigator.clipboard.writeText(url).then(() => {
        alert('Link copied to clipboard! Paste it in your messaging app.');
      });
    }
  };

  return (
    <main className="min-h-screen" style={{ backgroundColor: '#17101f' }}>
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-semibold text-white mb-3">
            Farlinker
          </h1>
          <p className="text-gray-400 mb-12">
            Better link previews for Farcaster posts
          </p>
          
          <div style={{ backgroundColor: '#1c1a24' }} className="rounded-lg p-8 mb-8 border border-gray-800">
            <h2 className="text-xl font-medium text-white mb-6">
              How it works
            </h2>
            <ol className="space-y-4 text-gray-300">
              <li className="flex">
                <span className="text-purple-400 mr-3 font-medium">1.</span>
                <span>Take any Farcaster post URL</span>
              </li>
              <li className="flex">
                <span className="text-purple-400 mr-3 font-medium">2.</span>
                <span>Replace &quot;farcaster.xyz&quot; with &quot;farlinker.xyz&quot;</span>
              </li>
              <li className="flex">
                <span className="text-purple-400 mr-3 font-medium">3.</span>
                <span>Share the new link to get rich previews on Twitter, Discord, Telegram, and more</span>
              </li>
              <li className="flex">
                <span className="text-purple-400 mr-3 font-medium">4.</span>
                <span>When clicked, users are seamlessly redirected to the original Farcaster post</span>
              </li>
            </ol>
          </div>
          
          <div style={{ backgroundColor: '#1c1a24' }} className="rounded-lg p-8 border border-gray-800">
            <h2 className="text-xl font-medium text-white mb-6">
              Example
            </h2>
            <div className="space-y-3">
              <div className="font-mono text-sm bg-black/40 p-4 rounded border border-gray-800">
                <span className="text-gray-500">Original:</span>
                <br />
                <span className="text-gray-300">farcaster.xyz/dwr.eth/0xce8c7b65</span>
              </div>
              <div className="font-mono text-sm bg-black/40 p-4 rounded border border-gray-800">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex-1">
                    <span className="text-gray-500">Farlinker format:</span>
                    <br />
                    <span className="text-gray-300 break-all">farlinker.xyz/dwr.eth/0xce8c7b65</span>
                  </div>
                  <button
                    onClick={() => shareViaMessages('https://farlinker.xyz/dwr.eth/0xce8c7b65', 'enhanced')}
                    className="w-full sm:w-auto px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition-colors"
                  >
                    Share
                  </button>
                </div>
              </div>
              <div className="font-mono text-sm bg-black/40 p-4 rounded border border-gray-800">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex-1">
                    <span className="text-gray-500">Farlinker standard open graph format:</span>
                    <br />
                    <span className="text-gray-300 break-all">farlinker.xyz/dwr.eth/0xce8c7b65?preview=standard</span>
                  </div>
                  <button
                    onClick={() => shareViaMessages('https://farlinker.xyz/dwr.eth/0xce8c7b65?preview=standard', 'standard')}
                    className="w-full sm:w-auto px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition-colors"
                  >
                    Share
                  </button>
                </div>
              </div>
            </div>
            <p className="text-gray-500 text-sm mt-4">
              Tap the Share buttons to send these examples via your messaging app
            </p>
          </div>
          
          <div style={{ backgroundColor: '#1c1a24' }} className="rounded-lg p-8 border border-gray-800 mt-8">
            <h2 className="text-xl font-medium text-white mb-6">
              See the difference
            </h2>
            <div className="space-y-6">
              <div>
                <p className="text-gray-400 text-sm mb-3">Before (Farcaster link):</p>
                <div className="relative w-full max-w-md mx-auto bg-black p-4 rounded-lg">
                  <Image 
                    src="/apple_messages_farcaster.png" 
                    alt="Farcaster link preview in Apple Messages"
                    width={400}
                    height={300}
                    className="rounded-lg w-full h-auto"
                    priority
                  />
                </div>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-3">After (Farlinker format):</p>
                <div className="relative w-full max-w-md mx-auto bg-black p-4 rounded-lg">
                  <Image 
                    src="/apple_messages_farlinker.png" 
                    alt="Farlinker link preview in Apple Messages"
                    width={400}
                    height={300}
                    className="rounded-lg w-full h-auto"
                    priority
                  />
                </div>
              </div>
              <div>
                <p className="text-gray-400 text-sm mb-3">Farlinker with standard open graph format (with ?preview=standard):</p>
                <div className="relative w-full max-w-md mx-auto bg-black p-4 rounded-lg">
                  <Image 
                    src="/apple_messages_farlinker_standard.png" 
                    alt="Farlinker standard preview in Apple Messages"
                    width={400}
                    height={300}
                    className="rounded-lg w-full h-auto"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-12 text-center text-gray-500">
            <p>Made for the Farcaster community with 💜</p>
          </div>
        </div>
      </div>
    </main>
  );
}
