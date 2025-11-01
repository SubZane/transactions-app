# PWA Auto-Update System

## Overview

The Transactions App now automatically detects and prompts users to update when a new version is released. This ensures users on home screen installations always have the latest features and bug fixes.

## How It Works

### 1. **Automatic Update Detection**

- Service worker checks for updates every **60 seconds**
- Compares the installed version with the server version
- Detects new deployments automatically
- Works for apps installed on home screen

### 2. **User Notification**

When a new version is available:

- **Update Prompt** appears at the bottom of the screen
- Friendly message: "Update Available! 🎉"
- Two options:
  - **Update Now** - Reloads the app with the new version
  - **Later** - Dismisses the prompt (can update later)

### 3. **Seamless Update Process**

- User clicks "Update Now"
- App reloads automatically
- New version loads immediately
- All data preserved (offline storage intact)

## Visual Design

```
┌────────────────────────────────────────┐
│         🎉 Update Available!           │
│                                        │
│ A new version of the app is ready.    │
│ Reload to get the latest features     │
│ and improvements.                      │
│                                        │
│  [ Update Now ]  [ Later ]            │
└────────────────────────────────────────┘
```

## Configuration

### Update Check Interval

**Default:** 60 seconds

**Location:** `src/components/common/UpdatePrompt.tsx`

```typescript
onRegistered(registration: ServiceWorkerRegistration | undefined) {
  if (registration) {
    // Check for updates every 60 seconds
    setInterval(() => {
      registration.update()
    }, 60000) // Change this value
  }
}
```

**Options:**

- `30000` = 30 seconds (more frequent)
- `60000` = 60 seconds (recommended)
- `120000` = 2 minutes (less frequent)
- `300000` = 5 minutes (minimal checks)

### Service Worker Strategy

**Current:** `prompt` (requires user confirmation)

**Location:** `vite.config.ts`

```typescript
VitePWA({
  registerType: 'prompt', // User must confirm update
  // OR
  // registerType: 'autoUpdate', // Updates automatically (not recommended)
})
```

**Workbox Options:**

```typescript
workbox: {
  cleanupOutdatedCaches: true,  // Removes old cache versions
  skipWaiting: false,           // Waits for user confirmation
  clientsClaim: false,          // Doesn't take control immediately
}
```

## User Experience Flow

### First Install

1. User adds app to home screen
2. Service worker registers
3. App works offline
4. Update check starts in background

### When Update Available

1. Service worker detects new version
2. Update prompt slides up from bottom
3. User sees friendly notification
4. User chooses action

### Update Action

**Option 1: Update Now**

- App reloads
- New code loads
- User continues where they left off

**Option 2: Later**

- Prompt dismisses
- User continues using current version
- Prompt reappears on next check (if still outdated)
- Can manually update later

### After Update

- New features available immediately
- No data loss
- Offline functionality preserved
- Sync continues normally

## Testing Updates

### Test in Development

1. **Build version 1:**

   ```bash
   npm run build
   npm run preview
   ```

2. **Open in browser:**
   - Go to http://localhost:4173
   - Open DevTools → Application → Service Workers
   - Note the service worker version

3. **Make a change:**
   - Edit any file (e.g., add a console.log)
   - Don't rebuild yet

4. **In another terminal, build version 2:**

   ```bash
   npm run build
   ```

5. **Wait 60 seconds or manually trigger:**
   - In DevTools → Application → Service Workers
   - Click "Update" next to the service worker
   - Update prompt should appear

6. **Click "Update Now":**
   - App reloads with new version
   - Changes are visible

### Test on Mobile (Home Screen)

1. **Install app:**
   - Open in mobile browser
   - Add to home screen
   - Open from home screen icon

2. **Deploy new version:**
   - Make changes
   - Build: `npm run build:server`
   - Deploy to server

3. **Open installed app:**
   - Wait 60 seconds
   - Update prompt appears
   - Click "Update Now"
   - New version loads

### Force Update Check

**In Browser Console:**

```javascript
// Manually trigger update check
navigator.serviceWorker.ready.then((registration) => {
  registration.update()
})
```

## Deployment Process

### 1. Make Changes

```bash
# Edit your code
git add .
git commit -m "feat: new feature"
```

### 2. Build for Production

```bash
npm run build:server
```

### 3. Deploy to Server

```bash
# Upload dist/ folder to server
# Or use your deployment script
```

### 4. Users Get Notified

