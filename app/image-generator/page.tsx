'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ImageGenerator() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [error, setError] = useState('');
  const [castData, setCastData] = useState<{
    hash: string;
    pfp: string;
    displayName: string;
    username: string;
    text?: string;
    embeddedImage?: string;
    aspectRatio?: number;
  } | null>(null);

  // Extract cast hash from various input formats
  const extractCastInfo = (input: string) => {
    const trimmed = input.trim();
    
    // Direct hash format: 0x324ceda2c96209aa6be69b58be65836a1ff68142
    if (trimmed.startsWith('0x') && trimmed.length >= 10) {
      return { hash: trimmed, username: null };
    }
    
    // Farcaster.xyz URL: https://farcaster.xyz/dwr.eth/0xce8c7b65
    const farcasterMatch = trimmed.match(/(?:https?:\/\/)?(?:www\.)?farcaster\.xyz\/([^\/]+)\/([^\/\?]+)/);
    if (farcasterMatch) {
      return { username: farcasterMatch[1], hash: farcasterMatch[2] };
    }
    
    // Warpcast URL: https://warpcast.com/dwr.eth/0xce8c7b65
    const warpcastMatch = trimmed.match(/(?:https?:\/\/)?(?:www\.)?warpcast\.com\/([^\/]+)\/([^\/\?]+)/);
    if (warpcastMatch) {
      return { username: warpcastMatch[1], hash: warpcastMatch[2] };
    }
    
    return null;
  };

  const generateImage = async () => {
    setLoading(true);
    setError('');
    setImageUrl('');
    setCastData(null);

    try {
      const castInfo = extractCastInfo(input);
      if (!castInfo) {
        throw new Error('Invalid format. Please enter a cast hash (0x...) or farcaster.xyz URL');
      }

      // Fetch cast data using our API
      const response = await fetch('/api/cast-details', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(castInfo),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch cast data');
      }

      const data = await response.json();
      setCastData(data);

      // Generate the image URL using the og-post.png endpoint
      const params = new URLSearchParams({
        pfp: data.pfp,
        name: data.displayName,
        username: data.username,
        text: data.text || '',
        platform: 'download', // Special platform for download images
      });

      if (data.embeddedImage) {
        params.append('image', data.embeddedImage);
        if (data.aspectRatio) {
          params.append('aspectRatio', data.aspectRatio.toString());
        }
      }

      const generatedImageUrl = `/api/og-post.png?${params.toString()}`;
      setImageUrl(generatedImageUrl);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const downloadImage = async () => {
    if (!imageUrl) return;

    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `farcaster-cast-${castData?.hash || 'image'}.png`;
      
      document.body.appendChild(a);
      a.click();
      
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch {
      setError('Failed to download image');
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#17101f' }}>
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-semibold text-white mb-3">
              Farcaster Image Generator
            </h1>
            <p className="text-gray-400 mb-6">
              Generate downloadable enhanced link preview images for your presentations and marketing materials
            </p>
            <Link 
              href="/"
              className="text-purple-400 hover:text-purple-300 underline"
            >
              ← Back to Farlinker
            </Link>
          </div>

          {/* Input Section */}
          <div style={{ backgroundColor: '#1c1a24' }} className="rounded-lg p-8 mb-8 border border-gray-800">
            <h2 className="text-xl font-medium text-white mb-6">
              Enter Cast Information
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Cast Hash or Farcaster URL
                </label>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="0x324ceda2c96209aa6be69b58be65836a1ff68142 or https://farcaster.xyz/dwr.eth/0xce8c7b65"
                  className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-purple-500 focus:outline-none"
                />
              </div>
              
              <button
                onClick={generateImage}
                disabled={loading || !input.trim()}
                className="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
              >
                {loading ? 'Generating Image...' : 'Generate Image'}
              </button>
            </div>

            {error && (
              <div className="mt-4 p-4 bg-red-900/20 border border-red-800 rounded-lg">
                <p className="text-red-400">{error}</p>
              </div>
            )}
          </div>

          {/* Examples */}
          <div style={{ backgroundColor: '#1c1a24' }} className="rounded-lg p-8 mb-8 border border-gray-800">
            <h3 className="text-lg font-medium text-white mb-4">
              Supported Formats
            </h3>
            <div className="space-y-3 text-sm">
              <div className="font-mono bg-black/40 p-3 rounded border border-gray-800">
                <span className="text-gray-500">Cast Hash:</span>
                <br />
                <span className="text-gray-300">0x324ceda2c96209aa6be69b58be65836a1ff68142</span>
              </div>
              <div className="font-mono bg-black/40 p-3 rounded border border-gray-800">
                <span className="text-gray-500">Farcaster URL:</span>
                <br />
                <span className="text-gray-300">https://farcaster.xyz/dwr.eth/0xce8c7b65</span>
              </div>
              <div className="font-mono bg-black/40 p-3 rounded border border-gray-800">
                <span className="text-gray-500">Warpcast URL:</span>
                <br />
                <span className="text-gray-300">https://warpcast.com/dwr.eth/0xce8c7b65</span>
              </div>
            </div>
          </div>

          {/* Generated Image */}
          {imageUrl && (
            <div style={{ backgroundColor: '#1c1a24' }} className="rounded-lg p-8 border border-gray-800">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium text-white">
                  Generated Image
                </h3>
                <button
                  onClick={downloadImage}
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                >
                  Download PNG
                </button>
              </div>
              
              <div className="relative bg-black/20 rounded-lg p-4 mb-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imageUrl}
                  alt="Generated cast preview"
                  className="w-full max-w-2xl mx-auto rounded-lg"
                  style={{ maxHeight: '800px', objectFit: 'contain' }}
                />
              </div>

              {castData && (
                <div className="text-sm text-gray-400 space-y-1">
                  <p><strong>Cast by:</strong> {castData.displayName} (@{castData.username})</p>
                  {castData.text && <p><strong>Text:</strong> {castData.text.substring(0, 100)}{castData.text.length > 100 ? '...' : ''}</p>}
                  <p><strong>Hash:</strong> {castData.hash}</p>
                </div>
              )}
            </div>
          )}

          {/* Use Cases */}
          <div style={{ backgroundColor: '#1c1a24' }} className="rounded-lg p-8 mt-8 border border-gray-800">
            <h3 className="text-lg font-medium text-white mb-4">
              Perfect for:
            </h3>
            <ul className="space-y-2 text-gray-300">
              <li className="flex items-start">
                <span className="text-purple-400 mr-3">•</span>
                <span>Presentations about Farcaster</span>
              </li>
              <li className="flex items-start">
                <span className="text-purple-400 mr-3">•</span>
                <span>Marketing materials and landing pages</span>
              </li>
              <li className="flex items-start">
                <span className="text-purple-400 mr-3">•</span>
                <span>Social media graphics</span>
              </li>
              <li className="flex items-start">
                <span className="text-purple-400 mr-3">•</span>
                <span>Blog posts and documentation</span>
              </li>
              <li className="flex items-start">
                <span className="text-purple-400 mr-3">•</span>
                <span>Conference slides and demos</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 