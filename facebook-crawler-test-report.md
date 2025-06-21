# Facebook Crawler Test Report for Farlinker

## Summary

I've tested the farlinker URL with Facebook's crawler user agent to understand what metadata Facebook sees when crawling farlinker URLs.

## Facebook Crawler User Agents

Facebook uses several user agents for crawling:
- `facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)` (Primary)
- `facebookexternalhit/1.1`
- `facebookcatalog/1.0`
- `meta-externalagent/1.1`
- `meta-externalfetcher/1.1`

## Test Results

### Test 1: Non-existent Cast (dwr/0xfbe87ce6)
- **Status**: Page loads but shows fallback content
- **og:title**: "Loading cast content..."
- **og:description**: "@dwr"
- **og:image**: Missing ❌
- **Issue**: The Neynar API returns 404 for this cast, so no actual content is loaded

### Test 2: Valid Cast (dwr.eth/0x48d47343)
- **Status**: Page loads with actual cast content
- **og:title**: Full cast text (properly loaded)
- **og:description**: "@dwr.eth"
- **og:image**: Present but incorrect ⚠️
- **Issue**: The og:image is set to the embed URL (https://danromero.org/excited-for-this-build-cycle.html) which is a webpage, not an image

## Key Findings

1. **Cast Loading**: When the cast exists, the metadata is properly populated with the cast content
2. **Missing og:image for Image-less Casts**: When a cast has no image embeds, no og:image tag is generated, which means Facebook won't show any preview image
3. **Incorrect og:image URL**: When embeds are present, the code uses the first embed URL as og:image, but it doesn't verify if it's actually an image
4. **Bot Detection Works**: The server correctly identifies Facebook's crawler as a bot and serves the full HTML with metadata (no redirect)

## Recommendations

1. **Validate Image URLs**: The code should check if embed URLs are actually images before using them as og:image
2. **Fallback Image**: Provide a default og:image when casts don't have image embeds
3. **Error Handling**: When cast fetching fails, provide better fallback metadata
4. **Image URL Detection**: Check for common image extensions (.jpg, .png, .gif, .webp) or image hosting domains

## Code Issue Location

The issue is in `/app/[username]/[hash]/page.tsx`:
- Lines 31-36: The code uses the first embed URL as preview image without checking if it's an image
- The code should validate that the URL points to an actual image file

## Testing Tools Created

1. `test-facebook-crawler.js` - Basic Facebook crawler simulation
2. `test-facebook-crawler-detailed.js` - Comprehensive multi-user-agent testing
3. `test-neynar-fetch.js` - Direct Neynar API testing
4. `test-working-cast.js` - Testing with known valid cast

These tools can be used to verify fixes and test other farlinker URLs.