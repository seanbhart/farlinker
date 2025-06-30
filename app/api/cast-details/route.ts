import { NextRequest, NextResponse } from 'next/server';
import { fetchCastByUrl } from '@/lib/neynar-client';
import { NeynarAPIClient, Configuration } from "@neynar/nodejs-sdk";

const config = new Configuration({
  apiKey: process.env.NEYNAR_API_KEY || '',
});

const client = new NeynarAPIClient(config);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { hash, username } = body;

    if (!hash) {
      return NextResponse.json({ error: 'Cast hash is required' }, { status: 400 });
    }

    let cast = null;

    // If we have a username, use the existing fetchCastByUrl function
    if (username) {
      cast = await fetchCastByUrl(username, hash);
    } else {
      // For direct hash lookup, we need to use the Neynar API directly
      try {
        const response = await client.lookupCastByHashOrWarpcastUrl({
          identifier: hash,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          type: "hash" as any
        });
        cast = response.cast;
      } catch (error) {
        console.error('[Cast Details] Direct hash lookup failed:', error);
        return NextResponse.json({ error: 'Cast not found' }, { status: 404 });
      }
    }

    if (!cast) {
      return NextResponse.json({ error: 'Cast not found' }, { status: 404 });
    }

    // Extract the data we need for image generation
    const author = cast.author;
    const pfp = author.pfp_url;
    const displayName = author.display_name || author.username;
    const usernameValue = author.username;
    const text = cast.text || '';
    
    // Handle embedded images
    let embeddedImage = null;
    let aspectRatio = null;
    
    if (cast.embeds && cast.embeds.length > 0) {
      for (const embed of cast.embeds) {
        if ('url' in embed && embed.url && (embed.url.includes('.jpg') || embed.url.includes('.png') || embed.url.includes('.gif') || embed.url.includes('.webp'))) {
          embeddedImage = embed.url;
          // Try to extract aspect ratio from metadata if available
          if ('metadata' in embed && embed.metadata?.image) {
            const width = embed.metadata.image.width_px;
            const height = embed.metadata.image.height_px;
            if (width && height && height > 0) {
              aspectRatio = height / width; // height/width for the OG image generator
            }
          }
          break;
        }
      }
    }

    const result = {
      hash: cast.hash,
      pfp,
      displayName,
      username: usernameValue,
      text,
      embeddedImage,
      aspectRatio,
      author: {
        fid: author.fid,
        username: usernameValue,
        displayName,
        pfp
      }
    };

    return NextResponse.json(result);

  } catch (error) {
    console.error('[Cast Details] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}