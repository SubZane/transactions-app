/**
 * UpdatePrompt Component
 * Prompts user to reload when a new version is available
 */

import './UpdatePrompt.css'

import { useRegisterSW } from 'virtual:pwa-register/react'

export const UpdatePrompt = () => {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(registration: ServiceWorkerRegistration | undefined) {
      if (registration) {
        // Check for updates every 60 seconds
        setInterval(() => {
          registration.update()
        }, 60000)
      }
    },
    onRegisterError(error: Error) {
      console.error('SW registration error', error)
    },
  })

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
            className="update-prompt__button update-prompt__button--primary">
            Update Now
          </button>
          <button
            onClick={handleDismiss}
            className="update-prompt__button update-prompt__button--secondary">
            Later
          </button>
        </div>
      </div>
    </div>
  )
}
