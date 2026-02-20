# CLAUDE.md - Farlinker

This file provides guidance to Claude Code (claude.ai/code) for developing Farlinker features for Farcaster.

## Project Overview

Farlinker is a link preview enhancement service for Farcaster posts. It provides enhanced OG images and metadata when Farcaster URLs are shared on external platforms (Apple Messages, WhatsApp, Twitter, Discord, etc.), with automatic redirect to the original post.

## Architecture

### Key Directories
- `app/[username]/[hash]/` — Dynamic route for link previews (core feature)
- `app/actions/copy-v2/` — Farcaster Action copy interface
- `app/api/actions/` — Farcaster Action endpoints (farlinker, frame)
- `app/api/cast-details/` — Cast metadata API
- `app/api/og-image.png/` — Simple profile OG image generator (edge)
- `app/api/og-post.png/` — Post preview OG image generator (edge)
- `app/image-generator/` — Downloadable image generator tool
- `lib/` — Shared utilities (neynar client, cache, metadata helpers, types)

### Lib Modules
- `lib/neynar.ts` — Unified Neynar SDK client with `fetchCastByUrl()` and `fetchCastByHash()`
- `lib/cast-cache.ts` — In-memory cast cache (5-min TTL, 1000 entry limit)
- `lib/metadata.ts` — Platform detection, embed extraction, preview image selection, title/description builders
- `lib/types.ts` — Shared TypeScript interfaces

### Manifest
- `public/.well-known/farcaster.json` — Farcaster Mini App manifest (uses `miniapp` key, not legacy `frame`)
- Contains `accountAssociation` (signed), `miniapp` config, and `actions` config

### Action Flow
1. User clicks Farlinker action on a cast in Warpcast
2. POST to `/api/actions/farlinker` → returns frame URL
3. Frame at `/api/actions/frame` renders with Enhanced/Standard buttons
4. Buttons link to `/actions/copy-v2?castId=HASH&type=enhanced|standard`
5. Copy page fetches cast details and provides copy-to-clipboard

### Link Preview Flow
1. Someone shares `farlinker.xyz/username/hash`
2. Middleware validates the URL pattern
3. `generateMetadata()` in `[username]/[hash]/page.tsx` detects platform via user-agent
4. Helpers in `lib/metadata.ts` select the appropriate preview image strategy
5. OG image routes generate images at edge runtime
6. Real users get instant redirect to `farcaster.xyz`; bots get metadata

## Tech Stack
- Next.js 15 (App Router, Turbopack dev)
- TypeScript 5 (strict mode)
- Tailwind CSS 4
- `@neynar/nodejs-sdk` for Farcaster data
- `@farcaster/miniapp-sdk` for Mini App integration
- Vercel (deployment, analytics, edge functions)

## Common Commands
```bash
npm run dev    # Dev server with Turbopack
npm run build  # Production build
npm run lint   # ESLint
```

## Environment Variables
- `NEXT_PUBLIC_BASE_URL` — Deployment URL (e.g., https://farlinker.xyz)
- `NEYNAR_API_KEY` — Neynar API key for cast data

## Phase 2: Mini App (Future)

The Mini App will provide a richer in-Farcaster experience for generating and sharing Farlinker URLs. Key integration points:

- SDK: `import { sdk } from '@farcaster/miniapp-sdk'`
- Share extension via `castShareUrl` in manifest (add when share route is implemented)
- Manifest already configured with `miniapp` section in `public/.well-known/farcaster.json`
