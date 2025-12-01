// Service and API related interfaces

export interface Category {
  id: number
  name: string
  type: 'withdrawal' | 'expense'
  color?: string
  description?: string
  created_at?: string
  updated_at?: string
}

export interface CreateCategoryData {
  name: string
  type: 'withdrawal' | 'expense'
  color?: string
  description?: string
}

export interface UpdateCategoryData {
  name?: string
  type?: 'withdrawal' | 'expense'
  color?: string
  description?: string
}

export interface Transaction {
  id: number
  category_id: number | null
  type: 'withdrawal' | 'expense'
  amount: number
  description: string | null
  transaction_date: string
  user_id: number
  user_firstname: string
  user_surname: string
  category_name: string | null
  category_color: string | null
  created_at: string
  updated_at: string
}

export interface CreateTransactionData {
  category_id: number | null
  type: 'withdrawal' | 'expense'
  amount: number
  description?: string
  transaction_date: string
  user_id: string
}

export interface UpdateTransactionData {
  category_id?: number | null
  type?: 'withdrawal' | 'expense'
  amount?: number
  description?: string
  transaction_date?: string
}

export interface UserProfile {
  id: number
  uuid: string
  firstname: string
  surname: string
  email: string
  created_at: string
  updated_at: string
}

export interface UpdateUserProfileData {
  firstname?: string
  surname?: string
}
