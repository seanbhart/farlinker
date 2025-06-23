# Testing Farcaster Actions

## Local Testing

### 1. Test Page
Navigate to `/test-action` in your local development environment to access the action testing interface.

This page allows you to:
- Simulate Farcaster action requests
- Test the action endpoint response
- Preview the modal interface
- Verify metadata configuration

### 2. Testing Steps

1. **Start the development server**:
   ```bash
   npm run dev
   ```

2. **Open the test page**:
   ```
   http://localhost:3000/test-action
   ```

3. **Test the action endpoint**:
   - Click "Test Action Endpoint"
   - Verify it returns a modal response with a URL

4. **Test the modal**:
   - Click "Open Modal in New Tab" or view in the iframe
   - Verify all 4 sharing options are displayed
   - Check that preview images load correctly

5. **Test metadata**:
   - Click "Test Metadata Endpoint"
   - Verify it returns proper action configuration

## External Testing Tools

### Warpcast Frame Validator
- URL: https://warpcast.com/~/developers/frames
- Official tool for validating frames and actions
- Paste your action URL to validate

### Frameground
- URL: https://frameground.app
- Sandbox environment for testing frames and actions
- Supports local development URLs

### Frame Simulator
- URL: https://www.framesimuator.com
- Simulates frame interactions
- Good for testing user flows

## Debugging Tips

1. **Check console logs**: The action endpoint logs requests and responses
2. **Verify CORS**: Ensure your local server allows cross-origin requests
3. **Test with different cast IDs**: Use various hash formats (with/without 0x prefix)
4. **Check modal communication**: Verify postMessage events are working

## Common Issues

### Modal not loading
- Check if the modal URL is correct
- Verify the query parameters are properly encoded
- Ensure the modal page is accessible

### Action not responding
- Check the request payload format
- Verify the endpoint URL in the manifest
- Look for errors in the server logs

### Preview images not showing
- Ensure image files exist in the public directory
- Check image paths in the modal component
- Verify Next.js Image component configuration

## Production Testing

Before registering your action:

1. Deploy to a staging environment
2. Test with the production URL
3. Validate with Warpcast Frame Validator
4. Test on multiple devices/browsers
5. Verify analytics are tracking correctly

## Registration Process

Once testing is complete:

1. Ensure your manifest is accessible at `/.well-known/farcaster.json`
2. Submit your action through Warpcast developer tools
3. Monitor for any validation errors
4. Test the live action once approved