/**
 * Application-wide constants
 */

// Locale Constants
export const LOCALE_EN_US = 'en-US'
export const LOCALE_SV_SE = 'sv-SE'

// Currency Constants
export const CURRENCY_SEK = 'SEK'

// Date Format Options
export const DATE_FORMAT_SHORT = {
  month: 'short' as const,
  day: 'numeric' as const,
  year: 'numeric' as const,
}

export const DATE_FORMAT_LONG = {
  year: 'numeric' as const,
  month: 'long' as const,
  day: 'numeric' as const,
}

export const DATE_FORMAT_MONTH_YEAR = {
  month: 'long' as const,
  year: 'numeric' as const,
}

// Transaction Types
export const TRANSACTION_TYPE_DEPOSIT = 'deposit'
export const TRANSACTION_TYPE_EXPENSE = 'expense'

// Minimum Transaction Amount
export const MIN_TRANSACTION_AMOUNT = 1
