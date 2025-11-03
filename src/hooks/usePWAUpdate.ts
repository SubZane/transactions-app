/**
 * usePWAUpdate Hook
 * Provides access to PWA update functionality
 */

import { useRegisterSW } from 'virtual:pwa-register/react'

export const usePWAUpdate = () => {
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW()

  const checkForUpdate = async () => {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration()
      if (registration) {
        await registration.update()
      }
    }
  }

  const forceUpdate = () => {
    updateServiceWorker(true)
  }

  return {
    needRefresh,
    checkForUpdate,
    forceUpdate,
  }
}
