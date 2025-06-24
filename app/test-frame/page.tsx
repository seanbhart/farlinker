'use client';

import { useState } from 'react';

export default function TestFrame() {
  const [frameUrl, setFrameUrl] = useState('');
  const [frameHtml, setFrameHtml] = useState('');
  const [loading, setLoading] = useState(false);
  const [buttonIndex, setButtonIndex] = useState(0);
  const [castId, setCastId] = useState('0x324ceda2');
  const [fid, setFid] = useState('4612');
  const [username, setUsername] = useState('swabbie.eth');
  
  // Load frame (simulates GET request)
  const loadFrame = async () => {
    setLoading(true);
    try {
      const url = `/api/actions/frame?castId=${castId}&fid=${fid}&username=${encodeURIComponent(username)}`;
      setFrameUrl(url);
      
      const res = await fetch(url);
      const html = await res.text();
      setFrameHtml(html);
      setButtonIndex(0);
    } catch (error) {
      console.error('Error loading frame:', error);
      setFrameHtml('Error loading frame');
    } finally {
      setLoading(false);
    }
  };
  
  // Simulate button click (POST request)
  const simulateButtonClick = async (index: number) => {
    setLoading(true);
    try {
      const url = `/api/actions/frame?castId=${castId}&fid=${fid}&username=${encodeURIComponent(username)}`;
      
      const mockData = {
        untrustedData: {
          fid: fid,
          url: `https://www.farlinker.xyz${url}`,
          messageHash: '0x00',
          timestamp: Date.now(),
          network: 1,
          buttonIndex: index,
          castId: {
            fid: fid,
            hash: castId
          }
        }
      };
      
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mockData),
      });
      
      const html = await res.text();
      setFrameHtml(html);
      setButtonIndex(index);
    } catch (error) {
      console.error('Error clicking button:', error);
      setFrameHtml('Error processing button click');
    } finally {
      setLoading(false);
    }
  };
  
  // Parse frame metadata from HTML
  const parseFrameMetadata = (html: string) => {
    const metadata: Record<string, string> = {};
    const regex = /<meta\s+property="([^"]+)"\s+content="([^"]+)"/g;
    let match;
    
    while ((match = regex.exec(html)) !== null) {
      metadata[match[1]] = match[2];
    }
    
    return metadata;
  };
  
  const metadata = frameHtml ? parseFrameMetadata(frameHtml) : {};
  const frameImageUrl = metadata['fc:frame:image'] || '';
  const button1Text = metadata['fc:frame:button:1'] || '';
  const button2Text = metadata['fc:frame:button:2'] || '';
  const button1Action = metadata['fc:frame:button:1:action'] || '';
  const button1Target = metadata['fc:frame:button:1:target'] || '';
  const button2Action = metadata['fc:frame:button:2:action'] || '';
  const button2Target = metadata['fc:frame:button:2:target'] || '';
  const inputPlaceholder = metadata['fc:frame:input:text'] || '';
  const inputValue = metadata['fc:frame:input:text:value'] || '';
  // const frameState = metadata['fc:frame:state'] || '';
  // const postUrl = metadata['fc:frame:post_url'] || '';
  
  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: '#17101f' }}>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Farcaster Frame Tester</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Controls */}
          <div className="space-y-6">
            <div className="bg-gray-900 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Frame Parameters</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Cast ID (Hash)
                  </label>
                  <input
                    type="text"
                    value={castId}
                    onChange={(e) => setCastId(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 text-white rounded-lg border border-gray-700"
                    placeholder="0x..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    FID (User ID)
                  </label>
                  <input
                    type="text"
                    value={fid}
                    onChange={(e) => setFid(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 text-white rounded-lg border border-gray-700"
                    placeholder="1606"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Username (for testing)
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 text-white rounded-lg border border-gray-700"
                    placeholder="swabbie.eth"
                  />
                </div>
                
                <button
                  onClick={loadFrame}
                  disabled={loading}
                  className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg disabled:opacity-50"
                >
                  {loading ? 'Loading...' : 'Load Frame'}
                </button>
              </div>
            </div>
            
            {/* Frame Preview */}
            {frameImageUrl && (
              <div className="bg-gray-900 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Frame Preview</h3>
                
                <div className="space-y-4">
                  {/* Image */}
                  <div className="relative aspect-[1.91/1] bg-gray-800 rounded-lg overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                      src={frameImageUrl}
                      alt="Frame preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = '/api/og-image.png?title=Error&description=Failed%20to%20load%20image';
                      }}
                    />
                  </div>
                  
                  {/* Input Field */}
                  {inputPlaceholder && (
                    <div className="mb-4">
                      <input
                        type="text"
                        placeholder={inputPlaceholder}
                        defaultValue={inputValue || ''}
                        className="w-full px-3 py-2 bg-gray-800 text-white rounded-lg border border-gray-700"
                        readOnly={!!inputValue}
                      />
                    </div>
                  )}
                  
                  {/* Buttons */}
                  <div className="flex gap-2">
                    {button1Text && (
                      <button
                        onClick={() => {
                          if (button1Action === 'link' && button1Target) {
                            window.open(button1Target, '_blank');
                          } else {
                            simulateButtonClick(1);
                          }
                        }}
                        disabled={loading}
                        className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50"
                      >
                        {button1Text}
                      </button>
                    )}
                    {button2Text && (
                      <button
                        onClick={() => {
                          if (button2Action === 'link' && button2Target) {
                            window.open(button2Target, '_blank');
                          } else {
                            simulateButtonClick(2);
                          }
                        }}
                        disabled={loading}
                        className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50"
                      >
                        {button2Text}
                      </button>
                    )}
                  </div>
                  
                  {/* Status */}
                  <div className="text-sm text-gray-400">
                    {buttonIndex > 0 && `Last button clicked: ${buttonIndex}`}
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Raw Data */}
          <div className="space-y-6">
            {/* Frame URL */}
            {frameUrl && (
              <div className="bg-gray-900 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-3">Frame URL</h3>
                <p className="text-gray-300 text-sm break-all">{frameUrl}</p>
              </div>
            )}
            
            {/* Parsed Metadata */}
            {Object.keys(metadata).length > 0 && (
              <div className="bg-gray-900 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-3">Frame Metadata</h3>
                <div className="space-y-2">
                  {Object.entries(metadata).map(([key, value]) => (
                    <div key={key} className="text-sm">
                      <span className="text-purple-400">{key}:</span>
                      <span className="text-gray-300 ml-2 break-all">{value}</span>
                    </div>
                  ))}
                  {inputPlaceholder && (
                    <div className="mt-4 p-3 bg-blue-900/20 rounded">
                      <p className="text-sm text-blue-400">Input field detected:</p>
                      <p className="text-xs text-gray-400">Placeholder: {inputPlaceholder}</p>
                      <p className="text-xs text-gray-400">Value: {inputValue || 'none'}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            {/* Raw HTML */}
            {frameHtml && (
              <div className="bg-gray-900 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-3">Raw HTML Response</h3>
                <pre className="bg-black p-4 rounded text-green-400 text-xs overflow-auto max-h-96">
                  {frameHtml}
                </pre>
              </div>
            )}
          </div>
        </div>
        
        {/* Instructions */}
        <div className="mt-8 bg-gray-900 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-3">How to Use</h3>
          <ol className="text-gray-300 space-y-2 list-decimal list-inside">
            <li>Enter a Cast ID (hash) and FID to test with</li>
            <li>Click &quot;Load Frame&quot; to simulate the initial frame load (GET request)</li>
            <li>The frame preview will show the image and buttons</li>
            <li>Click the frame buttons to simulate button clicks (POST request)</li>
            <li>Check the metadata and raw HTML to debug any issues</li>
            <li>The frame should handle both initial load and button interactions correctly</li>
          </ol>
        </div>
      </div>
    </div>
  );
}