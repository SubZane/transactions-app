/**
 * useOffline Hook
 * React hook for offline support and sync management
 */

import { useCallback, useEffect, useState } from 'react'

import { dbService } from '../services/db.service'
import { syncService } from '../services/sync.service'

export const useOffline = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [isSyncing, setIsSyncing] = useState(false)
  const [lastSync, setLastSync] = useState<string | null>(null)
  const [syncQueueCount, setSyncQueueCount] = useState(0)

  // Update online status
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

  // Initialize DB and start auto-sync
  useEffect(() => {
    const init = async () => {
      try {
        await dbService.init()
        syncService.startAutoSync()

        // Get last sync time
        const lastSyncTime = (await dbService.getMetadata('lastSync')) as string | undefined
        if (lastSyncTime) {
          setLastSync(lastSyncTime)
        }

        // Get initial queue count
        const queue = await dbService.getSyncQueue()
        setSyncQueueCount(queue.length)
      } catch (error) {
        console.error('Failed to initialize offline support:', error)
      }
    }

    init()

    return () => {
      syncService.stopAutoSync()
    }
  }, [])

  // Manual sync trigger
  const triggerSync = useCallback(async () => {
    if (!isOnline) {
      console.warn('Cannot sync while offline')
      return
    }

    setIsSyncing(true)
    try {
      await syncService.syncNow()

      // Update last sync time
      const lastSyncTime = (await dbService.getMetadata('lastSync')) as string | undefined
      if (lastSyncTime) {
        setLastSync(lastSyncTime)
      }

      // Update queue count
      const queue = await dbService.getSyncQueue()
      setSyncQueueCount(queue.length)
    } catch (error) {
      console.error('Sync failed:', error)
    } finally {
      setIsSyncing(false)
    }
  }, [isOnline])

  // Get local data (for offline use)
  const getLocalTransactions = useCallback(async () => {
    try {
      await dbService.init()
      return await dbService.getAllTransactions()
    } catch (error) {
      console.error('Failed to get local transactions:', error)
      return []
    }
  }, [])

  const getLocalCategories = useCallback(async () => {
    try {
      await dbService.init()
      return await dbService.getAllCategories()
    } catch (error) {
      console.error('Failed to get local categories:', error)
      return []
    }
  }, [])

  return {
    isOnline,
    isSyncing,
    lastSync,
    syncQueueCount,
    triggerSync,
    getLocalTransactions,
    getLocalCategories,
  }
}
