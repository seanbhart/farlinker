import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Allow API routes, static files, Next.js internals, and known app paths
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/actions/') ||
    pathname.startsWith('/.well-known/') ||
    pathname === '/' ||
    pathname === '/image-generator' ||
    pathname === '/favicon.ico' ||
    /\.(png|jpg|jpeg|gif|webp|svg|ico)$/.test(pathname)
  ) {
    return NextResponse.next();
  }

  // Check if this is a valid Farcaster post URL pattern
  // Allow dots in username for ENS names like swabbie.eth
  // Hash can optionally start with 0x
  const postPattern = /^\/([a-zA-Z0-9._-]+)\/(0x)?([a-zA-Z0-9]+)$/;
  if (!pathname.match(postPattern)) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/((?!_next/static|_next/image|favicon.ico).*)',
};
