# Offline Support Documentation

## Overview

The Transactions App now includes full offline support with automatic synchronization. Users can create, edit, and delete transactions even when offline, and the app will automatically sync changes to the server when an internet connection is restored.

## Features

### 1. **Offline Indicator**

- Visual indicator at the top of the screen showing connection status
- Displays sync status (syncing, pending items, last sync time)
- Manual sync button when items are queued
- Auto-hides when online and synced

### 2. **Local Storage (IndexedDB)**

- All transactions and categories are stored locally
- Persistent storage survives page reloads and browser restarts
- Fast access to data even offline

### 3. **Automatic Sync**

- Syncs every 30 seconds when online
- Instant sync when connection is restored
- Retry mechanism with exponential backoff (up to 3 attempts)
- Conflict detection and resolution

### 4. **Sync Queue**

- All offline changes are queued for synchronization
- FIFO processing (first-in, first-out)
- Retry count tracking
- Failed items are retried or removed after max attempts

## Architecture

### Components

#### **OfflineIndicator** (`src/components/common/OfflineIndicator.tsx`)

Visual component that displays:

- Offline mode indicator (when offline)
- Syncing animation (during sync)
- Pending items count
- Manual sync button
- Last sync timestamp

#### **useOffline Hook** (`src/hooks/useOffline.ts`)

React hook providing:

- `isOnline` - Current online status
- `isSyncing` - Whether a sync is in progress
- `lastSync` - Timestamp of last successful sync
- `syncQueueCount` - Number of pending sync items
- `triggerSync()` - Function to manually trigger sync
- `getLocalTransactions()` - Get offline transaction data
- `getLocalCategories()` - Get offline category data

### Services

#### **dbService** (`src/services/db.service.ts`)

IndexedDB wrapper providing:

- Transaction CRUD operations
- Category CRUD operations
- Sync queue management
- Metadata storage
- Conflict storage

#### **syncService** (`src/services/sync.service.ts`)

Synchronization engine providing:

- Automatic sync on interval
- Manual sync trigger
- Pull from server (download latest data)
- Push to server (upload local changes)
- Conflict detection and resolution
- Queue management

## Data Flow

### Online Mode

```
User Action → API Call → Update Local DB → UI Update
```

### Offline Mode

```
User Action → Save to IndexedDB → Add to Sync Queue → UI Update
```

### Sync Process

```
1. Pull: Server → IndexedDB (latest data)
2. Push: Sync Queue → Server (pending changes)
3. Clear: Remove successful items from queue
4. Retry: Increment retry count for failed items
```

## Storage Structure

### IndexedDB Stores

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

## Usage

### Basic Usage

The offline support is automatically initialized when the app starts. No additional setup is required.

```tsx
// In your component
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

### Creating Transactions Offline

```tsx
// The page automatically handles offline mode
const handleSubmit = async (data) => {
  if (navigator.onLine) {
    // Online - create directly
    await transactionService.create(data)
  } else {
    // Offline - save locally and queue
    await dbService.saveTransaction(data)
    await syncService.queueTransactionCreate(data)
  }
}
```

### Updating Transactions Offline

```tsx
const handleUpdate = async (id, data) => {
  if (navigator.onLine) {
    await transactionService.update(id, data)
  } else {
    await dbService.saveTransaction({ id, ...data })
    await syncService.queueTransactionUpdate(id, data)
  }
}
```

### Deleting Transactions Offline

```tsx
const handleDelete = async (id) => {
  if (navigator.onLine) {
    await transactionService.delete(id)
  } else {
    await dbService.deleteTransaction(id)
    await syncService.queueTransactionDelete(id)
  }
}
```

## Conflict Resolution

When the same transaction is modified both offline and on the server, a conflict is detected during sync.

### Conflict Detection

- Happens during UPDATE operations
- Server returns 409 status with server version
- Conflict is stored in IndexedDB

### Resolution Options

1. **Use Local** - Keep offline changes, overwrite server
2. **Use Server** - Discard offline changes, keep server version
3. **Manual Merge** - (Future feature) Manually merge both versions

### Resolving Conflicts

```tsx
// Get unresolved conflicts
const conflicts = await syncService.getUnresolvedConflicts()

// Resolve using local version
await syncService.resolveConflict(conflictId, 'use-local')

// Resolve using server version
await syncService.resolveConflict(conflictId, 'use-server')
```

## Configuration

### Sync Interval

Default: 30 seconds

```typescript
// In sync.service.ts
const SYNC_INTERVAL = 30000 // 30 seconds
```

### Max Retry Count

Default: 3 attempts

```typescript
// In sync.service.ts
const MAX_RETRY_COUNT = 3
```

### IndexedDB Version

```typescript
// In db.service.ts
const DB_VERSION = 2
```

## Testing

### Test Offline Mode

1. Open DevTools → Network tab
2. Set throttling to "Offline"
3. Create/edit/delete transactions
4. Check sync queue: `await dbService.getSyncQueue()`
5. Go back online
6. Watch automatic sync

### Test Sync Queue

```javascript
// In browser console
const queue = await dbService.getSyncQueue()
console.log('Pending items:', queue)
```

### Test Local Storage

```javascript
// Check transactions
const transactions = await dbService.getAllTransactions()
console.log('Local transactions:', transactions)

// Check last sync
const lastSync = await dbService.getMetadata('lastSync')
console.log('Last synced:', lastSync)
```

## Troubleshooting

### Sync Not Working

1. Check online status: `navigator.onLine`
2. Check sync queue: `await dbService.getSyncQueue()`
3. Check browser console for errors
4. Try manual sync

### Data Not Appearing Offline

1. Check IndexedDB in DevTools → Application → Storage
2. Verify data was saved: `await dbService.getAllTransactions()`
3. Check for initialization errors

### Conflicts Not Resolving

1. Check conflict store: `await dbService.getConflicts(false)`
2. Verify conflict has both local and server versions
3. Manually resolve: `await syncService.resolveConflict(id, 'use-local')`

## Browser Compatibility

- Chrome 87+
- Firefox 85+
- Safari 15+
- Edge 87+

**Requirements:**

- IndexedDB support
- Service Worker support
- Online/Offline event support

## Performance

### Storage Limits

- IndexedDB: ~50MB minimum (browser-dependent)
- Recommended max transactions: 10,000
- Sync queue limit: 1,000 items

### Optimization Tips

1. Clear resolved conflicts periodically
2. Archive old transactions
3. Limit sync queue size
4. Use pagination for large datasets

## Security

- All data encrypted at rest (browser security model)
- API authentication still required for sync
- No sensitive data stored in clear text
- User ID required for all operations

## Future Enhancements

- [ ] Background Sync API integration
- [ ] Conflict resolution UI
- [ ] Batch sync operations
- [ ] Export/import offline data
- [ ] Compression for large datasets
- [ ] Progressive sync (prioritize recent data)

## API Changes

No backend changes are required. The offline support works with the existing API endpoints.

Optional: Add conflict detection endpoint for better conflict handling:

```php
// Optional: Detect conflicts
if ($version && $serverVersion > $version) {
    http_response_code(409); // Conflict
    echo json_encode([
        'error' => 'Conflict detected',
        'serverVersion' => $serverTransaction
    ]);
    exit;
}
```

## Migration

If you're upgrading from a version without offline support:

1. No user action required
2. IndexedDB will be created automatically
3. First sync will download all data
4. Users can continue using the app normally

## Support

For issues or questions:

1. Check browser console for errors
2. Verify IndexedDB is enabled
3. Clear site data and refresh
4. Check Network tab for API errors
