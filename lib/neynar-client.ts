import { NeynarAPIClient, Configuration } from "@neynar/nodejs-sdk";

// Initialize Neynar client
const config = new Configuration({
  apiKey: process.env.NEYNAR_API_KEY || '',
});

const client = new NeynarAPIClient(config);

export async function fetchCastByUrl(username: string, shortHash: string) {
  try {
    if (!process.env.NEYNAR_API_KEY) {
      return null;
    }

    const url = `https://warpcast.com/${username}/${shortHash}`;
    
    const response = await client.lookupCastByHashOrWarpcastUrl({
      identifier: url,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      type: "url" as any
    });

    return response.cast;
  } catch (error) {
    return null;
  }
}