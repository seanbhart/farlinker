export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold text-purple-900 mb-6">
            Farlinker
          </h1>
          <p className="text-xl text-purple-700 mb-12">
            Better link previews for Farcaster posts
          </p>
          
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              How it works
            </h2>
            <ol className="space-y-4 text-gray-700">
              <li className="flex">
                <span className="font-bold text-purple-600 mr-3">1.</span>
                <span>Take any Farcaster post URL (e.g., farcaster.xyz/username/0x1234...)</span>
              </li>
              <li className="flex">
                <span className="font-bold text-purple-600 mr-3">2.</span>
                <span>Replace &quot;farcaster.xyz&quot; with &quot;farlinker.xyz&quot;</span>
              </li>
              <li className="flex">
                <span className="font-bold text-purple-600 mr-3">3.</span>
                <span>Share the new link to get beautiful previews on Twitter, Discord, and more</span>
              </li>
              <li className="flex">
                <span className="font-bold text-purple-600 mr-3">4.</span>
                <span>When clicked, users are redirected to the original Farcaster post</span>
              </li>
            </ol>
          </div>
          
          <div className="bg-purple-600 text-white rounded-lg p-8">
            <h2 className="text-2xl font-semibold mb-4">
              Example
            </h2>
            <div className="space-y-2">
              <div className="font-mono text-sm bg-purple-700 p-3 rounded">
                <span className="text-purple-300">Original:</span> farcaster.xyz/dwr/0x0de97199
              </div>
              <div className="font-mono text-sm bg-purple-700 p-3 rounded">
                <span className="text-purple-300">Farlinker:</span> farlinker.xyz/dwr/0x0de97199
              </div>
            </div>
          </div>
          
          <div className="mt-12 text-center text-gray-600">
            <p>Built for the Farcaster community with 💜</p>
          </div>
        </div>
      </div>
    </main>
  );
}
