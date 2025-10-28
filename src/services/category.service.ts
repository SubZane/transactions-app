import { apiClient } from '../lib/axios'

const API_CATEGORIES_URL = import.meta.env.VITE_API_CATEGORIES_URL

export interface Category {
  id: number
  name: string
  type: 'deposit' | 'expense'
  description: string | null
  icon: string | null
  color: string | null
  created_at: string
  updated_at: string
}

export interface CreateCategoryData {
  name: string
  type: 'deposit' | 'expense'
  description?: string
  icon?: string
  color?: string
}

export interface UpdateCategoryData {
  name?: string
  description?: string
  icon?: string
  color?: string
}

export const categoryService = {
  /**
   * Get all categories
   */
  async getAll(): Promise<Category[]> {
    const response = await apiClient.get(API_CATEGORIES_URL)
    return response.data
  },

  /**
   * Get category by ID
   */
  async getById(id: number): Promise<Category> {
    const response = await apiClient.get(`${API_CATEGORIES_URL}/${id}`)
    return response.data
  },

  /**
   * Get categories by type (deposit or expense)
   */
  async getByType(type: 'deposit' | 'expense'): Promise<Category[]> {
    const response = await apiClient.get(`${API_CATEGORIES_URL}/type/${type}`)
    return response.data
  },

  /**
   * Create new category
   */
  async create(data: CreateCategoryData): Promise<Category> {
    const response = await apiClient.post(API_CATEGORIES_URL, data)
    return response.data
  },

  /**
   * Update category
   */
  async update(id: number, data: UpdateCategoryData): Promise<Category> {
    const response = await apiClient.put(`${API_CATEGORIES_URL}/${id}`, data)
    return response.data
  },

  /**
   * Delete category
   */
  async delete(id: number): Promise<void> {
    await apiClient.delete(`${API_CATEGORIES_URL}/${id}`)
  },
}
