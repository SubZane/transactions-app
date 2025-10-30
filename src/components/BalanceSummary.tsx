interface BalanceSummaryProps {
  netBalance: number
  totalDeposits: number
  totalExpenses: number
  title?: string
}

export const BalanceSummary = ({
  netBalance,
  totalDeposits,
  totalExpenses,
  title = 'Balance Overview',
}: BalanceSummaryProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('sv-SE', {
      style: 'currency',
      currency: 'SEK',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  return (
    <div className="mb-0">
      <h2 className="text-white text-lg font-semibold mb-3 text-center">{title}</h2>
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
        <div className="text-center mb-3">
          <span className="text-white/70 text-xs block mb-1">Net Balance</span>
          <span
            className={`text-3xl font-bold block ${netBalance >= 0 ? 'text-green-200' : 'text-red-200'}`}>
            {formatCurrency(netBalance)}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2">
            <div className="text-white/70 text-xs mb-1">Deposits</div>
            <div className="text-white font-semibold">{formatCurrency(totalDeposits)}</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2">
            <div className="text-white/70 text-xs mb-1">Expenses</div>
            <div className="text-white font-semibold">{formatCurrency(totalExpenses)}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
