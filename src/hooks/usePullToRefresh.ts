import { useEffect, useRef, useState } from 'react'

import type { PullToRefreshOptions } from '../types'

export const usePullToRefresh = ({
  onRefresh,
  threshold = 80,
  resistance = 2.5,
}: PullToRefreshOptions) => {
  const [isPulling, setIsPulling] = useState(false)
  const [pullDistance, setPullDistance] = useState(0)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const startY = useRef(0)
  const currentY = useRef(0)

  useEffect(() => {
    let touchStartY = 0

    const handleTouchStart = (e: TouchEvent) => {
      // Only enable pull-to-refresh if at the top of the page
      if (window.scrollY === 0) {
        touchStartY = e.touches[0].clientY
        startY.current = touchStartY
        setIsPulling(true)
      }
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (!isPulling || window.scrollY > 0) {
        setIsPulling(false)
        setPullDistance(0)
        return
      }

      currentY.current = e.touches[0].clientY
      const distance = currentY.current - startY.current

      if (distance > 0) {
        // Prevent default only when pulling down
        e.preventDefault()
        // Apply resistance to make it feel more natural
        const adjustedDistance = distance / resistance
        setPullDistance(adjustedDistance)
      }
    }

    const handleTouchEnd = async () => {
      if (pullDistance >= threshold && !isRefreshing) {
        setIsRefreshing(true)
        try {
          await onRefresh()
        } finally {
          setIsRefreshing(false)
        }
      }
      setIsPulling(false)
      setPullDistance(0)
    }

    document.addEventListener('touchstart', handleTouchStart, { passive: true })
    document.addEventListener('touchmove', handleTouchMove, { passive: false })
    document.addEventListener('touchend', handleTouchEnd)

    return () => {
      document.removeEventListener('touchstart', handleTouchStart)
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleTouchEnd)
    }
  }, [isPulling, pullDistance, threshold, isRefreshing, onRefresh, resistance])

  return {
    isPulling,
    pullDistance,
    isRefreshing,
    shouldTrigger: pullDistance >= threshold,
  }
}
