import { useEffect, useState } from 'react'

import { BalanceSummary } from '../components/BalanceSummary'
import { FilterTabs } from '../components/FilterTabs'
import { TransactionList } from '../components/TransactionList'
import { useAuth } from '../hooks/useAuth'
import { Transaction, transactionService } from '../services/transaction.service'

export const MyTransactionsPage = () => {
  const { user } = useAuth()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'deposit' | 'expense'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadTransactions()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  // Filter transactions locally when filter changes
  useEffect(() => {
    if (filter === 'all') {
      setFilteredTransactions(transactions)
    } else {
      setFilteredTransactions(transactions.filter((t) => t.type === filter))
    }
  }, [filter, transactions])

  const loadTransactions = async () => {
    if (!user) {
      setError('User not authenticated')
      setIsLoading(false)
      return
    }

    if (!user.dbId) {
      setError('User database ID not found. Please try logging out and back in.')
      setIsLoading(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Get all transactions and filter by current user's database ID
      const data = await transactionService.getAll()

      const userTransactions = Array.isArray(data)
        ? data.filter((t) => t.user_id === user.dbId)
        : []

      setTransactions(userTransactions)
      setFilteredTransactions(userTransactions)
    } catch (err) {
      console.error('Error loading transactions:', err)
      setError('Failed to load transactions. Please try again.')
      setTransactions([])
      setFilteredTransactions([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadTransactions()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const getTotalByType = (type: 'deposit' | 'expense') => {
    if (!Array.isArray(transactions)) return 0
    return transactions.filter((t) => t.type === type).reduce((total, t) => total + t.amount, 0)
  }

  const getNetBalance = () => {
    const deposits = getTotalByType('deposit')
    const expenses = getTotalByType('expense')
    return deposits - expenses
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Top Section with Emerald Green Background */}
      <div className="bg-emerald-600">
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 max-w-7xl">
          {/* User Balance */}
          <BalanceSummary
            netBalance={getNetBalance()}
            totalDeposits={getTotalByType('deposit')}
            totalExpenses={getTotalByType('expense')}
            title="My Transactions"
          />
        </div>
      </div>

      {/* Sticky Section: Filters */}
      <div className="sticky top-0 z-10 bg-emerald-600 shadow-md">
        <div className="container mx-auto px-3 sm:px-4 pt-[15px] pb-4 max-w-7xl">
          {/* Filter Tabs */}
          <FilterTabs
            activeFilter={filter}
            onFilterChange={setFilter}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        </div>
      </div>

      {/* Transactions List Section */}
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 max-w-7xl">
        <TransactionList
          transactions={filteredTransactions}
          isLoading={isLoading}
          error={error}
          searchQuery={searchQuery}
          emptyMessage="You haven't added any transactions yet"
          emptyDescription="Start tracking your personal finances by adding your first transaction"
        />
      </div>
    </div>
  )
}
