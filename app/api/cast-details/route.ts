import { NextRequest, NextResponse } from 'next/server';
import { fetchCastByUrl, fetchCastByHash } from '@/lib/neynar';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { hash, username } = body;

    if (!hash) {
      return NextResponse.json({ error: 'Cast hash is required' }, { status: 400 });
    }

    const cast = username
      ? await fetchCastByUrl(username, hash)
      : await fetchCastByHash(hash);

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
        if ('url' in embed && embed.url) {
          const isImage = embed.url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ||
                         embed.url.includes('imagedelivery.net') ||
                         embed.url.includes('imgur.com') ||
                         embed.url.includes('i.imgur.com');

          if (isImage) {
            embeddedImage = embed.url;
            if ('metadata' in embed && embed.metadata?.image) {
              const width = embed.metadata.image.width_px;
              const height = embed.metadata.image.height_px;
              if (width && height && height > 0) {
                aspectRatio = height / width;
              }
            }
            break;
          }
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
