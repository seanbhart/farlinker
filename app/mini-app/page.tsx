'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import sdk from '@farcaster/miniapp-sdk';
import type { MiniAppCast } from '@farcaster/miniapp-core/dist/context';
import { track } from '@vercel/analytics';

type Format = 'enhanced' | 'standard';

interface CastDetails {
  hash: string;
  username: string;
  displayName: string;
  pfpUrl?: string;
  text: string;
}

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://farlinker.xyz';

function castFromContext(cast: MiniAppCast): CastDetails | null {
  const username = cast.author.username;
  if (!username) return null;
  return {
    hash: cast.hash,
    username,
    displayName: cast.author.displayName || username,
    pfpUrl: cast.author.pfpUrl,
    text: cast.text,
  };
}

function generateUrl(cast: CastDetails, format: Format): string {
  const base = `${BASE_URL}/${cast.username}/${cast.hash}`;
  return format === 'standard' ? `${base}?preview=standard` : base;
}

function parseFarcasterUrl(input: string): { username: string; hash: string } | null {
  const trimmed = input.trim();

  // Direct URL: farcaster.xyz/username/0xhash or warpcast.com/username/0xhash
  const urlMatch = trimmed.match(/(?:farcaster\.xyz|warpcast\.com)\/([a-zA-Z0-9._-]+)\/(0x[a-fA-F0-9]+)/);
  if (urlMatch) return { username: urlMatch[1], hash: urlMatch[2] };

  // Bare hash: 0x followed by hex chars (at least 8)
  const hashMatch = trimmed.match(/^(0x[a-fA-F0-9]{8,})$/);
  if (hashMatch) return { username: '_', hash: hashMatch[1] };

  return null;
}

