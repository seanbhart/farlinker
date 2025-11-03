# CLAUDE.md - Farlinker Development Plan

This file provides guidance to Claude Code (claude.ai/code) for developing Farlinker features for Farcaster.

## Project Overview

Farlinker is a link preview enhancement service for Farcaster posts. We'll develop both Farcaster Actions (Phase 1) and a Mini App (Phase 2) to help users generate and share Farlinker URLs.

## Current Development Status

### ✅ Phase 1: Farcaster Actions - COMPLETED

The Farcaster Action has been fully implemented with the following features:

1. **Action Infrastructure**
   - Action endpoint at `/api/actions/farlinker/route.ts`
   - Modal interface at `/app/actions/modal/page.tsx`
   - Cast details API at `/api/cast-details/route.ts`

2. **Modal Interface**
   - Simplified to 2 copy options (enhanced and standard formats)
   - Visual preview images for each format
   - Responsive design with tall, narrow buttons
   - Copy feedback with "✓ Copied!" message

3. **Testing Infrastructure**
   - Test page at `/test-action` for local development
   - Dual clipboard approach (direct + postMessage) for testing
   - Documentation in `TESTING_ACTIONS.md`

4. **Analytics Integration**
   - Vercel Analytics tracking for all actions
   - Event tracking for modal selections
   - Link visit tracking

### 🚀 Next Steps: Action Registration

#### 1. Pre-Registration Checklist
- [ ] Deploy to production (Vercel or similar)
- [ ] Ensure HTTPS is enabled
- [ ] Verify manifest is accessible at `https://farlinker.xyz/.well-known/farcaster.json`
- [ ] Test action endpoint at `https://farlinker.xyz/api/actions/farlinker`
- [ ] Confirm modal loads at `https://farlinker.xyz/actions/modal?castId=HASH&fid=FID`

#### 2. Registration Process

1. **Access Warpcast Developer Tools**
   - Go to https://warpcast.com/~/developers/actions
   - Or navigate through Settings → Developer → Actions

2. **Submit New Action**
   - Click "Create Action"
   - Fill in the required fields:
     - **Name**: Farlinker
     - **Action URL**: `https://farlinker.xyz/api/actions/farlinker`
     - **Description**: create enhanced preview links for Farcaster posts
     - **Icon**: Link icon (or upload custom icon)

3. **Validation Process**
   - Warpcast will validate your action endpoint
   - It will check for proper response format
   - Verify modal functionality works correctly

4. **Testing in Production**
   - Once approved, the action will appear under casts
   - Test with various cast types
   - Monitor analytics for usage

#### 3. Post-Registration Tasks
- [ ] Monitor error logs for any issues
- [ ] Track usage analytics
- [ ] Gather user feedback
- [ ] Consider A/B testing different modal layouts

### Implementation Details

The current implementation provides:

1. **Copy Farlinker link** - Enhanced preview with images (similar to Twitter link preview)
2. **Copy standard link** - Clean text preview (similar to website link preview)

Each option shows a preview image demonstrating how the link will appear when shared.

### Technical Architecture

#### Action Flow
1. User clicks Farlinker action button on a cast
2. Farcaster sends POST request to `/api/actions/farlinker` with cast data
3. Action endpoint returns modal response
4. Modal opens at `/actions/modal` with cast ID parameters
5. Modal fetches cast details via `/api/cast-details`
6. User selects copy option
7. Link is copied to clipboard and feedback is shown

#### Key Components
- **Action Endpoint**: Handles Farcaster requests and returns modal configuration
- **Modal Interface**: Displays copy options with visual previews
- **Cast Details API**: Fetches cast metadata from Neynar
- **Clipboard Integration**: Dual approach for Farcaster and testing environments

### Action Configuration

The action is configured in `/public/.well-known/farcaster.json`:

```json
{
  "actions": [
    {
      "name": "Farlinker",
      "icon": "link",
      "description": "Generate shareable preview links",
      "aboutUrl": "https://farlinker.xyz",
      "action": {
        "type": "post",
        "url": "https://farlinker.xyz/api/actions/farlinker"
      }
    }
  ]
}
```

### Adding the Action Button

Once deployed, users can add the Farlinker action button to their Farcaster client using this deep link:

```
https://warpcast.com/~/add-cast-action?url=https%3A%2F%2Fwww.farlinker.xyz%2Fapi%2Factions%2Ffarlinker
```

Or they can manually add it by going to Settings → Actions and entering:
- **Action URL**: `https://www.farlinker.xyz/api/actions/farlinker`

### Known Issues & Solutions

1. **Clipboard in Test Environment**
   - The modal uses both direct clipboard API and postMessage
   - This ensures it works in both local testing and Farcaster

2. **User Fallback**
   - When cast data can't be fetched, username defaults to "user"
   - This is only seen in testing with invalid hashes

