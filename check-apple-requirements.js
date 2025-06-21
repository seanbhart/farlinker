#!/usr/bin/env node

// Check for Apple-specific meta tags and requirements

const https = require('https');
const { URL } = require('url');

async function fetchURL(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function checkAppleRequirements() {
  // Compare working Bluesky with Farlinker
  const urls = [
    'https://bsky.app/profile/nature.com/post/3lrqdplv4wm2m',
    'https://www.farlinker.xyz/swabbie.eth/0x8f9eb013'
  ];
  
  for (const url of urls) {
    console.log(`\n=== Checking ${url} ===`);
    
    try {
      const html = await fetchURL(url);
      
      // Check for various meta tags
      const checks = [
        // Standard OG tags
        { name: 'og:title', pattern: /<meta\s+property="og:title"\s+content="([^"]+)"/i },
        { name: 'og:description', pattern: /<meta\s+property="og:description"\s+content="([^"]+)"/i },
        { name: 'og:image', pattern: /<meta\s+property="og:image"\s+content="([^"]+)"/i },
        { name: 'og:url', pattern: /<meta\s+property="og:url"\s+content="([^"]+)"/i },
        { name: 'og:site_name', pattern: /<meta\s+property="og:site_name"\s+content="([^"]+)"/i },
        { name: 'og:type', pattern: /<meta\s+property="og:type"\s+content="([^"]+)"/i },
        
        // Twitter tags
        { name: 'twitter:card', pattern: /<meta\s+name="twitter:card"\s+content="([^"]+)"/i },
        { name: 'twitter:title', pattern: /<meta\s+name="twitter:title"\s+content="([^"]+)"/i },
        { name: 'twitter:description', pattern: /<meta\s+name="twitter:description"\s+content="([^"]+)"/i },
        
        // Apple-specific tags
        { name: 'apple-mobile-web-app-title', pattern: /<meta\s+name="apple-mobile-web-app-title"\s+content="([^"]+)"/i },
        { name: 'format-detection', pattern: /<meta\s+name="format-detection"\s+content="([^"]+)"/i },
        
        // Additional tags Bluesky might use
        { name: 'twitter:app:name:iphone', pattern: /<meta\s+name="twitter:app:name:iphone"\s+content="([^"]+)"/i },
        { name: 'twitter:app:id:iphone', pattern: /<meta\s+name="twitter:app:id:iphone"\s+content="([^"]+)"/i },
        { name: 'al:ios:app_name', pattern: /<meta\s+property="al:ios:app_name"\s+content="([^"]+)"/i },
      ];
      
      console.log('\nFound meta tags:');
      for (const check of checks) {
        const match = html.match(check.pattern);
        if (match) {
          console.log(`✓ ${check.name}: ${match[1].substring(0, 80)}${match[1].length > 80 ? '...' : ''}`);
        } else {
          console.log(`✗ ${check.name}: NOT FOUND`);
        }
      }
      
      // Check for any Apple-specific link tags
      const appleLinkPattern = /<link\s+rel="apple[^"]*"\s+[^>]+>/gi;
      const appleLinks = html.match(appleLinkPattern);
      if (appleLinks) {
        console.log('\nApple-specific link tags:');
        appleLinks.forEach(link => console.log(link));
      }
      
    } catch (error) {
      console.error('Error:', error.message);
    }
  }
}

checkAppleRequirements();