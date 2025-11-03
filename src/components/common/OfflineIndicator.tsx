/**
 * OfflineIndicator Component
 * Shows offline status and sync information
 */

import './OfflineIndicator.css'

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
            <span className="offline-indicator__icon">📡</span>
            <span className="offline-indicator__text">Offline Mode</span>
          </>
        )}

        {isOnline && isSyncing && (
          <>
            <span className="offline-indicator__icon spinning">🔄</span>
            <span className="offline-indicator__text">Syncing...</span>
          </>
        )}

        {isOnline && !isSyncing && syncQueueCount > 0 && (
          <>
            <span className="offline-indicator__icon">⏳</span>
            <span className="offline-indicator__text">
              {syncQueueCount} item{syncQueueCount !== 1 ? 's' : ''} pending
            </span>
            <button onClick={triggerSync} className="offline-indicator__sync-btn" type="button">
              Sync Now
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
