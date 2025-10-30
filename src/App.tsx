import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import { Dock } from './components/common/Dock'
import { LoginForm } from './components/LoginForm'
import { useAuth } from './hooks/useAuth'
import { AddTransactionPage } from './pages/AddTransactionPage'
import { MyTransactionsPage } from './pages/MyTransactionsPage'
import { ProfilePage } from './pages/ProfilePage'
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
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-base-200 to-base-300 px-4 py-8">
        <LoginForm onSubmit={signIn} />
      </div>
    )
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-base-100 pb-24">
        <main>
          <Routes>
            <Route path="/" element={<TransactionsPage />} />
            <Route path="/profile" element={user && <ProfilePage user={user} />} />
            <Route path="/my-transactions" element={<MyTransactionsPage />} />
            <Route path="/add" element={<AddTransactionPage />} />
            <Route path="/edit/:id" element={<AddTransactionPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Dock />
      </div>
    </BrowserRouter>
  )
}

export default App
