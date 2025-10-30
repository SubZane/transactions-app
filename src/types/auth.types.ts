export interface User {
  id: string // Supabase UUID
  dbId?: number // Database ID
  email: string
  name?: string
  avatar?: string
  firstname?: string
  surname?: string
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface SignUpCredentials extends LoginCredentials {
  name?: string
}
