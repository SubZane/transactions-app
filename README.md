# Transactions App

A modern React TypeScript application with Tailwind CSS, DaisyUI, Axios for API calls, and Supabase for authentication.

## 🚀 Tech Stack

### Frontend
- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **DaisyUI** - Tailwind CSS component library
- **Axios** - HTTP client for API calls
- **Supabase** - Authentication and backend services
- **ESLint** - Code linting
- **Prettier** - Code formatting

### Backend
- **PHP 8.1+** - Server-side language
- **Slim Framework 4** - Micro-framework for PHP
- **SQLite** - Embedded database
- **Composer** - PHP dependency manager

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

### Frontend
- Node.js (v18 or higher)
- npm or yarn
- A Supabase account (for authentication features)

### Backend
- PHP 8.1 or higher
- Composer
- SQLite3

## 🛠️ Setup Instructions

### Frontend Setup

### 1. Clone the repository

```bash
git clone <repository-url>
cd transactions-app
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Copy the example environment file and configure your environment variables:

```bash
cp .env.example .env
```

Edit `.env` and add your Supabase credentials:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_BASE_URL=http://localhost:8000/api
```

To get your Supabase credentials:
1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Select your project (or create a new one)
3. Go to Settings > API
4. Copy the Project URL and anon/public key

### 4. Start the development server

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### Backend Setup

### 1. Install PHP dependencies

```bash
cd backend
composer install
```

### 2. Initialize the database

The database will be automatically created on first run. You can also manually initialize it:

```bash
php init-db.php
```

### 3. Start the backend server

```bash
cd backend/public
php -S localhost:8000
```

The API will be available at `http://localhost:8000`

### 4. Test the API

```bash
curl http://localhost:8000/
```

For more details, see the [Backend README](backend/README.md).

## 📁 Project Structure

```
transactions-app/
├── backend/                # PHP backend API
│   ├── public/             # Web root
│   │   └── index.php       # API entry point
│   ├── src/                # Source code
│   │   ├── Controllers/    # API controllers
│   │   ├── Models/         # Data models
│   │   ├── Middleware/     # HTTP middleware
│   │   └── Database/       # Database utilities
│   ├── config/             # Configuration
│   ├── docs/               # Backend documentation
│   ├── backups/            # Database backups
│   ├── composer.json       # PHP dependencies
│   └── README.md           # Backend documentation
├── src/
│   ├── components/         # React components
│   │   ├── Header.tsx
│   │   └── LoginForm.tsx
│   ├── hooks/              # Custom React hooks
│   │   └── useAuth.ts
│   ├── lib/                # Library configurations
│   │   ├── axios.ts        # Axios instance configuration
│   │   └── supabase.ts     # Supabase client configuration
│   ├── pages/              # Page components
│   ├── styles/             # CSS files
│   │   └── index.css
│   ├── types/              # TypeScript type definitions
│   │   └── auth.types.ts
│   ├── utils/              # Utility functions
│   ├── App.tsx             # Main App component
│   ├── main.tsx            # Application entry point
│   └── vite-env.d.ts       # Vite environment types
├── public/                 # Static assets
├── .env.example            # Example environment variables
├── .eslintrc.cjs           # ESLint configuration
├── .prettierrc.json        # Prettier configuration
├── index.html              # HTML entry point
├── package.json            # Dependencies and scripts
├── postcss.config.js       # PostCSS configuration
├── tailwind.config.js      # Tailwind CSS configuration
├── tsconfig.json           # TypeScript configuration
└── vite.config.ts          # Vite configuration
```

## 🎨 Styling

This project uses Tailwind CSS with DaisyUI for styling. DaisyUI provides pre-built components that follow Tailwind's utility-first approach.

### Available DaisyUI Themes
- light
- dark
- cupcake

You can change the theme in `tailwind.config.js`.

### Using Tailwind CSS
```tsx
<div className="btn btn-primary">Click me</div>
<div className="card bg-base-200">
  <div className="card-body">Content</div>
</div>
```

## 🔐 Authentication

Authentication is handled by Supabase. The `useAuth` hook provides:

- `user` - Current authenticated user
- `isAuthenticated` - Authentication status
- `isLoading` - Loading state
- `signIn(credentials)` - Sign in method
- `signUp(credentials)` - Sign up method
- `signOut()` - Sign out method

### Example Usage

```tsx
import { useAuth } from './hooks/useAuth';

function MyComponent() {
  const { user, signIn, signOut } = useAuth();

  const handleLogin = async () => {
    await signIn({ email: 'user@example.com', password: 'password' });
  };

  return (
    <div>
      {user ? (
        <button onClick={signOut}>Logout</button>
      ) : (
        <button onClick={handleLogin}>Login</button>
      )}
    </div>
  );
}
```

## 🌐 API Calls

The backend provides a RESTful API for managing transactions. Axios is configured with interceptors for authentication and error handling.

