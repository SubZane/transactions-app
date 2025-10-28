import { apiClient } from '../lib/axios'

const API_TRANSACTIONS_URL = import.meta.env.VITE_API_TRANSACTIONS_URL

export interface Transaction {
  id: number
  user_id: number
  category_id: number
  type: 'deposit' | 'expense'
  amount: number
  description: string | null
  transaction_date: string
  created_at: string
  updated_at: string
  category_name: string
  category_icon: string
  category_color: string
  user_firstname: string
  user_surname: string
}

export interface CreateTransactionData {
  category_id: number | null
  type: 'deposit' | 'expense'
  amount: number
  description?: string
  transaction_date: string
  user_id: string
}

export interface UpdateTransactionData {
  category_id?: number | null
  type?: 'deposit' | 'expense'
  amount?: number
  description?: string
  transaction_date?: string
}

export const transactionService = {
  /**
   * Get all transactions for authenticated user
   */
  async getAll(): Promise<Transaction[]> {
    const response = await apiClient.get(API_TRANSACTIONS_URL)
    return response.data
  },

  /**
   * Get transaction by ID
   */
  async getById(id: number): Promise<Transaction> {
    const response = await apiClient.get(`${API_TRANSACTIONS_URL}/${id}`)
    return response.data
  },

  /**
   * Get transactions by type (deposit or expense)
   */
  async getByType(type: 'deposit' | 'expense'): Promise<Transaction[]> {
    const response = await apiClient.get(`${API_TRANSACTIONS_URL}/type/${type}`)
    return response.data
  },

  /**
   * Get transactions by category
   */
  async getByCategory(categoryId: number): Promise<Transaction[]> {
    const response = await apiClient.get(`${API_TRANSACTIONS_URL}/category/${categoryId}`)
    return response.data
  },

  /**
   * Get transactions by user_id (Supabase auth ID)
   */
  async getByUserId(userId: string): Promise<Transaction[]> {
    const response = await apiClient.get(`${API_TRANSACTIONS_URL}/user/${userId}`)
    return response.data
  },

  /**
   * Create new transaction
   */
  async create(data: CreateTransactionData): Promise<Transaction> {
    const response = await apiClient.post(API_TRANSACTIONS_URL, data)
    return response.data
  },

  /**
   * Update transaction
   */
  async update(id: number, data: UpdateTransactionData): Promise<Transaction> {
    const response = await apiClient.put(`${API_TRANSACTIONS_URL}/${id}`, data)
    return response.data
  },

  /**
   * Delete transaction
   */
  async delete(id: number): Promise<void> {
    await apiClient.delete(`${API_TRANSACTIONS_URL}/${id}`)
  },
}
