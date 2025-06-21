#!/usr/bin/env node

const https = require('https');
const http = require('http');
const { URL } = require('url');

// Apple Messages user agent
const APPLE_MESSAGES_USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_1) AppleWebKit/601.2.4 (KHTML, like Gecko) Version/9.0.1 Safari/601.2.4 facebookexternalhit/1.1 Facebot Twitterbot/1.0';

// Test URL
const TEST_URL = process.argv[2] || 'https://farlinker.xyz/swabbie.eth/0x8f9eb013';

async function fetchWithUserAgent(url, userAgent, followRedirects = false) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port,
      path: parsedUrl.pathname + parsedUrl.search,
      method: 'GET',
      headers: {
        'User-Agent': userAgent,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      }
    };

    const protocol = parsedUrl.protocol === 'https:' ? https : http;
    
    const req = protocol.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if ((res.statusCode === 301 || res.statusCode === 302 || res.statusCode === 307) && followRedirects && res.headers.location) {
          console.log('Following redirect to:', res.headers.location);
          fetchWithUserAgent(res.headers.location, userAgent, followRedirects).then(resolve).catch(reject);
        } else {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: data
          });
        }
      });
    });
    
    req.on('error', (err) => {
      reject(err);
    });
    
    req.end();
  });
}

async function testWithRedirect() {
  console.log('Testing URL:', TEST_URL);
  console.log('User-Agent:', APPLE_MESSAGES_USER_AGENT);
  console.log('---');
  
  try {
    // First, test without following redirects
    const response1 = await fetchWithUserAgent(TEST_URL, APPLE_MESSAGES_USER_AGENT, false);
    console.log('Initial Response:');
    console.log('Status:', response1.statusCode);
    console.log('Location header:', response1.headers.location);
    console.log('Body length:', response1.body.length);
    console.log('Body preview:', response1.body.substring(0, 200));
    console.log('---');
    
    // Then test with following redirects
    if (response1.statusCode === 307 || response1.statusCode === 301 || response1.statusCode === 302) {
      console.log('Following redirects...');
      const response2 = await fetchWithUserAgent(TEST_URL, APPLE_MESSAGES_USER_AGENT, true);
      console.log('Final Response:');
      console.log('Status:', response2.statusCode);
      const headMatch = response2.body.match(/<head[^>]*>([\s\S]*?)<\/head>/i);
      if (headMatch) {
        console.log('HEAD section found');
        // Extract meta tags
        const metaTags = {};
        const ogTitle = response2.body.match(/<meta\s+property="og:title"\s+content="([^"]+)"/i);
        const ogDesc = response2.body.match(/<meta\s+property="og:description"\s+content="([^"]+)"/i);
        const ogImage = response2.body.match(/<meta\s+property="og:image"\s+content="([^"]+)"/i);
        
        if (ogTitle) console.log('og:title:', ogTitle[1]);
        if (ogDesc) console.log('og:description:', ogDesc[1]);
        if (ogImage) console.log('og:image:', ogImage[1]);
      }
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testWithRedirect();