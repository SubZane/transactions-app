import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { ArrowLeftIcon, ExclamationCircleIcon } from '@heroicons/react/24/solid'

import { useAuth } from '../hooks/useAuth'
import { Category, categoryService } from '../services/category.service'
import { transactionService } from '../services/transaction.service'

import type { UpdateTransactionData } from '../services/transaction.service'

export const EditTransactionPage = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const [categories, setCategories] = useState<Category[]>([])
  const [type, setType] = useState<'deposit' | 'expense'>('expense')
  const [categoryId, setCategoryId] = useState<string>('')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [transactionDate, setTransactionDate] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Filter categories by type (with defensive check) - only for expense
  const filteredCategories = Array.isArray(categories)
    ? categories.filter((cat) => cat.type === 'expense')
    : []

  useEffect(() => {
    loadCategories()
    loadTransaction()
  }, [id])

  // Reset category when type changes to deposit
  useEffect(() => {
    if (type === 'deposit') {
      setCategoryId('')
    }
  }, [type])

  const loadCategories = async () => {
    try {
      const data = await categoryService.getAll()
      setCategories(data)
    } catch (err) {
      console.error('Error loading categories:', err)
    }
  }

  const loadTransaction = async () => {
    if (!id) {
      setError('Transaction ID is missing')
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      const transaction = await transactionService.getById(parseInt(id))

      // Populate form with existing data
      setType(transaction.type)
      setCategoryId(transaction.category_id ? transaction.category_id.toString() : '')
      setAmount(transaction.amount.toString())
      setDescription(transaction.description || '')
      setTransactionDate(transaction.transaction_date)
    } catch (err) {
      console.error('Error loading transaction:', err)
      setError('Failed to load transaction. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!id) {
      setError('Transaction ID is missing')
      return
    }

    // Validate required fields
    if (!amount || !transactionDate) {
      setError('Please fill in all required fields')
      return
    }

    // Category is only required for expenses
    if (type === 'expense' && !categoryId) {
      setError('Please select a category for expenses')
      return
    }

    if (parseFloat(amount) < 1) {
      setError('Amount must be at least 1 kr')
      return
    }

    if (!user?.id) {
      setError('User not authenticated')
      return
    }

    setIsSubmitting(true)

    try {
      const data: UpdateTransactionData = {
        category_id: type === 'expense' && categoryId ? parseInt(categoryId) : null,
        type,
        amount: parseInt(amount),
        description: description.trim() || undefined,
        transaction_date: transactionDate,
      }

      await transactionService.update(parseInt(id), data)

      // Navigate back to transactions page
      navigate('/transactions')
    } catch (err) {
      console.error('Error updating transaction:', err)
      setError('Failed to update transaction. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    navigate('/transactions')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-base-100 pb-24">
        <div className="max-w-2xl mx-auto p-4 md:p-6">
          <div className="flex items-center justify-center py-12">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-base-200 pb-24">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Header with background */}
        <div className="mb-6 p-6 bg-base-100 rounded-lg border border-base-300">
          <button onClick={handleCancel} className="btn btn-ghost btn-sm mb-4 gap-2">
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Transactions
          </button>
          <h1 className="text-3xl font-bold mb-2 text-primary">Edit Transaction</h1>
          <p className="text-base-content/70">Update transaction details</p>
        </div>

        {/* Form Card */}
        <div className="card bg-base-100 border border-base-300 shadow-sm">
          <div className="card-body p-6 md:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error Alert */}
              {error && (
                <div className="alert alert-error">
                  <ExclamationCircleIcon className="h-5 w-5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Transaction Type - Radio Buttons */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold text-base">Transaction Type</span>
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <label
                    className={`cursor-pointer border-2 rounded-lg p-4 transition-colors ${
                      type === 'expense'
                        ? 'border-error bg-error/5'
                        : 'border-base-300 hover:border-error/50'
                    }`}>
                    <input
                      type="radio"
                      name="type"
                      value="expense"
                      checked={type === 'expense'}
                      onChange={(e) => setType(e.target.value as 'expense')}
                      className="radio radio-error"
                    />
                    <div className="ml-3 inline-block">
                      <span className="font-semibold">Expense</span>
                      <p className="text-xs text-base-content/70">Money spent</p>
                    </div>
                  </label>

                  <label
                    className={`cursor-pointer border-2 rounded-lg p-4 transition-colors ${
                      type === 'deposit'
                        ? 'border-success bg-success/5'
                        : 'border-base-300 hover:border-success/50'
                    }`}>
                    <input
                      type="radio"
                      name="type"
                      value="deposit"
                      checked={type === 'deposit'}
                      onChange={(e) => setType(e.target.value as 'deposit')}
                      className="radio radio-success"
                    />
                    <div className="ml-3 inline-block">
                      <span className="font-semibold">Deposit</span>
                      <p className="text-xs text-base-content/70">Money received</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Category - Only for expenses */}
              {type === 'expense' && (
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold text-base">Category</span>
                  </label>
                  <select
                    className="select select-bordered w-full text-base"
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    required={type === 'expense'}>
                    <option value="">Select a category</option>
                    {filteredCategories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  <label className="label">
                    <span className="label-text-alt text-base-content/70">
                      Choose what type of expense this is
                    </span>
                  </label>
                </div>
              )}

              {/* Amount */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold text-base">Amount</span>
                </label>
                <label className="input input-bordered flex items-center gap-2 text-lg">
                  <input
                    type="number"
                    step="1"
                    min="1"
                    placeholder="0"
                    className="grow"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                  />
                  <span className="text-base-content/50">kr</span>
                </label>
                <label className="label">
                  <span className="label-text-alt text-base-content/70">
                    Enter the transaction amount
                  </span>
                </label>
              </div>

              {/* Date */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold text-base">Date</span>
                </label>
                <input
                  type="date"
                  className="input input-bordered w-full text-base"
                  value={transactionDate}
                  onChange={(e) => setTransactionDate(e.target.value)}
                  required
                />
                <label className="label">
                  <span className="label-text-alt text-base-content/70">
                    When did this transaction occur?
                  </span>
                </label>
              </div>

              {/* Description */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold text-base">
                    Description <span className="text-base-content/50 font-normal">(Optional)</span>
                  </span>
                </label>
                <textarea
                  className="textarea textarea-bordered h-24 text-base"
                  placeholder="Add notes about this transaction..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}></textarea>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="btn btn-outline flex-1"
                  disabled={isSubmitting}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary flex-1" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <span className="loading loading-spinner loading-sm"></span>
                      Updating...
                    </>
                  ) : (
                    'Update Transaction'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
