export default function TestImagePage() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-8">Test OG Image Generation</h1>
      
      <div className="space-y-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Test Image URLs:</h2>
          <div className="space-y-4">
            <div className="bg-white p-4 rounded shadow">
              <p className="font-mono text-sm mb-2">/api/og/swabbie.eth/0xf71a74c3</p>
              <img 
                src="/api/og/swabbie.eth/0xf71a74c3" 
                alt="Test OG Image"
                className="border border-gray-300 max-w-full"
              />
            </div>
          </div>
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-4">Environment Info:</h2>
          <pre className="bg-white p-4 rounded shadow font-mono text-sm">
            {JSON.stringify({
              NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
              NODE_ENV: process.env.NODE_ENV,
            }, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}