import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import { ErrorBoundary } from './components/common/ErrorBoundary'
import { LoginForm } from './components/features/LoginForm'
import { Dock } from './components/layout/Dock'
import { InstallPWA } from './components/ui/InstallPWA'
import { OfflineIndicator } from './components/ui/OfflineIndicator'
import { ScrollToTop } from './components/ui/ScrollToTop'
import { UpdatePrompt } from './components/ui/UpdatePrompt'
import { useAuth } from './hooks/useAuth'
import { AddTransactionPage } from './pages/AddTransactionPage'
import { ForgotPasswordPage } from './pages/ForgotPasswordPage'
import { MyTransactionsPage } from './pages/MyTransactionsPage'
import { ResetPasswordPage } from './pages/ResetPasswordPage'
import { SettingsPage } from './pages/SettingsPage'
import { TransactionsPage } from './pages/TransactionsPage'

function App() {
  const { user, isAuthenticated, isLoading, signIn } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    )
  }

  if (!isAuthenticated) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LoginForm onSubmit={signIn} />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    )
  }

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ScrollToTop />
        <OfflineIndicator />
        <UpdatePrompt />
        <div className="min-h-screen bg-base-100 pb-24">
          <main>
            <Routes>
              <Route path="/" element={<TransactionsPage />} />
              <Route path="/settings" element={user && <SettingsPage user={user} />} />
              <Route path="/my-transactions" element={<MyTransactionsPage />} />
              <Route path="/add" element={<AddTransactionPage />} />
              <Route path="/edit/:id" element={<AddTransactionPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Dock />
          <InstallPWA />
        </div>
      </BrowserRouter>
    </ErrorBoundary>
  )
}

export default App
