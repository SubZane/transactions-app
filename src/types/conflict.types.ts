/**
 * Conflict Types
 * Types for handling sync conflicts between local and server data
 */

import type { OfflineTransaction } from '../services/db.service'

export interface TransactionConflict {
  id: string // Unique conflict ID
  transactionId: number | string
  localVersion: OfflineTransaction
  serverVersion: OfflineTransaction
  detectedAt: string
  resolved: boolean
  resolution?: 'use-local' | 'use-server' | 'merge'
  resolvedAt?: string
}

export interface ConflictResolution {
  conflictId: string
  resolution: 'use-local' | 'use-server' | 'merge'
  mergedData?: Partial<OfflineTransaction>
}
