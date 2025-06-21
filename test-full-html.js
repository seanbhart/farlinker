#!/usr/bin/env node

const https = require('https');
const http = require('http');
const { URL } = require('url');

// Apple Messages user agent
const APPLE_MESSAGES_USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_1) AppleWebKit/601.2.4 (KHTML, like Gecko) Version/9.0.1 Safari/601.2.4 facebookexternalhit/1.1 Facebot Twitterbot/1.0';

// Test URL
const TEST_URL = process.argv[2] || 'https://farlinker.vercel.app/dwr/0x0de97199';

async function fetchWithUserAgent(url, userAgent) {
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
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });
    
    req.on('error', (err) => {
      reject(err);
    });
    
    req.end();
  });
}

async function testFullHTML() {
  console.log('Fetching full HTML for:', TEST_URL);
  console.log('---');
  
  try {
    const response = await fetchWithUserAgent(TEST_URL, APPLE_MESSAGES_USER_AGENT);
    
    // Extract just the <head> section to see all meta tags
    const headMatch = response.body.match(/<head[^>]*>([\s\S]*?)<\/head>/i);
    if (headMatch) {
      console.log('HEAD section:');
      console.log(headMatch[0]);
    } else {
      console.log('Could not find HEAD section');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testFullHTML();