# Farlinker

Better link previews for Farcaster posts.

## Overview

Farlinker provides enhanced link previews for Farcaster posts when shared on Twitter, Discord, and other social platforms. Simply replace "farcaster.xyz" with "farlinker.xyz" in any Farcaster post URL to get beautiful previews while maintaining the original redirect functionality.

## Features

- 🖼️ Rich preview images with cast content
- 🔗 Automatic redirect to original Farcaster post
- 📱 Farcaster Frame support for in-app experiences
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
   - Test with a Farcaster URL: `https://your-deployment.vercel.app/dwr/0x2c51e5c4`
   - Verify the preview image generates correctly
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

## Tech Stack

- Next.js 15 with App Router
- TypeScript
- Tailwind CSS
- @vercel/og for image generation
- @farcaster/frame-sdk for Frame support
- Neynar API for cast data

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