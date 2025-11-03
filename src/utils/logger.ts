/**
 * Global Logger Utility
 * Centralized logging with debug mode control
 */

// Get initial debug state from localStorage
const getDebugState = (): boolean => {
  if (typeof window === 'undefined') return false
  const stored = localStorage.getItem('debug_mode')
  return stored === 'true' || import.meta.env.DEV
}

let debugEnabled = getDebugState()

export const logger = {
  /**
   * Enable or disable debug mode
   */
  setDebugMode(enabled: boolean) {
    debugEnabled = enabled
    if (typeof window !== 'undefined') {
      localStorage.setItem('debug_mode', enabled.toString())
    }
  },

  /**
   * Check if debug mode is enabled
   */
  isDebugEnabled(): boolean {
    return debugEnabled
  },

  /**
   * Debug log (only in dev or when debug mode is enabled)
   */
  debug(message: string, ...args: unknown[]) {
    if (debugEnabled) {
      console.log(`[DEBUG] ${message}`, ...args)
    }
  },

  /**
   * Info log (always shown)
   */
  info(message: string, ...args: unknown[]) {
    console.info(`[INFO] ${message}`, ...args)
  },

  /**
   * Warning log (always shown)
   */
  warn(message: string, ...args: unknown[]) {
    console.warn(`[WARN] ${message}`, ...args)
  },

  /**
   * Error log (always shown)
   */
  error(message: string, error?: unknown, ...args: unknown[]) {
    console.error(`[ERROR] ${message}`, error, ...args)

    // In production, you could send to error tracking service here
    if (import.meta.env.PROD) {
      // Example: sendToSentry(message, error)
    }
  },

  /**
   * Success log (only in debug mode)
   */
  success(message: string, ...args: unknown[]) {
    if (debugEnabled) {
      console.log(`[SUCCESS] ${message}`, ...args)
    }
  },
}
