import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const userAgent = request.headers.get('user-agent') || '';
  
  console.log('Middleware - pathname:', pathname);
  console.log('Middleware - user-agent:', userAgent.substring(0, 50) + '...');
  
  // Check if this is a bot/crawler (including OG validators)
  const isBot = /\b(bot|crawler|spider|crawling|facebookexternalhit|twitterbot|telegrambot|discordbot|slackbot|linkedinbot|opengraph|metainspector|whatsapp|telegram|validator|preview|scraper|curl|wget|python|ruby|perl|java|go)\b/i.test(userAgent);
  
  // If it's a bot and we're on the non-www domain, don't redirect
  // This allows validators to get metadata without following redirects
  if (isBot && request.headers.get('host') === 'farlinker.xyz') {
    console.log('Bot detected on non-www, serving content directly');
  }
  
  // Allow API routes, static files, images, and special routes to pass through
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname === '/' ||
    pathname === '/favicon.ico' ||
    pathname === '/icon.png' ||
    pathname === '/splash.png' ||
    pathname === '/apple-touch-icon.png' ||
    pathname === '/apple-touch-icon-precomposed.png' ||
    pathname === '/.well-known/farcaster.json' ||
    pathname.endsWith('.png') ||
    pathname.endsWith('.jpg') ||
    pathname.endsWith('.jpeg') ||
    pathname.endsWith('.gif') ||
    pathname.endsWith('.webp') ||
    pathname.endsWith('.svg') ||
    pathname === '/farlinker.png' ||
    pathname === '/fc.png' ||
    pathname === '/fc.webp'
  ) {
    return NextResponse.next();
  }
  
  // Check if this is a valid Farcaster post URL pattern
  // Allow dots in username for ENS names like swabbie.eth
  // Hash can optionally start with 0x
  const postPattern = /^\/([a-zA-Z0-9._-]+)\/(0x)?([a-zA-Z0-9]+)$/;
  const match = pathname.match(postPattern);
  
  if (!match) {
    // Log for debugging
    console.log(`Invalid URL pattern: ${pathname}`);
    // Invalid URL pattern, redirect to home
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  // Valid pattern, continue to the dynamic route
  return NextResponse.next();
}

export const config = {
  matcher: '/((?!_next/static|_next/image|favicon.ico).*)',
};