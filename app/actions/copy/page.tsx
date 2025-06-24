'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

// Helper function to decode HTML entities
function decodeHtmlEntities(text: string): string {
  const textarea = document.createElement('textarea');
  textarea.innerHTML = text;
  return textarea.value;
}

function CopyPageContent() {
  const searchParams = useSearchParams();
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [ogData, setOgData] = useState<Record<string, string> | null>(null);
  const [appleOgData, setAppleOgData] = useState<Record<string, string> | null>(null);
  const [loadingOg, setLoadingOg] = useState(false);
  
  const castId = searchParams.get('castId') || '';
  const type = searchParams.get('type') || 'enhanced';
  const isStandard = type === 'standard';
  const urlUsername = searchParams.get('username') || '';
  const actualUsername = urlUsername;
  
  console.log('Copy page params:', { castId, type, isStandard, urlUsername });
  
  // Generate the Farlinker URL
  const baseUrlForLink = typeof window !== 'undefined' 
    ? window.location.origin 
    : (process.env.NEXT_PUBLIC_BASE_URL || 'https://www.farlinker.xyz');
  const farlinkerUrl = castId ? `${baseUrlForLink}/${actualUsername || 'user'}/${castId}${isStandard ? '?preview=standard' : ''}` : '';
  
  useEffect(() => {
    if (farlinkerUrl) {
      setLoading(false);
      
      // Fetch the actual OG metadata from the Farlinker URL
      const fetchOgData = async () => {
        setLoadingOg(true);
        try {
          console.log('Fetching OG data from:', farlinkerUrl);
          
          // Fetch the HTML from the Farlinker URL for general preview
          const response = await fetch(`/api/fetch-og?url=${encodeURIComponent(farlinkerUrl)}`);
          if (!response.ok) {
            throw new Error('Failed to fetch OG data');
          }
          
          const data = await response.json();
          console.log('OG data received:', data);
          setOgData(data);
          
          // For enhanced preview, also fetch Apple Messages version
          if (!isStandard) {
            const appleUrl = `${farlinkerUrl}${farlinkerUrl.includes('?') ? '&' : '?'}platform=apple`;
            console.log('Fetching Apple OG data from:', appleUrl);
            
            const appleResponse = await fetch(`/api/fetch-og?url=${encodeURIComponent(appleUrl)}&apple=true`);
            if (appleResponse.ok) {
              const appleData = await appleResponse.json();
              console.log('Apple OG data received:', appleData);
              setAppleOgData(appleData);
            }
          }
        } catch (error) {
          console.error('Error fetching OG data:', error);
          // Set fallback OG data
          const fallbackData = {
            title: `${urlUsername || 'User'} on Farcaster`,
            description: 'View this post on Farcaster',
            siteName: 'Farcaster',
            image: ''
          };
          setOgData(fallbackData);
          if (!isStandard) {
            setAppleOgData(fallbackData);
          }
        } finally {
          setLoadingOg(false);
        }
      };
      
      fetchOgData();
    }
  }, [farlinkerUrl, urlUsername, isStandard]);
  
  const copyToClipboard = async () => {
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
        <div className="text-white">Loading...</div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen p-4" style={{ backgroundColor: '#17101f' }}>
      <div className="max-w-4xl mx-auto pt-8">
        {/* Header */}
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
              value={farlinkerUrl || 'Loading...'}
              readOnly
              disabled={!farlinkerUrl}
              className="flex-1 px-4 py-3 bg-gray-800 text-white rounded-lg border border-gray-700 font-mono text-sm disabled:opacity-50"
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
        <div className="bg-gray-900 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">Link Preview</h2>
          
          {!isStandard ? (
            // Enhanced format - show both previews
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Apple Messages preview */}
              <div className="bg-gray-800 rounded-lg p-4 flex flex-col items-center">
                <div className="text-sm text-gray-400 mb-3 self-start">Apple Messages preview:</div>
                <div className="inline-block">
                  {loadingOg ? (
                    <div className="bg-gray-700 rounded-lg p-8 text-center">
                      <div className="text-gray-400 mb-2">Loading preview...</div>
                    </div>
                  ) : appleOgData ? (
                    <div className="bg-gray-700 rounded-lg overflow-hidden inline-block">
                      {appleOgData.image && (
                        <div className="relative">
                          {/* Apple Messages shows image at its natural aspect ratio */}
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={appleOgData.image}
                            alt="Apple Messages Preview"
                            className="block"
                            style={{ maxWidth: '300px', maxHeight: '300px', width: 'auto', height: 'auto' }}
                            onError={(e) => {
                              console.error('Failed to load Apple OG image:', appleOgData.image);
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                      <div className="p-3">
                        <div className="text-gray-400 text-xs">
                          {decodeHtmlEntities(appleOgData.siteName || 'farlinker.xyz')}
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
              
              {/* General preview */}
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="text-sm text-gray-400 mb-3">General preview (most platforms):</div>
                <div className="bg-gray-700 rounded overflow-hidden max-w-md w-full">
                  {loadingOg ? (
                    <div className="text-center py-8">
                      <div className="text-gray-400 mb-2">Loading preview...</div>
                      <div className="text-xs text-gray-500">Fetching link preview...</div>
                    </div>
                  ) : ogData ? (
                    <div>
                      {ogData.image && (
                        <div className="relative aspect-[1.91/1] bg-gray-600">
                          {/* Full bleed image */}
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={ogData.image}
                            alt="OG Preview"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              console.error('Failed to load OG image:', ogData.image);
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                      <div className="p-4">
                        <div className="text-white font-semibold text-sm break-words">
                          {decodeHtmlEntities(ogData.title || 'No title')}
                        </div>
                        {ogData.description && (
                          <div className="text-gray-300 text-xs mt-1 break-words line-clamp-2">
                            {decodeHtmlEntities(ogData.description)}
                          </div>
                        )}
                        <div className="text-gray-400 text-xs mt-2">
                          {decodeHtmlEntities(ogData.siteName || 'Farcaster')}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-gray-400 text-center py-4">
                      Unable to load preview
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            // Standard format - single preview
            <div className="bg-gray-800 rounded-lg p-4 flex flex-col items-center">
              <div className="text-sm text-gray-400 mb-3 self-start">This is how your link will appear when shared:</div>
              <div className="bg-gray-700 rounded overflow-hidden max-w-lg w-full">
                {loadingOg ? (
                  <div className="text-center py-8">
                    <div className="text-gray-400 mb-2">Loading preview...</div>
                  </div>
                ) : ogData ? (
                  <div>
                    {ogData.image && (
                      <div className="relative aspect-[1.91/1] bg-gray-600">
                        {/* Full bleed image */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={ogData.image}
                          alt="OG Preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            console.error('Failed to load OG image:', ogData.image);
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                    <div className="p-4">
                      <div className="text-white font-medium break-words">
                        {decodeHtmlEntities(ogData.title || 'No title')}
                      </div>
                      {ogData.description && (
                        <div className="text-gray-300 text-sm mt-1 break-words">
                          {decodeHtmlEntities(ogData.description)}
                        </div>
                      )}
                      <div className="text-gray-400 text-xs mt-2">
                        {decodeHtmlEntities(ogData.siteName || 'Farcaster')}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-gray-400 text-center py-4">
                    Unable to load preview
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* Actions */}
        <div className="flex gap-4 justify-center">
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

export default function CopyPage() {
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