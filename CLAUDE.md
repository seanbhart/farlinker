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
     - **Description**: Copy enhanced preview links for Farcaster posts
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

---

## Phase 2: Mini App Development (Future)

### Mini App Concept

The Farlinker Mini App will provide a richer experience:
1. A full interface to generate Farlinker URLs for any Farcaster post
2. Visual examples showing how each format appears
3. Batch processing for multiple casts
4. Analytics and link management

### Mini App Development Steps

#### Step 1: Setup and Basic Structure

1. **Initialize Mini App Project**
   - Create `/mini-app` directory for the mini app code
   - Set up basic Next.js structure for the mini app
   - Install required dependencies:
     ```bash
     npm install @farcaster/frame-sdk
     ```

2. **Create Mini App Entry Point**
   - Set up `/mini-app/page.tsx` as the main mini app interface
   - Import and initialize the Farcaster Frame SDK
   - Implement the `ready()` call to hide splash screen when loaded

3. **Update Manifest**
   - Add mini app configuration to `/public/.well-known/farcaster.json`
   - Include required fields:
     - `homeUrl`: Point to the mini app URL
     - `name`: "Farlinker"
     - `iconUrl`: Use existing Farlinker icon
     - `splashImageUrl`: Use Farlinker logo
     - `splashBackgroundColor`: Match brand colors
     - `buttonTitle`: "Generate Link"

#### Step 2: Core Functionality

1. **Cast Selection Interface**
   - Implement ability to receive shared casts via share extension
   - Add `castShareUrl` to manifest for share extension support
   - Parse cast data from URL parameters and SDK context

2. **URL Generation**
   - Create function to convert Farcaster URLs to Farlinker URLs
   - Support both formats:
     - Standard: `farlinker.xyz/username/hash`
     - Enhanced: `farlinker.xyz/username/hash?preview=standard`

3. **Preview Options UI**
   - Design clean interface showing:
     - Original cast content
     - Two preview format options with visual examples
     - Description of each format's benefits

#### Step 3: Visual Examples Integration

1. **Example Images**
   - Display the three example images from the landing page:
     - `/apple_messages_farcaster.png` - Original Farcaster preview
     - `/apple_messages_farlinker.png` - Enhanced Farlinker preview
     - `/apple_messages_farlinker_standard.png` - Standard format preview
   - Show these as visual guides for what each option creates

2. **Interactive Preview Selection**
   - Allow users to tap on example images to select that format
   - Highlight selected option
   - Update generated URL based on selection

#### Step 4: Sharing Implementation

1. **Share Functionality**
   - Implement share buttons using native share API
   - Use `navigator.share()` for mobile devices
   - Fallback to clipboard copy for desktop
   - Show success feedback after sharing

2. **Quick Actions**
   - Add "Copy Link" button for manual copying
   - Add "Share to Messages" button using SMS intent
   - Consider platform-specific share options

#### Step 5: Polish and Edge Cases

1. **Error Handling**
   - Handle cases where cast data is unavailable
   - Provide fallback for manual URL entry
   - Show helpful error messages

2. **Loading States**
   - Implement skeleton loaders while fetching cast data
   - Smooth transitions between states
   - Optimize for fast initial load

3. **Responsive Design**
   - Ensure UI works well in Farcaster's mini app container
   - Test on various screen sizes
   - Handle safe area insets properly

## Technical Implementation Details

### SDK Integration

```typescript
import { sdk } from '@farcaster/frame-sdk';

// Initialize when component mounts
useEffect(() => {
  sdk.actions.ready();
}, []);

// Handle shared casts
if (sdk.context.location?.type === 'cast_share') {
  const cast = sdk.context.location.cast;
  // Process cast data
}
```

### Share Extension Setup

```json
{
  "frame": {
    "castShareUrl": "https://farlinker.xyz/mini-app/share",
    // ... other config
  }
}
```

### URL Generation Logic

```typescript
function generateFarlinkerUrl(cast: MiniappCast, useStandard: boolean): string {
  const baseUrl = 'https://farlinker.xyz';
  const path = `${cast.author.username}/${cast.hash}`;
  const params = useStandard ? '?preview=standard' : '';
  return `${baseUrl}/${path}${params}`;
}
```

## User Flow

1. User shares a cast to Farlinker Mini App
2. Mini app opens showing:
   - Cast preview
   - Two format options with visual examples
   - Share buttons
3. User selects preferred format
4. User taps share button
5. Link is shared via messaging app or copied to clipboard

## Design Considerations

- Match existing Farlinker brand colors (#17101f background, purple accents)
- Use clean, minimal interface similar to landing page
- Show visual examples prominently to educate users
- Make sharing the primary action with large, accessible buttons
- Provide immediate feedback for all actions

## Testing Plan

1. Test share extension integration
2. Verify URL generation for various cast types
3. Test sharing on different platforms (iOS, Android, Web)
4. Ensure proper error handling
5. Validate manifest configuration
6. Test with various cast formats (with/without images, embeds, etc.)

## Future Enhancements

1. Analytics to track which format users prefer
2. Batch link generation for multiple casts
3. History of generated links
4. Custom preview templates
5. Integration with Farcaster notifications for link performance

## Resources

- Farcaster Mini App SDK: https://github.com/farcasterxyz/frames
- Mini App Documentation: https://miniapps.farcaster.xyz/
- Share Extensions Guide: https://miniapps.farcaster.xyz/docs/guides/share-extension
- Example Mini Apps: https://github.com/farcasterxyz/frames-v2-demo