export default function MiniAppPage() {
  const copyTimerRef = useRef<ReturnType<typeof setTimeout>>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [cast, setCast] = useState<CastDetails | null>(null);
  const [entrySource, setEntrySource] = useState<'cast_share' | 'manual'>('manual');
  const [selectedFormat, setSelectedFormat] = useState<Format>('enhanced');
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [fetchError, setFetchError] = useState('');
  const [fetching, setFetching] = useState(false);
  const [safeArea, setSafeArea] = useState({ top: 0, bottom: 0 });

  useEffect(() => {
    const init = async () => {
      try {
        const context = await sdk.context;
        await sdk.actions.ready();

        if (context?.client?.safeAreaInsets) {
          setSafeArea({
            top: context.client.safeAreaInsets.top,
            bottom: context.client.safeAreaInsets.bottom,
          });
        }

        if (context?.location?.type === 'cast_share') {
          const castData = castFromContext(context.location.cast);
          if (castData) {
            setCast(castData);
            setEntrySource('cast_share');
          }
          // If username is missing, fall through to manual input mode
        }
      } catch {
        // Running outside Farcaster client — manual mode
      }
      setIsLoaded(true);
    };
    init();
    return () => {
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    };
  }, []);

  const fetchCastFromUrl = useCallback(async () => {
    const parsed = parseFarcasterUrl(urlInput);
    if (!parsed) {
      setFetchError('Enter a Farcaster URL or cast hash (0x...)');
      return;
    }

    setFetching(true);
    setFetchError('');

    try {
      const res = await fetch('/api/cast-details', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hash: parsed.hash, ...(parsed.username !== '_' && { username: parsed.username }) }),
      });

      if (!res.ok) {
        setFetchError('Cast not found');
        return;
      }

      const data = await res.json();
      setCast({
        hash: data.hash,
        username: data.username,
        displayName: data.displayName,
        pfpUrl: data.pfp,
        text: data.text,
      });
    } catch {
      setFetchError('Failed to fetch cast. Try again.');
    } finally {
      setFetching(false);
    }
  }, [urlInput]);

  const copyToClipboard = useCallback(async () => {
    if (!cast) return;
    const url = generateUrl(cast, selectedFormat);

    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = url;
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }

    setCopyFeedback(true);
    if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    copyTimerRef.current = setTimeout(() => setCopyFeedback(false), 2000);
    track('farlinker_miniapp_copy', { format: selectedFormat, username: cast.username });
  }, [cast, selectedFormat]);

  const shareUrl = useCallback(async () => {
    if (!cast) return;
    const url = generateUrl(cast, selectedFormat);

    if (navigator.share) {
      try {
        await navigator.share({ url, title: `Cast by @${cast.username}` });
        track('farlinker_miniapp_share', { format: selectedFormat, username: cast.username });
        return;
      } catch {
        // User cancelled or share failed — fall through to copy
      }
    }
    await copyToClipboard();
  }, [cast, selectedFormat, copyToClipboard]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#17101f' }}>
        <div className="text-purple-400 text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        backgroundColor: '#17101f',
        paddingTop: safeArea.top,
        paddingBottom: safeArea.bottom,
      }}
    >
      <div className="flex-1 p-4 max-w-lg mx-auto w-full">
        {/* Header */}
        <div className="text-center mb-6 pt-2">
          <h1 className="text-xl font-bold text-white">Farlinker</h1>
          <p className="text-sm text-gray-400 mt-1">Share Farcaster posts with rich previews</p>
        </div>

        {!cast ? (
          /* Manual URL input */
          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Paste a Farcaster URL or cast hash
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchCastFromUrl()}
                placeholder="https://warpcast.com/user/0x... or 0x..."
                className="flex-1 px-3 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 text-sm placeholder-gray-500 focus:outline-none focus:border-purple-500"
              />
              <button
                onClick={fetchCastFromUrl}
                disabled={fetching || !urlInput.trim()}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium disabled:opacity-50"
              >
                {fetching ? '...' : 'Go'}
              </button>
            </div>
            {fetchError && (
              <p className="text-red-400 text-sm mt-2">{fetchError}</p>
            )}

            {/* How it works */}
            <div className="mt-8">
              <h2 className="text-sm font-medium text-gray-400 mb-4">How it works</h2>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-800 rounded-lg p-3">
                  <div className="text-xs text-purple-400 font-medium mb-2">Enhanced</div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/apple_messages_farlinker.png"
                    alt="Enhanced preview example"
                    className="rounded w-full"
                  />
                  <p className="text-xs text-gray-500 mt-2">Image-based preview with cast content</p>
                </div>
                <div className="bg-gray-800 rounded-lg p-3">
                  <div className="text-xs text-purple-400 font-medium mb-2">Standard</div>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/apple_messages_farlinker_standard.png"
                    alt="Standard preview example"
                    className="rounded w-full"
                  />
                  <p className="text-xs text-gray-500 mt-2">Text-based OG card preview</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Cast loaded — show preview + format selection + actions */
          <div>
            {/* Cast preview */}
            <div className="bg-gray-800 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-3">
                {cast.pfpUrl && (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={cast.pfpUrl}
                    alt={cast.displayName}
                    className="w-10 h-10 rounded-full flex-shrink-0"
                  />
                )}
                <div className="min-w-0">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-white font-medium text-sm">{cast.displayName}</span>
                    <span className="text-gray-500 text-xs">@{cast.username}</span>
                  </div>
                  <p className="text-gray-300 text-sm mt-1 break-words line-clamp-4">
                    {cast.text}
                  </p>
                </div>
              </div>
            </div>

            {/* Format selection */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <button
                onClick={() => setSelectedFormat('enhanced')}
                className={`rounded-lg p-3 text-left transition-all ${
                  selectedFormat === 'enhanced'
                    ? 'bg-purple-900/50 border-2 border-purple-500'
                    : 'bg-gray-800 border-2 border-transparent'
                }`}
              >
                <div className="text-xs font-medium text-purple-400 mb-1">Enhanced</div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/apple_messages_farlinker.png"
                  alt="Enhanced preview"
                  className="rounded w-full mb-1"
                />
                <p className="text-xs text-gray-500">Rich image preview</p>
              </button>
              <button
                onClick={() => setSelectedFormat('standard')}
                className={`rounded-lg p-3 text-left transition-all ${
                  selectedFormat === 'standard'
                    ? 'bg-purple-900/50 border-2 border-purple-500'
                    : 'bg-gray-800 border-2 border-transparent'
                }`}
              >
                <div className="text-xs font-medium text-purple-400 mb-1">Standard</div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/apple_messages_farlinker_standard.png"
                  alt="Standard preview"
                  className="rounded w-full mb-1"
                />
                <p className="text-xs text-gray-500">Text-based OG card</p>
              </button>
            </div>

            {/* Generated URL */}
            <div className="bg-gray-800 rounded-lg px-3 py-2 mb-4">
              <p className="text-xs text-gray-500 font-mono break-all">
                {generateUrl(cast, selectedFormat)}
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              <button
                onClick={copyToClipboard}
                className={`flex-1 py-3 rounded-lg font-medium text-sm transition-all ${
                  copyFeedback
                    ? 'bg-green-600 text-white'
                    : 'bg-purple-600 hover:bg-purple-700 text-white'
                }`}
              >
                {copyFeedback ? 'Copied!' : 'Copy Link'}
              </button>
              <button
                onClick={shareUrl}
                className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium text-sm transition-all"
              >
                Share
              </button>
            </div>

            {/* Reset — only for manual entry */}
            {entrySource === 'manual' && (
              <button
                onClick={() => {
                  setCast(null);
                  setUrlInput('');
                }}
                className="w-full mt-3 py-2 text-gray-500 text-xs hover:text-gray-400"
              >
                Use a different URL
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
