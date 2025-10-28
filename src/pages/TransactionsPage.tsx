import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { PencilIcon, PlusIcon } from '@heroicons/react/24/solid'

import { Transaction, transactionService } from '../services/transaction.service'

export const TransactionsPage = () => {
  const navigate = useNavigate()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'deposit' | 'expense'>('all')

  const loadTransactions = async () => {
    setIsLoading(true)
    setError(null)

    try {
      let data: Transaction[]
      if (filter === 'all') {
        data = await transactionService.getAll()
      } else {
        data = await transactionService.getByType(filter)
      }
      // Ensure data is an array
      setTransactions(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error('Error loading transactions:', err)
      setError('Failed to load transactions. Please try again.')
      setTransactions([]) // Reset to empty array on error
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadTransactions()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter])

  const formatAmount = (amount: number, type: 'deposit' | 'expense') => {
    const formatted = new Intl.NumberFormat('sv-SE', {
      style: 'currency',
      currency: 'SEK',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)

    return type === 'deposit' ? `+${formatted}` : `-${formatted}`
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date)
  }

  const getTotalBalance = () => {
    if (!Array.isArray(transactions)) return 0

    return transactions.reduce((total, transaction) => {
      if (transaction.type === 'deposit') {
        return total + transaction.amount
      } else {
        return total - transaction.amount
      }
    }, 0)
  }

  const getTotalByType = (type: 'deposit' | 'expense') => {
    if (!Array.isArray(transactions)) return 0

    return transactions.filter((t) => t.type === type).reduce((total, t) => total + t.amount, 0)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-base-100 pb-24">
      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 max-w-7xl">
        {/* Page Header */}
        <div className="mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-base-content">Transactions</h1>
          <p className="text-sm sm:text-base text-base-content/60 mt-1">
            Track your deposits and expenses
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
          {/* Balance Card */}
          <div className="card bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
            <div className="card-body p-4 sm:p-5">
              <div className="flex items-center justify-between mb-1 sm:mb-2">
                <h3 className="text-xs sm:text-sm font-semibold text-base-content/70 uppercase tracking-wide">
                  Balance
                </h3>
                <div className="badge badge-primary badge-sm">Total</div>
              </div>
              <p
                className={`text-2xl sm:text-3xl font-bold ${
                  getTotalBalance() >= 0 ? 'text-success' : 'text-error'
                }`}>
                {new Intl.NumberFormat('sv-SE', {
                  style: 'currency',
                  currency: 'SEK',
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                }).format(getTotalBalance())}
              </p>
            </div>
          </div>

          {/* Deposits Card */}
          <div className="card bg-gradient-to-br from-success/10 to-success/5 border border-success/20">
            <div className="card-body p-4 sm:p-5">
              <div className="flex items-center justify-between mb-1 sm:mb-2">
                <h3 className="text-xs sm:text-sm font-semibold text-base-content/70 uppercase tracking-wide">
                  Deposits
                </h3>
                <div className="badge badge-success badge-sm">+</div>
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-success">
                {new Intl.NumberFormat('sv-SE', {
                  style: 'currency',
                  currency: 'SEK',
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                }).format(getTotalByType('deposit'))}
              </p>
            </div>
          </div>

          {/* Expenses Card */}
          <div className="card bg-gradient-to-br from-error/10 to-error/5 border border-error/20">
            <div className="card-body p-4 sm:p-5">
              <div className="flex items-center justify-between mb-1 sm:mb-2">
                <h3 className="text-xs sm:text-sm font-semibold text-base-content/70 uppercase tracking-wide">
                  Expenses
                </h3>
                <div className="badge badge-error badge-sm">-</div>
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-error">
                {new Intl.NumberFormat('sv-SE', {
                  style: 'currency',
                  currency: 'SEK',
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                }).format(getTotalByType('expense'))}
              </p>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-4 sm:mb-6">
          <button
            className={`btn btn-sm ${filter === 'all' ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setFilter('all')}>
            All
          </button>
          <button
            className={`btn btn-sm ${filter === 'deposit' ? 'btn-success' : 'btn-ghost'}`}
            onClick={() => setFilter('deposit')}>
            Deposits
          </button>
          <button
            className={`btn btn-sm ${filter === 'expense' ? 'btn-error' : 'btn-ghost'}`}
            onClick={() => setFilter('expense')}>
            Expenses
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="alert alert-error mb-4 sm:mb-6">
            <span>{error}</span>
          </div>
        )}

        {/* Transactions List */}
        {transactions.length === 0 ? (
          <div className="card bg-base-200 border border-base-300">
            <div className="card-body text-center py-12 sm:py-16 px-4">
              <div className="text-base-content/40 mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z"
                  />
                </svg>
              </div>
              <p className="text-base sm:text-lg font-medium text-base-content/70 mb-2">
                No transactions yet
              </p>
              <p className="text-xs sm:text-sm text-base-content/50 mb-6">
                Start tracking your finances by adding your first transaction
              </p>
              <button
                className="btn btn-primary btn-sm sm:btn-md"
                onClick={() => navigate('/transactions/add')}>
                <PlusIcon className="h-5 w-5" />
                Add Your First Transaction
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Mobile View - Stacked Cards */}
            <div className="lg:hidden space-y-2">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="card bg-base-200 border border-base-300 hover:border-primary/30 transition-colors">
                  <div className="card-body p-3">
                    {/* Top Row: Category, Amount, Edit Button */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-base text-base-content leading-tight">
                          {transaction.type === 'deposit' ? 'Deposit' : transaction.category_name}
                        </h3>
                        <p className="text-xs text-base-content/60 mt-0.5">
                          {transaction.user_firstname} {transaction.user_surname}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <p
                          className={`text-lg font-bold ${
                            transaction.type === 'deposit' ? 'text-success' : 'text-error'
                          }`}>
                          {formatAmount(transaction.amount, transaction.type)}
                        </p>
                        <button
                          className="btn btn-ghost btn-xs btn-square"
                          onClick={() => navigate(`/transactions/edit/${transaction.id}`)}
                          aria-label={`Edit ${transaction.category_name} transaction`}>
                          <PencilIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {/* Description (if present) */}
                    {transaction.description && (
                      <p className="text-xs text-base-content/60 mb-2 line-clamp-1">
                        {transaction.description}
                      </p>
                    )}

                    {/* Bottom Row: Date only */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-base-content/50">
                        {formatDate(transaction.transaction_date)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop View - Table */}
            <div className="hidden lg:block card bg-base-200 border border-base-300">
              <div className="card-body p-0">
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-base-300 bg-base-100/50">
                  <div className="col-span-5 text-xs font-semibold text-base-content/60 uppercase tracking-wide">
                    Description
                  </div>
                  <div className="col-span-2 text-xs font-semibold text-base-content/60 uppercase tracking-wide">
                    Date
                  </div>
                  <div className="col-span-2 text-xs font-semibold text-base-content/60 uppercase tracking-wide">
                    Type
                  </div>
                  <div className="col-span-2 text-xs font-semibold text-base-content/60 uppercase tracking-wide text-right">
                    Amount
                  </div>
                  <div className="col-span-1 text-xs font-semibold text-base-content/60 uppercase tracking-wide text-right">
                    Actions
                  </div>
                </div>

                {/* Transaction Rows */}
                <div className="divide-y divide-base-300">
                  {transactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-base-100/50 transition-colors">
                      {/* Description */}
                      <div className="col-span-5 flex flex-col justify-center">
                        <h3 className="font-semibold text-base-content text-base">
                          {transaction.category_name}
                        </h3>
                        {transaction.description && (
                          <p className="text-sm text-base-content/60 mt-0.5 truncate">
                            {transaction.description}
                          </p>
                        )}
                      </div>

                      {/* Date */}
                      <div className="col-span-2 flex flex-col justify-center">
                        <p className="text-sm text-base-content/80">
                          {formatDate(transaction.transaction_date)}
                        </p>
                        <p className="text-xs text-base-content/50">
                          {transaction.user_firstname} {transaction.user_surname}
                        </p>
                      </div>

                      {/* Type Badge */}
                      <div className="col-span-2 flex items-center">
                        <span
                          className={`badge ${
                            transaction.type === 'deposit' ? 'badge-success' : 'badge-error'
                          } badge-sm font-medium`}>
                          {transaction.type === 'deposit' ? 'Deposit' : 'Expense'}
                        </span>
                      </div>

                      {/* Amount */}
                      <div className="col-span-2 flex items-center justify-end">
                        <p
                          className={`text-lg font-bold ${
                            transaction.type === 'deposit' ? 'text-success' : 'text-error'
                          }`}>
                          {formatAmount(transaction.amount, transaction.type)}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="col-span-1 flex items-center justify-end">
                        <button
                          className="btn btn-ghost btn-sm btn-square"
                          onClick={() => navigate(`/transactions/edit/${transaction.id}`)}
                          aria-label={`Edit ${transaction.category_name} transaction`}>
                          <PencilIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Floating Add Button */}
        <button
          className="btn btn-primary btn-circle btn-lg fixed bottom-20 sm:bottom-24 right-4 sm:right-6 shadow-lg z-10"
          onClick={() => navigate('/transactions/add')}
          aria-label="Add new transaction">
          <PlusIcon className="h-6 w-6" />
        </button>
      </div>
    </div>
  )
}
