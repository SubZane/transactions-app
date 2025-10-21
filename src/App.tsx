import { useAuth } from './hooks/useAuth';
import { LoginForm } from './components/LoginForm';
import { Header } from './components/Header';

function App() {
  const { user, isAuthenticated, isLoading, signIn, signOut } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <LoginForm onSubmit={signIn} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-100">
      <Header user={user} onLogout={signOut} />
      <main className="container mx-auto px-4 py-8">
        <div className="hero min-h-[60vh] bg-base-200 rounded-lg">
          <div className="hero-content text-center">
            <div className="max-w-md">
              <h1 className="text-5xl font-bold">Welcome!</h1>
              <p className="py-6">
                You are now logged in to the Transactions App. Start building amazing features!
              </p>
              <button className="btn btn-primary">Get Started</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
