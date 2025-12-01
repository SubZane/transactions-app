/**
 * IndexedDB Service
 * Handles local offline storage using IndexedDB
 */

import type { TransactionConflict } from '../types/conflict.types'

const DB_NAME = 'TransactionsDB'
const DB_VERSION = 2 // Incremented for conflicts store

export interface OfflineTransaction {
  id: number | string
  user_id: number | string
  type: 'withdrawal' | 'expense'
  amount: number
  category_id: number | null
  transaction_date: string
  description?: string | null
  created_at?: string
  updated_at?: string
}

export interface Category {
  id: number
  name: string
  type: string
  icon?: string
}

export interface SyncQueueItem {
  id?: number
  type: 'CREATE' | 'UPDATE' | 'DELETE'
  entityType: 'transaction' | 'category'
  entityId?: number | string
  data?: OfflineTransaction | Category
  timestamp: number
  retryCount: number
}

class DBService {
  private db: IDBDatabase | null = null

  async init(): Promise<void> {
    // Only initialize in browser environment
    if (typeof window === 'undefined' || !('indexedDB' in window)) {
      console.warn('IndexedDB not available')
      return Promise.resolve()
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        // Transactions store
        if (!db.objectStoreNames.contains('transactions')) {
          const transactionStore = db.createObjectStore('transactions', { keyPath: 'id' })
          transactionStore.createIndex('transaction_date', 'transaction_date', { unique: false })
          transactionStore.createIndex('type', 'type', { unique: false })
          transactionStore.createIndex('user_id', 'user_id', { unique: false })
        }

        // Categories store
        if (!db.objectStoreNames.contains('categories')) {
          db.createObjectStore('categories', { keyPath: 'id' })
        }

        // Sync queue store
        if (!db.objectStoreNames.contains('syncQueue')) {
          const syncStore = db.createObjectStore('syncQueue', {
            keyPath: 'id',
            autoIncrement: true,
          })
          syncStore.createIndex('timestamp', 'timestamp', { unique: false })
          syncStore.createIndex('entityType', 'entityType', { unique: false })
        }

        // Metadata store
        if (!db.objectStoreNames.contains('metadata')) {
          db.createObjectStore('metadata', { keyPath: 'key' })
        }

        // Conflicts store (new in v2)
        if (!db.objectStoreNames.contains('conflicts')) {
          const conflictsStore = db.createObjectStore('conflicts', { keyPath: 'id' })
          conflictsStore.createIndex('transactionId', 'transactionId', { unique: false })
          conflictsStore.createIndex('resolved', 'resolved', { unique: false })
          conflictsStore.createIndex('detectedAt', 'detectedAt', { unique: false })
        }
      }
    })
  }

  private getStore(storeName: string, mode: IDBTransactionMode = 'readonly'): IDBObjectStore {
    if (!this.db) {
      throw new Error(
        'Database not initialized. IndexedDB may not be available in this environment.'
      )
    }
    const transaction = this.db.transaction(storeName, mode)
    return transaction.objectStore(storeName)
  }

  // ==================== TRANSACTIONS ====================

  async saveTransaction(transaction: OfflineTransaction): Promise<void> {
    console.log('💾 saveTransaction called with:', {
      id: transaction.id,
      idType: typeof transaction.id,
      idValue: JSON.stringify(transaction.id),
      transaction
    })

    const store = this.getStore('transactions', 'readwrite')
    return new Promise((resolve, reject) => {
      const request = store.put(transaction)
      request.onsuccess = () => {
        console.log('✅ Transaction saved successfully:', transaction.id)
        resolve()
      }
      request.onerror = () => {
        console.error('❌ IndexedDB error:', {
          error: request.error,
          transaction,
          id: transaction.id,
          idType: typeof transaction.id
        })
        reject(request.error)
      }
    })
  }

  async getTransaction(id: number | string): Promise<OfflineTransaction | undefined> {
    const store = this.getStore('transactions', 'readonly')
    return new Promise((resolve, reject) => {
      const request = store.get(id)
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async getAllTransactions(): Promise<OfflineTransaction[]> {
    const store = this.getStore('transactions', 'readonly')
    return new Promise((resolve, reject) => {
      const request = store.getAll()
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async deleteTransaction(id: number | string): Promise<void> {
    const store = this.getStore('transactions', 'readwrite')
    return new Promise((resolve, reject) => {
      const request = store.delete(id)
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async clearTransactions(): Promise<void> {
    const store = this.getStore('transactions', 'readwrite')
    return new Promise((resolve, reject) => {
      const request = store.clear()
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  // ==================== CATEGORIES ====================

  async saveCategory(category: Category): Promise<void> {
    const store = this.getStore('categories', 'readwrite')
    return new Promise((resolve, reject) => {
      const request = store.put(category)
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async getAllCategories(): Promise<Category[]> {
    const store = this.getStore('categories', 'readonly')
    return new Promise((resolve, reject) => {
      const request = store.getAll()
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async clearCategories(): Promise<void> {
    const store = this.getStore('categories', 'readwrite')
    return new Promise((resolve, reject) => {
      const request = store.clear()
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  // ==================== SYNC QUEUE ====================

  async addToSyncQueue(item: Omit<SyncQueueItem, 'id'>): Promise<void> {
    const store = this.getStore('syncQueue', 'readwrite')
    return new Promise((resolve, reject) => {
      const request = store.add(item)
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async getSyncQueue(): Promise<SyncQueueItem[]> {
    const store = this.getStore('syncQueue', 'readonly')
    return new Promise((resolve, reject) => {
      const request = store.getAll()
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async removeSyncQueueItem(id: number): Promise<void> {
    const store = this.getStore('syncQueue', 'readwrite')
    return new Promise((resolve, reject) => {
      const request = store.delete(id)
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async updateSyncQueueItem(item: SyncQueueItem): Promise<void> {
    const store = this.getStore('syncQueue', 'readwrite')
    return new Promise((resolve, reject) => {
      const request = store.put(item)
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async clearSyncQueue(): Promise<void> {
    const store = this.getStore('syncQueue', 'readwrite')
    return new Promise((resolve, reject) => {
      const request = store.clear()
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  // ==================== METADATA ====================

  async setMetadata(key: string, value: string | number | boolean | object): Promise<void> {
    const store = this.getStore('metadata', 'readwrite')
    return new Promise((resolve, reject) => {
      const request = store.put({ key, value })
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async getMetadata(key: string): Promise<string | number | boolean | object | undefined> {
    const store = this.getStore('metadata', 'readonly')
    return new Promise((resolve, reject) => {
      const request = store.get(key)
      request.onsuccess = () => resolve(request.result?.value)
      request.onerror = () => reject(request.error)
    })
  }

  // ==================== CONFLICTS ====================

  async saveConflict(conflict: TransactionConflict): Promise<void> {
    const store = this.getStore('conflicts', 'readwrite')
    return new Promise((resolve, reject) => {
      const request = store.put(conflict)
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async getConflicts(resolvedFilter?: boolean): Promise<TransactionConflict[]> {
    // Return empty array if DB not initialized (e.g., SSR or IndexedDB not available)
    if (!this.db) return []

    const store = this.getStore('conflicts', 'readonly')
    return new Promise((resolve, reject) => {
      const request = store.getAll()
      request.onsuccess = () => {
        const conflicts = request.result
        if (resolvedFilter !== undefined) {
          resolve(conflicts.filter((c: TransactionConflict) => c.resolved === resolvedFilter))
        } else {
          resolve(conflicts)
        }
      }
      request.onerror = () => reject(request.error)
    })
  }

  async getConflictById(id: string): Promise<TransactionConflict | undefined> {
    const store = this.getStore('conflicts', 'readonly')
    return new Promise((resolve, reject) => {
      const request = store.get(id)
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async deleteConflict(id: string): Promise<void> {
    const store = this.getStore('conflicts', 'readwrite')
    return new Promise((resolve, reject) => {
      const request = store.delete(id)
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async clearResolvedConflicts(): Promise<void> {
    const conflicts = await this.getConflicts(true)
    const store = this.getStore('conflicts', 'readwrite')

    return new Promise((resolve, reject) => {
      const promises = conflicts.map(
        (conflict) =>
          new Promise<void>((res, rej) => {
            const request = store.delete(conflict.id)
            request.onsuccess = () => res()
            request.onerror = () => rej(request.error)
          })
      )

      Promise.all(promises)
        .then(() => resolve())
        .catch(reject)
    })
  }

  // ==================== UTILITY ====================

  async clearAllData(): Promise<void> {
    await this.clearTransactions()
    await this.clearCategories()
    await this.clearSyncQueue()
  }
}

export const dbService = new DBService()
