/**
 * Sync Service
 * Handles synchronization between IndexedDB and server
 */

import { categoryService } from './category.service'
import { dbService } from './db.service'
import { transactionService } from './transaction.service'

import type { OfflineTransaction, SyncQueueItem } from './db.service'
import type { Transaction } from './transaction.service'
import type { TransactionConflict } from '../types/conflict.types'

const MAX_RETRY_COUNT = 3
const SYNC_INTERVAL = 30000 // 30 seconds

class SyncService {
  private syncTimer: number | null = null
  private isSyncing = false

  /**
   * Start automatic sync when online
   */
  startAutoSync(): void {
    // Only in browser environment
    if (typeof window === 'undefined') return

    // Initial sync
    this.syncNow()

    // Periodic sync
    this.syncTimer = window.setInterval(() => {
      if (navigator.onLine) {
        this.syncNow()
      }
    }, SYNC_INTERVAL)

    // Listen for online event
    window.addEventListener('online', this.handleOnline)
  }

  /**
   * Stop automatic sync
   */
  stopAutoSync(): void {
    if (typeof window === 'undefined') return

    if (this.syncTimer) {
      clearInterval(this.syncTimer)
      this.syncTimer = null
    }
    window.removeEventListener('online', this.handleOnline)
  }

  private handleOnline = (): void => {
    console.log('🌐 Network connection restored, starting sync...')
    this.syncNow()
  }

  /**
   * Trigger immediate sync
   */
  async syncNow(): Promise<void> {
    if (!navigator.onLine) {
      console.log('⚠️ Offline - skipping sync')
      return
    }

    if (this.isSyncing) {
      console.log('⚠️ Sync already in progress')
      return
    }

    this.isSyncing = true

    try {
      await dbService.init()

      // Step 1: Pull latest data from server
      await this.pullFromServer()

      // Step 2: Push local changes to server
      await this.pushToServer()

      // Update last sync timestamp
      await dbService.setMetadata('lastSync', new Date().toISOString())

      console.log('✅ Sync completed successfully')
    } catch (error) {
      console.error('❌ Sync failed:', error)
    } finally {
      this.isSyncing = false
    }
  }

  /**
   * Pull latest data from server to IndexedDB
   */
  private async pullFromServer(): Promise<void> {
    try {
      // Fetch transactions from server
      const transactions = await transactionService.getAll()
      console.log('🔄 Server returned transactions:', transactions)

      // Save to IndexedDB
      await dbService.clearTransactions()
      for (const transaction of transactions) {
        console.log('💾 Attempting to save transaction:', {
          id: transaction.id,
          idType: typeof transaction.id,
          idValue: JSON.stringify(transaction.id),
          transaction
        })

        await dbService.saveTransaction({
          id: transaction.id,
          user_id: transaction.user_id,
          type: transaction.type as 'withdrawal' | 'expense',
          amount: transaction.amount,
          category_id: transaction.category_id,
          transaction_date: transaction.transaction_date,
          description: transaction.description,
          created_at: transaction.created_at,
          updated_at: transaction.updated_at,
        })
      }

      // Fetch categories from server
      const categories = await categoryService.getAll()

      // Save to IndexedDB
      await dbService.clearCategories()
      for (const category of categories) {
        await dbService.saveCategory({
          id: category.id,
          name: category.name,
          type: category.type,
        })
      }

      console.log(
        `📥 Pulled ${transactions.length} transactions and ${categories.length} categories`
      )
    } catch (error) {
      console.error('Error pulling from server:', error)
      throw error
    }
  }

  /**
   * Push local changes from sync queue to server
   */
  private async pushToServer(): Promise<void> {
    const queue = await dbService.getSyncQueue()

    if (queue.length === 0) {
      console.log('📤 No items in sync queue')
      return
    }

    console.log(`📤 Processing ${queue.length} items in sync queue`)

    for (const item of queue) {
      try {
        await this.processSyncItem(item)
        await dbService.removeSyncQueueItem(item.id!)
      } catch (error) {
        console.error(`Error processing sync item ${item.id}:`, error)

        // Increment retry count
        item.retryCount += 1

        if (item.retryCount >= MAX_RETRY_COUNT) {
          console.error(`Max retries reached for item ${item.id}, removing from queue`)
          await dbService.removeSyncQueueItem(item.id!)
        } else {
          await dbService.updateSyncQueueItem(item)
        }
      }
    }
  }

  /**
   * Process individual sync queue item
   */
  private async processSyncItem(item: SyncQueueItem): Promise<void> {
    if (item.entityType === 'transaction') {
      await this.processSyncTransaction(item)
    } else if (item.entityType === 'category') {
      // Categories are read-only for now
      console.log('Category sync not implemented yet')
    }
  }

