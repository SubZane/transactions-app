import { AxiosError } from 'axios'

import { apiClient } from '../lib/axios'

const API_USERS_URL = import.meta.env.VITE_API_USERS_URL

export interface UserProfile {
  id: number
  user_id: string
  email: string
  firstname: string
  surname: string
  created_at: string
  updated_at: string
}

export interface UpdateUserProfileData {
  firstname?: string
  surname?: string
}

export const userService = {
  /**
   * Get user by user_id (Supabase auth ID) - PRIMARY METHOD
   */
  async getByUserId(userId: string): Promise<UserProfile | null> {
    try {
      const response = await apiClient.get(`${API_USERS_URL}/user_id/${userId}`)
      return response.data
    } catch (error) {
      if ((error as AxiosError).response?.status === 404) {
        return null
      }
      throw error
    }
  },

  /**
   * Get user by email (legacy support)
   */
  async getByEmail(email: string): Promise<UserProfile | null> {
    try {
      const response = await apiClient.get(`${API_USERS_URL}/email/${encodeURIComponent(email)}`)
      return response.data
    } catch (error) {
      if ((error as AxiosError).response?.status === 404) {
        return null
      }
      throw error
    }
  },

  /**
   * Create or update user profile
   */
  async upsert(userId: string, email: string, data: UpdateUserProfileData): Promise<UserProfile> {
    const response = await apiClient.post(API_USERS_URL, {
      user_id: userId,
      email,
      ...data,
    })
    return response.data
  },

  /**
   * Update user profile by user_id (PRIMARY METHOD)
   */
  async updateByUserId(userId: string, data: UpdateUserProfileData): Promise<UserProfile> {
    const response = await apiClient.put(`${API_USERS_URL}/user_id/${userId}`, data)
    return response.data
  },

  /**
   * Update user profile by email (legacy support)
   */
  async updateByEmail(email: string, data: UpdateUserProfileData): Promise<UserProfile> {
    const response = await apiClient.put(
      `${API_USERS_URL}/email/${encodeURIComponent(email)}`,
      data
    )
    return response.data
  },

  /**
   * Get or create user profile by user_id
   */
  async getOrCreate(
    userId: string,
    email: string,
    data: UpdateUserProfileData = {}
  ): Promise<UserProfile> {
    const user = await this.getByUserId(userId)
    if (user) {
      return user
    }
    return this.upsert(userId, email, data)
  },
}
