import { useState } from 'react'
import { Link } from 'react-router-dom'

import EmailIcon from '@mui/icons-material/Email'
import LockIcon from '@mui/icons-material/Lock'
import LoginIcon from '@mui/icons-material/Login'
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong'

import { Alert } from '../common/Alert'

import type { LoginFormProps } from '../../types'

export const LoginForm = ({ onSubmit, isLoading = false }: LoginFormProps) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    try {
      await onSubmit({ email, password })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during login')
    }
  }

  return (
    <div className="h-screen overflow-hidden flex items-center justify-center bg-linear-to-br from-emerald-500 to-emerald-700 px-4">
      <div className="w-full max-w-md">
        {/* Logo/Brand Section */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-3xl mb-3 shadow-xl">
            <ReceiptLongIcon sx={{ fontSize: 36 }} className="text-emerald-600" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-1">Transactions App</h1>
          <p className="text-white/80 text-sm">Manage your finances together</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-6">
          <h2 className="text-xl font-bold text-gray-800 text-center mb-5">Welcome Back</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <Alert message={error} variant="error" showIcon={false} />}

            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <EmailIcon
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  sx={{ fontSize: 18 }}
                />
                <input
                  type="email"
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-base text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <LockIcon
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  sx={{ fontSize: 18 }}
                />
                <input
                  type="password"
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-base text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  autoComplete="current-password"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full mt-2 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}>
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <LoginIcon sx={{ fontSize: 18 }} />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>

          {/* Forgot Password Link */}
          <div className="text-center mt-4">
            <Link
              to="/forgot-password"
              className="text-sm text-emerald-600 hover:text-emerald-700 font-medium transition-colors">
              Forgot your password?
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-4 text-xs text-white/70">
          <p>By signing in, you agree to our Terms of Service and Privacy Policy</p>
        </div>
      </div>
    </div>
  )
}
