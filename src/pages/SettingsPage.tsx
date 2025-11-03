import { useEffect, useRef, useState } from 'react'
import * as XLSX from 'xlsx'

import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import CachedIcon from '@mui/icons-material/Cached'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import CloudSyncIcon from '@mui/icons-material/CloudSync'
import DownloadIcon from '@mui/icons-material/Download'
import EmailIcon from '@mui/icons-material/Email'
import InfoIcon from '@mui/icons-material/Info'
import LockIcon from '@mui/icons-material/Lock'
import LogoutIcon from '@mui/icons-material/Logout'
import RefreshIcon from '@mui/icons-material/Refresh'
import SaveIcon from '@mui/icons-material/Save'
import SyncIcon from '@mui/icons-material/Sync'
import VisibilityIcon from '@mui/icons-material/Visibility'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'

import { Alert } from '../components/common/Alert'
import { useAuth } from '../hooks/useAuth'
import { useOffline } from '../hooks/useOffline'
import { usePWAUpdate } from '../hooks/usePWAUpdate'
import { transactionService } from '../services/transaction.service'
import { userService } from '../services/user.service'
import { formatDate } from '../utils/formatters'
import { logger } from '../utils/logger'

import type { SettingsPageProps } from '../types'

export const SettingsPage = ({ user }: SettingsPageProps) => {
  const { refreshUserProfile, signOut, updatePassword } = useAuth()
  const { isOnline, isSyncing, lastSync, syncQueueCount, triggerSync } = useOffline()
  const { needRefresh, checkForUpdate, forceUpdate } = usePWAUpdate()
  const [firstname, setFirstname] = useState(user.firstname || user.user_metadata?.firstname || '')
  const [surname, setSurname] = useState(user.surname || user.user_metadata?.surname || '')
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [isClearing, setIsClearing] = useState(false)
  const [isCheckingUpdate, setIsCheckingUpdate] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Password change state
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null)

  // Debug mode state
  const [debugMode, setDebugMode] = useState(logger.isDebugEnabled())

  // Ref to store timeout IDs for cleanup
  const timeoutRefs = useRef<number[]>([])

  // Cleanup all timeouts on unmount
  useEffect(() => {
    return () => {
      timeoutRefs.current.forEach((timeoutId) => clearTimeout(timeoutId))
      timeoutRefs.current = []
    }
  }, [])

  // Helper function to set timeout with cleanup tracking
  const setTrackedTimeout = (callback: () => void, delay: number) => {
    const timeoutId = setTimeout(() => {
      callback()
      // Remove this timeout from tracking after it executes
      timeoutRefs.current = timeoutRefs.current.filter((id) => id !== timeoutId)
    }, delay) as unknown as number
    timeoutRefs.current.push(timeoutId)
    return timeoutId
  }

  const handleClearCache = async () => {
    setIsClearing(true)
    setError(null)
    setSuccess(null)

    try {
      // Unregister service workers
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations()
        for (const registration of registrations) {
          await registration.unregister()
        }
      }

      // Clear all caches
      if ('caches' in window) {
        const cacheNames = await caches.keys()
        await Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)))
      }

      setSuccess('Cache cleared successfully! Reloading...')

      // Reload the page after a short delay
      setTrackedTimeout(() => {
        window.location.reload()
      }, 1500)
    } catch (err) {
      console.error('Error clearing cache:', err)
      setError('Failed to clear cache. Please try again.')
      setIsClearing(false)
    }
  }

  const handleExportToExcel = async () => {
    setIsExporting(true)
    setError(null)
    setSuccess(null)

    try {
      // Fetch all transactions
      const transactions = await transactionService.getAll()

      // Prepare data for Excel
      const excelData = transactions.map((t) => ({
        Date: formatDate(t.transaction_date),
        User: `${t.user_firstname} ${t.user_surname}`,
        Category: t.category_name || 'Deposit',
        Type: t.type === 'deposit' ? 'Deposit' : 'Expense',
        Amount: t.amount,
        Description: t.description || '',
      }))

      // Create worksheet and workbook
      const ws = XLSX.utils.json_to_sheet(excelData)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'Transactions')

      // Generate filename with current date
      const filename = `transactions_${new Date().toISOString().split('T')[0]}.xlsx`

      // Save file
      XLSX.writeFile(wb, filename)

      setSuccess('Transactions exported successfully!')
      setTrackedTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      console.error('Error exporting transactions:', err)
      setError('Failed to export transactions. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  const handleSave = async () => {
    if (!user.id) {
      setError('User ID is required')
      return
    }

    setIsSaving(true)
    setError(null)
    setSuccess(null)

    try {
      await userService.updateByUserId(user.id, {
        firstname,
        surname,
      })

      // Refresh the user profile in auth state
      await refreshUserProfile()

      setSuccess('Profile updated successfully!')
      setIsEditing(false)

      // Clear success message after 3 seconds
      setTrackedTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      console.error('Error saving profile:', err)
      setError('Failed to save profile. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setFirstname(user.firstname || user.user_metadata?.firstname || '')
    setSurname(user.surname || user.user_metadata?.surname || '')
    setError(null)
    setSuccess(null)
    setIsEditing(false)
  }

  const handlePasswordChange = async () => {
    setPasswordError(null)
    setPasswordSuccess(null)

    // Validate inputs
    if (!newPassword || !confirmPassword) {
      setPasswordError('Please fill in all password fields')
      return
    }

    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters long')
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match')
      return
    }

    setIsChangingPassword(true)

    try {
      await updatePassword(newPassword)
      setPasswordSuccess('Password updated successfully!')

      // Clear form
      setNewPassword('')
      setConfirmPassword('')

      // Clear success message after 3 seconds
      setTrackedTimeout(() => setPasswordSuccess(null), 3000)
    } catch (err) {
      console.error('Error updating password:', err)
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to update password. Please try again.'
      setPasswordError(errorMessage)
    } finally {
      setIsChangingPassword(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Top Section with Emerald Green Background - Fixed */}
      <div
        className="fixed top-0 left-0 right-0 bg-emerald-600 z-40 shadow-lg backdrop-blur-sm"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 max-w-3xl">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Settings</h1>
          <p className="text-white/80 text-sm">Manage your account information</p>
        </div>
      </div>

      {/* Content Section */}
      <div
        className="container mx-auto px-3 sm:px-4 py-6 max-w-3xl space-y-6"
        style={{
          paddingTop: 'calc(8rem + env(safe-area-inset-top))',
        }}>
        {/* Profile Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          {/* Avatar Section */}
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-200">
            <div className="flex items-center justify-center bg-emerald-600 text-white rounded-full w-20 h-20">
              <AccountCircleIcon sx={{ fontSize: 48 }} />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">
                {firstname && surname ? `${firstname} ${surname}` : 'No name set'}
              </h2>
              <p className="text-gray-500 text-sm">{user.email}</p>
            </div>
          </div>

          {/* Edit Form */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>

            {/* First Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">First Name</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm disabled:bg-gray-50 disabled:text-gray-500"
                value={firstname}
                onChange={(e) => setFirstname(e.target.value)}
                disabled={!isEditing}
                placeholder="Enter your first name"
              />
            </div>

            {/* Surname */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Surname</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm disabled:bg-gray-50 disabled:text-gray-500"
                value={surname}
                onChange={(e) => setSurname(e.target.value)}
                disabled={!isEditing}
                placeholder="Enter your surname"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              {!isEditing ? (
                <button
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
                  onClick={() => setIsEditing(true)}>
                  Edit Profile
                </button>
              ) : (
                <>
                  <button
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleSave}
                    disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <SaveIcon sx={{ fontSize: 18 }} />
                        Save Changes
                      </>
                    )}
                  </button>
                  <button
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleCancel}
                    disabled={isSaving}>
                    Cancel
                  </button>
                </>
              )}
            </div>

            {/* Success Message */}
            {success && <Alert message={success} variant="success" />}

            {/* Error Message */}
            {error && <Alert message={error} variant="error" className="mt-4" />}
          </div>
        </div>

        {/* Account Information Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>

          <div className="space-y-4">
            {/* Email */}
            <div className="flex items-start gap-3">
              <EmailIcon sx={{ fontSize: 20 }} className="text-gray-400 mt-1" />
              <div className="flex-1">
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium text-gray-900">{user.email}</p>
              </div>
            </div>

            {/* User ID */}
            <div className="flex items-start gap-3">
              <AccountCircleIcon sx={{ fontSize: 20 }} className="text-gray-400 mt-1" />
              <div className="flex-1">
                <p className="text-sm text-gray-500">User ID</p>
                <p className="font-mono text-sm break-all text-gray-700">{user.id}</p>
              </div>
            </div>

            {/* Created Date */}
            {user.created_at && (
              <div className="flex items-start gap-3">
                <CalendarMonthIcon sx={{ fontSize: 20 }} className="text-gray-400 mt-1" />
                <div className="flex-1">
                  <p className="text-sm text-gray-500">Member Since</p>
                  <p className="font-medium text-gray-900">{formatDate(user.created_at)}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Password Change Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <LockIcon sx={{ fontSize: 24 }} className="text-emerald-600" />
            <h3 className="text-lg font-semibold text-gray-900">Change Password</h3>
          </div>

          <div className="space-y-4">
            {/* New Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">New Password</label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password (min 6 characters)"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showNewPassword ? (
                    <VisibilityOffIcon sx={{ fontSize: 20 }} />
                  ) : (
                    <VisibilityIcon sx={{ fontSize: 20 }} />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showConfirmPassword ? (
                    <VisibilityOffIcon sx={{ fontSize: 20 }} />
                  ) : (
                    <VisibilityIcon sx={{ fontSize: 20 }} />
                  )}
                </button>
              </div>
            </div>

            {/* Change Password Button */}
            <div className="pt-2">
              <button
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
                onClick={handlePasswordChange}
                disabled={isChangingPassword || !newPassword || !confirmPassword}>
                {isChangingPassword ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Updating...
                  </>
                ) : (
                  <>
                    <LockIcon sx={{ fontSize: 18 }} />
                    Update Password
                  </>
                )}
              </button>
            </div>

            {/* Password Success Message */}
            {passwordSuccess && <Alert message={passwordSuccess} variant="success" />}

            {/* Password Error Message */}
            {passwordError && <Alert message={passwordError} variant="error" />}
          </div>
        </div>

        {/* Data Export Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Export</h3>

          <p className="text-sm text-gray-600 mb-4">
            Export all household transactions to an Excel file for your records or analysis.
          </p>

          <button
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleExportToExcel}
            disabled={isExporting}>
            {isExporting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                Exporting...
              </>
            ) : (
              <>
                <DownloadIcon sx={{ fontSize: 18 }} />
                Export to Excel
              </>
            )}
          </button>
        </div>

        {/* Offline Sync Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <CloudSyncIcon sx={{ fontSize: 20 }} />
            Offline Sync
          </h3>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-xs text-gray-500 mb-1">Connection Status</p>
                <p
                  className={`text-sm font-semibold ${isOnline ? 'text-emerald-600' : 'text-orange-600'}`}>
                  {isOnline ? '🟢 Online' : '🔴 Offline'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Pending Items</p>
                <p className="text-sm font-semibold text-gray-900">
                  {syncQueueCount} {syncQueueCount === 1 ? 'item' : 'items'}
                </p>
              </div>
            </div>

            {lastSync && (
              <div className="text-sm text-gray-600">
                <span className="font-medium">Last synced:</span>{' '}
                {new Date(lastSync).toLocaleString()}
              </div>
            )}

            <p className="text-sm text-gray-600">
              The app automatically syncs your data every 30 seconds when online. You can also
              manually trigger a sync anytime.
            </p>

            <button
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={async () => {
                setError(null)
                setSuccess(null)
                try {
                  await triggerSync()
                  setSuccess('Sync completed successfully!')
                  setTrackedTimeout(() => setSuccess(null), 3000)
                } catch (err) {
                  console.error('Sync error:', err)
                  setError('Sync failed. Please try again.')
                }
              }}
              disabled={isSyncing || !isOnline}>
              {isSyncing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Syncing...
                </>
              ) : (
                <>
                  <SyncIcon sx={{ fontSize: 18 }} />
                  {isOnline ? 'Sync Now' : 'Offline - Cannot Sync'}
                </>
              )}
            </button>
          </div>
        </div>

        {/* App Version Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <InfoIcon sx={{ fontSize: 20 }} />
            App Version
          </h3>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-xs text-gray-500 mb-1">Current Version</p>
                <p className="text-lg font-semibold text-gray-900">
                  v{import.meta.env.VITE_APP_VERSION || '1.0.1'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Build Date</p>
                <p className="text-sm font-medium text-gray-900">
                  {new Date(__BUILD_DATE__).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(__BUILD_DATE__).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>

            {needRefresh && (
              <div className="flex items-center gap-2 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                <span className="inline-block w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                <span className="text-sm font-medium text-emerald-700">
                  Update Available - New version ready to install
                </span>
              </div>
            )}

            <p className="text-sm text-gray-600">
              Check for updates to ensure you have the latest features and bug fixes. The app
              automatically checks for updates every 60 seconds.
            </p>

            <div className="flex gap-2">
              <button
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={async () => {
                  setIsCheckingUpdate(true)
                  setError(null)
                  setSuccess(null)
                  try {
                    await checkForUpdate()
                    setSuccess('Checked for updates!')
                    setTrackedTimeout(() => setSuccess(null), 3000)
                  } catch (err) {
                    console.error('Check update error:', err)
                    setError('Failed to check for updates.')
                  } finally {
                    setIsCheckingUpdate(false)
                  }
                }}
                disabled={isCheckingUpdate}>
                {isCheckingUpdate ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Checking...
                  </>
                ) : (
                  <>
                    <RefreshIcon sx={{ fontSize: 18 }} />
                    Check for Update
                  </>
                )}
              </button>

              {needRefresh && (
                <button
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
                  onClick={() => {
                    forceUpdate()
                  }}>
                  <DownloadIcon sx={{ fontSize: 18 }} />
                  Update Now
                </button>
              )}
            </div>
          </div>
        </div>

        {/* App Settings Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">App Settings</h3>

          <div className="space-y-4 mb-6">
            {/* Debug Mode Toggle */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-900 mb-1">Debug Mode</p>
                <p className="text-xs text-gray-600">
                  Show detailed console logs for troubleshooting
                  {import.meta.env.DEV && ' (Always on in development)'}
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={debugMode}
                  onChange={(e) => {
                    const enabled = e.target.checked
                    setDebugMode(enabled)
                    logger.setDebugMode(enabled)
                    setSuccess(`Debug mode ${enabled ? 'enabled' : 'disabled'}`)
                    setTrackedTimeout(() => setSuccess(null), 2000)
                  }}
                  className="sr-only peer"
                  disabled={import.meta.env.DEV}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600 peer-disabled:opacity-50 peer-disabled:cursor-not-allowed"></div>
              </label>
            </div>
          </div>

          <p className="text-sm text-gray-600 mb-4">
            Clear cached data and refresh the app. This will unregister the service worker and clear
            all cached files.
          </p>

          <button
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleClearCache}
            disabled={isClearing}>
            {isClearing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                Clearing...
              </>
            ) : (
              <>
                <CachedIcon sx={{ fontSize: 18 }} />
                Clear Cache & Reload
              </>
            )}
          </button>
        </div>

        {/* Logout Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Sign Out</h3>

          <p className="text-sm text-gray-600 mb-4">
            Sign out of your account and return to the login screen.
          </p>

          <button
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
            onClick={signOut}>
            <LogoutIcon sx={{ fontSize: 18 }} />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  )
}
