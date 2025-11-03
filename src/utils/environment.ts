/**
 * Environment Detection Service
 * Determines the current environment and configures API endpoints accordingly
 */

type Environment = 'development' | 'preview' | 'server'

interface EnvironmentConfig {
  environment: Environment
  apiBaseUrl: string
  isDevelopment: boolean
  isPreview: boolean
  isServer: boolean
}

/**
 * Detect the current environment based on various factors
 */
function detectEnvironment(): Environment {
  // Check if we're in Vite build mode
  const mode = import.meta.env.MODE

  if (mode === 'server') {
    return 'server'
  }

  // Check current URL
  const hostname = window.location.hostname
  const port = window.location.port

  // Preview mode detection
  if (
    (hostname === 'localhost' && (port === '3000' || port === '4173')) ||
    hostname.includes('preview') ||
    mode === 'preview'
  ) {
    return 'preview'
  }

  // Development mode detection
  if (
    (hostname === 'localhost' && port === '5173') ||
    hostname === '127.0.0.1' ||
    mode === 'development'
  ) {
    return 'development'
  }

  // Default to server for production domains
  return 'server'
}

/**
 * Get the API base URL for the current environment
 */
function getApiBaseUrl(): string {
  const environment = detectEnvironment()

  // For local development, assume PHP backend is running alongside
  if (environment === 'development' || environment === 'preview') {
    // Adjust this based on where your PHP backend is hosted locally
    return window.location.origin + '/backend'
  }

  // For server/production, use the full backend URL
  return window.location.origin + '/backend'
}

/**
 * Get environment configuration
 */
export function getEnvironmentConfig(): EnvironmentConfig {
  const environment = detectEnvironment()

  return {
    environment,
    apiBaseUrl: getApiBaseUrl(),
    isDevelopment: environment === 'development',
    isPreview: environment === 'preview',
    isServer: environment === 'server',
  }
}

/**
 * Add environment header to API requests
 * This helps the PHP backend determine which database to use
 */
export function addEnvironmentHeaders(
  headers: Record<string, string> = {}
): Record<string, string> {
  const config = getEnvironmentConfig()

  return {
    ...headers,
    'X-App-Env': config.environment,
  }
}

/**
 * Log environment information (for debugging)
 */
export function logEnvironmentInfo(): void {
  const config = getEnvironmentConfig()

  if (config.isDevelopment) {
    console.log('🔧 Environment Config:', {
      environment: config.environment,
      apiBaseUrl: config.apiBaseUrl,
      mode: import.meta.env.MODE,
      hostname: window.location.hostname,
      port: window.location.port,
    })
  }
}

// Auto-log environment info in development
if (import.meta.env.DEV) {
  logEnvironmentInfo()
}
