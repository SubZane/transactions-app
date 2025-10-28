import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import { Dock } from './components/common/Dock'
import { Header } from './components/Header'
import { LoginForm } from './components/LoginForm'
import { useAuth } from './hooks/useAuth'
import { AddTransactionPage } from './pages/AddTransactionPage'
import { EditTransactionPage } from './pages/EditTransactionPage'
import { ProfilePage } from './pages/ProfilePage'
import { TransactionsPage } from './pages/TransactionsPage'

function App() {
  const { user, isAuthenticated, isLoading, signIn, signOut } = useAuth()

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
        <Header user={user} onLogout={signOut} />
        <main>
          <Routes>
            <Route
              path="/"
              element={
                <div className="container mx-auto px-4 py-8">
                  <div className="hero min-h-[60vh] bg-base-200 rounded-lg">
                    <div className="hero-content text-center">
                      <div className="max-w-md">
                        <h1 className="text-5xl font-bold">Welcome!</h1>
                        <p className="py-6">
                          You are now logged in to the Transactions App. Start tracking your
                          financial transactions!
                        </p>
                        <button className="btn btn-soft-primary">Get Started</button>
                      </div>
                    </div>
                  </div>
                </div>
              }
            />
            <Route path="/profile" element={user && <ProfilePage user={user} />} />
            <Route path="/transactions" element={<TransactionsPage />} />
            <Route path="/transactions/add" element={<AddTransactionPage />} />
            <Route path="/transactions/edit/:id" element={<EditTransactionPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Dock />
      </div>
    </BrowserRouter>
  )
}

export default App
