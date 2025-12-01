// Component prop interfaces

import type { Transaction } from './api.types'

export interface BalanceBarProps {
  user1Name: string
  user2Name: string
  user1Net: number
  user2Net: number
}

export interface BalanceCardProps {
  label: string
  amount: number
  variant?: 'default' | 'positive' | 'negative'
  size?: 'small' | 'medium' | 'large'
}

export interface UserBalanceCardProps {
  name: string
  netAmount: number
  deposits: number
  expenses: number
}

export interface BalanceSummaryProps {
  netBalance: number
  totalDeposits: number
  totalExpenses: number
  title?: string
}

export interface FilterTabsProps {
  activeFilter: 'all' | 'withdrawal' | 'expense'
  onFilterChange: (filter: 'all' | 'withdrawal' | 'expense') => void
  searchQuery?: string
  onSearchChange?: (query: string) => void
}

export interface HeaderProps {
  user: {
    id: string
    email?: string
    firstname?: string
    surname?: string
    user_metadata?: {
      firstname?: string
      surname?: string
    }
    created_at?: string
  } | null
  onLogout: () => void
}

export interface LoginFormProps {
  onSubmit: (credentials: { email: string; password: string }) => Promise<unknown>
  isLoading?: boolean
}

export interface SettingsPageProps {
  user: {
    id: string
    email?: string
    firstname?: string
    surname?: string
    user_metadata?: {
      firstname?: string
      surname?: string
    }
    created_at?: string
  }
}

export interface PullToRefreshIndicatorProps {
  pullDistance: number
  isRefreshing: boolean
  shouldTrigger: boolean
}

export interface TransactionListProps {
  transactions: Transaction[]
  isLoading?: boolean
  error?: string | null
  emptyMessage?: string
  emptyDescription?: string
  searchQuery?: string
}

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}
