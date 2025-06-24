'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

function CopyPageContent() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [castData, setCastData] = useState<{
    authorUsername: string;
    hash: string;
    text?: string;
    author?: {
      username: string;
      display_name?: string;
      pfp_url: string;
    };
    embeds?: Array<{ url?: string; metadata?: { image?: { width_px: number; height_px: number } } }>;
  } | null>(null);
  const [embedImage, setEmbedImage] = useState<string | null>(null);
  
  // Get params from URL
  const castId = searchParams.get('castId') || '';
  const type = searchParams.get('type') || 'enhanced';
  const isStandard = type === 'standard';
  
  // Fetch the username from the cast details
  useEffect(() => {
    if (!castId) return;
    
    const fetchUsername = async () => {
      try {
        const response = await fetch('/api/cast-details', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ hash: castId })
        });
        
        if (response.ok) {
          const data = await response.json();
          setUsername(data.authorUsername || 'user');
          setCastData(data);
          
          // Extract first embedded image if available
          if (data.embeds && data.embeds.length > 0) {
            for (const embed of data.embeds) {
              if ('url' in embed && embed.url) {
                // Check if this is an image URL
                const isImage = embed.url.match(/\.(jpg|jpeg|png|gif|webp)$/i) || 
                               embed.url.includes('imagedelivery.net') ||
                               embed.url.includes('imgur.com') ||
                               embed.url.includes('i.imgur.com');
                
                if (isImage) {
                  setEmbedImage(embed.url);
                  break;
                }
              }
            }
          }
        } else {
          setUsername('user');
        }
      } catch (error) {
        console.error('Error fetching cast details:', error);
        setUsername('user');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsername();
  }, [castId]);
  
  // Construct the Farlinker URL
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://farlinker.xyz';
  const farlinkerUrl = username && castId 
    ? `${baseUrl}/${username}/${castId}${isStandard ? '?preview=standard' : ''}` 
    : '';
  
  const copyToClipboard = async () => {
    if (!farlinkerUrl) return;
    
    try {
      await navigator.clipboard.writeText(farlinkerUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for mobile
      const textArea = document.createElement('textarea');
      textArea.value = farlinkerUrl;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch {
        console.error('Failed to copy');
      }
      document.body.removeChild(textArea);
    }
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#17101f' }}>
        <div className="text-white">Loading cast details...</div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen p-4" style={{ backgroundColor: '#17101f' }}>
      <div className="max-w-4xl mx-auto pt-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Your Farlinker URL is Ready!</h1>
          <p className="text-gray-400">
            {isStandard ? 'Standard format' : 'Enhanced format'} link preview
          </p>
        </div>
        
        {/* URL Display */}
        <div className="bg-gray-900 rounded-lg p-6 mb-8">
          <div className="flex items-center gap-4">
            <input
              type="text"
              value={farlinkerUrl}
              readOnly
              className="flex-1 px-4 py-3 bg-gray-800 text-white rounded-lg border border-gray-700 font-mono text-sm"
              onClick={(e) => e.currentTarget.select()}
            />
            <button
              onClick={copyToClipboard}
              disabled={!farlinkerUrl}
              className={`px-6 py-3 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                copied 
                  ? 'bg-green-600 text-white' 
                  : 'bg-purple-600 hover:bg-purple-700 text-white'
              }`}
            >
              {copied ? '✓ Copied!' : 'Copy'}
            </button>
          </div>
        </div>
        
        {/* Preview Section */}
        {farlinkerUrl && castData && castData.author && (
          <div className="bg-gray-900 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-4">Link Preview</h2>
            
            {!isStandard ? (
              // Enhanced format - show both previews
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Apple Messages preview */}
                <div className="bg-gray-800 rounded-lg p-4 flex flex-col items-center">
                  <div className="text-sm text-gray-400 mb-3 self-start">Apple Messages preview:</div>
                  <div className="inline-block">
                    {/* Dark card that mimics the og-post.png output */}
                    <div className="bg-[#17101f] rounded-xl overflow-hidden" style={{ width: '300px' }}>
                      {/* Embedded image if present */}
                      {embedImage && (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={embedImage}
                          alt="Embedded content"
                          className="w-full h-auto object-contain bg-[#17101f]"
                        />
                      )}
                      
                      <div className={`${embedImage ? 'p-4' : 'p-5'} flex flex-col`} style={{ minHeight: embedImage ? '100px' : '180px' }}>
                        {/* Post text */}
                        {castData.text && (
                          <div className="text-white text-[15px] leading-[20px] whitespace-pre-wrap break-words flex-1">
                            {castData.text}
                          </div>
                        )}
                        
                        {/* User info at bottom */}
                        <div className="flex items-center gap-3 mt-4">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={castData.author.pfp_url}
                            alt={castData.author.display_name || username}
                            className="w-[30px] h-[30px] rounded-full"
                          />
                          <div className="flex flex-col">
                            <div className="text-white font-semibold text-[14px]">{castData.author.display_name || username}</div>
                            <div className="text-gray-400 text-[12px]">@{username}</div>
                          </div>
                        </div>
                      </div>
                      {/* Footer */}
                      <div className="border-t border-gray-700 px-4 py-2 bg-[#0f0a14]">
                        <div className="text-gray-400 text-xs">farlinker.xyz</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* General preview */}
                <div className="bg-gray-800 rounded-lg p-4">
                  <div className="text-sm text-gray-400 mb-3">General preview (most platforms):</div>
                  <div className="bg-gray-700 rounded overflow-hidden max-w-md w-full">
                    {/* Use embedded image if available for enhanced, otherwise profile banner */}
                    {embedImage ? (
                      <div className="relative aspect-[1.91/1] bg-gray-600">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={embedImage}
                          alt="Post image"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="relative h-[150px] bg-[#17101f] flex items-center px-8">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={castData.author.pfp_url}
                          alt={castData.author.display_name || username}
                          className="w-[90px] h-[90px] rounded-full mr-6"
                        />
                        <div className="flex flex-col text-white">
                          <div className="text-[32px] font-bold leading-tight">{castData.author.display_name || username}</div>
                          <div className="text-[18px] text-gray-400">on Farcaster</div>
                        </div>
                      </div>
                    )}
                    <div className="p-4">
                      <div className="text-white font-semibold text-sm break-words">
                        {castData.author.display_name || username} on Farcaster
                      </div>
                      <div className="text-gray-300 text-xs mt-1 break-words line-clamp-2">
                        {castData.text || 'View this post on Farcaster'}
                      </div>
                      <div className="text-gray-400 text-xs mt-2">
                        Farcaster
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // Standard format - single preview
              <div className="bg-gray-800 rounded-lg p-4 flex flex-col items-center">
                <div className="text-sm text-gray-400 mb-3 self-start">This is how your link will appear when shared:</div>
                <div className="bg-gray-700 rounded overflow-hidden max-w-lg w-full">
                  {/* Use embedded image if available, otherwise show profile */}
                  {embedImage ? (
                    <div className="relative aspect-[1.91/1] bg-gray-600">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={embedImage}
                        alt="Post image"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="relative h-[200px] bg-[#17101f] flex items-center justify-center px-8">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={castData.author.pfp_url}
                        alt={castData.author.display_name || username}
                        className="w-[90px] h-[90px] rounded-full mr-6"
                      />
                      <div className="flex flex-col text-white">
                        <div className="text-[32px] font-bold leading-tight">{castData.author.display_name || username}</div>
                        <div className="text-[18px] text-gray-400">on Farcaster</div>
                      </div>
                    </div>
                  )}
                  <div className="p-4">
                    <div className="text-white font-medium break-words">
                      {embedImage ? 
                        `${castData.author.display_name || username} on Farcaster` : 
                        (castData.text ? castData.text.slice(0, 100) + (castData.text.length > 100 ? '...' : '') : 'View on Farcaster')
                      }
                    </div>
                    <div className="text-gray-300 text-sm mt-1 break-words">
                      {embedImage && castData.text ? 
                        castData.text.slice(0, 100) + (castData.text.length > 100 ? '...' : '') : 
                        `Posted by @${username}`
                      }
                    </div>
                    <div className="text-gray-400 text-xs mt-2">
                      Farcaster
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Actions */}
        <div className="flex gap-4 justify-center mt-8">
          <button
            onClick={() => window.open(farlinkerUrl, '_blank')}
            disabled={!farlinkerUrl}
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Open Link
          </button>
          <button
            onClick={() => window.close()}
            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CopyPageV2() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#17101f' }}>
        <div className="text-white">Loading...</div>
      </div>
    }>
      <CopyPageContent />
    </Suspense>
  );
}