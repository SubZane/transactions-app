import { apiClient } from '../lib/axios'

import type { Transaction, CreateTransactionData, UpdateTransactionData } from '../types'

const API_TRANSACTIONS_URL = import.meta.env.VITE_API_TRANSACTIONS_URL

// Re-export types for backward compatibility
export type { Transaction, CreateTransactionData, UpdateTransactionData }

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