  /**
   * Process transaction sync item
   */
  private async processSyncTransaction(item: SyncQueueItem): Promise<void> {
    if (item.type === 'CREATE' && item.data) {
      const data = item.data as unknown as OfflineTransaction
      await transactionService.create({
        type: data.type,
        amount: data.amount,
        category_id: data.category_id,
        transaction_date: data.transaction_date,
        description: data.description ?? undefined,
        user_id: String(data.user_id),
      })
    } else if (item.type === 'UPDATE' && item.entityId && item.data) {
      try {
        const data = item.data as unknown as OfflineTransaction
        await transactionService.update(Number(item.entityId), {
          type: data.type,
          amount: data.amount,
          category_id: data.category_id,
          transaction_date: data.transaction_date,
          description: data.description ?? undefined,
        })
      } catch (error: unknown) {
        // Check if it's a conflict (409 status)
        if (error && typeof error === 'object' && 'response' in error) {
          const response = error.response as {
            status?: number
            data?: { serverVersion?: Transaction }
          }
          if (response.status === 409) {
            // Conflict detected - store it
            const localVersion = item.data as unknown as OfflineTransaction
            const serverVersion = response.data?.serverVersion

            if (serverVersion) {
              const conflict: TransactionConflict = {
                id: `conflict-${Date.now()}-${item.entityId}`,
                transactionId: item.entityId!,
                localVersion,
                serverVersion: {
                  ...serverVersion,
                  description: serverVersion.description ?? undefined,
                },
                detectedAt: new Date().toISOString(),
                resolved: false,
              }

              await dbService.saveConflict(conflict)
              console.log('⚠️ Conflict detected and saved:', conflict.id)
            }
          }
        }
        throw error
      }
    } else if (item.type === 'DELETE' && item.entityId) {
      await transactionService.delete(Number(item.entityId))
    }
  }

  /**
   * Add transaction to sync queue
   */
  async queueTransactionCreate(transaction: Partial<Transaction>): Promise<void> {
    await dbService.init()
    await dbService.addToSyncQueue({
      type: 'CREATE',
      entityType: 'transaction',
      data: transaction as unknown as OfflineTransaction,
      timestamp: Date.now(),
      retryCount: 0,
    })

    // Trigger sync if online
    if (navigator.onLine) {
      this.syncNow()
    }
  }

  /**
   * Add transaction update to sync queue
   */
  async queueTransactionUpdate(id: number, transaction: Partial<Transaction>): Promise<void> {
    await dbService.init()
    await dbService.addToSyncQueue({
      type: 'UPDATE',
      entityType: 'transaction',
      entityId: id,
      data: transaction as unknown as OfflineTransaction,
      timestamp: Date.now(),
      retryCount: 0,
    })

    // Trigger sync if online
    if (navigator.onLine) {
      this.syncNow()
    }
  }

  /**
   * Add transaction delete to sync queue
   */
  async queueTransactionDelete(id: number): Promise<void> {
    await dbService.init()
    await dbService.addToSyncQueue({
      type: 'DELETE',
      entityType: 'transaction',
      entityId: id,
      timestamp: Date.now(),
      retryCount: 0,
    })

    // Trigger sync if online
    if (navigator.onLine) {
      this.syncNow()
    }
  }

  /**
   * Get unresolved conflicts
   */
  async getUnresolvedConflicts(): Promise<TransactionConflict[]> {
    await dbService.init()
    return dbService.getConflicts(false)
  }

  /**
   * Resolve a conflict
   */
  async resolveConflict(conflictId: string, resolution: 'use-local' | 'use-server'): Promise<void> {
    await dbService.init()
    const conflict = await dbService.getConflictById(conflictId)

    if (!conflict) {
      throw new Error('Conflict not found')
    }

    const dataToUse = resolution === 'use-local' ? conflict.localVersion : conflict.serverVersion

    // Update server with resolved data
    await transactionService.update(Number(conflict.transactionId), {
      type: dataToUse.type,
      amount: dataToUse.amount,
      category_id: dataToUse.category_id,
      transaction_date: dataToUse.transaction_date,
      description: dataToUse.description ?? undefined,
    })

    // Mark conflict as resolved
    conflict.resolved = true
    conflict.resolution = resolution
    conflict.resolvedAt = new Date().toISOString()
    await dbService.saveConflict(conflict)

    // Remove from sync queue if present
    const queue = await dbService.getSyncQueue()
    const queueItem = queue.find((item) => item.entityId === conflict.transactionId)
    if (queueItem) {
      await dbService.removeSyncQueueItem(queueItem.id!)
    }
  }
}

export const syncService = new SyncService()
