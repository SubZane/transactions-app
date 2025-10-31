# PWA Setup Guide

Your Transactions App has been converted to a Progressive Web App (PWA) with an **online-first** approach.

## What's Been Added

### 1. Service Worker Configuration

- Configured in `vite.config.ts` using `vite-plugin-pwa`
- Online-first caching strategy (tries network first, falls back to cache)
- Automatic updates when new versions are deployed

### 2. Caching Strategies

**Supabase API Calls** (NetworkFirst)

- Network timeout: 10 seconds
- Cache expires after: 1 hour
- Falls back to cache if offline

**Backend PHP APIs** (NetworkFirst)

- Network timeout: 5 seconds
- Cache expires after: 5 minutes
- Falls back to cache if offline

**Images** (CacheFirst)

- Cached for 30 days
- Served from cache for better performance

### 3. Install Prompt

- `<InstallPWA>` component added to App.tsx
- Shows install prompt for users on supported browsers
- Users can dismiss the prompt (saved to localStorage)
- Appears at bottom of screen with slide-up animation

### 4. PWA Meta Tags

- Theme color: `#10b981` (emerald-600)
- Manifest configured with app name, icons, and display settings
- Apple touch icon support for iOS

## Setup Steps

### 1. Generate PWA Icons

Open `/public/generate-icons.html` in your browser and click the buttons to download:

- `pwa-192x192.png` (192x192)
- `pwa-512x512.png` (512x512)
- `apple-touch-icon.png` (180x180)

Save all three PNG files to the `/public` directory.

### 2. Build the App

```bash
npm run build
```

The PWA plugin will generate:

- `manifest.webmanifest` - PWA manifest file
- `sw.js` - Service worker file

### 3. Test the PWA

**Development:**

```bash
npm run dev
```

Note: Service worker may not work fully in dev mode

**Production Preview:**

```bash
npm run build
npm run preview
```

### 4. Deploy

Deploy the `dist` folder to your hosting service. The PWA will work on:

- ✅ HTTPS domains
- ✅ localhost (for testing)
- ❌ HTTP domains (PWA requires HTTPS)

## Features

### Online First Approach

- App always tries to fetch fresh data from the network
- If network fails, serves cached data
- Users see the most up-to-date information when online

### Install Prompt

- Users can install the app to their home screen
- Works on:
  - Chrome/Edge on Android
  - Chrome/Edge on Desktop
  - Safari on iOS 16.4+

### Offline Support

- Cached pages and data available offline
- API responses cached for limited time
- Images cached for 30 days

### App-like Experience

- Standalone display mode (no browser UI)
- Custom splash screen with emerald theme
- Optimized for mobile and desktop

## Testing

### Chrome DevTools

1. Open DevTools (F12)
2. Go to Application tab
3. Check:
   - Manifest (should show all fields correctly)
   - Service Workers (should be registered)
   - Cache Storage (should populate as you use the app)

### Test Install

1. Open the app in Chrome/Edge
2. Click the install prompt or browser's install button
3. App should install and open in standalone mode

### Test Offline

1. Open DevTools → Network tab
2. Check "Offline" checkbox
3. Refresh the app
4. Previously visited pages should still work

## Troubleshooting

**Install prompt not showing?**

- Ensure you're on HTTPS or localhost
- Check if user previously dismissed it (check localStorage)
- Try in incognito mode

**Service worker not updating?**

- Hard refresh (Ctrl+Shift+R / Cmd+Shift+R)
- Clear cache in DevTools → Application → Clear Storage

**Icons not loading?**

- Ensure PNG files are in `/public` directory
- Check browser console for 404 errors
- Rebuild the app

## Next Steps

For production, consider:

1. Creating custom high-quality icons with your branding
2. Adding a custom splash screen
3. Implementing background sync for offline transactions
4. Adding push notifications for transaction reminders
5. Testing on various devices and browsers
