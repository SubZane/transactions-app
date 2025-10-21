/**
 * API service for making HTTP requests
 * This is an example service demonstrating how to use the axios instance
 */

import { apiClient } from '../lib/axios';

/**
 * Example: Fetch user profile
 * @param userId - User ID
 * @returns User profile data
 */
export const getUserProfile = async (userId: string) => {
  const response = await apiClient.get(`/users/${userId}`);
  return response.data;
};

/**
 * Example: Update user profile
 * @param userId - User ID
 * @param data - Profile data to update
 * @returns Updated user profile
 */
export const updateUserProfile = async (userId: string, data: Record<string, unknown>) => {
  const response = await apiClient.put(`/users/${userId}`, data);
  return response.data;
};

/**
 * Example: Fetch transactions
 * @param params - Query parameters for filtering
 * @returns List of transactions
 */
export const getTransactions = async (params?: Record<string, unknown>) => {
  const response = await apiClient.get('/transactions', { params });
  return response.data;
};

/**
 * Example: Create a new transaction
 * @param data - Transaction data
 * @returns Created transaction
 */
export const createTransaction = async (data: Record<string, unknown>) => {
  const response = await apiClient.post('/transactions', data);
  return response.data;
};

/**
 * Example: Delete a transaction
 * @param transactionId - Transaction ID
 * @returns Deletion confirmation
 */
export const deleteTransaction = async (transactionId: string) => {
  const response = await apiClient.delete(`/transactions/${transactionId}`);
  return response.data;
};
