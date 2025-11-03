import { BalanceBar } from '../components/BalanceBar'
import { FilterTabs } from '../components/FilterTabs'
import { PullToRefreshIndicator } from '../components/PullToRefreshIndicator'
import { TransactionList } from '../components/TransactionList'
import { UserBalanceCard } from '../components/UserBalanceCard'
import { usePullToRefresh } from '../hooks/usePullToRefresh'
import { useTransactions } from '../hooks/useTransactions'

export const TransactionsPage = () => {
  const {
    transactions: allTransactions,
    filteredTransactions,
    isLoading,
    error,
    filter,
    searchQuery,
    setFilter,
    setSearchQuery,
    reload,
  } = useTransactions()

  // Pull to refresh
  const { pullDistance, isRefreshing, shouldTrigger } = usePullToRefresh({
    onRefresh: reload,
    threshold: 80,
    resistance: 2.5,
  })

  const getUserStats = () => {
    if (!Array.isArray(allTransactions) || allTransactions.length === 0) {
      return { users: [], balance: 0 }
    }

    const userMap = new Map<
      number,
      {
        id: number
        name: string
        deposits: number
        expenses: number
        net: number
      }
    >()

    allTransactions.forEach((t) => {
      if (!userMap.has(t.user_id)) {
        userMap.set(t.user_id, {
          id: t.user_id,
          name: t.user_firstname,
          deposits: 0,
          expenses: 0,
          net: 0,
        })
      }

      const user = userMap.get(t.user_id)!
      if (t.type === 'deposit') {
        user.deposits += t.amount
      } else {
        user.expenses += t.amount
      }
      user.net = user.deposits - user.expenses
    })

    const users = Array.from(userMap.values())
    const balance = users.length === 2 ? Math.abs(users[0].net - users[1].net) : 0

    return { users, balance }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
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
          {/* User Balance Comparison - This part scrolls away */}
          <div className="mb-0">
            <h2 className="text-white text-lg font-semibold mb-3 text-center">Balance Overview</h2>
            <div className="grid grid-cols-2 gap-3">
              {getUserStats().users.map((user) => (
                <UserBalanceCard
                  key={user.id}
                  name={user.name}
                  netAmount={user.net}
                  deposits={user.deposits}
                  expenses={user.expenses}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Section: Balance Bar and Filters - This sticks to top when scrolling */}
      <div className="sticky top-0 z-10 bg-emerald-600 shadow-md">
        <div className="container mx-auto px-3 sm:px-4 pt-2 pb-4 max-w-7xl">
          {getUserStats().users.length === 2 && (
            <BalanceBar
              user1Name={getUserStats().users[0].name}
              user2Name={getUserStats().users[1].name}
              user1Net={getUserStats().users[0].net}
              user2Net={getUserStats().users[1].net}
            />
          )}

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
        />
      </div>
    </div>
  )
}
