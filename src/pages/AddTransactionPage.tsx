import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { ArrowLeftIcon } from '@heroicons/react/24/solid'

import { useAuth } from '../hooks/useAuth'
import { Category, categoryService } from '../services/category.service'
import { transactionService } from '../services/transaction.service'

import type { CreateTransactionData } from '../services/transaction.service'
export const AddTransactionPage = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [categories, setCategories] = useState<Category[]>([])
  const [type, setType] = useState<'deposit' | 'expense'>('expense')
  const [categoryId, setCategoryId] = useState<string>('')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [transactionDate, setTransactionDate] = useState(new Date().toISOString().split('T')[0])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Filter categories by type (with defensive check) - only for expense
  const filteredCategories = Array.isArray(categories)
    ? categories.filter((cat) => cat.type === 'expense')
    : []

  useEffect(() => {
    loadCategories()
  }, [])

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

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
      const data: CreateTransactionData = {
        category_id: type === 'expense' && categoryId ? parseInt(categoryId) : null,
        type,
        amount: parseInt(amount),
        description: description.trim() || undefined,
        transaction_date: transactionDate,
        user_id: user.id,
      }

      await transactionService.create(data)

      // Navigate back to transactions page
      navigate('/transactions')
    } catch (err) {
      console.error('Error adding transaction:', err)
      setError('Failed to add transaction. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    navigate('/transactions')
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
          <h1 className="text-3xl font-bold mb-2 text-primary">Add Transaction</h1>
          <p className="text-base-content/70">Record a new deposit or expense</p>
        </div>

        {/* Error Message */}
        {/* Form Card */}
        <div className="card bg-base-100 border border-base-300 shadow-sm">
          <div className="card-body p-6 md:p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error Alert */}
              {error && (
                <div className="alert alert-error elevation-none">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="stroke-current shrink-0 h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>{error}</span>
                </div>
              )}
              {/* Transaction Type Radio Buttons */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-base font-semibold">Transaction Type *</span>
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
                      onChange={(e) => setType(e.target.value as 'expense' | 'deposit')}
                      className="radio radio-error radio-sm"
                    />
                    <div className="ml-3 inline-block">
                      <span className="font-medium">Expense</span>
                      <p className="text-xs text-base-content/60 mt-1">Money spent</p>
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
                      onChange={(e) => setType(e.target.value as 'expense' | 'deposit')}
                      className="radio radio-success radio-sm"
                    />
                    <div className="ml-3 inline-block">
                      <span className="font-medium">Deposit</span>
                      <p className="text-xs text-base-content/60 mt-1">Money received</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Category Select - Only for Expenses */}
              {type === 'expense' && (
                <div className="form-control">
                  <label className="label">
                    <span className="label-text text-base font-semibold">Category *</span>
                  </label>
                  <select
                    className="select select-bordered w-full text-base"
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    required={type === 'expense'}>
                    <option value="">Select a category</option>
                    {filteredCategories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  <label className="label">
                    <span className="label-text-alt text-base-content/60">
                      Choose what this expense is for
                    </span>
                  </label>
                </div>
              )}

              {/* Amount Input */}
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
                  <span className="label-text-alt text-base-content/60">Enter the amount</span>
                </label>
              </div>

              {/* Date Input */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-base font-semibold">Date *</span>
                </label>
                <input
                  type="date"
                  className="input input-bordered w-full text-base"
                  value={transactionDate}
                  onChange={(e) => setTransactionDate(e.target.value)}
                  required
                />
                <label className="label">
                  <span className="label-text-alt text-base-content/60">
                    When did this transaction occur?
                  </span>
                </label>
              </div>

              {/* Description Textarea */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-base font-semibold">
                    Description <span className="text-base-content/50">(Optional)</span>
                  </span>
                </label>
                <textarea
                  className="textarea textarea-bordered h-24 text-base"
                  placeholder="Add notes or details about this transaction..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  className="btn btn-outline flex-1"
                  onClick={handleCancel}
                  disabled={isSubmitting}>
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`btn btn-primary flex-1 ${isSubmitting ? 'loading' : ''}`}
                  disabled={isSubmitting}>
                  {isSubmitting ? 'Adding...' : 'Add Transaction'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
