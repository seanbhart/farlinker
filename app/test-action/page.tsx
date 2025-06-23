'use client';

import { useState } from 'react';

export default function TestAction() {
  const [response, setResponse] = useState<Record<string, unknown> | null>(null);
  const [modalUrl, setModalUrl] = useState<string>('');
  const [loading, setLoading] = useState(false);
  
  // Simulate a Farcaster action request
  const testAction = async () => {
    setLoading(true);
    try {
      // Simulate the untrustedData that Farcaster would send
      const mockData = {
        untrustedData: {
          fid: '3621', // Mock FID
          castId: {
            fid: '3621',
            hash: '0xce8c7b65' // Mock cast hash
          },
          messageHash: '0x00',
          network: 1,
          timestamp: Date.now()
        }
      };
      
      // Test the action endpoint
      const res = await fetch('/api/actions/farlinker', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mockData),
      });
      
      const data = await res.json();
      setResponse(data);
      
      if (data.type === 'modal' && data.url) {
        setModalUrl(data.url);
      }
    } catch (error) {
      console.error('Error testing action:', error);
      setResponse({ error: 'Failed to test action' });
    } finally {
      setLoading(false);
    }
  };
  
  // Test the metadata endpoint
  const testMetadata = async () => {
    try {
      const res = await fetch('/api/actions/farlinker');
      const data = await res.json();
      setResponse(data);
    } catch (error) {
      console.error('Error fetching metadata:', error);
      setResponse({ error: 'Failed to fetch metadata' });
    }
  };
  
  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: '#17101f' }}>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Test Farcaster Action</h1>
        
        <div className="space-y-6">
          {/* Test Controls */}
          <div className="bg-gray-900 rounded-lg p-6 space-y-4">
            <h2 className="text-xl font-semibold text-white mb-4">Action Tests</h2>
            
            <div className="flex gap-4">
              <button
                onClick={testAction}
                disabled={loading}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg disabled:opacity-50"
              >
                {loading ? 'Testing...' : 'Test Action Endpoint'}
              </button>
              
              <button
                onClick={testMetadata}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
              >
                Test Metadata Endpoint
              </button>
            </div>
          </div>
          
          {/* Response Display */}
          {response && (
            <div className="bg-gray-900 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-3">Response:</h3>
              <pre className="bg-black p-4 rounded text-green-400 text-sm overflow-auto">
                {JSON.stringify(response, null, 2)}
              </pre>
            </div>
          )}
          
          {/* Modal Test */}
          {modalUrl && (
            <div className="bg-gray-900 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-3">Modal URL:</h3>
              <p className="text-gray-300 mb-4">{modalUrl}</p>
              <a
                href={modalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
              >
                Open Modal in New Tab
              </a>
              
              {/* Iframe to test modal */}
              <div className="mt-6">
                <h4 className="text-md font-semibold text-white mb-3">Modal Preview:</h4>
                <iframe
                  src={modalUrl}
                  className="w-full h-96 rounded-lg border border-gray-700"
                  title="Modal Preview"
                />
              </div>
            </div>
          )}
          
          {/* Instructions */}
          <div className="bg-gray-900 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-3">Testing Instructions:</h3>
            <ol className="text-gray-300 space-y-2 list-decimal list-inside">
              <li>Click &quot;Test Action Endpoint&quot; to simulate a Farcaster action request</li>
              <li>Check the response - it should return a modal type with a URL</li>
              <li>Click &quot;Open Modal in New Tab&quot; to test the modal interface</li>
              <li>The modal should show 4 options for sharing/copying links</li>
              <li>Test the metadata endpoint to ensure it returns proper action configuration</li>
            </ol>
          </div>
          
          {/* Additional Tools */}
          <div className="bg-gray-900 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-3">Additional Testing Tools:</h3>
            <ul className="text-gray-300 space-y-2">
              <li>
                <a 
                  href="https://warpcast.com/~/developers/frames"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-400 hover:text-purple-300"
                >
                  Warpcast Frame Validator
                </a>
                {' - Official validator for frames and actions'}
              </li>
              <li>
                <a 
                  href="https://frameground.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-400 hover:text-purple-300"
                >
                  Frameground
                </a>
                {' - Test frames and actions in a sandbox environment'}
              </li>
              <li>
                <a 
                  href="https://www.framesimuator.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-400 hover:text-purple-300"
                >
                  Frame Simulator
                </a>
                {' - Simulate frame interactions'}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}