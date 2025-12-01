// Hook interfaces

import type { Transaction } from './api.types'

export interface PullToRefreshOptions {
  onRefresh: () => Promise<void>
  threshold?: number
  resistance?: number
}

export interface PullToRefreshReturn {
  pullDistance: number
  isRefreshing: boolean
  shouldTrigger: boolean
}

export interface UseTransactionsOptions {
  /** Filter transactions by user ID */
  userId?: number
  /** Auto-load transactions on mount */
  autoLoad?: boolean
}

export interface UseTransactionsReturn {
  /** All loaded transactions (unfiltered) */
  transactions: Transaction[]
  /** Transactions filtered by type */
  filteredTransactions: Transaction[]
  /** Loading state */
  isLoading: boolean
  /** Error message if any */
  error: string | null
  /** Current filter type */
  filter: 'all' | 'withdrawal' | 'expense'
  /** Search query */
  searchQuery: string
  /** Set the filter type */
  setFilter: (filter: 'all' | 'withdrawal' | 'expense') => void
  /** Set the search query */
  setSearchQuery: (query: string) => void
  /** Manually reload transactions */
  reload: () => Promise<void>
}
