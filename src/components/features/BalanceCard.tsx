import type { BalanceCardProps } from '../../types'
import { formatCurrency } from '../../utils/formatters'

export const BalanceCard = ({ label, amount, size = 'medium' }: BalanceCardProps) => {
  const getTextSize = () => {
    if (size === 'small') return 'text-xl'
    if (size === 'large') return 'text-3xl'
    return 'text-2xl'
  }

  const getLabelSize = () => {
    if (size === 'small') return 'text-[10px]'
    if (size === 'large') return 'text-xs'
    return 'text-xs'
  }

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2">
      <div className={`text-white/70 ${getLabelSize()} mb-1`}>{label}</div>
      <div className={`text-green-200 font-semibold ${getTextSize()}`}>
        {formatCurrency(amount)}
      </div>
    </div>
  )
}
