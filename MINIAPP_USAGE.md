# Farlinker Mini App - Usage Guide

## Overview

The Farlinker Mini App allows users to easily generate and copy Farlinker URLs for Farcaster casts with a single click. The mini app is built using the Farcaster Frame SDK and provides a seamless experience for sharing enhanced link previews.

## Features

- **Share Extension Integration**: Share any Farcaster cast to the Farlinker mini app
- **One-Click Copy**: Generate and copy Farlinker URLs with a single tap
- **Format Selection**: Choose between enhanced (Twitter-like) or standard (website-like) previews
- **Visual Previews**: See how your link will appear before sharing
- **Cast Preview**: View the cast you're sharing within the mini app
- **Analytics Tracking**: Automatic tracking of usage patterns

## How to Use

### 1. Share a Cast to Farlinker

1. Find any cast you want to share on Farcaster
2. Tap the share button on the cast
3. Select "Farlinker" from the share menu
4. The Farlinker mini app will open with the cast loaded

### 2. Choose Your Link Format

The mini app offers two link formats:

- **Farlinker Link** (Enhanced)
  - Similar to Twitter link previews
  - Shows rich previews with images
  - Uses URL format: `farlinker.xyz/username/hash`

- **Standard Link**
  - Similar to website link previews
  - Clean, text-focused preview
  - Uses URL format: `farlinker.xyz/username/hash?preview=standard`

### 3. Copy and Share

1. Select your preferred format by tapping on it
2. Tap the "Copy Link" button
3. The link is automatically copied to your clipboard
4. Paste and share the link anywhere

## Technical Details

### SDK Integration

The mini app uses the Farcaster Frame SDK (`@farcaster/frame-sdk`) to:
- Initialize the app and signal readiness
- Receive shared cast data from the Farcaster client
- Access user context and cast information

### Manifest Configuration

The mini app is configured in `/public/.well-known/farcaster.json`:

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

### Share Extension

The `castShareUrl` field enables the mini app to appear in the share menu when users tap the share button on any cast.

## Development

### Running Locally

```bash
npm install
npm run dev
```

The mini app will be available at: `http://localhost:3000/mini-app`

### Testing

To test the mini app locally without Farcaster integration:

1. Open the mini app directly: `http://localhost:3000/mini-app`
2. The app will display an empty state message since no cast is shared
3. To test with actual cast data, you'll need to:
   - Deploy to a public URL
   - Add the mini app to your Farcaster client
   - Share a cast to test the full flow

### Deployment

1. Deploy to Vercel or your hosting provider
2. Ensure the domain matches what's in `farcaster.json`
3. The mini app will be automatically available to users who have it installed

## Analytics

The mini app tracks the following events using Vercel Analytics:

- `miniapp_opened_with_cast`: When a user opens the mini app with a shared cast
- `miniapp_opened_direct`: When a user opens the mini app directly
- `miniapp_link_copied`: When a user copies a link (tracks format selection)

## Future Enhancements

- Link history and management
- Batch processing for multiple casts
- Custom preview templates
- Direct sharing to messaging apps
- QR code generation for easy sharing

## Support

For issues or questions:
- Check the [Farcaster Mini App Documentation](https://miniapps.farcaster.xyz/)
- Review the code in `/app/mini-app/page.tsx`
- Contact the Farlinker team