### Backend API Endpoints

```
GET    /api/transactions              # List all transactions
GET    /api/transactions/{id}         # Get single transaction
POST   /api/transactions              # Create transaction
PUT    /api/transactions/{id}         # Update transaction
DELETE /api/transactions/{id}         # Delete transaction
GET    /api/transactions/summary/stats # Get transaction summary
GET    /api/categories                # List categories
POST   /api/backup                    # Create database backup
GET    /api/backups                   # List backups
```

### Example Usage

```tsx
import { apiClient } from './lib/axios';

// GET request - List transactions
const fetchTransactions = async (userId: string) => {
  const response = await apiClient.get('/transactions', {
    params: { user_id: userId }
  });
  return response.data;
};

// POST request - Create transaction
const createTransaction = async (data: TransactionData) => {
  const response = await apiClient.post('/transactions', data);
  return response.data;
};

// PUT request - Update transaction
const updateTransaction = async (id: number, data: TransactionData) => {
  const response = await apiClient.put(`/transactions/${id}`, data);
  return response.data;
};

// DELETE request
const deleteTransaction = async (id: number, userId: string) => {
  const response = await apiClient.delete(`/transactions/${id}`, {
    params: { user_id: userId }
  });
  return response.data;
};
```

The Axios instance automatically:
- Adds authentication tokens to requests
- Handles 401 (Unauthorized) responses
- Sets default headers and timeout

For complete API documentation, see [Backend README](backend/README.md).

## 📜 Available Scripts

### Frontend Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Lint code with ESLint
- `npm run lint:fix` - Fix linting errors automatically
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

### Backend Scripts
- `cd backend && composer install` - Install dependencies
- `php init-db.php` - Initialize database
- `php -S localhost:8000` - Start development server (from backend/public)
- `composer test` - Run PHPUnit tests

## 🎯 Coding Conventions

### TypeScript
- Use TypeScript for all new files
- Define interfaces for props and data structures
- Use type inference where possible
- Avoid `any` type unless absolutely necessary

### React Components
- Use functional components with hooks
- Name components with PascalCase
- Keep components small and focused
- Extract reusable logic into custom hooks

### File Naming
- Components: PascalCase (e.g., `LoginForm.tsx`)
- Hooks: camelCase with 'use' prefix (e.g., `useAuth.ts`)
- Utilities: camelCase (e.g., `formatDate.ts`)
- Types: camelCase with '.types' suffix (e.g., `auth.types.ts`)

### Code Style
- Use ESLint and Prettier for consistent code style
- Run `npm run lint:fix` before committing
- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions small and focused (single responsibility)

### Git Commits
- Write clear, descriptive commit messages
- Use conventional commits format:
  - `feat:` - New feature
  - `fix:` - Bug fix
  - `docs:` - Documentation changes
  - `style:` - Code style changes (formatting)
  - `refactor:` - Code refactoring
  - `test:` - Adding or updating tests
  - `chore:` - Maintenance tasks

## 🚦 Best Practices

1. **Environment Variables**: Never commit `.env` files. Always use `.env.example` as a template.

2. **Error Handling**: Always handle errors in async functions with try-catch blocks.

3. **Loading States**: Show loading indicators for async operations.

4. **Accessibility**: Use semantic HTML and ARIA attributes when necessary.

5. **Performance**: Use React.memo() for expensive components, lazy load routes and components.

6. **Security**: Never expose sensitive data in client-side code.

## 🐛 Troubleshooting

### Supabase Connection Issues
- Verify your Supabase URL and anon key in `.env`
- Check if your Supabase project is active
- Ensure authentication is enabled in Supabase dashboard

### Build Errors
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Clear Vite cache: `rm -rf node_modules/.vite`
- Check Node.js version compatibility

### Styling Issues
- Ensure Tailwind CSS is properly configured
- Check if DaisyUI theme is correctly set
- Verify PostCSS configuration

## 📚 Additional Resources

### Frontend
- [React Documentation](https://react.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Vite Documentation](https://vitejs.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [DaisyUI Documentation](https://daisyui.com/)
- [Supabase Documentation](https://supabase.com/docs)
- [Axios Documentation](https://axios-http.com/docs/intro)

### Backend
- [PHP Manual](https://www.php.net/manual/)
- [Slim Framework Documentation](https://www.slimframework.com/docs/)
- [SQLite Documentation](https://www.sqlite.org/docs.html)
- [PHP Best Practices](backend/docs/PHP_SQLITE_BEST_PRACTICES.md)

## 📖 Documentation

- [Frontend Coding Conventions](CODING_CONVENTIONS.md)
- [Backend README](backend/README.md)
- [PHP & SQLite Best Practices](backend/docs/PHP_SQLITE_BEST_PRACTICES.md)
- [Quick Start Guide](QUICKSTART.md)

## 📄 License

MIT