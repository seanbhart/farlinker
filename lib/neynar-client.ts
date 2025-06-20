import { NeynarAPIClient, Configuration } from "@neynar/nodejs-sdk";

// Initialize Neynar client
const config = new Configuration({
  apiKey: process.env.NEYNAR_API_KEY || '',
});

const client = new NeynarAPIClient(config);

export async function fetchCastByUrl(username: string, shortHash: string) {
  try {
    if (!process.env.NEYNAR_API_KEY) {
      console.error('NEYNAR_API_KEY is not set');
      return null;
    }

    // Construct the URL - we can use warpcast.com format
    const url = `https://warpcast.com/${username}/${shortHash}`;
    console.log('Fetching cast by URL:', url);

    const response = await client.lookupCastByHashOrWarpcastUrl({
      identifier: url,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      type: "url" as any // Cast to any to bypass type issues
    });

    console.log('Successfully fetched cast');
    return response.cast;
  } catch (error) {
    console.error('Error fetching cast:', error);
    return null;
  }
}