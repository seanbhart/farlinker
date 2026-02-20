# Farlinker Refactoring Plan

## Analysis Summary

Full codebase audit cross-referenced with current Farcaster Mini App docs (Neynar MCP). Breaking changes are acceptable. All Farcaster-related refactors (manifest, Neynar client, route/dead-code cleanup) are merged into one chunk since there's no compatibility constraint.

---

## TODO Items

### Phase A: Delete dead code
- [x] 1. Delete deprecated pages: `app/actions/copy/`, `app/actions/modal/`
- [x] 2. Delete test pages: `app/test-action/`, `app/test-frame/`, `app/test-modal/`
- [x] 3. Delete dead API routes (**breaking API removals**, no known external consumers): `app/api/cast/[username]/[hash]/`, `app/api/fetch-og/`
- [x] 4. Delete root test HTML files: `test-copy-page.html`, `test-frame-flow.html`, `test-modal.html`, `working-cast-response.html`
- [x] 5. Delete `lib/preview-components.tsx`
- [x] 6. Delete `TESTING_ACTIONS.md`, add validation section to `README.md`

### Phase B: Consolidate Neynar client
- [x] 7. Rewrite `lib/neynar.ts` using SDK client with `fetchCastByUrl(username, hash)` and `fetchCastByHash(hash)` — preserves short/full hash behavior
- [x] 8. Keep `lib/cast-cache.ts` as the single cache
- [x] 9. Delete `lib/neynar-client.ts`
- [x] 10. Update consumers: `app/[username]/[hash]/page.tsx`, `app/api/cast-details/route.ts` — import from unified `lib/neynar.ts`
- [x] 11. Remove inline SDK client from `app/api/cast-details/route.ts`

### Phase C: Manifest hard flip (`public/.well-known/farcaster.json`)
- [x] 12. Replace `"frame"` key with `"miniapp"` in `public/.well-known/farcaster.json`
- [x] 13. Real `accountAssociation` values generated and signed by owner
- [x] 14. Remove `webhookUrl` (no handler exists)
- [x] 15. Swap `@farcaster/frame-sdk` for `@farcaster/miniapp-sdk` in `package.json`
- *Deferred*: `castShareUrl` — add when share route is implemented (Phase 2 mini app), not before

### Phase D: Code quality
- [x] 17. DRY up `app/api/actions/frame/route.tsx` — extracted `getBaseUrl()`, `buildFrameHtml()`, `htmlResponse()` helpers
- [x] 18. Simplify `middleware.ts` — removed test page entries, consolidated image extension checks into single regex
- [x] 19. Extract metadata helpers into `lib/metadata.ts`: `detectPlatform()`, `extractEmbedData()`, `cleanCastText()`, `selectPreviewImage()`, `buildTitleDescription()`, `buildImageDimensions()`
- [x] 20. Create shared `lib/types.ts` — `Platform`, `EmbedData`, `PreviewImageResult` interfaces
- [x] 21. Update `CLAUDE.md` and `README.md` to reflect refactored architecture

---

## Phase 2: Mini App Implementation

The mini app runs inside Farcaster clients (Warpcast, etc.) and lets users generate Farlinker URLs directly from a shared cast.

### User Flow
1. User shares a cast to Farlinker via Farcaster share sheet
2. Mini app opens with cast context from SDK
3. User sees cast preview + two format options (enhanced / standard) with visual examples
4. User taps "Copy Link" or "Share" for their chosen format
5. Link is copied or shared via native share API

### TODO Items

#### E1: Mini app page + SDK init
- [ ] 22. Create `app/mini-app/page.tsx` — client component, entry point for the mini app
- [ ] 23. Initialize SDK: `import { sdk } from '@farcaster/miniapp-sdk'`, call `sdk.actions.ready()` on mount
- [ ] 24. Update `homeUrl` in `public/.well-known/farcaster.json` to `https://farlinker.xyz/mini-app`
- [ ] 25. Add `/mini-app` to middleware allowlist

