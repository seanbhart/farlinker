import { NeynarAPIClient, Configuration } from "@neynar/nodejs-sdk";
import { getCachedCast, setCachedCast } from "./cast-cache";

// Initialize Neynar client
const config = new Configuration({
  apiKey: process.env.NEYNAR_API_KEY || '',
});

const client = new NeynarAPIClient(config);

export async function fetchCastByUrl(username: string, shortHash: string) {
  const cacheKey = `${username}:${shortHash}`;
  
  // Check cache first
  const cached = getCachedCast(cacheKey);
  if (cached) {
    return cached;
  }
  
  try {
    if (!process.env.NEYNAR_API_KEY) {
      console.error('[Neynar] No API key set');
      return null;
    }

    const url = `https://warpcast.com/${username}/${shortHash}`;
    
    const response = await client.lookupCastByHashOrWarpcastUrl({
      identifier: url,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      type: "url" as any
    });

    // Cache successful response
    if (response.cast) {
      setCachedCast(cacheKey, response.cast);
    }

    return response.cast;
  } catch (error) {
    // Log specific error types
    const err = error as { response?: { status?: number }, message?: string };
    if (err?.response?.status === 429) {
      console.error('[Neynar] Rate limit hit');
    } else if (err?.response?.status === 404) {
      console.error('[Neynar] Cast not found:', shortHash);
    } else if (err?.response?.status === 401) {
      console.error('[Neynar] Invalid API key');
    } else {
      console.error('[Neynar] Error:', err?.message || 'Unknown error');
    }
    return null;
  }
}