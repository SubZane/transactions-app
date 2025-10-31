import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import { Dock } from './components/common/Dock'
import { InstallPWA } from './components/InstallPWA'
import { LoginForm } from './components/LoginForm'
import { ScrollToTop } from './components/ScrollToTop'
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
    return <LoginForm onSubmit={signIn} />
  }

  return (
    <BrowserRouter>
      <ScrollToTop />
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
        <InstallPWA />
      </div>
    </BrowserRouter>
  )
}

export default App
