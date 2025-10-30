interface UserBalanceCardProps {
  name: string
  netAmount: number
  deposits: number
  expenses: number
}

export const UserBalanceCard = ({ name, netAmount, deposits, expenses }: UserBalanceCardProps) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('sv-SE', {
      style: 'currency',
      currency: 'SEK',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
      <h3 className="text-white font-medium mb-2 text-sm">{name}</h3>
      <div className="bg-white/20 backdrop-blur-sm rounded-lg p-2 mb-2">
        <div className="text-center">
          <span className="text-white/70 text-[10px] block mb-0.5">Net</span>
          <span
            className={`text-xl font-bold block ${netAmount >= 0 ? 'text-green-200' : 'text-red-200'}`}>
            {formatCurrency(netAmount)}
          </span>
        </div>
      </div>
      <div className="space-y-1 text-[10px]">
        <div className="flex justify-between text-white/70">
          <span>Deposits:</span>
          <span className="font-medium text-white/90">{formatCurrency(deposits)}</span>
        </div>
        <div className="flex justify-between text-white/70">
          <span>Expenses:</span>
          <span className="font-medium text-white/90">{formatCurrency(expenses)}</span>
        </div>
      </div>
    </div>
  )
}
