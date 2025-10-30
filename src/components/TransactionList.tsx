import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import AddCircleIcon from '@mui/icons-material/AddCircle'
import EditIcon from '@mui/icons-material/Edit'
import RefreshIcon from '@mui/icons-material/Refresh'

import { Transaction } from '../services/transaction.service'

interface TransactionListProps {
  transactions: Transaction[]
  isLoading?: boolean
  error?: string | null
  emptyMessage?: string
  emptyDescription?: string
  searchQuery?: string
}

export const TransactionList = ({
  transactions,
  isLoading = false,
  error = null,
  emptyMessage = 'No transactions yet',
  emptyDescription = 'Start tracking your finances by adding your first transaction',
  searchQuery = '',
}: TransactionListProps) => {
  const navigate = useNavigate()
  const currentYear = new Date().getFullYear()
  const [displayedYears, setDisplayedYears] = useState<number[]>([currentYear])

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

  const getMonthYear = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-US', {
      month: 'long',
      year: 'numeric',
    }).format(date)
  }

  const groupTransactionsByMonth = (transactions: Transaction[]) => {
    const grouped = new Map<string, Transaction[]>()

    transactions.forEach((transaction) => {
      const monthYear = getMonthYear(transaction.transaction_date)
      if (!grouped.has(monthYear)) {
        grouped.set(monthYear, [])
      }
      grouped.get(monthYear)!.push(transaction)
    })

    // Convert to array and sort by date (newest first)
    return Array.from(grouped.entries()).sort((a, b) => {
      const dateA = new Date(a[1][0].transaction_date)
      const dateB = new Date(b[1][0].transaction_date)
      return dateB.getTime() - dateA.getTime()
    })
  }

  // Filter transactions by displayed years
  const filteredByYear = transactions.filter((t) => {
    const year = new Date(t.transaction_date).getFullYear()
    return displayedYears.includes(year)
  })

  // Filter by search query (category and description)
  const filteredTransactions = filteredByYear.filter((t) => {
    if (!searchQuery.trim()) return true

    const query = searchQuery.toLowerCase()
    const categoryMatch = t.category_name?.toLowerCase().includes(query)
    const descriptionMatch = t.description?.toLowerCase().includes(query)

    return categoryMatch || descriptionMatch
  })

  // Get all available years from transactions
  const availableYears = Array.from(
    new Set(transactions.map((t) => new Date(t.transaction_date).getFullYear()))
  ).sort((a, b) => b - a)

  // Find the next year to load (oldest year not yet displayed)
  const nextYearToLoad = availableYears.find((year) => !displayedYears.includes(year))

  const loadPreviousYear = () => {
    if (nextYearToLoad) {
      setDisplayedYears([...displayedYears, nextYearToLoad])
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 sm:mb-6">
        <span className="text-red-800">{error}</span>
      </div>
    )
  }

  if (transactions.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="text-center py-12 sm:py-16 px-4">
          <div className="text-gray-400 mb-4">
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
          <p className="text-base sm:text-lg font-medium text-gray-700 mb-2">{emptyMessage}</p>
          <p className="text-xs sm:text-sm text-gray-500 mb-6">{emptyDescription}</p>
          <button
            className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors"
            onClick={() => navigate('/add')}>
            <AddCircleIcon sx={{ fontSize: 20, marginRight: 1 }} />
            Add Your First Transaction
          </button>
        </div>
      </div>
    )
  }

  // Use filtered transactions for display
  const transactionsToDisplay = filteredTransactions

  return (
    <>
      {/* Mobile View - Stacked Cards */}
      <div className="lg:hidden space-y-6">
        {groupTransactionsByMonth(transactionsToDisplay).map(([monthYear, transactions]) => (
          <div key={monthYear}>
            {/* Month Header */}
            <h3 className="text-sm font-semibold text-gray-700 mb-3 px-1">{monthYear}</h3>
            <div className="space-y-2">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="bg-white rounded-lg border border-gray-200 hover:border-emerald-300 transition-colors">
                  <div className="p-3">
                    {/* Top Row: Category, Amount, Edit Button */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-base text-gray-900 leading-tight">
                          {transaction.type === 'deposit' ? 'Deposit' : transaction.category_name}
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {transaction.user_firstname} {transaction.user_surname}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <p
                          className={`text-lg font-bold ${
                            transaction.type === 'deposit' ? 'text-green-600' : 'text-red-600'
                          }`}>
                          {formatAmount(transaction.amount, transaction.type)}
                        </p>
                        <button
                          className="p-1 text-gray-400 hover:text-emerald-600 transition-colors rounded"
                          onClick={() => navigate(`/edit/${transaction.id}`)}
                          aria-label={`Edit ${transaction.category_name} transaction`}>
                          <EditIcon sx={{ fontSize: 16 }} />
                        </button>
                      </div>
                    </div>

                    {/* Description (if present) */}
                    {transaction.description && (
                      <p className="text-xs text-gray-600 mb-2 line-clamp-1">
                        {transaction.description}
                      </p>
                    )}

                    {/* Bottom Row: Date only */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">
                        {formatDate(transaction.transaction_date)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Desktop View - Table */}
      <div className="hidden lg:block space-y-6">
        {groupTransactionsByMonth(transactionsToDisplay).map(([monthYear, transactions]) => (
          <div key={monthYear}>
            {/* Month Header */}
            <h3 className="text-sm font-semibold text-gray-700 mb-3 px-1">{monthYear}</h3>
            <div className="bg-white rounded-lg border border-gray-200">
              <div>
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-gray-200 bg-gray-50">
                  <div className="col-span-5 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Description
                  </div>
                  <div className="col-span-2 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Date
                  </div>
                  <div className="col-span-2 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                    Type
                  </div>
                  <div className="col-span-2 text-xs font-semibold text-gray-600 uppercase tracking-wide text-right">
                    Amount
                  </div>
                  <div className="col-span-1 text-xs font-semibold text-gray-600 uppercase tracking-wide text-right">
                    Actions
                  </div>
                </div>

                {/* Transaction Rows */}
                <div className="divide-y divide-gray-200">
                  {transactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-gray-50 transition-colors">
                      {/* Description */}
                      <div className="col-span-5 flex flex-col justify-center">
                        <h3 className="font-semibold text-gray-900 text-base">
                          {transaction.category_name}
                        </h3>
                        {transaction.description && (
                          <p className="text-sm text-gray-600 mt-0.5 truncate">
                            {transaction.description}
                          </p>
                        )}
                      </div>

                      {/* Date */}
                      <div className="col-span-2 flex flex-col justify-center">
                        <p className="text-sm text-gray-800">
                          {formatDate(transaction.transaction_date)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {transaction.user_firstname} {transaction.user_surname}
                        </p>
                      </div>

                      {/* Type Badge */}
                      <div className="col-span-2 flex items-center">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            transaction.type === 'deposit'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                          {transaction.type === 'deposit' ? 'Deposit' : 'Expense'}
                        </span>
                      </div>

                      {/* Amount */}
                      <div className="col-span-2 flex items-center justify-end">
                        <p
                          className={`text-lg font-bold ${
                            transaction.type === 'deposit' ? 'text-green-600' : 'text-red-600'
                          }`}>
                          {formatAmount(transaction.amount, transaction.type)}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="col-span-1 flex items-center justify-end">
                        <button
                          className="p-2 text-gray-400 hover:text-emerald-600 transition-colors rounded"
                          onClick={() => navigate(`/edit/${transaction.id}`)}
                          aria-label={`Edit ${transaction.category_name} transaction`}>
                          <EditIcon sx={{ fontSize: 16 }} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Load Previous Year Button */}
      {nextYearToLoad && (
        <div className="mt-8 flex justify-center">
          <button
            onClick={loadPreviousYear}
            className="px-4 py-2 bg-white border-2 border-emerald-600 text-emerald-600 rounded-lg text-sm font-medium hover:bg-emerald-50 transition-colors flex items-center gap-2">
            <RefreshIcon sx={{ fontSize: 18 }} />
            Load {nextYearToLoad} Transactions
          </button>
        </div>
      )}
    </>
  )
}
