import type { Category } from '../types'

/**
 * Check if a category is "Other" based on its name
 */
export const isOtherCategory = (category: Category | undefined): boolean => {
  return category?.name === 'Other'
}

/**
 * Validates that a description is required when "Other" category is selected
 * @returns true if validation passes, false otherwise
 */
export const validateOtherCategoryDescription = (
  type: 'withdrawal' | 'expense',
  categoryId: string | undefined,
  description: string,
  categories: Category[]
): boolean => {
  if (type !== 'expense' || !categoryId) return true

  const selectedCategory = categories.find((cat) => cat.id === parseInt(categoryId))
  if (isOtherCategory(selectedCategory) && !description.trim()) {
    return false
  }

  return true
}

/**
 * Get the error message for "Other" category validation
 */
export const getOtherCategoryErrorMessage = (): string => {
  return 'Please add a description when using the "Other" category'
}
