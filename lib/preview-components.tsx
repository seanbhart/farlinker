import React from 'react';

// Simple profile preview component (matches og-image.png route)
export function SimpleProfilePreview({ 
  pfp, 
  displayName 
}: { 
  pfp: string; 
  displayName: string; 
}) {
  return (
    <div className="relative bg-[#17101f] w-full h-[300px] flex items-center p-[60px]">
      {/* Profile picture */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={pfp}
        alt={displayName}
        className="w-[180px] h-[180px] rounded-full mr-[50px] object-cover"
      />
      {/* Text */}
      <div className="flex flex-col text-white">
        <div className="text-[64px] font-bold mb-2">{displayName}</div>
        <div className="text-[36px] text-gray-400">on Farcaster</div>
      </div>
    </div>
  );
}

// Post preview component (matches og-post.png route styling)
export function PostPreview({ 
  pfp, 
  displayName, 
  username, 
  text,
  isAppleStyle = false 
}: { 
  pfp: string; 
  displayName: string; 
  username: string; 
  text?: string;
  isAppleStyle?: boolean;
}) {
  if (isAppleStyle) {
    // Apple Messages style - white background
    return (
      <div className="bg-white rounded-xl overflow-hidden w-[300px]">
        {/* Post content area */}
        <div className="p-4">
          <div className="flex items-start gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={pfp}
              alt={displayName}
              className="w-10 h-10 rounded-full flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-1">
                <span className="font-semibold text-gray-900">{displayName}</span>
                <span className="text-gray-500 text-sm">@{username}</span>
              </div>
              <div className="text-gray-800 mt-1 text-[15px] leading-normal break-words">
                {text || 'View this post on Farcaster'}
              </div>
            </div>
          </div>
        </div>
        {/* Footer */}
        <div className="border-t border-gray-200 px-4 py-2 bg-gray-50">
          <div className="text-gray-600 text-xs">farlinker.xyz</div>
        </div>
      </div>
    );
  }
  
  // Dark theme post preview
  return (
    <div className="bg-[#17101f] text-white p-10 w-[600px]">
      {/* Text content */}
      {text && (
        <div className="text-[32px] leading-[42px] whitespace-pre-wrap mb-8">
          {text}
        </div>
      )}
      
      {/* Profile section at bottom */}
      <div className="flex items-center gap-5 mt-6">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={pfp}
          alt={displayName}
          className="w-[60px] h-[60px] rounded-full"
        />
        <div className="flex flex-col">
          <div className="text-[28px] font-semibold">{displayName}</div>
          <div className="text-[24px] text-gray-400">@{username}</div>
        </div>
      </div>
    </div>
  );
}

// Profile banner preview (for general/standard preview)
export function ProfileBannerPreview({ 
  pfp, 
  displayName, 
  username, 
  text 
}: { 
  pfp: string; 
  displayName: string; 
  username: string; 
  text?: string;
}) {
  return (
    <div className="bg-gray-700 rounded overflow-hidden max-w-md w-full">
      {/* Banner image area */}
      <div className="relative h-32 bg-gradient-to-br from-purple-600 to-blue-600">
        <div className="absolute bottom-0 left-0 p-4 flex items-end gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={pfp}
            alt={displayName}
            className="w-16 h-16 rounded-full border-4 border-gray-700"
          />
          <div className="text-white mb-1">
            <div className="font-bold text-lg">{displayName}</div>
            <div className="text-gray-200 text-sm">@{username}</div>
          </div>
        </div>
      </div>
      <div className="p-4">
        <div className="text-white font-semibold text-sm break-words">
          {displayName} on Farcaster
        </div>
        <div className="text-gray-300 text-xs mt-1 break-words line-clamp-2">
          {text ? text.slice(0, 120) + (text.length > 120 ? '...' : '') : 'View this post on Farcaster'}
        </div>
        <div className="text-gray-400 text-xs mt-2">
          Farcaster
        </div>
      </div>
    </div>
  );
}

// Standard preview (simple link icon)
export function StandardPreview({ 
  text,
  username 
}: { 
  text?: string;
  username: string;
}) {
  return (
    <div className="bg-gray-700 rounded overflow-hidden max-w-lg w-full">
      <div className="relative aspect-[1.91/1] bg-gray-900 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="text-4xl mb-2">🔗</div>
          <div className="text-white font-semibold">farlinker.xyz</div>
          <div className="text-gray-400 text-sm">Enhanced link previews for Farcaster</div>
        </div>
      </div>
      <div className="p-4">
        <div className="text-white font-medium break-words">
          {text ? text.slice(0, 100) + (text.length > 100 ? '...' : '') : 'View on Farcaster'}
        </div>
        <div className="text-gray-300 text-sm mt-1 break-words">
          Posted by @{username}
        </div>
        <div className="text-gray-400 text-xs mt-2">
          Farcaster
        </div>
      </div>
    </div>
  );
}