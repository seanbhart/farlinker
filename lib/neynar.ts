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

  try {
    const params = new URLSearchParams({
      identifier: identifier,
      type: 'hash',
      ...(viewerFid && { viewer_fid: viewerFid.toString() }),
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

    if (!response.ok) {
      console.error('Neynar API error:', response.status, response.statusText);
      return null;
    }

    const data: NeynarResponse = await response.json();
    return data.cast;
  } catch (error) {
    console.error('Error fetching cast from Neynar:', error);
    return null;
  }
}

export function formatCastUrl(username: string, hash: string): string {
  // Ensure hash starts with 0x
  if (!hash.startsWith('0x')) {
    hash = '0x' + hash;
  }
  return `https://farcaster.xyz/${username}/${hash}`;
}