3. **SearchParams in Next.js 15**
   - SearchParams are now Promises and must be awaited
   - Modal properly handles this with useEffect

4. **Embedded Images**
   - The action properly handles casts with embedded images
   - Images are displayed in both preview formats
   - Standard format uses embedded image as main preview when available

---

## ✅ Phase 2: Mini App Development - COMPLETED

### Mini App Overview

The Farlinker Mini App has been successfully implemented and provides a streamlined experience for generating and sharing Farlinker URLs directly from Farcaster.

**Key Features:**
1. Share Extension - Receive casts shared from any Farcaster client
2. One-Click Copy - Generate and copy Farlinker URLs with a single tap
3. Format Selection - Choose between enhanced or standard preview formats
4. Visual Previews - See how links will appear before sharing
5. Cast Preview - View cast details within the mini app
6. Analytics Tracking - Automatic usage tracking via Vercel Analytics

### Implementation Details

#### Components
- **Mini App Page**: `/app/mini-app/page.tsx`
  - Client-side React component using Farcaster Frame SDK
  - Receives and processes shared cast data
  - Provides UI for format selection and copying

#### Manifest Configuration
Updated `/public/.well-known/farcaster.json`:
```json
{
  "frame": {
    "version": "1",
    "name": "Farlinker",
    "iconUrl": "https://farlinker.xyz/farlinker.png",
    "splashImageUrl": "https://farlinker.xyz/farlinker.png",
    "splashBackgroundColor": "#8B5CF6",
    "homeUrl": "https://farlinker.xyz/mini-app",
    "castShareUrl": "https://farlinker.xyz/mini-app"
  }
}
```

#### Key Features Implemented

1. **SDK Integration**
   - Initializes Farcaster Frame SDK on mount
   - Calls `sdk.actions.ready()` to hide splash screen
   - Accesses cast data via `sdk.context.location.cast`

2. **Share Extension Support**
   - `castShareUrl` enables the app to receive shared casts
   - Appears in share menu when users tap share on any cast
   - Automatically parses cast author, text, hash, and metadata

3. **URL Generation**
   - Generates enhanced format: `farlinker.xyz/username/hash`
   - Generates standard format: `farlinker.xyz/username/hash?preview=standard`
   - Uses cast author username and hash from SDK context

4. **User Interface**
   - Cast preview showing author details and text
   - Radio button selection for format choice
   - Visual preview images for each format
   - Large "Copy Link" button with success feedback
   - Empty state when no cast is shared

5. **Analytics Events**
   - `miniapp_opened_with_cast` - Tracks shares with cast data
   - `miniapp_opened_direct` - Tracks direct opens
   - `miniapp_link_copied` - Tracks successful copies with format

### User Flow

1. User taps share button on any Farcaster cast
2. Selects "Farlinker" from the share menu
3. Mini app opens with cast preview and format options
4. User selects preferred format (enhanced or standard)
5. User taps "Copy Link" button
6. Link is copied to clipboard with success feedback
7. User can paste and share the link anywhere

### Design Decisions

- **Brand Consistency**: Uses Farlinker brand colors (#17101f background, #8b5cf6 purple accents)
- **Minimal UI**: Clean, focused interface with minimal distractions
- **Visual Education**: Preview images show exactly how each format will appear
- **Single-Click UX**: One tap to copy - no additional steps required
- **Immediate Feedback**: Success state with checkmark and "Copied!" message

### Deployment & Testing

**Local Testing:**
```bash
npm install
npm run dev
```
Access at: `http://localhost:3000/mini-app`

**Production Deployment:**
1. Deploy to Vercel or hosting provider
2. Ensure `farcaster.json` manifest is accessible
3. Mini app will automatically appear in Farcaster share menus

**Testing Checklist:**
- [x] SDK initializes and calls ready()
- [x] Empty state displays when no cast is shared
- [x] Cast data displays correctly when shared
- [x] Format selection works
- [x] URL generation is correct for both formats
- [x] Clipboard copy works
- [x] Analytics events fire correctly
- [x] Loading states display properly
- [x] Responsive design works on mobile

### Documentation

See `MINIAPP_USAGE.md` for detailed usage instructions and user-facing documentation.

### Future Enhancements

Potential future additions:
1. Batch link generation for multiple casts
2. Link history and management
3. Custom preview templates
4. Direct sharing to messaging apps
5. QR code generation
6. Performance analytics (track link clicks)

### Resources

- Farcaster Mini App SDK: https://github.com/farcasterxyz/frames
- Mini App Documentation: https://miniapps.farcaster.xyz/
- Share Extensions Guide: https://miniapps.farcaster.xyz/docs/guides/share-extension
- Example Mini Apps: https://github.com/farcasterxyz/frames-v2-demo