#### E2: Share extension + cast context
- [ ] 26. Handle `sdk.context.location.type === 'cast_share'` to receive shared cast data (author, hash, text)
- [ ] 27. Create `app/mini-app/share/page.tsx` as the share extension landing route
- [ ] 28. Add `castShareUrl: "https://farlinker.xyz/mini-app/share"` to manifest `miniapp` section
- [ ] 29. Fallback: if no cast context, show manual URL input or instructions

#### E3: URL generation + UI
- [ ] 30. Build URL generator: `farlinker.xyz/{username}/{hash}` (enhanced) and `?preview=standard` (standard)
- [ ] 31. Cast preview component showing author PFP, display name, and cast text
- [ ] 32. Two format option cards with visual example images (`/apple_messages_farlinker.png`, `/apple_messages_farlinker_standard.png`)
- [ ] 33. Highlight selected format, show generated URL

#### E4: Copy + share actions
- [ ] 34. "Copy Link" button using `navigator.clipboard.writeText()` with fallback
- [ ] 35. "Share" button using `navigator.share()` on mobile, clipboard fallback on desktop
- [ ] 36. Success feedback (copied/shared confirmation)
- [ ] 37. Analytics tracking for format selection and share method

#### E5: Polish
- [ ] 38. Loading skeleton while SDK initializes and cast data loads
- [ ] 39. Respect `sdk.context.client.safeAreaInsets` for proper padding
- [ ] 40. Match brand styling (#17101f background, purple accents)
- [ ] 41. Test in Warpcast (share extension flow, direct launch flow)

### Dependencies
- E1 must complete before E2-E5
- E2 (share extension) and E3 (UI) can be built in parallel
- E4 depends on E3 (needs the UI to attach actions to)
- E5 is final polish after core functionality works

---

## Review

### Changes Made

**13 files deleted:**
- `app/actions/copy/page.tsx` (deprecated)
- `app/actions/modal/page.tsx` (deprecated)
- `app/test-action/page.tsx`, `app/test-frame/page.tsx`, `app/test-modal/page.tsx` (test pages in production)
- `app/api/cast/[username]/[hash]/route.ts` (dead API route, zero references)
- `app/api/fetch-og/route.ts` (only consumer was deprecated `actions/copy`)
- `lib/preview-components.tsx` (unused, not imported anywhere)
- `lib/neynar-client.ts` (merged into `lib/neynar.ts`)
- `test-copy-page.html`, `test-frame-flow.html`, `test-modal.html`, `working-cast-response.html`
- `TESTING_ACTIONS.md`

**3 files created:**
- `lib/types.ts` — Shared TypeScript interfaces (`Platform`, `EmbedData`, `PreviewImageResult`)
- `lib/metadata.ts` — 6 extracted helper functions from the 330-line `generateMetadata`
- Validation section added to `README.md`

**6 files rewritten/updated:**
- `lib/neynar.ts` — Unified Neynar SDK client (replaced raw REST + SDK dual approach with single SDK client, one cache)
- `app/[username]/[hash]/page.tsx` — Reduced from ~400 lines to ~160 lines using extracted helpers
- `app/api/cast-details/route.ts` — Removed inline SDK client, imports from unified `lib/neynar.ts`
- `app/api/actions/frame/route.tsx` — Reduced from 137 lines to 55 lines (3x template → shared builder)
- `middleware.ts` — Simplified from 68 lines to 32 lines
- `public/.well-known/farcaster.json` — Hard flip: `frame` → `miniapp`, real `accountAssociation`, removed phantom `webhookUrl`
- `CLAUDE.md` — Rewritten to reflect current architecture
- `README.md` — Updated SDK reference, added validation section
- `package.json` — `@farcaster/frame-sdk` → `@farcaster/miniapp-sdk`

### Build Status
Production build passes clean with no type errors.

### Breaking Changes
- **API removals**: `/api/cast/[username]/[hash]` and `/api/fetch-og` endpoints removed (no known external consumers)
- **Manifest**: `frame` key replaced with `miniapp` — Farcaster clients using the old key will need the new format
- **SDK**: `@farcaster/frame-sdk` replaced with `@farcaster/miniapp-sdk` (not imported in source yet, relevant for Phase 2)
