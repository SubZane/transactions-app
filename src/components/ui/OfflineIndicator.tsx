/**
 * OfflineIndicator Component
 * Shows offline status and sync information
 */

import './OfflineIndicator.css'

import PendingIcon from '@mui/icons-material/Pending'
import SyncIcon from '@mui/icons-material/Sync'
import WifiOffIcon from '@mui/icons-material/WifiOff'

import { useOffline } from '../../hooks/useOffline'

export const OfflineIndicator = () => {
  const { isOnline, isSyncing, lastSync, syncQueueCount, triggerSync } = useOffline()

  if (isOnline && syncQueueCount === 0 && !isSyncing) {
    return null // Don't show anything when online and synced
  }

  const formatLastSync = (timestamp: string | null) => {
    if (!timestamp) return 'Never'

    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)

    if (diffMins < 1) return 'Just now'
    if (diffMins === 1) return '1 minute ago'
    if (diffMins < 60) return `${diffMins} minutes ago'`
    if (diffMins < 120) return '1 hour ago'
    return `${Math.floor(diffMins / 60)} hours ago`
  }

  return (
    <div className={`offline-indicator ${isOnline ? 'online' : 'offline'}`}>
      <div className="offline-indicator__content">
        {!isOnline && (
          <>
            <WifiOffIcon className="offline-indicator__icon" fontSize="small" />
            <span className="offline-indicator__text">Offline Mode</span>
          </>
        )}

        {isOnline && isSyncing && (
          <>
            <SyncIcon className="offline-indicator__icon spinning" fontSize="small" />
            <span className="offline-indicator__text">Syncing...</span>
          </>
        )}

        {isOnline && syncQueueCount > 0 && (
          <>
            {!isSyncing && (
              <>
                <PendingIcon className="offline-indicator__icon" fontSize="small" />
                <span className="offline-indicator__text">
                  {syncQueueCount} item{syncQueueCount !== 1 ? 's' : ''} pending
                </span>
              </>
            )}
            <button
              onClick={triggerSync}
              className="offline-indicator__sync-btn"
              type="button"
              disabled={isSyncing}
            >
              {isSyncing ? (
                <>
                  <SyncIcon className="spinning" fontSize="small" style={{ marginRight: '4px' }} />
                  Syncing...
                </>
              ) : (
                <>
                  <SyncIcon fontSize="small" style={{ marginRight: '4px' }} />
                  Sync Now
                </>
              )}
            </button>
          </>
        )}
      </div>

      {lastSync && (
        <div className="offline-indicator__last-sync">Last sync: {formatLastSync(lastSync)}</div>
      )}
    </div>
  )
}
