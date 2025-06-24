'use client';

import { useState } from 'react';

export default function TestModal() {
  const [modalUrl, setModalUrl] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [castHash, setCastHash] = useState('0x324ceda2c96209aa6be69b58be65836a1ff68142');
  const [fid, setFid] = useState('4612');
  
  // Listen for messages from iframe
  if (typeof window !== 'undefined') {
    window.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'fc:action') {
        setMessages(prev => [...prev, {
          time: new Date().toLocaleTimeString(),
          data: event.data
        }]);
        
        // Handle link action
        if (event.data.data?.action === 'link' && event.data.data?.url) {
          console.log('Opening URL:', event.data.data.url);
          window.open(event.data.data.url, '_blank');
        }
      }
    });
  }
  
  const testAction = async () => {
    try {
      const response = await fetch('/api/actions/farlinker', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          untrustedData: {
            fid: fid,
            castId: {
              fid: fid,
              hash: castHash
            },
            messageHash: '0x00',
            network: 1,
            timestamp: Date.now()
          }
        }),
      });

      const data = await response.json();
      console.log('Action response:', data);
      
      if (data.modalUrl) {
        setModalUrl(data.modalUrl);
      }
    } catch (error) {
      console.error('Error testing action:', error);
    }
  };
  
  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: '#17101f' }}>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Test Farlinker Modal</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Controls */}
          <div className="space-y-6">
            <div className="bg-gray-900 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Test Parameters</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Cast Hash
                  </label>
                  <input
                    type="text"
                    value={castHash}
                    onChange={(e) => setCastHash(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 text-white rounded-lg border border-gray-700"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    FID
                  </label>
                  <input
                    type="text"
                    value={fid}
                    onChange={(e) => setFid(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 text-white rounded-lg border border-gray-700"
                  />
                </div>
                
                <button
                  onClick={testAction}
                  className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg"
                >
                  Test Farlinker Action
                </button>
                
                {modalUrl && (
                  <div className="mt-4 space-y-2">
                    <p className="text-sm text-gray-400">Modal URL generated:</p>
                    <p className="text-xs text-gray-500 break-all">{modalUrl}</p>
                    <button
                      onClick={() => window.open(modalUrl, '_blank')}
                      className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
                    >
                      Open Modal in New Tab
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            {/* Message Log */}
            <div className="bg-gray-900 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-3">Message Log</h3>
              <div className="bg-black p-4 rounded text-green-400 text-xs font-mono h-48 overflow-auto">
                {messages.length === 0 ? (
                  <p className="text-gray-500">Waiting for messages...</p>
                ) : (
                  messages.map((msg, i) => (
                    <div key={i} className="mb-2">
                      <span className="text-gray-500">[{msg.time}]</span>
                      <pre className="text-green-400">{JSON.stringify(msg.data, null, 2)}</pre>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
          
          {/* Modal Preview */}
          <div className="bg-gray-900 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-3">Modal Preview</h3>
            
            {modalUrl ? (
              <iframe
                src={modalUrl}
                className="w-full h-[600px] rounded-lg border border-gray-700"
                title="Modal Preview"
              />
            ) : (
              <div className="w-full h-[600px] rounded-lg border border-gray-700 bg-gray-800 flex items-center justify-center">
                <p className="text-gray-500">Click "Test Farlinker Action" to load modal</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Instructions */}
        <div className="mt-8 bg-gray-900 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-3">How This Works</h3>
          <ol className="text-gray-300 space-y-2 list-decimal list-inside">
            <li>Enter a Cast Hash and FID to test with</li>
            <li>Click "Test Farlinker Action" to simulate the action being triggered</li>
            <li>The modal will load in the preview iframe</li>
            <li>Click one of the options in the modal</li>
            <li>The modal will send a message requesting to open the copy page</li>
            <li>In Farcaster, this would open in the in-app browser</li>
            <li>Check the message log to see the communication</li>
          </ol>
        </div>
      </div>
    </div>
  );
}