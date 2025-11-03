import CachedIcon from '@mui/icons-material/Cached'

import type { PullToRefreshIndicatorProps } from '../../types'

export const PullToRefreshIndicator = ({
  pullDistance,
  isRefreshing,
  shouldTrigger,
}: PullToRefreshIndicatorProps) => {
  if (pullDistance === 0 && !isRefreshing) return null

  const opacity = Math.min(pullDistance / 80, 1)
  const rotation = isRefreshing ? 360 : pullDistance * 4

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 flex justify-center pointer-events-none"
      style={{
        transform: `translateY(${isRefreshing ? 60 : pullDistance}px)`,
        transition: isRefreshing || pullDistance === 0 ? 'transform 0.3s ease' : 'none',
      }}>
      <div
        className={`flex items-center justify-center w-10 h-10 rounded-full ${
          shouldTrigger || isRefreshing ? 'bg-emerald-600' : 'bg-gray-400'
        } shadow-lg`}
        style={{ opacity }}>
        <CachedIcon
          sx={{ fontSize: 24 }}
          className={`text-white ${isRefreshing ? 'animate-spin' : ''}`}
          style={{
            transform: isRefreshing ? 'none' : `rotate(${rotation}deg)`,
            transition: 'transform 0.1s ease',
          }}
        />
      </div>
    </div>
  )
}
