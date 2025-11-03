import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import { Dock } from './components/common/Dock'
import { ErrorBoundary } from './components/common/ErrorBoundary'
import { OfflineIndicator } from './components/common/OfflineIndicator'
import { UpdatePrompt } from './components/common/UpdatePrompt'
import { InstallPWA } from './components/InstallPWA'
import { LoginForm } from './components/LoginForm'
import { ScrollToTop } from './components/ScrollToTop'
import { useAuth } from './hooks/useAuth'
import { AddTransactionPage } from './pages/AddTransactionPage'
import { MyTransactionsPage } from './pages/MyTransactionsPage'
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
    return <LoginForm onSubmit={signIn} />
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
