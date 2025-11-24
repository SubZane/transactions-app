import { useState } from 'react'
import { Link } from 'react-router-dom'

import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import EmailIcon from '@mui/icons-material/Email'
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong'
import SendIcon from '@mui/icons-material/Send'

import { Alert } from '../components/common/Alert'
import { useAuth } from '../hooks/useAuth'

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState('')

  const { resetPassword } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      await resetPassword(email)
      setIsSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send reset email')
    } finally {
      setIsLoading(false)
    }
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
              <h2 className="text-xl font-bold text-gray-800 mb-3">Check Your Email</h2>
              <p className="text-gray-600 mb-6">
                We've sent a password reset link to <strong>{email}</strong>. Click the link in the
                email to reset your password.
              </p>
              <Link
                to="/"
                className="inline-block w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors text-center">
                Back to Login
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
          <p className="text-white/80 text-sm">Reset your password</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-6">
          <h2 className="text-xl font-bold text-gray-800 text-center mb-2">Forgot Password?</h2>
          <p className="text-sm text-gray-600 text-center mb-5">
            Enter your email address and we'll send you a link to reset your password.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <Alert message={error} variant="error" showIcon={false} />}

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

            <button
              type="submit"
              className="w-full mt-2 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}>
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <SendIcon sx={{ fontSize: 18 }} />
                  <span>Send Reset Link</span>
                </>
              )}
            </button>
          </form>

          <div className="text-center mt-4">
            <Link
              to="/"
              className="inline-flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-700 font-medium transition-colors">
              <ArrowBackIcon sx={{ fontSize: 16 }} />
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
