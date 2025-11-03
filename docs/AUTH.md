# Authentication & Security

## Overview

The Transactions App uses **Supabase** for authentication and implements multiple security layers to protect user data and ensure secure access to the application.

## Table of Contents

- [Authentication System](#authentication-system)
- [User Management](#user-management)
- [Security Configuration](#security-configuration)
- [Environment Variables](#environment-variables)
- [Protected Routes](#protected-routes)
- [Security Headers](#security-headers)
- [Testing Security](#testing-security)

## Authentication System

### Supabase Integration

The app uses Supabase for user authentication, providing:

- **Email/Password Authentication**: Standard login and registration
- **Session Management**: Automatic session handling and token refresh
- **User Profiles**: Linked to local database for transaction ownership
- **Secure Storage**: Authentication tokens stored securely

### Configuration

Authentication is configured in `src/lib/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

### Environment Variables

Required Supabase configuration:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Development Mode

If Supabase credentials are missing, the app creates a dummy client for development:

- Placeholder URL and key are used
- Authentication features are disabled
- Local development can continue without Supabase setup

## User Management

### User Registration

1. User creates account through Supabase authentication
2. Supabase generates a unique `user_id` (UUID)
3. Local database creates user record with Supabase `user_id`
4. User can start creating transactions

### User Authentication Flow

1. **Login**: User enters email/password
2. **Supabase Verification**: Credentials verified by Supabase
3. **Session Creation**: Supabase creates authenticated session
4. **Local User Lookup**: App finds local user record by Supabase `user_id`
5. **Transaction Access**: User gains access to their transactions

### Database Integration

The local SQLite database links to Supabase authentication:

```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT, -- Supabase auth user ID (UUID)
    email TEXT NOT NULL UNIQUE,
    firstname TEXT NOT NULL,
    surname TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Unique index for user_id lookups
CREATE UNIQUE INDEX idx_users_user_id ON users(user_id);
```

### User Data Privacy

- Each user can only access their own transactions
- Transactions are filtered by `user_id` at the database level
- No cross-user data access is possible
- Categories are shared across all users (for consistency)

## Security Configuration

### Protected Directories

The application uses `.htaccess` files to protect sensitive directories and files. For complete `.htaccess` configuration details, deployment checklists, and troubleshooting, see the [Backend Architecture Documentation](BACKEND.md#security-configuration).

#### Overview of Protected Areas

- **`/data/`** - Complete database protection (blocks all access)
- **`/backend/`** - API directory (allows only PHP files)
- **`/backend/database/`** - Migration scripts (blocks all access)
- **`/backend/database/backups/`** - Database backups (blocks all access)

#### 1. `/data/` - Database Protection

```apache
# Block all access to production database
<FilesMatch "\.(sqlite|sqlite3|db|db3)$">
    Require all denied
</FilesMatch>
```

#### 2. `/backend/` - API Directory

```apache
# Allow only PHP API files
<FilesMatch "\.(php)$">
    Require all granted
</FilesMatch>
<FilesMatch "^(?!.*\.php$).*$">
    Require all denied
</FilesMatch>
```

#### 3. `/backend/database/` - Migration Scripts

```apache
# Block all access to migration scripts
Require all denied
```

### File Types Blocked

Security configuration blocks access to:

- **Database Files**: `.sqlite`, `.sqlite3`, `.db`, `.sql`
- **Backup Files**: `.bak`, `.backup`, `.old`, `.tmp`
- **Config Files**: `.env`, `.json`, `.md`, `.sh`
- **Hidden Files**: Any file starting with `.`
- **Editor Files**: `.swp`, `~`, `.gitignore`

## Environment Variables

### Required Variables

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# API Configuration
VITE_API_BASE_URL=http://localhost/backend
```

### Environment Files

- `.env.development` - Development configuration
- `.env.server` - Server/production configuration
- `.env.example` - Template for environment setup

### Security Best Practices

- Never commit `.env` files to version control
- Use different Supabase projects for development and production
- Rotate keys regularly
- Use environment-specific configurations

## Protected Routes

### Frontend Route Protection

Authentication-required routes are protected using React Router:

```typescript
// Protected route example
<Route
  path="/transactions"
  element={
    <ProtectedRoute>
      <TransactionsPage />
    </ProtectedRoute>
  }
/>
```

### Backend API Protection

PHP APIs validate authentication before processing requests:

```php
// User authentication check
if (!$user_id) {
    http_response_code(401);
    echo json_encode(['error' => 'Authentication required']);
    exit;
}
```

## Security Headers

### HTTP Security Headers

The backend `.htaccess` sets security headers:

```apache
Header always set X-Content-Type-Options "nosniff"
Header always set X-Frame-Options "SAMEORIGIN"
Header always set X-XSS-Protection "1; mode=block"
```

### CORS Configuration

Cross-Origin Resource Sharing is configured in `backend/cors.php`:

```php
// Allow frontend origins
header("Access-Control-Allow-Origin: " . $allowed_origin);
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
```

## Testing Security

### Manual Security Tests

#### Test 1: Database Access (Should Fail)

```bash
curl https://your-domain.com/data/database.sqlite
# Expected: 403 Forbidden
```

#### Test 2: Directory Browsing (Should Fail)

```bash
curl https://your-domain.com/backend/
# Expected: 403 Forbidden (no directory listing)
```

#### Test 3: Migration Scripts (Should Fail)

```bash
curl https://your-domain.com/backend/database/schema.sql
# Expected: 403 Forbidden
```

### Automated Security Tests

Security tests are defined in `docs/SECURITY_TESTS.md`:

- Database file access tests
- Directory browsing tests
- Hidden file access tests
- Backup file access tests

### Security Monitoring

- Monitor authentication logs in Supabase dashboard
- Check server access logs for unauthorized attempts
- Review CORS errors for potential security issues
- Validate environment variable security regularly

## Troubleshooting

### Common Authentication Issues

#### Missing Supabase Credentials

- **Symptom**: Authentication features not working
- **Solution**: Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`

#### CORS Errors

- **Symptom**: API calls blocked by browser
- **Solution**: Update `cors.php` with correct frontend origin

#### User Not Found in Local Database

- **Symptom**: Authenticated user cannot access transactions
- **Solution**: Ensure user record exists in local database with correct `user_id`

### Security Incident Response

1. **Identify**: Monitor logs for suspicious activity
2. **Isolate**: Block suspicious IP addresses via server configuration
3. **Investigate**: Review authentication logs and database access patterns
4. **Remediate**: Rotate keys, update security configurations
5. **Document**: Record incident details and lessons learned

## Best Practices

### Development

- Use separate Supabase projects for dev/staging/production
- Never log authentication tokens or sensitive data
- Test authentication flows regularly
- Use HTTPS in all non-local environments

### Production

- Enable rate limiting on authentication endpoints
- Monitor authentication failure rates
- Implement session timeout policies
- Regular security audits and penetration testing

### Code Security

- Validate all user inputs
- Use parameterized queries to prevent SQL injection
- Implement proper error handling without exposing system details
- Regular dependency updates and security patches
