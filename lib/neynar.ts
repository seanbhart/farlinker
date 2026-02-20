import { NeynarAPIClient, Configuration } from "@neynar/nodejs-sdk";
import { getCachedCast, setCachedCast } from "./cast-cache";

const config = new Configuration({
  apiKey: process.env.NEYNAR_API_KEY || '',
});

const client = new NeynarAPIClient(config);

/**
 * Fetch a cast by Warpcast URL (username + hash).
 * Handles both short (0x324ceda2) and long (0x324ceda2c96209aa6be69b58be65836a1ff68142) hash formats.
 */
export async function fetchCastByUrl(username: string, hash: string) {
  // Normalize to short hash for Warpcast URL format
  let shortHash = hash;
  if (hash.startsWith('0x') && hash.length > 10) {
    shortHash = '0x' + hash.slice(2, 10);
  }

  const cacheKey = `url:${username}:${shortHash}`;

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

    if (response.cast) {
      setCachedCast(cacheKey, response.cast);
    }

    return response.cast;
  } catch (error) {
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

/**
 * Fetch a cast by hash directly.
 * Accepts both short and full-length hashes.
 */
export async function fetchCastByHash(hash: string) {
  const cacheKey = `hash:${hash}`;

  const cached = getCachedCast(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    if (!process.env.NEYNAR_API_KEY) {
      console.error('[Neynar] No API key set');
      return null;
    }

    const response = await client.lookupCastByHashOrWarpcastUrl({
      identifier: hash,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      type: "hash" as any
    });

    if (response.cast) {
      setCachedCast(cacheKey, response.cast);
    }

    return response.cast;
  } catch (error) {
    const err = error as { response?: { status?: number }, message?: string };
    if (err?.response?.status === 429) {
      console.error('[Neynar] Rate limit hit');
    } else if (err?.response?.status === 404) {
      console.error('[Neynar] Cast not found:', hash);
    } else if (err?.response?.status === 401) {
      console.error('[Neynar] Invalid API key');
    } else {
      console.error('[Neynar] Error:', err?.message || 'Unknown error');
    }
    return null;
  }
}
