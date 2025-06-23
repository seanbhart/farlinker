# CLAUDE.md - Farlinker Development Plan

This file provides guidance to Claude Code (claude.ai/code) for developing Farlinker features for Farcaster.

## Project Overview

Farlinker is a link preview enhancement service for Farcaster posts. We'll develop both Farcaster Actions (Phase 1) and a Mini App (Phase 2) to help users generate and share Farlinker URLs.

## Phase 1: Farcaster Actions (Priority)

### Actions Concept

We'll create a single Farcaster Action that opens a modal interface, allowing users to choose from multiple sharing options with visual previews. When users click the "Farlinker" action button under any cast, they'll see:

1. **Share in Farlinker format** - Generate enhanced preview link and open share menu
2. **Copy Farlinker link** - Generate enhanced preview link and copy to clipboard
3. **Share in standard format** - Generate standard OG preview link and open share menu
4. **Copy standard link** - Generate standard OG preview link and copy to clipboard

Each option will show a preview image demonstrating how the link will appear when shared.

### Actions Development Plan

#### Step 1: Actions Infrastructure Setup

1. **Create Action Modal Endpoint**
   - Set up `/api/actions/farlinker/route.ts` as the main action handler
   - Create `/app/actions/modal/page.tsx` for the modal interface
   - Set up image assets for preview examples

2. **Implement Modal Interface**
   - Design responsive modal with 4 sharing options
   - Include preview images for each format type
   - Handle user selection and execute appropriate action

3. **Action Metadata**
   - Create metadata endpoint that describes the Farlinker action
   - Include action name, description, and icon
   - Define modal response type

#### Step 2: Core Action Functionality

1. **Main Action Handler**
   ```typescript
   // /api/actions/farlinker/route.ts
   export async function POST(request: Request) {
     const { untrustedData } = await request.json();
     const { castId } = untrustedData;
     
     // Return modal response
     return Response.json({
       type: 'modal',
       title: 'Share with Farlinker',
       url: `https://farlinker.xyz/actions/modal?castId=${castId.hash}&fid=${castId.fid}`
     });
   }
   ```

2. **Modal Interface**
   ```typescript
   // /app/actions/modal/page.tsx
   export default function ActionModal({ searchParams }) {
     const { castId, fid } = searchParams;
     
     const options = [
       {
         id: 'share-enhanced',
         title: 'Share in Farlinker format',
         description: 'Enhanced preview with images',
         preview: '/apple_messages_farlinker.png',
         action: 'share'
       },
       {
         id: 'copy-enhanced',
         title: 'Copy Farlinker link',
         description: 'Enhanced preview link',
         preview: '/apple_messages_farlinker.png',
         action: 'copy'
       },
       {
         id: 'share-standard',
         title: 'Share in standard format',
         description: 'Clean text preview',
         preview: '/apple_messages_farlinker_standard.png',
         action: 'share'
       },
       {
         id: 'copy-standard',
         title: 'Copy standard link',
         description: 'Standard preview link',
         preview: '/apple_messages_farlinker_standard.png',
         action: 'copy'
       }
     ];
     
     return (
       <div className="modal-container">
         {options.map(option => (
           <OptionCard key={option.id} {...option} castData={{castId, fid}} />
         ))}
       </div>
     );
   }
   ```

3. **Action Execution**
   ```typescript
   // Handle user selection in modal
   async function handleOptionClick(option: OptionType, castData: CastData) {
     const { authorUsername, hash } = await fetchCastDetails(castData);
     const isStandard = option.id.includes('standard');
     const farlinkerUrl = `https://farlinker.xyz/${authorUsername}/${hash}${isStandard ? '?preview=standard' : ''}`;
     
     if (option.action === 'share') {
       // Trigger native share
       window.parent.postMessage({
         type: 'fc:action',
         data: {
           action: 'share',
           url: farlinkerUrl
         }
       }, '*');
     } else {
       // Copy to clipboard
       window.parent.postMessage({
         type: 'fc:action',
         data: {
           action: 'copy',
           text: farlinkerUrl
         }
       }, '*');
     }
   }
   ```

#### Step 3: Modal Design & UX

1. **Modal Layout**
   ```css
   /* Modal styling for 2x2 grid */
   .modal-container {
     display: grid;
     grid-template-columns: 1fr 1fr;
     gap: 16px;
     padding: 20px;
     max-width: 600px;
   }
   
   .option-card {
     border: 1px solid #e0e0e0;
     border-radius: 12px;
     padding: 16px;
     cursor: pointer;
     transition: all 0.2s;
   }
   
   .option-card:hover {
     border-color: #8b5cf6;
     background: #f9f5ff;
   }
   
   .preview-image {
     width: 100%;
     height: 120px;
     object-fit: cover;
     border-radius: 8px;
     margin-bottom: 12px;
   }
   ```

2. **Visual Preview Integration**
   - Use actual example images from landing page
   - Show clear distinction between enhanced and standard formats
   - Include hover states and selection feedback

3. **Accessibility**
   - Keyboard navigation support
   - Clear focus indicators
   - Descriptive labels for screen readers

#### Step 4: Action Registration

1. **Create Action Manifest**
   ```json
   {
     "name": "Farlinker",
     "icon": "link",
     "description": "Generate shareable preview links",
     "aboutUrl": "https://farlinker.xyz/about",
     "action": {
       "type": "post",
       "url": "https://farlinker.xyz/api/actions/farlinker"
     }
   }
   ```

2. **Register with Farcaster**
   - Submit action for review via Warpcast developer tools
   - Test in development environment first
   - Deploy to production after approval

#### Step 5: Testing & Optimization

1. **Test Different Cast Types**
   - Regular text casts
   - Casts with images
   - Casts with embeds
   - Thread replies
   - Long-form content

2. **Performance Optimization**
   - Pre-load preview images
   - Cache cast data where possible
   - Optimize modal load time

3. **Error Handling**
   - Handle network failures gracefully
   - Provide fallback for missing cast data
   - Clear error messages for users

### Benefits of Modal Action Approach

1. **Single Entry Point**: One action button provides all options
2. **Visual Guidance**: Preview images help users understand each format
3. **Flexibility**: Users can choose share or copy for each format
4. **Educational**: Shows the difference between preview types
5. **Clean UX**: Doesn't clutter the action bar with multiple buttons

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