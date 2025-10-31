/**
 * Utility functions for formatting data
 */

import {
  CURRENCY_SEK,
  DATE_FORMAT_LONG,
  DATE_FORMAT_MONTH_YEAR,
  DATE_FORMAT_SHORT,
  LOCALE_EN_US,
  LOCALE_SV_SE,
} from './constants'

/**
 * Formats a date to a readable string (long format)
 * @param date - Date to format
 * @param locale - Locale string (default: 'en-US')
 * @returns Formatted date string (e.g., "October 30, 2025")
 */
export const formatDate = (date: Date | string, locale = LOCALE_EN_US): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.toLocaleDateString(locale, DATE_FORMAT_LONG)
}

/**
 * Formats a date to a short readable string
 * @param date - Date to format
 * @param locale - Locale string (default: 'en-US')
 * @returns Formatted date string (e.g., "Oct 30, 2025")
 */
export const formatDateShort = (date: Date | string, locale = LOCALE_EN_US): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat(locale, DATE_FORMAT_SHORT).format(dateObj)
}

/**
 * Formats a date to show only month and year
 * @param date - Date to format
 * @param locale - Locale string (default: 'en-US')
 * @returns Formatted date string (e.g., "October 2025")
 */
export const formatMonthYear = (date: Date | string, locale = LOCALE_EN_US): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat(locale, DATE_FORMAT_MONTH_YEAR).format(dateObj)
}

/**
 * Formats a number as currency
 * @param amount - The amount to format
 * @param currency - Currency code (default: 'SEK')
 * @param locale - Locale for formatting (default: 'sv-SE')
 * @returns Formatted currency string
 */
export const formatCurrency = (
  amount: number,
  currency = CURRENCY_SEK,
  locale = LOCALE_SV_SE
): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Truncates a string to a specified length and adds ellipsis
 * @param text - Text to truncate
 * @param maxLength - Maximum length before truncating
 * @returns Truncated string
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength)}...`
}

/**
 * Converts a string to title case
 * @param text - Text to convert
 * @returns Title case string
 */
export const toTitleCase = (text: string): string => {
  return text
    .toLowerCase()
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}
