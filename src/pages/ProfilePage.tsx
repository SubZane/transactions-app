import { useState } from 'react'

import {
  CalendarIcon,
  CircleStackIcon,
  EnvelopeIcon,
  UserCircleIcon,
} from '@heroicons/react/24/solid'

import { useAuth } from '../hooks/useAuth'
import { userService } from '../services/user.service'

interface ProfilePageProps {
  user: {
    id: string
    email?: string
    firstname?: string
    surname?: string
    user_metadata?: {
      firstname?: string
      surname?: string
    }
    created_at?: string
  }
}

export const ProfilePage = ({ user }: ProfilePageProps) => {
  const { refreshUserProfile } = useAuth()
  const [firstname, setFirstname] = useState(user.firstname || user.user_metadata?.firstname || '')
  const [surname, setSurname] = useState(user.surname || user.user_metadata?.surname || '')
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSave = async () => {
    if (!user.id) {
      setError('User ID is required')
      return
    }

    setIsSaving(true)
    setError(null)

    try {
      await userService.updateByUserId(user.id, {
        firstname,
        surname,
      })

      // Refresh the user profile in auth state
      await refreshUserProfile()

      setIsEditing(false)
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
    setIsEditing(false)
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Profile</h1>
        <p className="text-base-content/60">Manage your account information</p>
      </div>

      {/* Profile Card */}
      <div className="card bg-base-100 shadow-xl border border-base-300 mb-6">
        <div className="card-body">
          {/* Avatar Section */}
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-base-300">
            <div className="avatar placeholder">
              <div className="bg-primary text-primary-content rounded-full w-20 h-20">
                <UserCircleIcon className="h-12 w-12" />
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-semibold">
                {firstname && surname ? `${firstname} ${surname}` : 'No name set'}
              </h2>
              <p className="text-base-content/60">{user.email}</p>
            </div>
          </div>

          {/* Edit Form */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4">Personal Information</h3>

            {/* First Name */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">First Name</span>
              </label>
              <input
                type="text"
                className="input input-bordered w-full"
                value={firstname}
                onChange={(e) => setFirstname(e.target.value)}
                disabled={!isEditing}
                placeholder="Enter your first name"
              />
            </div>

            {/* Surname */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Surname</span>
              </label>
              <input
                type="text"
                className="input input-bordered w-full"
                value={surname}
                onChange={(e) => setSurname(e.target.value)}
                disabled={!isEditing}
                placeholder="Enter your surname"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              {!isEditing ? (
                <button className="btn btn-soft-primary" onClick={() => setIsEditing(true)}>
                  Edit Profile
                </button>
              ) : (
                <>
                  <button className="btn btn-primary" onClick={handleSave} disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <span className="loading loading-spinner loading-sm"></span>
                        Saving...
                      </>
                    ) : (
                      <>
                        <CircleStackIcon className="h-5 w-5" />
                        Save Changes
                      </>
                    )}
                  </button>
                  <button
                    className="btn btn-soft-secondary"
                    onClick={handleCancel}
                    disabled={isSaving}
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="alert alert-error mt-4">
                <span>{error}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Account Information Card */}
      <div className="card bg-base-100 shadow-xl border border-base-300">
        <div className="card-body">
          <h3 className="text-lg font-semibold mb-4">Account Information</h3>

          <div className="space-y-4">
            {/* Email */}
            <div className="flex items-start gap-3">
              <EnvelopeIcon className="h-5 w-5 text-base-content/60 mt-1" />
              <div className="flex-1">
                <p className="text-sm text-base-content/60">Email</p>
                <p className="font-medium">{user.email}</p>
              </div>
            </div>

            {/* User ID */}
            <div className="flex items-start gap-3">
              <UserCircleIcon className="h-5 w-5 text-base-content/60 mt-1" />
              <div className="flex-1">
                <p className="text-sm text-base-content/60">User ID</p>
                <p className="font-mono text-sm break-all">{user.id}</p>
              </div>
            </div>

            {/* Created Date */}
            {user.created_at && (
              <div className="flex items-start gap-3">
                <CalendarIcon className="h-5 w-5 text-base-content/60 mt-1" />
                <div className="flex-1">
                  <p className="text-sm text-base-content/60">Member Since</p>
                  <p className="font-medium">
                    {new Date(user.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
