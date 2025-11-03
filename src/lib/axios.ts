import axios from 'axios'

import { addEnvironmentHeaders } from '../utils/environment'
import { supabase } from './supabase'

// Create axios instance with default config
// Note: baseURL is not set here because we use full URLs from env variables
export const apiClient = axios.create({
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor for adding auth token and environment headers
apiClient.interceptors.request.use(
  async (config) => {
    // Get current Supabase session
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`
    }

    // Add environment headers to help backend determine which database to use
    const envHeaders = addEnvironmentHeaders()
    Object.keys(envHeaders).forEach((key) => {
      config.headers[key] = envHeaders[key]
    })

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access (e.g., redirect to login)
      console.error('Unauthorized access - redirecting to login')
    }
    return Promise.reject(error)
  }
)
