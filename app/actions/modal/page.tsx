'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { track } from '@vercel/analytics';

interface OptionType {
  id: string;
  title: string;
  description: string;
  preview: string;
  action: 'share' | 'copy';
  format: 'enhanced' | 'standard';
}

interface CastData {
  castId: string;
  fid: string;
  username?: string;
}

async function fetchCastDetails(castData: CastData) {
  try {
    const response = await fetch('/api/cast-details', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hash: castData.castId })
    });
    
    if (!response.ok) throw new Error('Failed to fetch cast details');
    
    const data = await response.json();
    console.log('Cast details response:', data);
    return {
      authorUsername: data.authorUsername || 'user',
      hash: data.hash || castData.castId
    };
  } catch (error) {
    console.error('Error fetching cast details:', error);
    // Return fallback data
    return {
      authorUsername: 'user',
      hash: castData.castId
    };
  }
}

function OptionCard({ option, castData }: { option: OptionType; castData: CastData }) {
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const handleClick = async () => {
    setLoading(true);
    
    try {
      const isStandard = option.format === 'standard';
      const previewType = isStandard ? 'standard' : 'enhanced';
      
      // Track option selection
      track('farlinker_action_option_selected', {
        option: option.id,
        action: option.action,
        format: option.format
      });
      
      // Open the copy page in a new tab
      // Don't pass username - let the copy page handle it
      const copyPageUrl = `/actions/copy-v2?castId=${castData.castId}&type=${previewType}`;
      
      // Send message to parent to open link
      window.parent.postMessage({
        type: 'fc:action',
        data: {
          action: 'link',
          url: copyPageUrl
        }
      }, '*');
      
      // Also try to open directly for testing
      window.open(copyPageUrl, '_blank');
      
      // Show feedback
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error handling option click:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <button
      onClick={handleClick}
      disabled={loading || copied}
      className="option-card text-left w-full"
    >
      <div className="preview-wrapper">
        <Image 
          src={option.preview} 
          alt={`Preview for ${option.title}`}
          width={250}
          height={150}
          className="preview-image"
        />
      </div>
      <h3 className="option-title">{option.title}</h3>
      <p className="option-description">
        {copied ? '✓ Opening...' : option.description}
      </p>
    </button>
  );
}

export default function ActionModal({
  searchParams,
}: {
  searchParams: Promise<{ castId?: string; fid?: string; username?: string }>;
}) {
  const [mounted, setMounted] = useState(false);
  const [params, setParams] = useState<{ castId?: string; fid?: string; username?: string }>({});
  
  useEffect(() => {
    setMounted(true);
    searchParams.then(p => setParams(p));
  }, [searchParams]);
  
  if (!mounted || !params.castId || !params.fid) {
    return (
      <div className="modal-container">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }
  
  const castData: CastData = {
    castId: params.castId,
    fid: params.fid,
    username: params.username
  };
  
  const options: OptionType[] = [
    {
      id: 'copy-enhanced',
      title: 'farlinker link',
      description: 'similar to twitter link preview',
      preview: '/apple_messages_farlinker.png',
      action: 'copy',
      format: 'enhanced'
    },
    {
      id: 'copy-standard',
      title: 'standard link',
      description: 'similar to website link preview',
      preview: '/apple_messages_farlinker_standard.png',
      action: 'copy',
      format: 'standard'
    }
  ];
  
  return (
    <div className="modal-page">
      <style jsx global>{`
        body {
          margin: 0;
          padding: 0;
          background: #17101f;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        
        .modal-page {
          min-height: 100vh;
          background: #17101f;
          padding: 20px;
        }
        
        .modal-container {
          display: flex;
          flex-direction: column;
          gap: 16px;
          max-width: 320px;
          margin: 0 auto;
        }
        
        .option-card {
          background: #1c1a24;
          border: 1px solid #2d2b35;
          border-radius: 12px;
          padding: 24px 20px;
          cursor: pointer;
          transition: all 0.2s;
          min-height: 320px;
          display: flex;
          flex-direction: column;
        }
        
        .option-card:hover {
          border-color: #8b5cf6;
          background: #201e28;
        }
        
        .option-card:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        .option-card:disabled .option-description {
          color: #10b981;
          font-weight: 600;
        }
        
        .preview-wrapper {
          width: 100%;
          height: 200px;
          overflow: hidden;
          border-radius: 8px;
          margin-bottom: 20px;
          background: #000;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        
        .preview-image {
          width: 100%;
          height: 100%;
          object-fit: contain;
          object-position: center;
        }
        
        .option-title {
          font-size: 18px;
          font-weight: 600;
          color: #fff;
          margin: 0 0 8px 0;
        }
        
        .option-description {
          font-size: 15px;
          color: #9ca3af;
          margin: 0;
          margin-top: auto;
        }
      `}</style>
      
      <div className="modal-container">
        {options.map(option => (
          <OptionCard key={option.id} option={option} castData={castData} />
        ))}
      </div>
    </div>
  );
}