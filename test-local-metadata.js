// Test script to check generated metadata locally
const { generateMetadata } = require('./app/[username]/[hash]/page.tsx');

async function testMetadata() {
  const params = {
    username: 'dwr',
    hash: '0x0de97199'
  };
  
  try {
    const metadata = await generateMetadata({ params: Promise.resolve(params) });
    console.log('Generated metadata:', JSON.stringify(metadata, null, 2));
  } catch (error) {
    console.error('Error:', error);
  }
}

testMetadata();