- Apps check for updates every 60 seconds
- Within 1-2 minutes, all active users see update prompt
- Users update when convenient

## Architecture

### Components

**`UpdatePrompt.tsx`**

- React component
- Uses `useRegisterSW` hook from vite-plugin-pwa
- Displays update notification
- Handles user actions

**`UpdatePrompt.css`**

- Styling for the prompt
- Responsive design
- Animations (slide up)

**`vite.config.ts`**

- PWA plugin configuration
- Service worker settings
- Update strategy

**`vite-env.d.ts`**

- TypeScript definitions
- Virtual module types
- PWA register types

### Service Worker Lifecycle

```
1. Install → 2. Wait → 3. Activate → 4. Control
                ↓
         Update Available
                ↓
          User Prompted
                ↓
        User Confirms
                ↓
         App Reloads
```

## Troubleshooting

### Update Prompt Not Appearing

**Check:**

1. Is `registerType: 'prompt'` in vite.config?
2. Is service worker registered? (DevTools → Application)
3. Is there actually a new version?
4. Check browser console for errors

**Solution:**

```bash
# Clear all caches
# DevTools → Application → Storage → Clear site data
# Rebuild and test again
```

### Update Fails

**Symptoms:**

- Prompt appears but update doesn't work
- App shows error after reload

**Solution:**

1. Check network in DevTools
2. Verify server has new files
3. Clear service worker:
   ```javascript
   navigator.serviceWorker.getRegistrations().then((registrations) => {
     registrations.forEach((r) => r.unregister())
   })
   ```
4. Hard reload: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

### Old Version Still Loading

**Problem:** Update prompt shows but old version loads

**Causes:**

- `skipWaiting: false` (waiting for user action)
- Multiple tabs open
- Cache not cleared

**Solution:**

1. Close all tabs
2. Reopen app
3. Or set `skipWaiting: true` in vite.config (forces update)

### Infinite Update Loop

**Problem:** Prompt keeps appearing after update

**Cause:** Version mismatch or caching issue

**Solution:**

1. Check if build is actually changing service worker
2. Verify cache strategy
3. Clear all caches and rebuild

## Best Practices

### ✅ DO

- Keep update checks at 60 seconds or longer
- Always provide "Later" option
- Test updates before deploying
- Monitor user complaints about updates
- Document version changes

### ❌ DON'T

- Set update check < 30 seconds (performance impact)
- Force immediate updates without user consent
- Deploy without testing update flow
- Update during critical user actions
- Remove "Later" option

## Version Management

### Semantic Versioning

Use in `package.json`:

```json
{
  "version": "1.2.3"
  // MAJOR.MINOR.PATCH
}
```

- **MAJOR**: Breaking changes
- **MINOR**: New features
- **PATCH**: Bug fixes

### Release Notes

Inform users about updates:

- Add version in update prompt message (optional)
- Maintain CHANGELOG.md
- Show "What's New" after update (future feature)

## Security

### Update Verification

- Service worker validates files from origin
- Only updates from same domain accepted
- HTTPS required for service workers
- No man-in-the-middle attacks

### Data Safety

- IndexedDB persists through updates
- No data loss during updates
- Sync queue preserved
- User sessions maintained

## Performance

### Impact

- **Check frequency:** Minimal (1 network request/60s)
- **Update download:** Only new/changed files
- **Installation:** Non-blocking
- **Activation:** Waits for user action

### Optimization

- Precache only essential files
- Use runtime caching for API calls
- Compress assets
- Implement code splitting

## Browser Compatibility

- ✅ Chrome 45+
- ✅ Firefox 44+
- ✅ Safari 11.1+
- ✅ Edge 17+
- ✅ iOS Safari 11.3+
- ✅ Chrome Android 45+

**Requirements:**

- Service Worker support
- Promise support
- Cache API support

## Future Enhancements

- [ ] Show version number in prompt
- [ ] "What's New" modal after update
- [ ] Background Sync API for updates
- [ ] Update progress indicator
- [ ] Scheduled updates (off-peak hours)
- [ ] A/B testing for updates
- [ ] Rollback mechanism
- [ ] Update analytics

## Summary

The PWA auto-update system ensures users always have the latest version with:

- 🔄 Automatic detection every 60 seconds
- 🎯 User-friendly prompt with clear actions
- ⚡ Fast, seamless updates
- 💾 No data loss
- 📱 Works perfectly on home screen apps

Users stay up-to-date effortlessly!
