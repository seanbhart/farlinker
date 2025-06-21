const https = require('https');
const http = require('http');
const { URL } = require('url');

// Facebook crawler user agents
const FACEBOOK_USER_AGENTS = [
  'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
  'facebookexternalhit/1.1',
  'facebookcatalog/1.0',
  'meta-externalagent/1.1 (+https://developers.facebook.com/docs/sharing/webmasters/crawler)',
  'meta-externalagent/1.1',
  'meta-externalfetcher/1.1 (+https://developers.facebook.com/docs/sharing/webmasters/crawler)',
  'meta-externalfetcher/1.1'
];

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

function extractMetaTags(html) {
  const metaTags = {};
  
  // Extract og:image
  const ogImageMatch = html.match(/<meta\s+(?:[^>]*?\s+)?property=["']og:image["']\s+(?:[^>]*?\s+)?content=["']([^"']+)["'][^>]*>/i);
  if (ogImageMatch) metaTags['og:image'] = ogImageMatch[1];
  
  // Extract og:title
  const ogTitleMatch = html.match(/<meta\s+(?:[^>]*?\s+)?property=["']og:title["']\s+(?:[^>]*?\s+)?content=["']([^"']+)["'][^>]*>/i);
  if (ogTitleMatch) metaTags['og:title'] = ogTitleMatch[1];
  
  // Extract og:description
  const ogDescMatch = html.match(/<meta\s+(?:[^>]*?\s+)?property=["']og:description["']\s+(?:[^>]*?\s+)?content=["']([^"']+)["'][^>]*>/i);
  if (ogDescMatch) metaTags['og:description'] = ogDescMatch[1];
  
  // Extract og:url
  const ogUrlMatch = html.match(/<meta\s+(?:[^>]*?\s+)?property=["']og:url["']\s+(?:[^>]*?\s+)?content=["']([^"']+)["'][^>]*>/i);
  if (ogUrlMatch) metaTags['og:url'] = ogUrlMatch[1];
  
  // Extract og:type
  const ogTypeMatch = html.match(/<meta\s+(?:[^>]*?\s+)?property=["']og:type["']\s+(?:[^>]*?\s+)?content=["']([^"']+)["'][^>]*>/i);
  if (ogTypeMatch) metaTags['og:type'] = ogTypeMatch[1];
  
  // Extract title tag
  const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
  if (titleMatch) metaTags['title'] = titleMatch[1];
  
  // Extract twitter:card
  const twitterCardMatch = html.match(/<meta\s+(?:[^>]*?\s+)?name=["']twitter:card["']\s+(?:[^>]*?\s+)?content=["']([^"']+)["'][^>]*>/i);
  if (twitterCardMatch) metaTags['twitter:card'] = twitterCardMatch[1];
  
  // Extract twitter:image
  const twitterImageMatch = html.match(/<meta\s+(?:[^>]*?\s+)?name=["']twitter:image["']\s+(?:[^>]*?\s+)?content=["']([^"']+)["'][^>]*>/i);
  if (twitterImageMatch) metaTags['twitter:image'] = twitterImageMatch[1];
  
  return metaTags;
}

async function testFacebookCrawler(url) {
  console.log(`\nTesting URL: ${url}`);
  console.log('=' .repeat(80));
  
  // Test with the primary Facebook crawler user agent
  const userAgent = FACEBOOK_USER_AGENTS[0];
  console.log(`\nUsing User-Agent: ${userAgent}`);
  
  try {
    const response = await testUrl(url, userAgent);
    
    console.log(`\nStatus Code: ${response.statusCode}`);
    console.log('\nResponse Headers:');
    Object.entries(response.headers).forEach(([key, value]) => {
      console.log(`  ${key}: ${value}`);
    });
    
    const metaTags = extractMetaTags(response.body);
    
    console.log('\nExtracted Meta Tags:');
    Object.entries(metaTags).forEach(([key, value]) => {
      console.log(`  ${key}: ${value}`);
    });
    
    // Check specifically for og:image
    console.log('\n🖼️  Open Graph Image Status:');
    if (metaTags['og:image']) {
      console.log(`  ✅ og:image found: ${metaTags['og:image']}`);
    } else {
      console.log('  ❌ og:image NOT FOUND');
    }
    
    // Save the full HTML response for debugging
    const fs = require('fs');
    fs.writeFileSync('facebook-crawler-response.html', response.body);
    console.log('\n📄 Full HTML response saved to: facebook-crawler-response.html');
    
  } catch (error) {
    console.error('Error testing URL:', error.message);
  }
}

// Test with a sample farlinker URL
// You can change this to test different posts
const testUrls = [
  'https://farlinker.vercel.app/dwr/0xfbe87ce6',  // Example URL - replace with actual
];

async function runTests() {
  for (const url of testUrls) {
    await testFacebookCrawler(url);
  }
  
  console.log('\n\n📝 Note: To test with different Facebook crawler user agents, you can modify the FACEBOOK_USER_AGENTS array.');
  console.log('\nAll available Facebook user agents:');
  FACEBOOK_USER_AGENTS.forEach((ua, index) => {
    console.log(`  ${index + 1}. ${ua}`);
  });
}

runTests();