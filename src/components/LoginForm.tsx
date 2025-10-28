import { useState } from 'react'

import {
  ArrowRightOnRectangleIcon,
  EnvelopeIcon,
  ExclamationCircleIcon,
  LockClosedIcon,
} from '@heroicons/react/24/solid'

import type { LoginCredentials } from '../types/auth.types'

interface LoginFormProps {
  onSubmit: (credentials: LoginCredentials) => Promise<unknown>
  isLoading?: boolean
}

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
    <div className="w-full max-w-md">
      {/* Logo/Brand Section */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl mb-4 shadow-lg">
          <ArrowRightOnRectangleIcon className="h-8 w-8 text-primary-content" />
        </div>
        <h1 className="text-3xl font-bold text-base-content">Transactions App</h1>
        <p className="text-base-content/60 mt-2">Sign in to manage your transactions</p>
      </div>

      {/* Login Card */}
      <div className="card bg-base-100 shadow-2xl border border-base-300">
        <div className="card-body p-8">
          <h2 className="text-2xl font-semibold text-center mb-6">Welcome Back</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="alert alert-error shadow-lg">
                <ExclamationCircleIcon className="h-6 w-6" />
                <span>{error}</span>
              </div>
            )}

            {/* Email Input */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Email Address</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <EnvelopeIcon className="h-5 w-5 text-base-content/40" />
                </div>
                <input
                  type="email"
                  placeholder="you@example.com"
                  className="input input-bordered w-full pl-12 focus:input-primary"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Password</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <LockClosedIcon className="h-5 w-5 text-base-content/40" />
                </div>
                <input
                  type="password"
                  placeholder="Enter your password"
                  className="input input-bordered w-full pl-12 focus:input-primary"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  autoComplete="current-password"
                />
              </div>
            </div>

            {/* Remember Me */}
            <div className="form-control">
              <label className="label cursor-pointer justify-start gap-3">
                <input type="checkbox" className="checkbox checkbox-primary checkbox-sm" />
                <span className="label-text">Remember me for 30 days</span>
              </label>
            </div>

            {/* Submit Button */}
            <div className="form-control mt-8">
              <button
                type="submit"
                className="btn btn-soft-primary btn-lg w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="loading loading-spinner"></span>
                    Signing in...
                  </>
                ) : (
                  <>
                    <ArrowRightOnRectangleIcon className="h-5 w-5" />
                    Sign In
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center mt-8 text-sm text-base-content/50">
        <p>By signing in, you agree to our Terms of Service and Privacy Policy</p>
      </div>
    </div>
  )
}
