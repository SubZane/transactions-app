import { useState } from 'react'
import * as XLSX from 'xlsx'

import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import CachedIcon from '@mui/icons-material/Cached'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import DownloadIcon from '@mui/icons-material/Download'
import EmailIcon from '@mui/icons-material/Email'
import LogoutIcon from '@mui/icons-material/Logout'
import SaveIcon from '@mui/icons-material/Save'

import { Alert } from '../components/common/Alert'
import { useAuth } from '../hooks/useAuth'
import { transactionService } from '../services/transaction.service'
import { userService } from '../services/user.service'
import { formatDate } from '../utils/formatters'

import type { ProfilePageProps } from '../types'

export const ProfilePage = ({ user }: ProfilePageProps) => {
  const { refreshUserProfile, signOut } = useAuth()
  const [firstname, setFirstname] = useState(user.firstname || user.user_metadata?.firstname || '')
  const [surname, setSurname] = useState(user.surname || user.user_metadata?.surname || '')
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [isClearing, setIsClearing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

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
      setTimeout(() => {
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
      setTimeout(() => setSuccess(null), 3000)
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
      setTimeout(() => setSuccess(null), 3000)
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

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Top Section with Emerald Green Background - Fixed */}
      <div
        className="fixed top-0 left-0 right-0 bg-emerald-600 z-40 shadow-lg backdrop-blur-sm"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 max-w-3xl">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Profile</h1>
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

        {/* App Settings Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">App Settings</h3>

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
