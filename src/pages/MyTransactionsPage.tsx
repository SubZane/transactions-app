import { BalanceSummary } from '../components/BalanceSummary'
import { FilterTabs } from '../components/FilterTabs'
import { PullToRefreshIndicator } from '../components/PullToRefreshIndicator'
import { TransactionList } from '../components/TransactionList'
import { useAuth } from '../hooks/useAuth'
import { usePullToRefresh } from '../hooks/usePullToRefresh'
import { useTransactions } from '../hooks/useTransactions'

export const MyTransactionsPage = () => {
  const { user, isLoading: isAuthLoading } = useAuth()

  const {
    transactions,
    filteredTransactions,
    isLoading,
    error,
    filter,
    searchQuery,
    setFilter,
    setSearchQuery,
    reload,
  } = useTransactions({
    userId: user?.dbId,
    autoLoad: !!user?.dbId,
  })

  // Pull to refresh
  const { pullDistance, isRefreshing, shouldTrigger } = usePullToRefresh({
    onRefresh: reload,
    threshold: 80,
    resistance: 2.5,
  })

  const getTotalByType = (type: 'deposit' | 'expense') => {
    if (!Array.isArray(transactions)) return 0
    return transactions.filter((t) => t.type === type).reduce((total, t) => total + t.amount, 0)
  }

  const getNetBalance = () => {
    const deposits = getTotalByType('deposit')
    const expenses = getTotalByType('expense')
    return deposits - expenses
  }

  // Show loading while auth is loading or transactions are loading
  if (isAuthLoading || (isLoading && !user)) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    )
  }

  // Show error if user is not authenticated after loading
  if (!user || !user.dbId) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">User not authenticated</p>
          <p className="text-gray-600 text-sm">Please try logging out and back in.</p>
        </div>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen bg-gray-50 pb-24"
      style={{ paddingTop: 'env(safe-area-inset-top)' }}>
      {/* Pull to Refresh Indicator */}
      <PullToRefreshIndicator
        pullDistance={pullDistance}
        isRefreshing={isRefreshing}
        shouldTrigger={shouldTrigger}
      />

      {/* Top Section with Emerald Green Background */}
      <div className="bg-emerald-600" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
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
