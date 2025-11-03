# Database Documentation

## Overview

The transactions app uses SQLite databases with a multi-environment setup to support development, staging, and production workflows. This document covers the complete database architecture, environments, and management procedures.

## Table of Contents

- [Database Architecture](#database-architecture)
- [Multi-Environment Setup](#multi-environment-setup)
- [Database Schema](#database-schema)
- [Migration System](#migration-system)
- [Backup & Recovery](#backup--recovery)
- [Performance & Indexes](#performance--indexes)
- [Security](#security)

## Database Architecture

### File Structure

```
data/                           # Production data directory
├── database.sqlite            # Original/main database
├── database-preview.sqlite    # Development & preview environment
├── database-server.sqlite     # Production server environment
├── database-local.sqlite      # Local development (optional)
└── README.md                  # Data directory documentation

backend/database/              # Database management
├── schema.sql                 # Complete database schema
├── migrate_*.php             # Migration scripts
├── check_*.php               # Database utilities
├── backup_database.php       # Backup utility
└── backups/                  # Automated backups
```

### Database Types by Environment

| Environment           | Database File             | Usage                   |
| --------------------- | ------------------------- | ----------------------- |
| **Local Development** | `database-local.sqlite`   | Local dev work          |
| **Preview/Staging**   | `database-preview.sqlite` | Testing & preview       |
| **Production**        | `database-server.sqlite`  | Live production data    |
| **Original**          | `database.sqlite`         | Backup of original data |

## Multi-Environment Setup

### Environment Detection

The system automatically selects databases based on:

#### Automatic Detection

- **Development**: `localhost:5173` (Vite dev) → preview database
- **Preview**: `localhost:4173` (Vite preview) → preview database
- **Production**: Non-localhost domains → server database

#### Manual Override

1. **HTTP Header**: `X-App-Env: server|preview|development`
2. **URL Parameter**: `?env=server|preview|development`
3. **Environment Variable**: `ENVIRONMENT=server|preview|local`

### Backend Environment Configuration

```php
$environment = $_ENV['ENVIRONMENT'] ?? 'local';

$databases = [
    'local' => __DIR__ . '/../data/database-local.sqlite',
    'preview' => __DIR__ . '/../data/database-preview.sqlite',
    'server' => __DIR__ . '/../data/database-server.sqlite',
    'original' => __DIR__ . '/../data/database.sqlite'
];

$dbPath = $databases[$environment];
```

### Setup New Environment

```bash
# 1. Copy schema to new database
php backend/database/setup_new_db.php --env=preview

# 2. Run migrations if needed
php backend/database/migrate_*.php

# 3. Verify structure
php backend/database/check_structure.php
```

## Database Schema

All databases share the same schema structure defined in `backend/database/schema.sql`:

### Tables

1. **users** - User profile information linked to Supabase authentication
2. **categories** - Predefined transaction categories (shared across all users)
3. **transactions** - Individual transaction records (user-owned)
4. **schema_version** - Database migration tracking

### Schema Details

- **Amount Storage**: `INTEGER` type (Swedish kronor, no decimals, minimum 1 kr)
- **Date Format**: ISO 8601 format (YYYY-MM-DD)
- **User Authentication**: Links to Supabase via `user_id` field
- **Foreign Keys**: Proper cascading and restrict constraints

### Core Schema

```sql
-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT, -- Supabase auth user ID (UUID)
    email TEXT NOT NULL UNIQUE,
    firstname TEXT NOT NULL,
    surname TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    type TEXT NOT NULL CHECK(type IN ('deposit', 'expense')),
    description TEXT,
    icon TEXT,
    color TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    category_id INTEGER NULL,
    type TEXT NOT NULL CHECK(type IN ('deposit', 'expense')),
    amount INTEGER NOT NULL CHECK(amount >= 1),
    description TEXT,
    transaction_date TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT
);
```

## Migration System

### Migration Files

Located in `backend/database/`, migrations follow the pattern `migrate_[description].php`:

- `migrate_add_user_id_column.php` - Added Supabase user ID integration
- `migrate_rename_*.php` - Category name updates
- `simple_migration.php` - Schema alignment tool

### Running Migrations

```bash
# Run specific migration
php backend/database/migrate_[name].php

# Check database structure
php backend/database/check_structure.php

# Verify migration success
php backend/database/check-database-status.php
```

### Migration Pattern

```php
<?php
/**
 * Migration: [Description]
 * Purpose: [Why this change is needed]
 * Rollback: [How to undo if needed]
 */

$dbPath = __DIR__ . '/../../data/database-server.sqlite';

try {
    $pdo = new PDO("sqlite:$dbPath");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $pdo->beginTransaction();

    // Migration steps
    $pdo->exec("ALTER TABLE [table] ADD COLUMN [column] [type]");

    $pdo->commit();
    echo "✅ Migration completed!\n";

} catch (Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    die("❌ Migration failed: " . $e->getMessage() . "\n");
}
?>
```

## Backup and Recovery

### Automated Backups

The `backup_database.php` script creates timestamped backups:

```bash
# Create backup
php backend/database/backup_database.php

# Backups stored in
backend/database/backups/database_backup_YYYY-MM-DD_HHMMSS.sqlite
```

### Manual Backup

```bash
# Copy database file
cp data/database-server.sqlite backups/manual_backup_$(date +%Y%m%d_%H%M%S).sqlite

# Export schema only
sqlite3 data/database-server.sqlite .schema > schema_backup.sql

# Export data as SQL
sqlite3 data/database-server.sqlite .dump > full_backup.sql
```

### Recovery

```bash
# Restore from backup
cp backups/database_backup_[timestamp].sqlite data/database-server.sqlite

# Restore from SQL dump
sqlite3 data/database-server.sqlite < full_backup.sql
```

## Performance and Indexes

The following indexes are created for optimal query performance:

### User Indexes

- `idx_users_email` - Fast email lookups for authentication
- `idx_users_user_id` - Unique index for Supabase user ID lookups

### Category Indexes

- `idx_categories_type` - Filter by transaction type (deposit/expense)

### Transaction Indexes

- `idx_transactions_user_id` - User-specific transaction queries
- `idx_transactions_category_id` - Category-based filtering
- `idx_transactions_type` - Type-based filtering (deposit/expense)
- `idx_transactions_date` - Date-based queries and sorting
- `idx_transactions_user_date` - Composite index for user + date queries

### Query Optimization

```sql
-- Efficient user transaction queries
SELECT * FROM transactions
WHERE user_id = ? AND transaction_date >= ?
ORDER BY transaction_date DESC;

-- Use indexes for filtering
SELECT * FROM transactions t
JOIN categories c ON t.category_id = c.id
WHERE t.user_id = ? AND c.type = 'expense';
```

## Security

### Data Protection

- Database files located outside web document root
- `.htaccess` files block direct database access
- User-specific data isolation via `user_id` filtering
- Foreign key constraints maintain referential integrity

### Access Control

```apache
# data/.htaccess - Block ALL web access
<FilesMatch "\.(sqlite|sqlite3|db|db3)$">
    Require all denied
</FilesMatch>

Options -Indexes
```

### SQL Injection Prevention

```php
// ✅ CORRECT - Use prepared statements
$stmt = $pdo->prepare("SELECT * FROM transactions WHERE user_id = ?");
$stmt->execute([$userId]);

// ❌ WRONG - Never concatenate user input
$query = "SELECT * FROM transactions WHERE user_id = " . $userId;
```

## Database Management Scripts

Located in `backend/database/`:

| Script                      | Purpose                                 |
| --------------------------- | --------------------------------------- |
| `schema.sql`                | Complete database schema with seed data |
| `check-database-status.php` | Status check for all databases          |
| `check_structure.php`       | Compare actual vs schema structure      |
| `check_categories.php`      | List all categories                     |
| `simple_migration.php`      | Schema alignment tool                   |
| `backup_database.php`       | Create timestamped backups              |

### Utility Commands

```bash
# Check database status
php backend/database/check-database-status.php

# Verify schema alignment
php backend/database/check_structure.php

# List categories
php backend/database/check_categories.php

# Create backup
php backend/database/backup_database.php
```

## Environment Migration

### Moving Between Environments

```bash
# Copy preview to server (promote to production)
cp data/database-preview.sqlite data/database-server.sqlite

# Copy server to preview (debugging production issues)
cp data/database-server.sqlite data/database-preview.sqlite

# Reset preview to clean state
rm data/database-preview.sqlite
sqlite3 data/database-preview.sqlite < backend/database/schema.sql
```

### Database Synchronization

```bash
# Export production data
sqlite3 data/database-server.sqlite .dump > production_data.sql

# Import to preview (WARNING: overwrites existing data)
sqlite3 data/database-preview.sqlite < production_data.sql
```

## Troubleshooting

### Common Issues

#### Database File Not Found

- **Symptom**: `Database connection failed`
- **Solution**: Ensure database file exists and has correct permissions

#### Permission Denied

- **Symptom**: `SQLSTATE[HY000]: General error: 8 attempt to write a readonly database`
- **Solution**: Check file permissions (`chmod 664 *.sqlite`)

#### Schema Mismatch

- **Symptom**: Table/column doesn't exist errors
- **Solution**: Run migrations or check schema alignment

### Database Recovery

```bash
# Check database integrity
sqlite3 data/database-server.sqlite "PRAGMA integrity_check;"

# Repair corrupted database
sqlite3 data/database-server.sqlite ".recover" | sqlite3 recovered.sqlite

# Verify table structure
sqlite3 data/database-server.sqlite ".schema"
```

### Performance Issues

```bash
# Analyze query performance
sqlite3 data/database-server.sqlite "EXPLAIN QUERY PLAN SELECT ..."

# Update table statistics
sqlite3 data/database-server.sqlite "ANALYZE;"

# Check database size
du -h data/*.sqlite
```

### Performance Indexes

The following indexes are created for optimal query performance:

#### User Indexes

- `idx_users_email` - Fast email lookups for authentication
- `idx_users_user_id` - Unique index for Supabase user ID lookups

#### Category Indexes

- `idx_categories_type` - Filter by transaction type (deposit/expense)

#### Transaction Indexes

- `idx_transactions_user_id` - User-specific transaction queries
- `idx_transactions_category_id` - Category-based filtering
- `idx_transactions_type` - Type-based filtering (deposit/expense)
- `idx_transactions_date` - Date-based queries and sorting
- `idx_transactions_user_date` - Composite index for user + date queries

### Database Management Scripts

Located in `backend/database/`:

| Script                      | Purpose                                 |
| --------------------------- | --------------------------------------- |
| `schema.sql`                | Complete database schema with seed data |
| `check-database-status.php` | Status check for all three databases    |
| `check_structure.php`       | Compare actual vs schema structure      |
| `simple_migration.php`      | Schema alignment migrations             |
| Various `migrate_*.php`     | Specific migration scripts              |

### Environment Configuration

Database selection is handled by the `ENVIRONMENT` variable:

- `local` → Uses appropriate local database
- `preview` → Uses `database-preview.sqlite`
- `server` → Uses `database-server.sqlite`
- Default → Uses `database.sqlite` (original)

### Migration History

Recent migrations:

1. **Initial Schema** - Users, categories, transactions tables
2. **Supabase Integration** - Added `user_id` column for auth
3. **Schema Alignment** - Convert amount to INTEGER, add missing indexes

### Data Integrity

- All amounts stored as integers (Swedish kronor)
- Foreign key constraints ensure referential integrity
- Check constraints validate transaction types and amounts
- Unique constraints prevent duplicate users and categories
