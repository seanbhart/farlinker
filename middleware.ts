import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Allow API routes, static files, and special routes to pass through
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname === '/' ||
    pathname === '/icon.png' ||
    pathname === '/splash.png' ||
    pathname === '/.well-known/farcaster.json'
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