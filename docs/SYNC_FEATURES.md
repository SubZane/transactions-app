# Sync Features

## Automatic Sync

The app now includes **automatic background synchronization** that runs continuously while you're using the app.

### How It Works

1. **Auto-start**: Sync automatically starts when you log in
2. **Interval**: Syncs every 30 seconds when online
3. **Smart**: Only syncs when there are pending changes or to pull fresh data
4. **Efficient**: Minimal battery and data usage

### Auto-Sync Behavior

- ✅ Starts automatically on app launch
- ✅ Runs in the background every 30 seconds
- ✅ Triggers immediately when connection is restored after being offline
- ✅ Stops when you close/refresh the app
- ✅ Resumes when you reopen the app

## Manual Sync Button

A **"Sync Now"** button is available in the Profile/Settings page for instant synchronization.

### Location

Navigate to: **Profile** → **Offline Sync** section

### Features

- 🔄 **Instant sync** - Triggers immediate synchronization
- 📊 **Status display** - Shows connection status, pending items, and last sync time
- 🎯 **Visual feedback** - Animated spinner during sync
- 🔒 **Smart disable** - Button disabled when offline or already syncing

### What You'll See

```
┌─────────────────────────────────────┐
│ 🌐 Offline Sync                     │
├─────────────────────────────────────┤
│ Connection Status  │ Pending Items  │
│ 🟢 Online         │ 0 items        │
├─────────────────────────────────────┤
│ Last synced: Nov 2, 2025, 2:30 PM  │
│                                     │
│ The app automatically syncs your    │
│ data every 30 seconds when online.  │
│                                     │
│ [🔄 Sync Now]                      │
└─────────────────────────────────────┘
```

## Sync States

### 🟢 Online & Synced

- Auto-sync running
- No pending items
- Manual sync available

### 🟡 Online with Pending Items

- Auto-sync will process shortly
- Shows pending count
- Manual sync recommended

### 🔴 Offline

- Auto-sync paused
- Changes queued locally
- Manual sync disabled

### 🔄 Syncing

- Sync in progress
- Button shows spinner
- Wait for completion

## Usage Examples

### Checking Sync Status

1. Open the app
2. Go to **Profile**
3. Look at the **Offline Sync** card
4. Check:
   - Connection status (Online/Offline)
   - Pending items count
   - Last sync timestamp

### Manual Sync

1. Go to **Profile**
2. Scroll to **Offline Sync** section
3. Click **"Sync Now"** button
4. Wait for success message
5. Check updated sync timestamp

### When to Use Manual Sync

- 📱 After making important changes
- 🔄 Before closing the app
- 📊 To see immediate updates from other users
- 🚀 When you need instant synchronization
- 🔍 To verify pending changes were uploaded

## Technical Details

### Sync Frequency

- **Automatic**: Every 30 seconds
- **On reconnect**: Immediate
- **Manual**: On demand

### What Gets Synced

**Pull (from server):**

- All transactions from all users
- All categories
- Latest data updates

**Push (to server):**

- New transactions created offline
- Edited transactions
- Deleted transactions
- Queued changes

### Conflict Handling

If the same transaction is modified both locally and on the server:

1. Conflict is detected during sync
2. Stored in local database
3. Can be resolved manually (future feature)
4. Default: Server version wins

### Performance

- ⚡ Lightweight background process
- 📉 Minimal battery impact
- 🌐 Smart network usage
- 💾 Efficient local storage

## Troubleshooting

### Auto-sync Not Working?

1. Check connection status in Profile
2. Verify browser console for errors
3. Try manual sync
4. Clear cache and reload

### Manual Sync Button Disabled?

- Check if you're online
- Wait if sync is already in progress
- Verify internet connection

### Pending Items Not Syncing?

1. Check sync queue: Browser DevTools → Console → `await dbService.getSyncQueue()`
2. Try manual sync
3. Check for errors in console
4. Verify API connectivity

## Configuration

### Change Sync Interval

Edit `src/services/sync.service.ts`:

```typescript
const SYNC_INTERVAL = 30000 // Change to desired milliseconds
// 15000 = 15 seconds
// 60000 = 60 seconds
// 120000 = 2 minutes
```

### Disable Auto-Sync

To disable automatic sync (not recommended):

```typescript
// In src/hooks/useOffline.ts
useEffect(() => {
  // Comment out this line:
  // syncService.startAutoSync()
}, [])
```

## Benefits

✅ **Always up-to-date**: Background sync keeps data fresh  
✅ **User control**: Manual sync for important changes  
✅ **Transparency**: Clear status indicators  
✅ **Reliability**: Automatic retry on failures  
✅ **Offline-first**: Works without connection  
✅ **Peace of mind**: Know your data is synced

## Future Enhancements

- [ ] Sync progress indicator
- [ ] Configurable sync interval in UI
- [ ] Sync history log
- [ ] Bandwidth usage statistics
- [ ] Background Sync API support
- [ ] Selective sync options
