# CLAUDE.md - Farlinker Mini App Development Plan

This file provides guidance to Claude Code (claude.ai/code) for developing the Farlinker Mini App for Farcaster.

## Project Overview

Farlinker is a link preview enhancement service for Farcaster posts. The Mini App will allow users to generate Farlinker share links directly from within Farcaster, making it easy to create enhanced previews for any cast.

## Mini App Concept

The Farlinker Mini App will provide:
1. A simple interface to generate Farlinker URLs for any Farcaster post
2. Options to choose between standard and enhanced preview formats
3. Visual examples showing how each format appears in different messaging apps
4. One-tap sharing to messaging apps

## Development Plan

### Phase 1: Mini App Setup and Basic Structure

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

### Phase 2: Core Functionality

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

### Phase 3: Visual Examples Integration

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

### Phase 4: Sharing Implementation

1. **Share Functionality**
   - Implement share buttons using native share API
   - Use `navigator.share()` for mobile devices
   - Fallback to clipboard copy for desktop
   - Show success feedback after sharing

2. **Quick Actions**
   - Add "Copy Link" button for manual copying
   - Add "Share to Messages" button using SMS intent
   - Consider platform-specific share options

### Phase 5: Polish and Edge Cases

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