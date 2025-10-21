# Quick Start Guide

Get up and running with the Transactions App in 5 minutes.

## Prerequisites

- Node.js 18+ installed
- npm or yarn

## Installation Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables (Optional)

For full functionality with Supabase authentication:

```bash
cp .env.example .env
```

Edit `.env` and add your Supabase credentials:
- Get your Supabase URL and anon key from [Supabase Dashboard](https://app.supabase.com/)

> **Note**: The app will run without Supabase credentials for development purposes, but authentication features will not work.

### 3. Start Development Server

```bash
npm run dev
```

The app will open at `http://localhost:3000`

## What's Included

✅ **React 19** with TypeScript  
✅ **Vite** - Lightning fast build tool  
✅ **Tailwind CSS** - Utility-first CSS  
✅ **DaisyUI** - Beautiful UI components  
✅ **Supabase** - Authentication ready  
✅ **Axios** - HTTP client configured  
✅ **ESLint & Prettier** - Code quality tools  

## Project Structure

```
src/
├── components/      # Reusable UI components (LoginForm, Header)
├── hooks/           # Custom React hooks (useAuth)
├── lib/             # Library configs (axios, supabase)
├── pages/           # Page components
├── services/        # API services
├── styles/          # Global styles
├── types/           # TypeScript types
├── utils/           # Utility functions
└── App.tsx          # Main app component
```

## Available Commands

```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Check code quality
npm run lint:fix     # Fix linting issues
npm run format       # Format code
```

## Next Steps

1. **Read the full [README.md](README.md)** for detailed documentation
2. **Review [CODING_CONVENTIONS.md](CODING_CONVENTIONS.md)** for coding standards
3. **Start building!** - Add your components in `src/components/`

## Need Help?

- Check the [README.md](README.md) for detailed setup instructions
- Review the example code in `src/` directory
- Look at the TypeScript types in `src/types/`

## Common Issues

### Supabase Warning
If you see a Supabase warning in the console, it's normal during development. The app uses placeholder credentials when real ones aren't configured.

### Port Already in Use
If port 3000 is in use, the app will automatically try the next available port.

### Build Errors
Clear cache and reinstall:
```bash
rm -rf node_modules node_modules/.vite
npm install
```

Happy coding! 🚀
