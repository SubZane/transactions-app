import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { Alert } from '../components/common/Alert'
import { useAuth } from '../hooks/useAuth'
import { type Category, categoryService } from '../services/category.service'
import { dbService } from '../services/db.service'
import { syncService } from '../services/sync.service'
import { transactionService } from '../services/transaction.service'
import { MIN_TRANSACTION_AMOUNT } from '../utils/constants'
import {
  getOtherCategoryErrorMessage,
  isOtherCategory,
  validateOtherCategoryDescription,
} from '../utils/validation'

import type { CreateTransactionData, UpdateTransactionData } from '../services/transaction.service'
export const AddTransactionPage = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const isEditMode = !!id
  const [categories, setCategories] = useState<Category[]>([])
  const [type, setType] = useState<'deposit' | 'expense'>('expense')
  const [categoryId, setCategoryId] = useState<string>('')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [transactionDate, setTransactionDate] = useState(new Date().toISOString().split('T')[0])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(isEditMode)
  const [error, setError] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Filter categories by type (with defensive check) - only for expense, sorted alphabetically
  const filteredCategories = Array.isArray(categories)
    ? categories
        .filter((cat) => cat.type === 'expense')
        .sort((a, b) => a.name.localeCompare(b.name))
    : []

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

  useEffect(() => {
    loadCategories()
    if (isEditMode) {
      loadTransaction()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, isEditMode])

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

    // Description is required when "Other" category is selected
    if (!validateOtherCategoryDescription(type, categoryId, description, categories)) {
      setError(getOtherCategoryErrorMessage())
      return
    }

    if (parseFloat(amount) < MIN_TRANSACTION_AMOUNT) {
      setError(`Amount must be at least ${MIN_TRANSACTION_AMOUNT} kr`)
      return
    }

    if (!user?.id) {
      setError('User not authenticated')
      return
    }

    setIsSubmitting(true)

    try {
      if (isEditMode && id) {
        // Update existing transaction
        const data: UpdateTransactionData = {
          category_id: type === 'expense' && categoryId ? parseInt(categoryId) : null,
          type,
          amount: parseInt(amount),
          description: description.trim() || undefined,
          transaction_date: transactionDate,
        }

        if (navigator.onLine) {
          // Online - update directly
          await transactionService.update(parseInt(id), data)
        } else {
          // Offline - queue for sync
          await dbService.init()
          const existingTransaction = await dbService.getTransaction(parseInt(id))
          if (existingTransaction) {
            const updatedTransaction = {
              ...existingTransaction,
              ...data,
              user_id: user.id,
            }
            await dbService.saveTransaction(updatedTransaction)
            await syncService.queueTransactionUpdate(parseInt(id), updatedTransaction as never)
          }
        }
      } else {
        // Create new transaction
        const data: CreateTransactionData = {
          category_id: type === 'expense' && categoryId ? parseInt(categoryId) : null,
          type,
          amount: parseInt(amount),
          description: description.trim() || undefined,
          transaction_date: transactionDate,
          user_id: user.id,
        }

        if (navigator.onLine) {
          // Online - create directly
          await transactionService.create(data)
        } else {
          // Offline - save locally and queue for sync
          await dbService.init()
          const tempId = `temp-${Date.now()}`
          const newTransaction = {
            id: tempId,
            ...data,
            user_id: user.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }
          await dbService.saveTransaction(newTransaction)
          await syncService.queueTransactionCreate(newTransaction as never)
        }
      }

      // Navigate back to transactions page
      navigate('/transactions')
    } catch (err) {
      console.error(`Error ${isEditMode ? 'updating' : 'adding'} transaction:`, err)
      setError(`Failed to ${isEditMode ? 'update' : 'add'} transaction. Please try again.`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCancel = () => {
    navigate('/transactions')
  }

  const handleDelete = async () => {
    if (!id) return

    setIsSubmitting(true)
    setError(null)

    try {
      if (navigator.onLine) {
        // Online - delete directly
        await transactionService.delete(parseInt(id))
      } else {
        // Offline - delete locally and queue for sync
        await dbService.init()
        await dbService.deleteTransaction(parseInt(id))
        await syncService.queueTransactionDelete(parseInt(id))
      }

      navigate('/transactions')
    } catch (err) {
      console.error('Error deleting transaction:', err)
      setError('Failed to delete transaction. Please try again.')
      setShowDeleteConfirm(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Top Section with Emerald Green Background - Fixed */}
      <div
        className="fixed top-0 left-0 right-0 bg-emerald-600 z-40 shadow-lg backdrop-blur-sm"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4 max-w-3xl">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">
            {isEditMode ? 'Edit Transaction' : 'Add Transaction'}
          </h1>
          <p className="text-white/80 text-sm">
            {isEditMode ? 'Update transaction details' : 'Record a new deposit or expense'}
          </p>
        </div>
      </div>

      {/* Form Section */}
      <div
        className="container mx-auto px-3 sm:px-4 py-4 max-w-3xl"
        style={{
          paddingTop: 'calc(7rem + env(safe-area-inset-top))',
        }}>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Error Alert */}
            {error && <Alert message={error} variant="error" />}

            {/* Transaction Type */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Transaction Type *
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label
                  className={`cursor-pointer border-2 rounded-xl p-2 transition-all ${
                    type === 'expense'
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-200 hover:border-red-300 bg-white'
                  }`}>
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="type"
                      value="expense"
                      checked={type === 'expense'}
                      onChange={(e) => setType(e.target.value as 'expense' | 'deposit')}
                      className="h-4 w-4 text-red-600 focus:ring-red-500"
                    />
                    <div>
                      <span className="font-medium text-gray-900 text-sm">Expense</span>
                      <p className="text-xs text-gray-500">Money spent</p>
                    </div>
                  </div>
                </label>

                <label
                  className={`cursor-pointer border-2 rounded-xl p-2 transition-all ${
                    type === 'deposit'
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-green-300 bg-white'
                  }`}>
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="type"
                      value="deposit"
                      checked={type === 'deposit'}
                      onChange={(e) => setType(e.target.value as 'expense' | 'deposit')}
                      className="h-4 w-4 text-green-600 focus:ring-green-500"
                    />
                    <div>
                      <span className="font-medium text-gray-900 text-sm">Deposit</span>
                      <p className="text-xs text-gray-500">Money deposited</p>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Amount Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Amount *</label>
              <div className="relative">
                <input
                  type="number"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  step="1"
                  min="1"
                  placeholder="0"
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-base"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">
                  kr
                </span>
              </div>
            </div>

            {/* Category and Date Row */}
            <div className={`grid gap-4 ${type === 'expense' ? 'grid-cols-2' : 'grid-cols-1'}`}>
              {/* Category Select - Only for Expenses */}
              {type === 'expense' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-base bg-white"
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
                </div>
              )}

              {/* Date Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Date *</label>
                <input
                  type="date"
                  className="w-full max-w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-base appearance-none"
                  style={{ WebkitAppearance: 'none' }}
                  value={transactionDate}
                  onChange={(e) => setTransactionDate(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Description Textarea */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Description{' '}
                {type === 'expense' &&
                categoryId &&
                isOtherCategory(categories.find((cat) => cat.id === parseInt(categoryId))) ? (
                  <span className="text-red-600">*</span>
                ) : (
                  <span className="text-gray-400 font-normal">(Optional)</span>
                )}
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-base resize-none"
                rows={2}
                placeholder={
                  type === 'expense' &&
                  categoryId &&
                  categories.find((cat) => cat.id === parseInt(categoryId))?.name === 'Other'
                    ? 'Required: Please describe this expense...'
                    : 'Add notes or details...'
                }
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required={
                  !!(
                    type === 'expense' &&
                    categoryId &&
                    categories.find((cat) => cat.id === parseInt(categoryId))?.name === 'Other'
                  )
                }
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleCancel}
                disabled={isSubmitting}>
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isSubmitting}>
                {isSubmitting
                  ? isEditMode
                    ? 'Updating...'
                    : 'Adding...'
                  : isEditMode
                    ? 'Update Transaction'
                    : 'Add Transaction'}
              </button>
            </div>

            {/* Delete Button - Only in Edit Mode */}
            {isEditMode && (
              <div className="pt-4 border-t border-gray-200">
                <button
                  type="button"
                  className="w-full px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={isSubmitting}>
                  Delete Transaction
                </button>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Transaction?</h3>
            <p className="text-gray-600 mb-6">
              This action cannot be undone. Are you sure you want to delete this transaction?
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isSubmitting}>
                Cancel
              </button>
              <button
                type="button"
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleDelete}
                disabled={isSubmitting}>
                {isSubmitting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
