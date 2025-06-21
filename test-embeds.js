// Test script to see what's in the embeds
const { fetchCastByUrl } = require('./lib/neynar-client.ts');

async function testEmbeds() {
  const cast = await fetchCastByUrl('swabbie.eth', '0x8f9eb013');
  
  if (cast) {
    console.log('Cast text:', cast.text);
    console.log('\nEmbeds:', JSON.stringify(cast.embeds, null, 2));
  } else {
    console.log('Failed to fetch cast');
  }
}

testEmbeds();