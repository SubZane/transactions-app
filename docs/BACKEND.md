# Backend Architecture

## Overview

The Transactions App uses a lightweight PHP + SQLite backend architecture designed for simplicity, security, and maintainability. This document outlines the backend structure, patterns, and best practices.

## Table of Contents

- [Architecture Philosophy](#architecture-philosophy)
- [Project Structure](#project-structure)
- [Core Components](#core-components)
- [API Patterns](#api-patterns)
- [Database Layer](#database-layer)
- [Authentication & Security](#authentication--security)
- [Environment Configuration](#environment-configuration)
- [Deployment](#deployment)

## Architecture Philosophy

The backend follows these principles:

- **Simple**: No complex frameworks, just clean PHP with clear patterns
- **Secure**: CORS protection, authentication helpers, input validation by default
- **Portable**: SQLite database, easy to deploy anywhere
- **Maintainable**: Clear separation of concerns, migration system, consistent patterns
- **Scalable**: Can start small and migrate to MySQL/PostgreSQL later if needed

## Project Structure

```
backend/
├── auth-helper.php          # Authentication utilities
├── cors.php                 # CORS configuration
├── transactions.php         # Transaction API endpoints
├── categories.php           # Categories API endpoints
├── users.php               # User management API
└── database/
    ├── schema.sql          # Complete database schema
    ├── *.sqlite            # SQLite database files
    ├── migrate_*.php       # Migration scripts
    ├── check_*.php         # Database utilities
    ├── backup_database.php # Backup utility
    └── backups/            # Backup storage
```

## Core Components

### 1. CORS Configuration (`cors.php`)

Handles cross-origin requests between frontend and backend:

```php
<?php
function cors() {
    $allowed_origins = [
        'http://localhost:5173',    // Vite dev
        'http://localhost:4173',    // Vite preview
        'https://your-domain.com'   // Production
    ];

    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    if (in_array($origin, $allowed_origins)) {
        header("Access-Control-Allow-Origin: $origin");
    }

    header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization");

    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(204);
        exit;
    }
}
?>
```

### 2. Authentication Helper (`auth-helper.php`)

Provides authentication utilities for protected endpoints:

```php
<?php
function requireAuth() {
    $headers = getallheaders();
    $authHeader = $headers['Authorization'] ?? '';

    if (empty($authHeader) || !str_starts_with($authHeader, 'Bearer ')) {
        http_response_code(401);
        echo json_encode(['error' => 'Authentication required']);
        exit;
    }

    // Validate token with Supabase or your auth provider
    // Return user data or exit with 401
}

function getUserId() {
    // Extract user ID from authenticated request
    // Used for user-specific data filtering
}
?>
```

### 3. Database Connection Pattern

Standard database connection used across all endpoints:

```php
$environment = $_ENV['ENVIRONMENT'] ?? 'local';
$dbPath = $environment === 'local'
    ? __DIR__ . '/database/database-local.sqlite'
    : __DIR__ . '/database/database-server.sqlite';

try {
    $pdo = new PDO("sqlite:$dbPath");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed']);
    exit;
}
```

## API Patterns

### 1. Standard API Endpoint Structure

Each entity follows this pattern:

```php
<?php
/**
 * [Entity] API Endpoint
 *
 * Endpoints:
 * - GET    /[entity]         - List all
 * - GET    /[entity]/{id}    - Get one
 * - POST   /[entity]         - Create
 * - PUT    /[entity]/{id}    - Update
 * - DELETE /[entity]/{id}    - Delete
 */

// 1. CORS (always first)
require_once __DIR__ . '/cors.php';
cors();

// 2. Set response type
header('Content-Type: application/json');

// 3. Database connection
// [connection code]

// 4. Routing
$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$pathParts = explode('/', trim($path, '/'));

// 5. Route handlers
try {
    switch ($method) {
        case 'GET':
            isset($pathParts[1]) ? getOne($pdo, $pathParts[1]) : getAll($pdo);
            break;
        case 'POST':
            create($pdo);
            break;
        case 'PUT':
            update($pdo, $pathParts[1]);
            break;
        case 'DELETE':
            delete($pdo, $pathParts[1]);
            break;
        default:
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Internal server error']);
}
?>
```

### 2. CRUD Handler Functions

#### GET All Resources

```php
function getAll($pdo) {
    $stmt = $pdo->query("
        SELECT * FROM [table]
        WHERE deleted_at IS NULL
        ORDER BY created_at DESC
    ");
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
}
```

#### GET Single Resource

```php
function getOne($pdo, $id) {
    $stmt = $pdo->prepare("
        SELECT * FROM [table]
        WHERE id = ? AND deleted_at IS NULL
    ");
    $stmt->execute([$id]);
    $item = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$item) {
        http_response_code(404);
        echo json_encode(['error' => 'Not found']);
        return;
    }

    echo json_encode($item);
}
```

#### CREATE Resource

```php
function create($pdo) {
    $user = requireAuth();
    $input = json_decode(file_get_contents('php://input'), true);

    // Validate required fields
    if (empty(trim($input['required_field'] ?? ''))) {
        http_response_code(400);
        echo json_encode(['error' => 'required_field is required']);
        return;
    }

    $stmt = $pdo->prepare("
        INSERT INTO [table] (field1, field2, user_id, created_at, updated_at)
        VALUES (?, ?, ?, datetime('now'), datetime('now'))
    ");
    $stmt->execute([
        $input['field1'],
        $input['field2'] ?? null,
        $user['sub']
    ]);

    // Return created resource
    $id = $pdo->lastInsertId();
    $stmt = $pdo->prepare("SELECT * FROM [table] WHERE id = ?");
    $stmt->execute([$id]);

    http_response_code(201);
    echo json_encode($stmt->fetch(PDO::FETCH_ASSOC));
}
```

### 3. Error Handling Pattern

```php
try {
    // Database operations
} catch (PDOException $e) {
    error_log("Database error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Database operation failed']);
} catch (Exception $e) {
    error_log("General error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Internal server error']);
}
```

## Database Layer

### 1. Schema Design Patterns

Every table follows this structure:

```sql
CREATE TABLE IF NOT EXISTS [table_name] (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    -- Business columns
    user_id INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    deleted_at TEXT, -- For soft deletes
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_[table]_user_id ON [table](user_id);
CREATE INDEX IF NOT EXISTS idx_[table]_created_at ON [table](created_at);
```

### 2. Data Types Standards

- **IDs**: `INTEGER PRIMARY KEY AUTOINCREMENT`
- **Dates**: `TEXT` in ISO 8601 format (`YYYY-MM-DD` or `YYYY-MM-DD HH:MM:SS`)
- **Amounts**: `INTEGER` (Swedish kronor, no decimals) or `REAL` (with decimals)
- **Foreign Keys**: `INTEGER` with appropriate constraints
- **Text**: `TEXT` for strings, `TEXT NULL` for optional fields

### 3. Migration System

Migration files follow this pattern:

```php
<?php
/**
 * Migration: [Descriptive Name]
 *
 * Purpose: [Why this change is needed]
 * Rollback: [How to undo if needed]
 */

$dbPath = __DIR__ . '/database.sqlite';

try {
    $pdo = new PDO("sqlite:$dbPath");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    echo "Starting migration...\n";
    $pdo->beginTransaction();

    // Migration steps
    $pdo->exec("ALTER TABLE [table] ADD COLUMN [column] [type]");
    $pdo->exec("UPDATE [table] SET [column] = [default] WHERE [column] IS NULL");

    $pdo->commit();
    echo "✅ Migration completed!\n";

} catch (PDOException $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    die("❌ Migration failed: " . $e->getMessage() . "\n");
}
?>
```

## Authentication & Security

### 1. Request Authentication

```php
function validateAuth() {
    $headers = getallheaders();
    $authHeader = $headers['Authorization'] ?? '';

    if (!str_starts_with($authHeader, 'Bearer ')) {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid authorization header']);
        exit;
    }

    $token = substr($authHeader, 7);
    // Validate token with Supabase
    return verifySupabaseToken($token);
}
```

### 2. Input Validation

```php
function validateInput($input, $rules) {
    $errors = [];

    foreach ($rules as $field => $rule) {
        if ($rule['required'] && empty(trim($input[$field] ?? ''))) {
            $errors[] = "$field is required";
        }

        if (isset($input[$field]) && isset($rule['type'])) {
            if ($rule['type'] === 'integer' && !is_numeric($input[$field])) {
                $errors[] = "$field must be a number";
            }
        }
    }

    if (!empty($errors)) {
        http_response_code(400);
        echo json_encode(['errors' => $errors]);
        exit;
    }
}
```

### 3. SQL Injection Prevention

Always use prepared statements:

```php
// ✅ CORRECT - Use prepared statements
$stmt = $pdo->prepare("SELECT * FROM users WHERE id = ?");
$stmt->execute([$userId]);

// ❌ WRONG - Never concatenate user input
$query = "SELECT * FROM users WHERE id = " . $userId;
```

## Environment Configuration

### 1. Environment Detection

```php
$environment = $_ENV['ENVIRONMENT'] ?? 'local';

$config = [
    'local' => [
        'database' => __DIR__ . '/database/database-local.sqlite',
        'debug' => true
    ],
    'server' => [
        'database' => __DIR__ . '/database/database-server.sqlite',
        'debug' => false
    ]
];

$dbPath = $config[$environment]['database'];
```

### 2. Environment Variables

```env
# Environment identifier
ENVIRONMENT=local

# Database paths (if overriding defaults)
DATABASE_PATH=/custom/path/database.sqlite

# API configuration
API_BASE_URL=http://localhost/backend

# Debug settings
DEBUG_MODE=true
```

## Deployment

### 1. Server Requirements

- **PHP**: 8.1 or higher
- **SQLite**: Built into PHP
- **Apache/Nginx**: Web server with mod_rewrite
- **SSL**: HTTPS certificate for production

### 2. Directory Structure in Production

```
/var/www/your-app/
├── public/                 # Document root
│   ├── index.html         # Frontend build
│   ├── assets/            # Frontend assets
│   └── backend/           # API endpoints
│       ├── *.php         # Public API files
│       └── .htaccess     # Security rules
├── data/                  # Outside document root
│   ├── *.sqlite          # Database files
│   └── .htaccess         # Block all access
└── config/
    └── .env              # Environment variables
```

### 3. Security Configuration

#### Apache .htaccess Files Overview

The application uses multiple `.htaccess` files to protect sensitive directories and files:

| Location                              | Purpose             | Protection Level     |
| ------------------------------------- | ------------------- | -------------------- |
| `/data/.htaccess`                     | Database protection | Block ALL access     |
| `/backend/.htaccess`                  | API directory       | Allow only PHP files |
| `/backend/database/.htaccess`         | Migration scripts   | Block ALL access     |
| `/backend/database/backups/.htaccess` | Database backups    | Block ALL access     |

#### 1. Backend Directory (`/backend/.htaccess`)

```apache
# Disable directory browsing
Options -Indexes

# Allow only PHP files to be accessed
<FilesMatch "\.(php)$">
    Require all granted
</FilesMatch>

# Block database files
<FilesMatch "\.(sqlite|sqlite3|db|db3|sql)$">
    Require all denied
</FilesMatch>

# Block hidden files and directories
<FilesMatch "^\.">
    Require all denied
</FilesMatch>

# Block backup files
<FilesMatch "\.(bak|backup|old|tmp|temp)$">
    Require all denied
</FilesMatch>

# Block config files
<FilesMatch "\.(env|json|md|sh|lock)$">
    Require all denied
</FilesMatch>

# Block editor files
<FilesMatch "\.(swp|~|gitignore)$">
    Require all denied
</FilesMatch>

# Security headers
Header always set X-Content-Type-Options "nosniff"
Header always set X-Frame-Options "SAMEORIGIN"
Header always set X-XSS-Protection "1; mode=block"
```

#### 2. Data Directory Protection (`/data/.htaccess`)

```apache
# Block ALL access to production database
Require all denied

# Additional protection for database files
<FilesMatch "\.(sqlite|sqlite3|db|db3|sql)$">
    Require all denied
</FilesMatch>

# Block directory browsing
Options -Indexes
```

#### 3. Migration Scripts Protection (`/backend/database/.htaccess`)

```apache
# Block all access to migration scripts and schema files
Require all denied
Options -Indexes
```

#### 4. Database Backups Protection (`/backend/database/backups/.htaccess`)

```apache
# Block all access to database backup files
Require all denied
Options -Indexes
```

#### Apache Configuration Requirements

These `.htaccess` files require:

- **Apache 2.4+**: Uses `mod_authz_core` (Require directive)
- **Apache 2.2**: Uses `mod_access` (Allow/Deny directive)
- **AllowOverride**: Must be enabled in Apache configuration

Enable `.htaccess` in your Apache virtual host:

```apache
<Directory /var/www/your-domain.com>
    AllowOverride All
    Options -Indexes
</Directory>
```

#### Nginx Alternative Configuration

If using Nginx instead of Apache, add these rules to your server block:

```nginx
# Block access to data directory
location /data/ {
    deny all;
    return 403;
}

# Block access to database files anywhere
location ~ \.(sqlite|sqlite3|db|db3|sql)$ {
    deny all;
    return 403;
}

# Block access to hidden files
location ~ /\. {
    deny all;
    return 403;
}

# Block access to backend database directory
location /backend/database/ {
    deny all;
    return 403;
}

# Backend directory - allow only PHP files
location /backend/ {
    # Allow PHP files
    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
        include snippets/fastcgi-php.conf;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
    }

    # Block other file types
    location ~ \.(bak|backup|old|json|md|sh|env|tmp)$ {
        deny all;
        return 403;
    }
}

# Security headers
add_header X-Content-Type-Options "nosniff" always;
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-XSS-Protection "1; mode=block" always;
```

### 4. Build Process

```bash
# 1. Build frontend
npm run build

# 2. Copy backend files to production
rsync -av backend/ /var/www/app/public/backend/

# 3. Set proper permissions
chmod 755 /var/www/app/public/backend/
chmod 644 /var/www/app/public/backend/*.php
chmod 600 /var/www/app/data/*.sqlite
```

### 5. Deployment Checklist

When deploying, ensure these security files are in place:

#### Required .htaccess Files

- [ ] `data/.htaccess` - Database protection
- [ ] `backend/.htaccess` - API directory security
- [ ] `backend/database/.htaccess` - Migration scripts protection
- [ ] `backend/database/backups/.htaccess` - Backup files protection

#### File Permissions

- [ ] `chmod 755` for directories (`data/`, `backend/`)
- [ ] `chmod 644` for PHP files (`*.php`)
- [ ] `chmod 644` for `.htaccess` files
- [ ] `chmod 600` for database files (`*.sqlite`)

#### Server Configuration

- [ ] Apache: `AllowOverride All` enabled
- [ ] Apache: `mod_rewrite` module enabled
- [ ] PHP: `sqlite3` extension enabled
- [ ] PHP: `pdo_sqlite` extension enabled

### 6. Security Testing

Test your deployment security with these commands:

```bash
# Test 1: Database access (should return 403)
curl -I https://your-domain.com/data/database.sqlite

# Test 2: Directory browsing (should return 403)
curl -I https://your-domain.com/backend/database/

# Test 3: Hidden files (should return 403)
curl -I https://your-domain.com/backend/.env

# Test 4: Migration scripts (should return 403)
curl -I https://your-domain.com/backend/database/schema.sql

# Test 5: API access (should work - 200 or 401, not 403)
curl -I https://your-domain.com/backend/transactions.php
```

### 7. Troubleshooting

#### Issue: 500 Internal Server Error

**Cause**: Apache doesn't support `.htaccess` or `AllowOverride` is disabled

**Solution**:

```apache
# Add to your Apache virtual host configuration
<Directory /var/www/your-domain.com>
    AllowOverride All
    Options -Indexes
</Directory>
```

#### Issue: API endpoints return 403 Forbidden

**Cause**: `.htaccess` rules are blocking PHP files

**Solution**: Verify your `backend/.htaccess` includes:

```apache
<FilesMatch "\.(php)$">
    Require all granted
</FilesMatch>
```

#### Issue: Database files still accessible

**Cause**: `.htaccess` file missing or not working

**Solution**:

1. Verify file exists: `ls -la data/.htaccess`
2. Check file permissions: `chmod 644 data/.htaccess`
3. Test Apache config: `apachectl configtest`
4. Check Apache error log: `tail -f /var/log/apache2/error.log`

#### Issue: Directory browsing still enabled

**Cause**: `Options -Indexes` not working

**Solution**: Add to main Apache configuration:

```apache
<Directory /var/www>
    Options -Indexes
</Directory>
```

## Best Practices

### 1. Error Handling

- Always use try-catch for database operations
- Log errors server-side, return generic messages to client
- Use appropriate HTTP status codes (200, 201, 400, 401, 404, 500)

### 2. Performance

- Create indexes on frequently queried columns
- Use LIMIT/OFFSET for pagination
- Cache static data (categories) when possible

### 3. Security

- Validate all inputs before database operations
- Use prepared statements for all queries
- Implement rate limiting for authentication endpoints
- Regular security audits and updates

### 4. Maintenance

- Keep migration scripts for database changes
- Regular database backups
- Monitor error logs
- Update dependencies regularly
