// Test script to check if we can fetch cast data directly
const https = require('https');

async function fetchCastDirectly(username, hash) {
  const url = `https://api.neynar.com/v2/farcaster/cast?identifier=https://warpcast.com/${username}/${hash}&type=url`;
  
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.neynar.com',
      path: `/v2/farcaster/cast?identifier=https://warpcast.com/${username}/${hash}&type=url`,
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'api_key': process.env.NEYNAR_API_KEY || 'NEYNAR_API_DOCS' // Default test key
      }
    };
    
    https.get(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, error: 'Failed to parse JSON', body: data });
        }
      });
    }).on('error', reject);
  });
}

async function testCastFetch() {
  console.log('Testing Neynar API cast fetch...\n');
  
  const testCases = [
    { username: 'dwr', hash: '0xfbe87ce6' },
    { username: 'vitalik.eth', hash: '0x48d47343' }, // Another example
  ];
  
  for (const test of testCases) {
    console.log(`\nFetching cast: ${test.username}/${test.hash}`);
    console.log(`URL: https://warpcast.com/${test.username}/${test.hash}`);
    
    try {
      const result = await fetchCastDirectly(test.username, test.hash);
      
      console.log(`Status: ${result.status}`);
      
      if (result.status === 200 && result.data?.cast) {
        const cast = result.data.cast;
        console.log('\n✅ Cast fetched successfully!');
        console.log(`Author: @${cast.author.username}`);
        console.log(`Text: ${cast.text.substring(0, 100)}${cast.text.length > 100 ? '...' : ''}`);
        
        if (cast.embeds && cast.embeds.length > 0) {
          console.log('\n📎 Embeds found:');
          cast.embeds.forEach((embed, index) => {
            if (embed.url) {
              console.log(`  ${index + 1}. ${embed.url}`);
              // Check if it's likely an image
              if (embed.url.match(/\.(jpg|jpeg|png|gif|webp)$/i) || embed.url.includes('imagedelivery.net')) {
                console.log(`     🖼️  This appears to be an image`);
              }
            }
          });
        } else {
          console.log('\n📎 No embeds in this cast');
        }
      } else {
        console.log('❌ Failed to fetch cast');
        console.log('Response:', JSON.stringify(result, null, 2));
      }
    } catch (error) {
      console.log('❌ Error:', error.message);
    }
  }
  
  console.log('\n\n💡 Note: If the API calls fail, the deployed app needs a valid NEYNAR_API_KEY environment variable.');
  console.log('Get your API key at: https://neynar.com');
}

testCastFetch();