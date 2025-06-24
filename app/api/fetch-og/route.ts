import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');
    const forApple = searchParams.get('apple') === 'true';
    
    if (!url) {
      return NextResponse.json(
        { error: 'Missing URL parameter' },
        { status: 400 }
      );
    }
    
    console.log('[Fetch OG] Fetching OG data from:', url, 'forApple:', forApple);
    
    // Use Apple Messages User-Agent if fetching for Apple preview
    const userAgent = forApple 
      ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 Messages/17.0'
      : 'Mozilla/5.0 (compatible; WhatsApp/2.23.20.0)';
    
    // Fetch the HTML from the URL
    const response = await fetch(url, {
      headers: {
        'User-Agent': userAgent
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.status}`);
    }
    
    const html = await response.text();
    
    // Parse OG tags from the HTML
    const ogData: Record<string, string> = {};
    
    // Helper to decode HTML entities
    const decodeHtmlEntities = (text: string): string => {
      return text
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");
    };
    
    // Extract og:title
    const titleMatch = html.match(/<meta\s+property="og:title"\s+content="([^"]+)"/i);
    if (titleMatch) ogData.title = decodeHtmlEntities(titleMatch[1]);
    
    // Extract og:description
    const descMatch = html.match(/<meta\s+property="og:description"\s+content="([^"]+)"/i);
    if (descMatch) ogData.description = decodeHtmlEntities(descMatch[1]);
    
    // Extract og:image
    const imageMatch = html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/i);
    if (imageMatch) ogData.image = decodeHtmlEntities(imageMatch[1]);
    
    // Extract og:site_name
    const siteMatch = html.match(/<meta\s+property="og:site_name"\s+content="([^"]+)"/i);
    if (siteMatch) ogData.siteName = decodeHtmlEntities(siteMatch[1]);
    
    console.log('[Fetch OG] Extracted OG data:', ogData);
    
    return NextResponse.json(ogData);
  } catch (error) {
    console.error('[Fetch OG] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch OG data' },
      { status: 500 }
    );
  }
}