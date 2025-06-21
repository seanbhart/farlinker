const https = require('https');
const http = require('http');
const { URL } = require('url');

// Test with a known working cast
const WORKING_CAST_URL = 'https://farlinker.vercel.app/dwr.eth/0x48d47343';
const FACEBOOK_USER_AGENT = 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)';

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
  
  // Extract all Open Graph tags
  const ogMatches = html.matchAll(/<meta\s+(?:[^>]*?\s+)?property=["']([^"']+)["']\s+(?:[^>]*?\s+)?content=["']([^"']+)["'][^>]*>/gi);
  for (const match of ogMatches) {
    metaTags[match[1]] = match[2];
  }
  
  // Extract title
  const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
  if (titleMatch) metaTags['title'] = titleMatch[1];
  
  // Extract Twitter tags
  const twitterMatches = html.matchAll(/<meta\s+(?:[^>]*?\s+)?name=["']twitter:([^"']+)["']\s+(?:[^>]*?\s+)?content=["']([^"']+)["'][^>]*>/gi);
  for (const match of twitterMatches) {
    metaTags[`twitter:${match[1]}`] = match[2];
  }
  
  return metaTags;
}

async function testWorkingCast() {
  console.log('🧪 Testing with a known working cast URL');
  console.log(`URL: ${WORKING_CAST_URL}`);
  console.log(`User-Agent: ${FACEBOOK_USER_AGENT}`);
  console.log('=' .repeat(80));
  
  try {
    const response = await testUrl(WORKING_CAST_URL, FACEBOOK_USER_AGENT);
    
    console.log(`\n✅ Status Code: ${response.statusCode}`);
    
    const metaTags = extractMetaTags(response.body);
    
    console.log('\n📋 Extracted Meta Tags:');
    Object.entries(metaTags).forEach(([key, value]) => {
      if (key === 'og:image') {
        console.log(`  🖼️  ${key}: ${value}`);
      } else if (key === 'og:title' || key === 'title') {
        console.log(`  📝 ${key}: ${value}`);
      } else {
        console.log(`  ${key}: ${value}`);
      }
    });
    
    // Check Facebook requirements
    console.log('\n🔍 Facebook Open Graph Requirements Check:');
    const requirements = {
      'og:title': metaTags['og:title'] ? '✅' : '❌',
      'og:description': metaTags['og:description'] ? '✅' : '❌',
      'og:image': metaTags['og:image'] ? '✅' : '❌',
      'og:url': metaTags['og:url'] ? '✅' : '❌'
    };
    
    Object.entries(requirements).forEach(([tag, status]) => {
      console.log(`  ${status} ${tag}: ${metaTags[tag] || 'NOT FOUND'}`);
    });
    
    // Save response
    const fs = require('fs');
    fs.writeFileSync('working-cast-response.html', response.body);
    console.log('\n💾 Full HTML response saved to: working-cast-response.html');
    
    // Analysis
    console.log('\n📊 Analysis:');
    if (metaTags['og:title'] === 'Loading cast content...') {
      console.log('  ⚠️  Cast data is not loading properly - Neynar API issue');
    } else {
      console.log('  ✅ Cast data loaded successfully');
    }
    
    if (!metaTags['og:image']) {
      console.log('  ❌ No og:image tag - Facebook won\'t show preview image');
    } else {
      console.log('  ✅ og:image present - Facebook should show preview');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testWorkingCast();