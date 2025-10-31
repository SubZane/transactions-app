import { useEffect, useState } from 'react'

import { transactionService } from '../services/transaction.service'

import type { Transaction } from '../types'
import type { UseTransactionsOptions, UseTransactionsReturn } from '../types/hook.types'

/**
 * Custom hook for loading and filtering transactions
 * Handles loading state, error handling, filtering by type, and search
 */
export const useTransactions = (options: UseTransactionsOptions = {}): UseTransactionsReturn => {
  const { userId, autoLoad = true } = options

  const [allTransactions, setAllTransactions] = useState<Transaction[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'deposit' | 'expense'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const loadTransactions = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const data = await transactionService.getAll()
      const transactions = Array.isArray(data) ? data : []

      // Filter by user ID if provided
      const filtered = userId ? transactions.filter((t) => t.user_id === userId) : transactions

      setAllTransactions(filtered)
      setFilteredTransactions(filtered)
    } catch (err) {
      console.error('Error loading transactions:', err)
      setError('Failed to load transactions. Please try again.')
      setAllTransactions([])
      setFilteredTransactions([])
    } finally {
      setIsLoading(false)
    }
  }

  // Load transactions on mount if autoLoad is true and userId is available (if required)
  useEffect(() => {
    if (autoLoad && (userId === undefined || userId !== undefined)) {
      loadTransactions()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, autoLoad])

  // Filter transactions by type when filter changes
  useEffect(() => {
    if (filter === 'all') {
      setFilteredTransactions(allTransactions)
    } else {
      setFilteredTransactions(allTransactions.filter((t) => t.type === filter))
    }
  }, [filter, allTransactions])

  return {
    transactions: allTransactions,
    filteredTransactions,
    isLoading,
    error,
    filter,
    searchQuery,
    setFilter,
    setSearchQuery,
    reload: loadTransactions,
  }
}
