const https = require('https');
const http = require('http');
const { URL } = require('url');

// Facebook crawler user agents
const FACEBOOK_USER_AGENTS = {
  'facebookexternalhit/1.1': 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
  'meta-externalagent/1.1': 'meta-externalagent/1.1 (+https://developers.facebook.com/docs/sharing/webmasters/crawler)',
  'meta-externalfetcher/1.1': 'meta-externalfetcher/1.1 (+https://developers.facebook.com/docs/sharing/webmasters/crawler)'
};

// Test different user agents
const TEST_USER_AGENTS = {
  'Facebook Crawler': FACEBOOK_USER_AGENTS['facebookexternalhit/1.1'],
  'Regular Browser': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  'Googlebot': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
  'TwitterBot': 'Twitterbot/1.0'
};

async function testUrl(urlString, userAgent) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlString);
    const options = {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname + url.search,
      method: 'GET',
      headers: {
        'User-Agent': userAgent,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'Connection': 'keep-alive',
      }
    };

    const protocol = url.protocol === 'https:' ? https : http;
    
    const req = protocol.request(options, (res) => {
      let data = '';
      
      // Handle compressed responses
      if (res.headers['content-encoding'] === 'gzip') {
        const zlib = require('zlib');
        const gunzip = zlib.createGunzip();
        res.pipe(gunzip);
        gunzip.on('data', chunk => data += chunk);
        gunzip.on('end', () => resolve({ statusCode: res.statusCode, headers: res.headers, body: data }));
      } else {
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve({ statusCode: res.statusCode, headers: res.headers, body: data }));
      }
    });

    req.on('error', reject);
    req.end();
  });
}

function extractAllMetaTags(html) {
  const metaTags = {
    openGraph: {},
    twitter: {},
    other: {}
  };
  
  // Extract all meta tags with property attribute (Open Graph)
  const ogMatches = html.matchAll(/<meta\s+(?:[^>]*?\s+)?property=["']([^"']+)["']\s+(?:[^>]*?\s+)?content=["']([^"']+)["'][^>]*>/gi);
  for (const match of ogMatches) {
    metaTags.openGraph[match[1]] = match[2];
  }
  
  // Extract all meta tags with name attribute (Twitter, etc.)
  const nameMatches = html.matchAll(/<meta\s+(?:[^>]*?\s+)?name=["']([^"']+)["']\s+(?:[^>]*?\s+)?content=["']([^"']+)["'][^>]*>/gi);
  for (const match of nameMatches) {
    if (match[1].startsWith('twitter:')) {
      metaTags.twitter[match[1]] = match[2];
    } else {
      metaTags.other[match[1]] = match[2];
    }
  }
  
  // Extract title tag
  const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
  if (titleMatch) metaTags.other['title'] = titleMatch[1];
  
  return metaTags;
}

async function testWithUserAgent(url, userAgentName, userAgent) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`Testing with: ${userAgentName}`);
  console.log(`User-Agent: ${userAgent}`);
  console.log(`${'='.repeat(80)}`);
  
  try {
    const response = await testUrl(url, userAgent);
    
    console.log(`Status Code: ${response.statusCode}`);
    
    const metaTags = extractAllMetaTags(response.body);
    
    console.log('\n📋 Open Graph Tags:');
    if (Object.keys(metaTags.openGraph).length === 0) {
      console.log('  ❌ No Open Graph tags found');
    } else {
      Object.entries(metaTags.openGraph).forEach(([key, value]) => {
        if (key === 'og:image') {
          console.log(`  🖼️  ${key}: ${value}`);
        } else {
          console.log(`  ${key}: ${value}`);
        }
      });
    }
    
    console.log('\n🐦 Twitter Card Tags:');
    if (Object.keys(metaTags.twitter).length === 0) {
      console.log('  ❌ No Twitter Card tags found');
    } else {
      Object.entries(metaTags.twitter).forEach(([key, value]) => {
        if (key === 'twitter:image') {
          console.log(`  🖼️  ${key}: ${value}`);
        } else {
          console.log(`  ${key}: ${value}`);
        }
      });
    }
    
    console.log('\n📄 Other Meta Tags:');
    Object.entries(metaTags.other).forEach(([key, value]) => {
      console.log(`  ${key}: ${value}`);
    });
    
    // Check for common issues
    console.log('\n⚠️  Issues:');
    const issues = [];
    
    if (!metaTags.openGraph['og:image']) {
      issues.push('❌ Missing og:image tag - Facebook won\'t show a preview image');
    }
    
    if (!metaTags.openGraph['og:title']) {
      issues.push('❌ Missing og:title tag');
    }
    
    if (!metaTags.openGraph['og:description']) {
      issues.push('❌ Missing og:description tag');
    }
    
    if (metaTags.openGraph['og:title'] === 'Loading cast content...') {
      issues.push('⚠️  Title shows "Loading cast content..." - cast data fetch likely failed');
    }
    
    if (issues.length === 0) {
      console.log('  ✅ All essential Open Graph tags present');
    } else {
      issues.forEach(issue => console.log(`  ${issue}`));
    }
    
    // Save response for debugging
    const filename = `response-${userAgentName.toLowerCase().replace(/\s+/g, '-')}.html`;
    const fs = require('fs');
    fs.writeFileSync(filename, response.body);
    console.log(`\n💾 Full HTML saved to: ${filename}`);
    
  } catch (error) {
    console.error('❌ Error testing URL:', error.message);
  }
}

async function runComprehensiveTest(url) {
  console.log(`\n🔍 Comprehensive Test for: ${url}`);
  console.log(`${'='.repeat(80)}`);
  
  // Test with different user agents
  for (const [name, userAgent] of Object.entries(TEST_USER_AGENTS)) {
    await testWithUserAgent(url, name, userAgent);
  }
  
  console.log(`\n\n📊 Summary`);
  console.log(`${'='.repeat(80)}`);
  console.log('Facebook\'s crawler (facebookexternalhit) needs the following Open Graph tags:');
  console.log('  1. og:title - The title of your content');
  console.log('  2. og:description - A brief description');
  console.log('  3. og:image - The URL of the image to display');
  console.log('  4. og:url - The canonical URL of your page');
  console.log('\nThe current issue appears to be that the cast data is not being fetched properly,');
  console.log('resulting in fallback "Loading..." content being served to crawlers.');
}

// Test URLs - add more as needed
const testUrls = [
  'https://farlinker.vercel.app/dwr/0xfbe87ce6',  // Example cast
];

async function main() {
  for (const url of testUrls) {
    await runComprehensiveTest(url);
  }
  
  console.log('\n\n💡 To test with a local farlinker instance:');
  console.log('1. Run your local server: npm run dev');
  console.log('2. Use ngrok or similar to expose it: ngrok http 3000');
  console.log('3. Test with: node test-facebook-crawler-detailed.js https://your-ngrok-url/username/hash');
}

main();