import { NeynarAPIClient, Configuration } from "@neynar/nodejs-sdk";
import { getCachedCast, setCachedCast } from "./cast-cache";

// Initialize Neynar client
const config = new Configuration({
  apiKey: process.env.NEYNAR_API_KEY || '',
});

const client = new NeynarAPIClient(config);

export async function fetchCastByUrl(username: string, hash: string) {
  // Handle both short and long hash formats
  // Short format: 0x324ceda2 (8 chars after 0x)
  // Long format: 0x324ceda2c96209aa6be69b58be65836a1ff68142 (40 chars after 0x)
  let shortHash = hash;
  if (hash.startsWith('0x') && hash.length > 10) {
    // This is a long hash, shorten it to the first 8 chars after 0x
    shortHash = '0x' + hash.slice(2, 10);
  }
  
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