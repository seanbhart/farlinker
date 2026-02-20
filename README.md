# Farlinker

Better link previews for Farcaster posts.

## Overview

Farlinker provides enhanced link previews for Farcaster posts when shared on Twitter, Discord, and other social platforms. Simply replace "farcaster.xyz" with "farlinker.xyz" in any Farcaster post URL to get beautiful previews while maintaining the original redirect functionality.

## Features

- 🖼️ Rich preview images with cast content
- 🔗 Automatic redirect to original Farcaster post
- 📱 Farcaster Mini App with share extension support
- ⚡ Fast, edge-optimized performance
- 🎨 Beautiful, branded preview cards

## Usage

1. Take any Farcaster post URL: `https://farcaster.xyz/username/0x1234...`
2. Replace the domain: `https://farlinker.xyz/username/0x1234...`
3. Share the new link to get enhanced previews
4. Clicking the link redirects to the original Farcaster post

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Environment Variables

Copy `.env.example` to `.env.local` and configure:

- `NEXT_PUBLIC_BASE_URL` - Your deployment URL (e.g., https://farlinker.xyz)
- `NEYNAR_API_KEY` - Your Neynar API key (required for fetching cast data)

### Getting a Neynar API Key

1. Go to [neynar.com](https://neynar.com)
2. Sign up for an account
3. Navigate to the [API Keys](https://dev.neynar.com/api-keys) section
4. Create a new API key
5. Copy the key and add it to your environment variables

Note: The free tier includes 100 requests per day, which should be sufficient for testing. For production use, consider upgrading to a paid plan.

## Deployment

This app is optimized for deployment on Vercel. Follow these steps:

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/farlinker.git
git push -u origin main
```

### 2. Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your GitHub repository
4. Configure your project:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./` (default)
   - **Node.js Version**: 18.x or higher

### 3. Set Environment Variables

In the Vercel dashboard, go to your project settings and add these environment variables:

| Variable | Value | Description |
|----------|-------|-------------|
| `NEXT_PUBLIC_BASE_URL` | `https://farlinker.vercel.app` | Your exact Vercel deployment URL (update after first deploy) |
| `NEYNAR_API_KEY` | `your_neynar_api_key` | Get from [neynar.com](https://neynar.com) |

### 4. Configure Custom Domain (Optional)

If using a custom domain like `farlinker.xyz`:

1. Go to your project's Domains settings in Vercel
2. Add your custom domain
3. Update DNS records as instructed
4. Update `NEXT_PUBLIC_BASE_URL` to your custom domain

### 5. Post-Deployment Steps

After your first deployment:

1. **Update the Base URL**: 
   - Copy your Vercel deployment URL (e.g., `https://farlinker-abc123.vercel.app`)
   - Go to Settings → Environment Variables
   - Update `NEXT_PUBLIC_BASE_URL` with your actual deployment URL
   - Redeploy for changes to take effect

2. **Test your deployment**:
   - Visit your deployment URL
   - Test with a Farcaster URL: `https://your-deployment.vercel.app/dwr/0x0de97199`
   - Verify the preview generates correctly
   - Check that clicking redirects to Farcaster

3. **Update Farcaster Manifest** (for Mini App functionality):
   - Generate proper account association credentials
   - Update `/public/.well-known/farcaster.json` with real values
   - Redeploy

### Vercel Configuration Notes

- The app uses Edge Runtime for optimal performance
- Image generation happens at the edge for fast previews
- No additional configuration needed for Edge functions
- Automatic HTTPS and global CDN included

## Mini App

Farlinker includes a Farcaster Mini App at `/mini-app` that runs inside Warpcast and other Farcaster clients.

### Entry Points

- **Share extension**: User shares a cast to Farlinker via the Farcaster share sheet. The SDK provides cast context (`cast_share`) so no API call is needed.
- **Direct launch**: User opens Farlinker from the mini app store. No cast context is available, so the app shows a manual URL input where users paste a Farcaster or Warpcast URL.

Both flows converge on the same UI: cast preview, format selection (enhanced vs standard), and copy/share actions.

### Local Testing

The mini app requires HTTPS and the Farcaster SDK to function fully. For local development:

1. Run `npm run dev` to start the local server
2. Use [ngrok](https://ngrok.com) or a similar tunnel to expose localhost over HTTPS:
   ```bash
   ngrok http 3000
   ```
3. Open the [Mini App Preview Tool](https://farcaster.xyz/~/developers/mini-apps/preview) in Warpcast
4. Enter your ngrok HTTPS URL (e.g., `https://abc123.ngrok.io/mini-app`)

The manual URL input flow works without the SDK, so you can test it at `http://localhost:3000/mini-app` directly in a browser. The share extension flow requires the Farcaster client context.

### Manifest

The mini app is configured in `public/.well-known/farcaster.json` under the `miniapp` key:

- `homeUrl`: Entry point for direct launch (`/mini-app`)
- `castShareUrl`: Entry point for share extension (also `/mini-app` — the SDK context differentiates)
- `accountAssociation`: Signed domain verification (production values required)

## Tech Stack

- Next.js 15 with App Router
- TypeScript
- Tailwind CSS
- @farcaster/miniapp-sdk for Mini App support
- Neynar API for cast data

## Validation

To validate the action and link previews after deployment:

1. Verify the manifest is accessible at `https://farlinker.xyz/.well-known/farcaster.json`
2. Test the action endpoint at `https://farlinker.xyz/api/actions/farlinker`
3. Test the mini app at `https://farlinker.xyz/mini-app` or via the [Mini App Preview Tool](https://farcaster.xyz/~/developers/mini-apps/preview)
4. Test link previews by sharing a Farlinker URL in Apple Messages, WhatsApp, Telegram, and Discord
5. Confirm the modal loads at `https://farlinker.xyz/actions/copy-v2?castId=HASH&type=enhanced`

## Troubleshooting

### Preview images not showing
- Ensure `NEXT_PUBLIC_BASE_URL` matches your deployment URL exactly
- Check that `NEYNAR_API_KEY` is set correctly in Vercel
- Verify the cast hash is valid (should start with 0x)

### Redirects not working
- The redirect only works for regular users, not bots/crawlers
- Test in an incognito window or different browser
- Social media crawlers will see the preview, users will be redirected

### Neynar API errors
- Check your API key is valid and has remaining quota
- Ensure the cast hash exists on Farcaster
- Check Vercel function logs for detailed error messages

### Environment variable issues
- After updating env vars in Vercel, redeploy the project
- Use the Vercel CLI to pull env vars locally: `vercel env pull`
- Ensure `NEXT_PUBLIC_BASE_URL` includes the protocol (https://)

## License

MIT