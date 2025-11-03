/**
 * UpdatePrompt Component
 * Prompts user to reload when a new version is available
 */

import './UpdatePrompt.css'

import { useEffect, useRef } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'

export const UpdatePrompt = () => {
  const intervalRef = useRef<number | null>(null)

  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(registration: ServiceWorkerRegistration | undefined) {
      if (registration) {
        // Check for updates every 60 seconds
        intervalRef.current = setInterval(() => {
          registration.update()
        }, 60000) as unknown as number
      }
    },
    onRegisterError(error: Error) {
      console.error('SW registration error', error)
    },
  })

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  const handleUpdate = () => {
    updateServiceWorker(true)
  }

  const handleDismiss = () => {
    setNeedRefresh(false)
  }

  if (!needRefresh) return null

  return (
    <div className="update-prompt">
      <div className="update-prompt__content">
        <div className="update-prompt__icon">🎉</div>
        <div className="update-prompt__text">
          <h3 className="update-prompt__title">Update Available!</h3>
          <p className="update-prompt__message">
            A new version of the app is ready. Reload to get the latest features and improvements.
          </p>
        </div>
        <div className="update-prompt__actions">
          <button
            onClick={handleUpdate}
            className="update-prompt__button update-prompt__button--primary"
          >
            Update Now
          </button>
          <button
            onClick={handleDismiss}
            className="update-prompt__button update-prompt__button--secondary"
          >
            Later
          </button>
        </div>
      </div>
    </div>
  )
}
