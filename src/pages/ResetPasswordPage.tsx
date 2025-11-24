import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import LockIcon from '@mui/icons-material/Lock'
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong'
import SaveIcon from '@mui/icons-material/Save'
import VisibilityIcon from '@mui/icons-material/Visibility'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'

import { Alert } from '../components/common/Alert'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'

export const ResetPasswordPage = () => {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState('')
  const [isValidSession, setIsValidSession] = useState<boolean | null>(null)

  const navigate = useNavigate()
  const { updatePassword } = useAuth()

  useEffect(() => {
    // Check if there's a valid recovery session
    const checkSession = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession()
      if (error || !session) {
        setIsValidSession(false)
      } else {
        setIsValidSession(true)
      }
    }
    checkSession()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setIsLoading(true)

    try {
      await updatePassword(password)
      setIsSuccess(true)

      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/')
      }, 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update password')
    } finally {
      setIsLoading(false)
    }
  }

  if (isValidSession === null) {
    return (
      <div className="h-screen overflow-hidden flex items-center justify-center bg-linear-to-br from-emerald-500 to-emerald-700">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    )
  }

  if (isValidSession === false) {
    return (
      <div className="h-screen overflow-hidden flex items-center justify-center bg-linear-to-br from-emerald-500 to-emerald-700 px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-3xl mb-3 shadow-xl">
              <ReceiptLongIcon sx={{ fontSize: 36 }} className="text-emerald-600" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-1">Transactions App</h1>
          </div>

          <div className="bg-white rounded-2xl shadow-2xl p-6">
            <Alert
              message="Invalid or expired reset link. Please request a new password reset."
              variant="error"
              showIcon={false}
            />
            <div className="mt-4">
              <Link
                to="/forgot-password"
                className="block w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors text-center">
                Request New Link
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (isSuccess) {
    return (
      <div className="h-screen overflow-hidden flex items-center justify-center bg-linear-to-br from-emerald-500 to-emerald-700 px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-3xl mb-3 shadow-xl">
              <ReceiptLongIcon sx={{ fontSize: 36 }} className="text-emerald-600" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-1">Transactions App</h1>
          </div>

          <div className="bg-white rounded-2xl shadow-2xl p-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-4">
                <CheckCircleIcon sx={{ fontSize: 36 }} className="text-emerald-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-3">Password Updated!</h2>
              <p className="text-gray-600 mb-6">
                Your password has been successfully updated. You will be redirected to the login
                page shortly.
              </p>
              <Link
                to="/"
                className="inline-block w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors text-center">
                Go to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen overflow-hidden flex items-center justify-center bg-linear-to-br from-emerald-500 to-emerald-700 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-3xl mb-3 shadow-xl">
            <ReceiptLongIcon sx={{ fontSize: 36 }} className="text-emerald-600" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-1">Transactions App</h1>
          <p className="text-white/80 text-sm">Set your new password</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-6">
          <h2 className="text-xl font-bold text-gray-800 text-center mb-5">Reset Password</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <Alert message={error} variant="error" showIcon={false} />}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">New Password</label>
              <div className="relative">
                <LockIcon
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  sx={{ fontSize: 18 }}
                />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter new password"
                  className="w-full pl-10 pr-12 py-2.5 border border-gray-300 rounded-lg text-base text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? (
                    <VisibilityOffIcon sx={{ fontSize: 18 }} />
                  ) : (
                    <VisibilityIcon sx={{ fontSize: 18 }} />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <LockIcon
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  sx={{ fontSize: 18 }}
                />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm new password"
                  className="w-full pl-10 pr-12 py-2.5 border border-gray-300 rounded-lg text-base text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                  {showConfirmPassword ? (
                    <VisibilityOffIcon sx={{ fontSize: 18 }} />
                  ) : (
                    <VisibilityIcon sx={{ fontSize: 18 }} />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-2 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}>
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <SaveIcon sx={{ fontSize: 18 }} />
                  <span>Update Password</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
