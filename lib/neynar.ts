const NEYNAR_API_BASE = 'https://api.neynar.com/v2/farcaster';

interface NeynarCast {
  hash: string;
  thread_hash: string;
  parent_hash: string | null;
  parent_url: string | null;
  root_parent_url: string | null;
  parent_author: {
    fid: number;
  } | null;
  author: {
    object: string;
    fid: number;
    custody_address: string;
    username: string;
    display_name: string;
    pfp_url: string;
    profile: {
      bio: {
        text: string;
      };
    };
    follower_count: number;
    following_count: number;
    verifications: string[];
    verified_addresses: {
      eth_addresses: string[];
      sol_addresses: string[];
    };
    active_status: string;
    power_badge: boolean;
  };
  text: string;
  timestamp: string;
  embeds: Array<{
    url?: string;
    metadata?: {
      content_type?: string;
      content_length?: number;
      _status?: string;
      image?: {
        width_px?: number;
        height_px?: number;
      };
      video?: {
        duration_s?: number;
        stream?: Array<{
          codec_name?: string;
          height_px?: number;
          width_px?: number;
        }>;
      };
      html?: {
        favicon?: string;
        ogImage?: string;
        ogTitle?: string;
        ogDescription?: string;
      };
    };
    cast_id?: {
      fid: number;
      hash: string;
    };
  }>;
  reactions: {
    likes_count: number;
    recasts_count: number;
  };
  replies: {
    count: number;
  };
  mentioned_profiles: unknown[];
}

interface NeynarResponse {
  cast: NeynarCast;
}

export async function fetchCastByIdentifier(identifier: string, viewerFid?: number): Promise<NeynarCast | null> {
  const apiKey = process.env.NEYNAR_API_KEY;
  
  if (!apiKey) {
    console.error('NEYNAR_API_KEY is not set');
    return null;
  }
  
  console.log('Fetching cast with identifier:', identifier);

  try {
    // Try with the identifier as-is first (could be a short hash)
    const params = new URLSearchParams({
      identifier: identifier,
      type: 'hash',
      ...(viewerFid && { viewer_fid: viewerFid.toString() }),
    });

    const response = await fetch(
      `${NEYNAR_API_BASE}/cast?${params}`,
      {
        headers: {
          'x-api-key': apiKey,
          'accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Neynar API error:', response.status, response.statusText, errorText);
      
      // If it fails with a short hash, we might need to try a different approach
      // Could try searching by URL or other methods
      return null;
    }

    const data: NeynarResponse = await response.json();
    return data.cast;
  } catch (error) {
    console.error('Error fetching cast from Neynar:', error);
    return null;
  }
}

// Function to fetch by Farcaster URL
export async function fetchCastByUrl(username: string, shortHash: string): Promise<NeynarCast | null> {
  const apiKey = process.env.NEYNAR_API_KEY;
  
  if (!apiKey) {
    console.error('NEYNAR_API_KEY is not set');
    return null;
  }
  
  // According to Neynar docs, we can use just the path part
  // Try different URL formats
  const urls = [
    `https://warpcast.com/${username}/${shortHash}`,
    `warpcast.com/${username}/${shortHash}`,
    `${username}/${shortHash}`
  ];
  
  for (const castUrl of urls) {
    console.log('Trying to fetch cast by URL:', castUrl);

    try {
      const params = new URLSearchParams({
        identifier: castUrl,
        type: 'url',
      });

      const response = await fetch(
        `${NEYNAR_API_BASE}/cast?${params}`,
        {
          headers: {
            'api_key': apiKey,
            'accept': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data: NeynarResponse = await response.json();
        console.log('Successfully fetched cast by URL');
        return data.cast;
      } else {
        const errorText = await response.text();
        console.error(`Neynar API error for ${castUrl}:`, response.status, errorText);
      }
    } catch (error) {
      console.error(`Error fetching cast from Neynar by URL ${castUrl}:`, error);
    }
  }
  
  return null;
}

export function formatCastUrl(username: string, hash: string): string {
  // Ensure hash starts with 0x
  if (!hash.startsWith('0x')) {
    hash = '0x' + hash;
  }
  return `https://farcaster.xyz/${username}/${hash}`;
}

// Simple in-memory cache for cast data
const castCache = new Map<string, { data: NeynarCast; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// New function specifically for fetching cast by hash only
export async function fetchCastByHash(hash: string): Promise<NeynarCast | null> {
  const apiKey = process.env.NEYNAR_API_KEY;
  
  if (!apiKey) {
    console.error('NEYNAR_API_KEY is not set');
    return null;
  }
  
  // Check cache first
  const cached = castCache.get(hash);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    console.log('[Neynar] Returning cached cast for hash:', hash);
    return cached.data;
  }
  
  console.log('[Neynar] Fetching cast by hash:', hash);

  try {
    const params = new URLSearchParams({
      identifier: hash,
      type: 'hash'
    });

    const response = await fetch(
      `${NEYNAR_API_BASE}/cast?${params}`,
      {
        headers: {
          'x-api-key': apiKey,
          'accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Neynar] API error:', response.status, response.statusText, errorText);
      return null;
    }

    const data: NeynarResponse = await response.json();
    console.log('[Neynar] Successfully fetched cast by hash');
    
    // Cache the result
    castCache.set(hash, { data: data.cast, timestamp: Date.now() });
    
    // Prevent memory leak
    if (castCache.size > 100) {
      const firstKey = castCache.keys().next().value;
      if (firstKey) castCache.delete(firstKey);
    }
    
    return data.cast;
  } catch (error) {
    console.error('[Neynar] Error fetching cast by hash:', error);
    return null;
  }
}