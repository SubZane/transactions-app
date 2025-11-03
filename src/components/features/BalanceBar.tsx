import type { BalanceBarProps } from '../../types'
import { formatCurrency } from '../../utils/formatters'

export const BalanceBar = ({ user1Name, user2Name, user1Net, user2Net }: BalanceBarProps) => {
  const balance = Math.abs(user1Net - user2Net)
  const total = Math.abs(user1Net) + Math.abs(user2Net)
  const user1Percent = total > 0 ? (Math.abs(user1Net) / total) * 100 : 50
  const user2Percent = total > 0 ? (Math.abs(user2Net) / total) * 100 : 50

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 mb-4">
      <div className="flex items-center justify-between mb-2 text-xs text-white/80">
        <span>{user1Name}</span>
        <span className="text-white font-medium">
          {balance === 0 ? 'Equal' : `${formatCurrency(balance)} apart`}
        </span>
        <span>{user2Name}</span>
      </div>
      <div className="relative h-8 bg-white/20 rounded-full overflow-hidden">
        <div className="absolute inset-0 flex">
          <div
            className="bg-amber-400 flex items-center justify-center text-white text-xs font-semibold transition-all duration-500"
            style={{ width: `${user1Percent}%` }}>
            {user1Percent > 15 && `${Math.round(user1Percent)}%`}
          </div>
          <div
            className="bg-teal-400 flex items-center justify-center text-white text-xs font-semibold transition-all duration-500"
            style={{ width: `${user2Percent}%` }}>
            {user2Percent > 15 && `${Math.round(user2Percent)}%`}
          </div>
        </div>
      </div>
    </div>
  )
}
