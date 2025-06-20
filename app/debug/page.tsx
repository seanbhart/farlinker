import { headers } from 'next/headers';

export default async function DebugPage() {
  const headersList = await headers();
  const userAgent = headersList.get('user-agent') || 'No user agent';
  
  // Test the bot detection regex
  const isBot = /\b(bot|crawler|spider|crawling|facebookexternalhit|twitterbot|telegrambot|discordbot|slackbot|linkedinbot)\b/i.test(userAgent);
  
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-8">Debug Information</h1>
      
      <div className="bg-white p-6 rounded shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">User Agent</h2>
        <p className="font-mono text-sm break-all">{userAgent}</p>
      </div>
      
      <div className="bg-white p-6 rounded shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">Bot Detection</h2>
        <p className="text-lg">
          Is Bot: <span className={isBot ? 'text-red-600' : 'text-green-600'}>
            {isBot ? 'Yes' : 'No'}
          </span>
        </p>
        <p className="text-sm text-gray-600 mt-2">
          {isBot ? 'This user agent is detected as a bot' : 'This user agent is detected as a regular user'}
        </p>
      </div>
      
      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-xl font-semibold mb-4">Test Links</h2>
        <ul className="space-y-2">
          <li>
            <a href="/swabbie.eth/0xf71a74c3" className="text-blue-600 hover:underline">
              Test redirect: /swabbie.eth/0xf71a74c3
            </a>
          </li>
          <li>
            <a href="/api/og/swabbie.eth/0xf71a74c3" className="text-blue-600 hover:underline">
              Test OG image: /api/og/swabbie.eth/0xf71a74c3
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
}