# Progressive Web App (PWA)

## Overview

The Transactions App is configured as a Progressive Web App (PWA) with an **online-first** approach, providing app-like experience with offline capabilities, installability, and automatic updates.

## Table of Contents

- [PWA Features](#pwa-features)
- [Service Worker Configuration](#service-worker-configuration)
- [Caching Strategies](#caching-strategies)
- [Installation](#installation)
- [Offline Capabilities](#offline-capabilities)
- [App Manifest](#app-manifest)
- [Performance](#performance)

> 📋 **For comprehensive offline support documentation,** including IndexedDB usage, sync queues, conflict resolution, and testing, see **[OFFLINE.md](OFFLINE.md)**

- [Testing & Debugging](#testing--debugging)

## PWA Features

### Core PWA Capabilities

- **Installable** - Users can install the app to their home screen
- **Offline Support** - Cached content available without internet
- **App-like Experience** - Standalone display mode without browser UI
- **Automatic Updates** - New versions deployed automatically
- **Push Notifications** - Ready for future notification features

### Online-First Approach

- Always attempts to fetch fresh data from network
- Falls back to cached data when offline
- Ensures users see most up-to-date information when online
- Graceful degradation for offline scenarios

### Cross-Platform Support

- **Android** - Chrome, Edge, Firefox
- **iOS** - Safari 16.4+ (limited support)
- **Desktop** - Chrome, Edge, Firefox
- **Windows** - Can be installed from Microsoft Store

## Service Worker Configuration

### Vite PWA Plugin Setup

Configuration in `vite.config.ts`:

```typescript
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
      manifest: {
        name: 'Transactions App',
        short_name: 'Transactions',
        description: 'Track your financial transactions',
        theme_color: '#10b981',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
      workbox: {
        runtimeCaching: [
          // API caching strategies
        ],
      },
    }),
  ],
})
```

### Workbox Integration

Using Google Workbox for service worker functionality:

- **Precaching** - App shell and critical resources
- **Runtime Caching** - API responses and dynamic content
- **Update Management** - Automatic app updates
- **Background Sync** - Retry failed requests when online

## Caching Strategies

### API Endpoints

#### Supabase Authentication (NetworkFirst)

```javascript
{
  urlPattern: /^https:\/\/.*\.supabase\.co\/.*/,
  handler: 'NetworkFirst',
  options: {
    cacheName: 'supabase-api',
    networkTimeoutSeconds: 10,
    cacheableResponse: {
      statuses: [0, 200]
    },
    expiration: {
      maxEntries: 100,
      maxAgeSeconds: 60 * 60 // 1 hour
    }
  }
}
```

#### Backend PHP APIs (NetworkFirst)

```javascript
{
  urlPattern: /\/backend\/.*/,
  handler: 'NetworkFirst',
  options: {
    cacheName: 'backend-api',
    networkTimeoutSeconds: 5,
    cacheableResponse: {
      statuses: [0, 200]
    },
    expiration: {
      maxEntries: 50,
      maxAgeSeconds: 60 * 5 // 5 minutes
    }
  }
}
```

#### Static Assets (CacheFirst)

```javascript
{
  urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
  handler: 'CacheFirst',
  options: {
    cacheName: 'images',
    expiration: {
      maxEntries: 100,
      maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
    }
  }
}
```

### Cache Management

#### Cache Expiration

- **API Responses**: 5 minutes to 1 hour
- **Images**: 30 days
- **App Shell**: Until new version deployed
- **User Data**: Session-based expiration

#### Cache Cleanup

```javascript
// Automatic cleanup of old cache entries
workbox.expiration.ExpirationPlugin({
  maxEntries: 100,
  maxAgeSeconds: 60 * 60 * 24 * 7, // 1 week
  purgeOnQuotaError: true,
})
```

## Installation

### Install Prompt Component

Custom install prompt in React:

```tsx
import { useState, useEffect } from 'react'

export const InstallPWA = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showInstall, setShowInstall] = useState(false)

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowInstall(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === 'accepted') {
      setDeferredPrompt(null)
      setShowInstall(false)
    }
  }

  if (!showInstall) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 bg-primary text-primary-content p-4 rounded-lg shadow-lg">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-semibold">Install App</h3>
          <p className="text-sm opacity-90">Get quick access from your home screen</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowInstall(false)} className="btn btn-ghost btn-sm">
            Later
          </button>
          <button onClick={handleInstall} className="btn btn-secondary btn-sm">
            Install
          </button>
        </div>
      </div>
    </div>
  )
}
```

### Installation Process

#### Android (Chrome/Edge)

1. Visit app in Chrome/Edge
2. "Add to Home Screen" banner appears
3. Tap "Add" to install
4. App appears on home screen

#### iOS (Safari 16.4+)

1. Visit app in Safari
2. Tap Share button
3. Select "Add to Home Screen"
4. Confirm installation

#### Desktop (Chrome/Edge)

1. Visit app in browser
2. Install icon appears in address bar
3. Click to install
4. App opens in standalone window

## Offline Capabilities

The Transactions App includes comprehensive offline support with automatic synchronization. Users can create, edit, and delete transactions even when offline, and the app will automatically sync changes to the server when an internet connection is restored.

### Overview

#### Core Features

- **✨ Full Offline Mode** - Complete app functionality without internet
- **🔄 Auto Sync** - Changes sync automatically every 30 seconds when online
- **📊 Visual Indicator** - See connection status and pending sync items
- **⚔️ Conflict Resolution** - Handles simultaneous edits intelligently
- **💾 Local Storage** - All data cached locally using IndexedDB for instant access
- **🔁 Retry Logic** - Failed syncs retry with exponential backoff

#### Data Flow

**Online Mode:**

```
User Action → API Call → Update Local DB → UI Update
```

**Offline Mode:**

```
User Action → Save to IndexedDB → Add to Sync Queue → UI Update
```

**Sync Process:**

```
1. Pull: Server → IndexedDB (latest data)
2. Push: Sync Queue → Server (pending changes)
3. Clear: Remove successful items from queue
4. Retry: Increment retry count for failed items
```

### Architecture

#### Components

**OfflineIndicator** (`src/components/ui/OfflineIndicator.tsx`)

Visual component displaying:

- Offline mode indicator (when offline)
- Syncing animation (during sync)
- Pending items count
- Manual sync button
- Last sync timestamp

**useOffline Hook** (`src/hooks/useOffline.ts`)

React hook providing:

- `isOnline` - Current online status
- `isSyncing` - Whether a sync is in progress
- `lastSync` - Timestamp of last successful sync
- `syncQueueCount` - Number of pending sync items
- `triggerSync()` - Function to manually trigger sync
- `getLocalTransactions()` - Get offline transaction data
- `getLocalCategories()` - Get offline category data

#### Services

**dbService** (`src/services/db.service.ts`)

IndexedDB wrapper providing:

- Transaction CRUD operations
- Category CRUD operations
- Sync queue management
- Metadata storage
- Conflict storage

**syncService** (`src/services/sync.service.ts`)

Synchronization engine providing:

- Automatic sync on 30-second interval
- Manual sync trigger
- Pull from server (download latest data)
- Push to server (upload local changes)
- Conflict detection and resolution
- Queue management with retry logic

### Storage Structure

#### IndexedDB Stores

1. **transactions**
   - Key: `id` (number or temp string for offline-created)
   - Indexes: `transaction_date`, `type`, `user_id`
   - Data: Full transaction objects

2. **categories**
   - Key: `id` (number)
   - Data: Category objects (id, name, type, icon)

3. **syncQueue**
   - Key: `id` (auto-increment)
   - Indexes: `timestamp`, `entityType`
   - Data: Sync operations (CREATE/UPDATE/DELETE)

4. **metadata**
   - Key: `key` (string)
   - Data: Key-value pairs (e.g., lastSync timestamp)

5. **conflicts**
   - Key: `id` (string)
   - Indexes: `transactionId`, `resolved`, `detectedAt`
   - Data: Conflict information (local vs server versions)

### Offline Functionality

#### Available Offline

- **Previously Loaded Pages** - Cached in service worker
- **All Transactions** - Full CRUD operations stored in IndexedDB
- **Categories** - Complete category data cached locally
- **App Shell** - UI components and navigation
- **Static Assets** - Images, icons, fonts
- **Form Validation** - Client-side validation works
- **User Preferences** - Settings maintained locally

#### Limited Offline

- **New User Registration** - Requires initial server connection
- **Password Changes** - Authentication changes need server

#### Requires Online

- **Initial Authentication** - Login/logout requires connection
- **Data Sync** - Fresh data from server
- **Conflict Resolution** - Server comparison for conflicts

### Using Offline Features

#### Basic Usage

The offline support is automatically initialized. No additional setup required.

```tsx
// Using the offline hook
import { useOffline } from '../hooks/useOffline'

function MyComponent() {
  const { isOnline, isSyncing, syncQueueCount, triggerSync } = useOffline()

  return (
    <div>
      <p>Status: {isOnline ? 'Online' : 'Offline'}</p>
      <p>Pending: {syncQueueCount} items</p>
      {syncQueueCount > 0 && <button onClick={triggerSync}>Sync Now</button>}
    </div>
  )
}
```

#### Creating Transactions Offline

```tsx
// The transaction service automatically handles offline mode
const handleSubmit = async (data) => {
  if (navigator.onLine) {
    // Online - create directly
    await transactionService.create(data)
  } else {
    // Offline - save locally and queue for sync
    await dbService.saveTransaction(data)
    await syncService.queueTransactionCreate(data)
  }
}
```

### Conflict Resolution

When the same transaction is modified both offline and on the server, a conflict is detected during sync.

#### Conflict Detection

- Happens during UPDATE operations
- Server returns 409 status with server version
- Conflict is stored in IndexedDB for resolution

#### Resolution Options

1. **Use Local** - Keep offline changes, overwrite server
2. **Use Server** - Discard offline changes, keep server version
3. **Manual Merge** - (Future feature) Manually merge both versions

#### Resolving Conflicts

```tsx
// Get unresolved conflicts
const conflicts = await syncService.getUnresolvedConflicts()

// Resolve using local version
await syncService.resolveConflict(conflictId, 'use-local')

// Resolve using server version
await syncService.resolveConflict(conflictId, 'use-server')
```

### Offline Indicators

```tsx
export const OfflineIndicator = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncQueueCount, setSyncQueueCount] = useState(0)
  const [lastSync, setLastSync] = useState<Date | null>(null)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (isOnline && syncQueueCount === 0) return null

  return (
    <div className={`alert ${isOnline ? 'alert-info' : 'alert-warning'}`}>
      {isOnline ? (
        isSyncing ? (
          <div className="flex items-center">
            <span className="loading loading-spinner loading-sm"></span>
            <span>Syncing...</span>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <span>{syncQueueCount} items pending sync</span>
            <button className="btn btn-sm" onClick={triggerSync}>
              Sync Now
            </button>
          </div>
        )
      ) : (
        <div className="flex items-center">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
          </svg>
          <span>Offline Mode - Changes will sync when connected</span>
        </div>
      )}
    </div>
  )
}
```

### Testing Offline Mode

#### Manual Testing

1. **Enable Offline Mode:**
   - Open Chrome DevTools (F12)
   - Go to Network tab
   - Select "Offline" from throttling dropdown

2. **Test Offline Operations:**
   - Create new transactions
   - Edit existing transactions
   - Delete transactions
   - Check sync queue: `await dbService.getSyncQueue()`

3. **Test Sync:**
   - Go back "Online" in DevTools
   - Watch automatic sync process
   - Verify all changes appear on server

#### Developer Console Testing

```javascript
// Check offline status
console.log('Online:', navigator.onLine)

// Check sync queue
const queue = await dbService.getSyncQueue()
console.log('Pending items:', queue)

// Check local transactions
const transactions = await dbService.getAllTransactions()
console.log('Local transactions:', transactions)

// Check last sync time
const lastSync = await dbService.getMetadata('lastSync')
console.log('Last synced:', lastSync)
```

### Configuration

#### Sync Settings

```typescript
// In sync.service.ts
const SYNC_INTERVAL = 30000 // 30 seconds
const MAX_RETRY_COUNT = 3 // Maximum retry attempts
const DB_VERSION = 2 // IndexedDB version
```

#### Browser Compatibility

- **Chrome 87+** ✅
- **Firefox 85+** ✅
- **Safari 15+** ✅
- **Edge 87+** ✅

**Requirements:**

- IndexedDB support
- Service Worker support
- Online/Offline event support

### Performance & Limits

#### Storage Limits

- **IndexedDB:** ~50MB minimum (browser-dependent)
- **Recommended max transactions:** 10,000
- **Sync queue limit:** 1,000 items

#### Optimization Tips

1. Clear resolved conflicts periodically
2. Archive old transactions
3. Limit sync queue size
4. Use pagination for large datasets

### Troubleshooting

#### Sync Not Working

1. Check online status: `navigator.onLine`
2. Check sync queue: `await dbService.getSyncQueue()`
3. Check browser console for errors
4. Try manual sync button

#### Data Not Appearing Offline

1. Check IndexedDB in DevTools → Application → Storage
2. Verify data was saved: `await dbService.getAllTransactions()`
3. Check for initialization errors in console

#### Conflicts Not Resolving

1. Check conflict store: `await dbService.getConflicts(false)`
2. Verify conflict has both local and server versions
3. Manually resolve: `await syncService.resolveConflict(id, 'use-local')`

### Security

- All data encrypted at rest (browser security model)
- API authentication still required for sync
- No sensitive data stored in clear text
- User ID required for all operations
- All local data uses browser security boundaries

## App Manifest

### Manifest Configuration

Located at `/public/manifest.webmanifest`:

```json
{
  "name": "Transactions App",
  "short_name": "Transactions",
  "description": "Track your financial transactions with ease",
  "theme_color": "#10b981",
  "background_color": "#ffffff",
  "display": "standalone",
  "orientation": "portrait-primary",
  "start_url": "/",
  "scope": "/",
  "icons": [
    {
      "src": "pwa-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "pwa-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "apple-touch-icon.png",
      "sizes": "180x180",
      "type": "image/png"
    }
  ]
}
```

### Icon Generation

Required icon sizes:

- **192x192** - Android home screen
- **512x512** - Android splash screen
- **180x180** - iOS home screen (apple-touch-icon)

Generate icons using `/public/generate-icons.html`:

1. Open in browser
2. Upload your source image
3. Download generated icons
4. Place in `/public` directory

## Performance

### PWA Performance Benefits

#### Faster Loading

- **Precached App Shell** - Instant app loading
- **Cached Resources** - Images and assets load instantly
- **Network Prioritization** - Critical resources loaded first

#### Reduced Bandwidth

- **Efficient Caching** - Only updated content downloaded
- **Compression** - Gzip/Brotli compression enabled
- **Resource Optimization** - Unused resources eliminated

#### Better User Experience

- **Smooth Animations** - No network delays for cached content
- **Instant Navigation** - Client-side routing
- **Background Updates** - New content preloaded

### Performance Monitoring

```javascript
// Performance metrics
self.addEventListener('activate', (event) => {
  // Track activation time
  performance.mark('sw-activated')
})

// Cache hit rates
self.addEventListener('fetch', (event) => {
  // Track cache vs network requests
  if (event.request.url.includes('/api/')) {
    performance.mark('api-request')
  }
})
```

## Testing & Debugging

### Development Testing

#### Local Development

```bash
# Start development server
npm run dev

# Note: Service worker may not work fully in dev mode
# Use preview mode for PWA testing
```

#### Production Preview

```bash
# Build and preview
npm run build
npm run preview

# Full PWA functionality available
```

### Browser DevTools

#### Chrome DevTools

1. **Application Tab**
   - Manifest validation
   - Service worker status
   - Cache inspection

2. **Lighthouse Tab**
   - PWA audit score
   - Performance analysis
   - Best practices check

3. **Network Tab**
   - Offline testing
   - Cache behavior verification

#### Firefox DevTools

1. **Application Panel**
   - Service worker debugging
   - Cache storage inspection

### PWA Testing Checklist

#### Installation

- [ ] Install prompt appears on supported browsers
- [ ] App installs successfully
- [ ] App icon appears on home screen/desktop
- [ ] App launches in standalone mode

#### Offline Functionality

- [ ] Previously loaded pages work offline
- [ ] Cached data displays correctly
- [ ] Offline indicator shows when disconnected
- [ ] App gracefully handles network errors

#### Performance

- [ ] App loads quickly on repeat visits
- [ ] Images load from cache efficiently
- [ ] Navigation is smooth and responsive

#### Updates

- [ ] New versions update automatically
- [ ] Update notification appears when available
- [ ] Cache invalidation works correctly

### Troubleshooting

#### Common Issues

**Install Prompt Not Showing**

- Ensure HTTPS or localhost
- Check if user previously dismissed
- Verify manifest is valid
- Confirm service worker is registered

**Offline Mode Not Working**

- Check service worker registration
- Verify cache strategies in DevTools
- Ensure resources are being cached
- Test network timeout settings

**Performance Issues**

- Check cache hit rates
- Verify resource compression
- Monitor cache storage size
- Optimize caching strategies

#### Debug Commands

```bash
# Clear all caches (development)
# In browser console:
caches.keys().then(names => {
  names.forEach(name => caches.delete(name))
})

# Unregister service worker
navigator.serviceWorker.getRegistrations().then(registrations => {
  registrations.forEach(registration => registration.unregister())
})
```

## Best Practices

### PWA Development

- **HTTPS Required** - PWAs only work on secure connections
- **Responsive Design** - Support all screen sizes
- **Fast Loading** - Optimize for mobile networks
- **Graceful Degradation** - Work without service worker

### User Experience

- **Clear Install Prompts** - Make installation obvious
- **Offline Feedback** - Show connection status
- **Background Updates** - Update without user interruption
- **Cross-Platform Consistency** - Same experience everywhere

### Performance

- **Selective Caching** - Cache only necessary resources
- **Cache Expiration** - Prevent stale data issues
- **Update Strategies** - Balance freshness and speed
- **Network-First for Data** - Ensure data accuracy
