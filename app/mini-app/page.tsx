'use client';

import { useEffect, useState } from 'react';
import { sdk } from '@farcaster/frame-sdk';
import { track } from '@vercel/analytics';
import Image from 'next/image';

interface CastData {
  author: {
    fid: number;
    username: string;
    displayName: string;
    pfpUrl?: string;
  };
  hash: string;
  timestamp: number;
  text: string;
  embeds?: string[];
}

export default function MiniApp() {
  const [mounted, setMounted] = useState(false);
  const [isSDKReady, setIsSDKReady] = useState(false);
  const [sharedCast, setSharedCast] = useState<CastData | null>(null);
  const [copied, setCopied] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState<'enhanced' | 'standard'>('enhanced');

  useEffect(() => {
    setMounted(true);

    const initSDK = async () => {
      try {
        // Initialize the SDK
        await sdk.actions.ready();
        setIsSDKReady(true);

        // Check if we're in a share context
        const context = sdk.context;
        if (context?.location?.type === 'cast_share') {
          const cast = context.location.cast;
          setSharedCast(cast as CastData);

          // Track that the mini app was opened with a shared cast
          track('miniapp_opened_with_cast', {
            username: cast.author.username,
            hasEmbeds: (cast.embeds?.length || 0) > 0
          });
        } else {
          // Track that the mini app was opened directly
          track('miniapp_opened_direct');
        }
      } catch (error) {
        console.error('Error initializing SDK:', error);
        setIsSDKReady(true); // Still set to true to show UI
      }
    };

    initSDK();
  }, []);

  const generateFarlinkerUrl = (format: 'enhanced' | 'standard') => {
    if (!sharedCast) return '';

    const baseUrl = 'https://farlinker.xyz';
    const path = `${sharedCast.author.username}/${sharedCast.hash}`;
    const params = format === 'standard' ? '?preview=standard' : '';
    return `${baseUrl}/${path}${params}`;
  };

  const handleCopy = async () => {
    const url = generateFarlinkerUrl(selectedFormat);

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);

      // Track copy action
      track('miniapp_link_copied', {
        format: selectedFormat,
        username: sharedCast?.author.username
      });

      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
    }
  };

  if (!mounted || !isSDKReady) {
    return (
      <div className="miniapp-container">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!sharedCast) {
    return (
      <div className="miniapp-container">
        <style jsx global>{`
          body {
            margin: 0;
            padding: 0;
            background: #17101f;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          }

          .miniapp-container {
            min-height: 100vh;
            background: #17101f;
            padding: 32px 20px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
          }

          .loading {
            text-align: center;
            color: #9ca3af;
          }

          .spinner {
            width: 40px;
            height: 40px;
            border: 3px solid #2d2b35;
            border-top-color: #8b5cf6;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 16px;
          }

          @keyframes spin {
            to { transform: rotate(360deg); }
          }

          .empty-state {
            text-align: center;
            max-width: 320px;
          }

          .empty-icon {
            width: 64px;
            height: 64px;
            background: #1c1a24;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 20px;
            font-size: 32px;
          }

          .empty-title {
            font-size: 20px;
            font-weight: 600;
            color: #fff;
            margin: 0 0 12px 0;
          }

          .empty-description {
            font-size: 15px;
            color: #9ca3af;
            margin: 0;
            line-height: 1.5;
          }
        `}</style>

        <div className="empty-state">
          <div className="empty-icon">🔗</div>
          <h2 className="empty-title">Share a Cast</h2>
          <p className="empty-description">
            To use Farlinker, share a Farcaster cast to this app.
            Tap the share button on any cast and select Farlinker.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="miniapp-container">
      <style jsx global>{`
        body {
          margin: 0;
          padding: 0;
          background: #17101f;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .miniapp-container {
          min-height: 100vh;
          background: #17101f;
          padding: 20px;
        }

        .content {
          max-width: 400px;
          margin: 0 auto;
        }

        .cast-preview {
          background: #1c1a24;
          border: 1px solid #2d2b35;
          border-radius: 12px;
          padding: 16px;
          margin-bottom: 24px;
        }

        .cast-author {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 12px;
        }

        .cast-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #2d2b35;
        }

        .cast-author-info {
          flex: 1;
        }

        .cast-display-name {
          font-size: 15px;
          font-weight: 600;
          color: #fff;
          margin: 0;
        }

        .cast-username {
          font-size: 14px;
          color: #9ca3af;
          margin: 0;
        }

        .cast-text {
          color: #e5e7eb;
          font-size: 15px;
          line-height: 1.5;
          margin: 0;
          word-break: break-word;
        }

        .section-title {
          font-size: 16px;
          font-weight: 600;
          color: #fff;
          margin: 0 0 16px 0;
        }

        .format-options {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 24px;
        }

        .format-option {
          background: #1c1a24;
          border: 2px solid #2d2b35;
          border-radius: 12px;
          padding: 16px;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .format-option.selected {
          border-color: #8b5cf6;
          background: #201e28;
        }

        .format-option:hover {
          border-color: #6d4db7;
        }

        .format-radio {
          width: 20px;
          height: 20px;
          border: 2px solid #2d2b35;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .format-option.selected .format-radio {
          border-color: #8b5cf6;
        }

        .format-radio-inner {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #8b5cf6;
          display: none;
        }

        .format-option.selected .format-radio-inner {
          display: block;
        }

        .format-info {
          flex: 1;
        }

        .format-title {
          font-size: 15px;
          font-weight: 600;
          color: #fff;
          margin: 0 0 4px 0;
        }

        .format-description {
          font-size: 14px;
          color: #9ca3af;
          margin: 0;
        }

        .copy-button {
          width: 100%;
          background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
          color: white;
          border: none;
          border-radius: 12px;
          padding: 16px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .copy-button:hover {
          background: linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%);
          transform: translateY(-1px);
        }

        .copy-button:active {
          transform: translateY(0);
        }

        .copy-button.copied {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        }

        .copy-icon {
          font-size: 20px;
        }

        .preview-images {
          margin-top: 24px;
          padding-top: 24px;
          border-top: 1px solid #2d2b35;
        }

        .preview-image-wrapper {
          background: #000;
          border-radius: 8px;
          overflow: hidden;
          margin-top: 12px;
        }

        .preview-image {
          width: 100%;
          height: auto;
          display: block;
        }
      `}</style>

      <div className="content">
        <div className="cast-preview">
          <div className="cast-author">
            {sharedCast.author.pfpUrl && (
              <Image
                src={sharedCast.author.pfpUrl}
                alt={sharedCast.author.displayName}
                width={40}
                height={40}
                className="cast-avatar"
              />
            )}
            <div className="cast-author-info">
              <p className="cast-display-name">{sharedCast.author.displayName}</p>
              <p className="cast-username">@{sharedCast.author.username}</p>
            </div>
          </div>
          <p className="cast-text">
            {sharedCast.text.length > 200
              ? `${sharedCast.text.slice(0, 200)}...`
              : sharedCast.text}
          </p>
        </div>

        <h3 className="section-title">Choose link format</h3>

        <div className="format-options">
          <button
            className={`format-option ${selectedFormat === 'enhanced' ? 'selected' : ''}`}
            onClick={() => setSelectedFormat('enhanced')}
          >
            <div className="format-radio">
              <div className="format-radio-inner"></div>
            </div>
            <div className="format-info">
              <p className="format-title">Farlinker Link</p>
              <p className="format-description">Similar to Twitter link preview</p>
            </div>
          </button>

          <button
            className={`format-option ${selectedFormat === 'standard' ? 'selected' : ''}`}
            onClick={() => setSelectedFormat('standard')}
          >
            <div className="format-radio">
              <div className="format-radio-inner"></div>
            </div>
            <div className="format-info">
              <p className="format-title">Standard Link</p>
              <p className="format-description">Similar to website link preview</p>
            </div>
          </button>
        </div>

        <button
          className={`copy-button ${copied ? 'copied' : ''}`}
          onClick={handleCopy}
          disabled={copied}
        >
          <span className="copy-icon">{copied ? '✓' : '📋'}</span>
          <span>{copied ? 'Copied!' : 'Copy Link'}</span>
        </button>

        <div className="preview-images">
          <p className="section-title">Preview</p>
          <div className="preview-image-wrapper">
            <Image
              src={selectedFormat === 'enhanced'
                ? '/apple_messages_farlinker.png'
                : '/apple_messages_farlinker_standard.png'}
              alt={`${selectedFormat} format preview`}
              width={400}
              height={300}
              className="preview-image"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
