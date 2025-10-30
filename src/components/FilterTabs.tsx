import { useState } from 'react'

import FilterListIcon from '@mui/icons-material/FilterList'
import SearchIcon from '@mui/icons-material/Search'

interface FilterTabsProps {
  activeFilter: 'all' | 'deposit' | 'expense'
  onFilterChange: (filter: 'all' | 'deposit' | 'expense') => void
  searchQuery?: string
  onSearchChange?: (query: string) => void
}

export const FilterTabs = ({
  activeFilter,
  onFilterChange,
  searchQuery = '',
  onSearchChange,
}: FilterTabsProps) => {
  const [showFilterMenu, setShowFilterMenu] = useState(false)

  return (
    <div className="flex gap-3 items-center max-w-2xl mx-auto">
      {/* Search Field */}
      <div className="flex-1 relative">
        <SearchIcon
          className="absolute left-4 top-1/2 -translate-y-1/2 text-white pointer-events-none z-10"
          sx={{ fontSize: 20 }}
        />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange?.(e.target.value)}
          placeholder="Search"
          className="w-full pl-11 pr-4 py-2.5 bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/50 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
        />
      </div>

      {/* Filter Dropdown Button */}
      <div className="relative">
        <button
          onClick={() => setShowFilterMenu(!showFilterMenu)}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-full text-sm transition-all">
          <FilterListIcon sx={{ fontSize: 20 }} />
          Filter
        </button>

        {/* Dropdown Menu */}
        {showFilterMenu && (
          <>
            {/* Backdrop to close menu */}
            <div className="fixed inset-0 z-10" onClick={() => setShowFilterMenu(false)} />
            {/* Menu */}
            <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-xl z-20 overflow-hidden">
              <button
                onClick={() => {
                  onFilterChange('all')
                  setShowFilterMenu(false)
                }}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                  activeFilter === 'all'
                    ? 'bg-emerald-50 text-emerald-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}>
                All Transactions
              </button>
              <button
                onClick={() => {
                  onFilterChange('deposit')
                  setShowFilterMenu(false)
                }}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                  activeFilter === 'deposit'
                    ? 'bg-emerald-50 text-emerald-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}>
                Deposits
              </button>
              <button
                onClick={() => {
                  onFilterChange('expense')
                  setShowFilterMenu(false)
                }}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                  activeFilter === 'expense'
                    ? 'bg-emerald-50 text-emerald-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}>
                Expenses
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
