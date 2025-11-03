# Transactions App

A modern financial tracking application designed for couples to log and manage their transactions together, promoting **financial equality and transparency**. Built with React 19, TypeScript, and a comprehensive PWA architecture.

## 💡 Purpose

This app helps couples track their financial transactions in one shared space. Both partners can:

- Log expenses and deposits with categorization
- View shared financial data in real-time
- Maintain balance and transparency in household finances
- Access the app offline with PWA capabilities
- Install as a native-like mobile/desktop app

## 📚 Documentation

Our comprehensive documentation is organized by topic:

### Core Documentation

- **[Frontend Architecture](docs/FRONTEND.md)** - React, TypeScript, component patterns, and UI guidelines
- **[Backend Architecture](docs/BACKEND.md)** - PHP API architecture, database patterns, and deployment
- **[Database Guide](docs/DATABASE.md)** - Multi-environment setup, schema, migrations, and management
- **[Authentication & Security](docs/AUTH.md)** - Supabase integration, user management, and security

### Features & Capabilities

- **[Progressive Web App](docs/PWA.md)** - Installation, service workers, and caching strategies
- **[Offline Support](docs/OFFLINE.md)** - Comprehensive offline functionality, sync, and conflict resolution
- **[Error Handling](docs/ERROR_HANDLING.md)** - Debug system, logging, and error recovery
- **[Coding Guidelines](docs/CODING_GUIDELINES.md)** - Standards, conventions, and best practices

### Quick Start Guides

- **[Quick Start](docs/QUICKSTART.md)** - Get up and running quickly

## 🚀 Tech Stack

### Frontend Technologies

- **React 19** - Latest React with concurrent features
- **TypeScript** - Full type safety and developer experience
- **Vite** - Fast build tool and development server
- **Tailwind CSS 4** - Utility-first styling with modern features
- **DaisyUI 5** - Component library with Emerald theme
- **PWA Support** - Offline capabilities, installable app

### Backend Technologies

- **PHP 8.1+** - Modern PHP with strong typing
- **SQLite** - Lightweight, file-based database
- **Multi-environment** - Local, preview, and production databases
- **RESTful APIs** - Clean API architecture with proper error handling

### Development & Quality

- **ESLint 9** - Modern linting with flat config
- **Prettier** - Consistent code formatting
- **TypeScript** - Comprehensive type checking
- **Testing** - Component and integration testing

## 📋 Prerequisites

### Required Software

- Node.js (v18 or higher)
- npm or yarn
- PHP 8.1 or higher
- A Supabase account (for authentication features)

## 🛠️ Quick Setup

### 1. Clone and Install

```bash
git clone <repository-url>
cd transactions-app
npm install
```

### 2. Environment Configuration

```bash
cp .env.example .env
```

Add your Supabase credentials to `.env`:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Start Development

```bash
# Start frontend (runs on http://localhost:5173)
npm run dev

# Set up backend (see docs/BACKEND.md for details)
```

## 🏗️ Project Structure

```text
/
├── src/                    # Frontend source code
│   ├── components/         # React components
│   ├── pages/             # Page components
│   ├── services/          # API services
│   ├── hooks/             # Custom React hooks
│   ├── types/             # TypeScript type definitions
│   └── utils/             # Utility functions
├── backend/               # PHP backend
│   ├── database/          # Database setup and migrations
│   └── *.php              # API endpoints
├── docs/                  # Comprehensive documentation
└── public/                # Static assets
```

## � Key Features

- **Multi-User Support** - Shared access for couples
- **Real-time Updates** - Live data synchronization
- **Offline Capability** - Full PWA functionality
- **Category Management** - Organized transaction tracking
- **Responsive Design** - Works on all devices
- **Secure Authentication** - Supabase-powered auth
- **Data Export** - Transaction history exports

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please read our [Coding Guidelines](docs/CODING_GUIDELINES.md) before contributing.

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support & Troubleshooting

- Check our [Error Handling Guide](docs/ERROR_HANDLING.md) for common issues
- Review the [Quick Start Guide](docs/QUICKSTART.md) for setup help
- See [Backend Architecture](docs/BACKEND.md) for server configuration

For detailed information about any aspect of the application, please refer to the appropriate documentation in the `docs/` folder.
