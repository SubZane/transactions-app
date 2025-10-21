# Quick Reference Guide

## Quick Start

### 1. Install & Initialize
```bash
cd backend
composer install
php init-db.php
```

### 2. Start Server
```bash
cd public
php -S localhost:8000
```

### 3. Test API
```bash
curl http://localhost:8000/
```

## Common Commands

### Database Operations
```bash
# Initialize database
php init-db.php

# Create manual backup
curl -X POST http://localhost:8000/api/backup

# List backups
curl http://localhost:8000/api/backups

# Check database
sqlite3 database.sqlite ".tables"
sqlite3 database.sqlite "SELECT COUNT(*) FROM transactions;"
```

### API Testing

#### Create Transaction
```bash
curl -X POST http://localhost:8000/api/transactions \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user123",
    "amount": 50.00,
    "category": "Groceries",
    "description": "Weekly shopping",
    "transaction_date": "2024-01-15 14:30:00",
    "type": "expense"
  }'
```

#### List Transactions
```bash
# All transactions for a user
curl "http://localhost:8000/api/transactions?user_id=user123"

# With filters
curl "http://localhost:8000/api/transactions?user_id=user123&type=expense&category=Groceries"

# Date range
curl "http://localhost:8000/api/transactions?user_id=user123&start_date=2024-01-01&end_date=2024-01-31"
```

#### Update Transaction
```bash
curl -X PUT http://localhost:8000/api/transactions/1 \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user123",
    "amount": 75.00,
    "category": "Groceries",
    "description": "Updated amount",
    "transaction_date": "2024-01-15 14:30:00",
    "type": "expense"
  }'
```

#### Delete Transaction
```bash
curl -X DELETE "http://localhost:8000/api/transactions/1?user_id=user123"
```

#### Get Summary
```bash
curl "http://localhost:8000/api/transactions/summary/stats?user_id=user123"
```

#### Categories
```bash
# List all categories
curl http://localhost:8000/api/categories

# Filter by type
curl "http://localhost:8000/api/categories?type=expense"

# Create category
curl -X POST http://localhost:8000/api/categories \
  -H "Content-Type: application/json" \
  -d '{"name": "Custom Category", "type": "expense"}'
```

## File Locations

```
backend/
├── database.sqlite              # SQLite database (auto-created)
├── backups/                     # Database backups (auto-created)
├── vendor/                      # Composer dependencies
├── public/index.php             # API entry point
├── src/Database/schema.sql      # Database schema
└── config/config.php            # Configuration
```

## Troubleshooting

### Database locked
```bash
# Check for processes using the database
lsof database.sqlite

# If stuck, restart the PHP server
pkill -f "php -S"
```

### Permission errors
```bash
# Fix permissions
chmod 755 backups/
chmod 644 database.sqlite
```

### Clear all data (development only)
```bash
rm database.sqlite
rm backups/*.zip
php init-db.php
```

### View logs
```bash
# PHP error log (if configured)
tail -f /var/log/php-errors.log

# Development server output
php -S localhost:8000
```

## API Response Formats

### Success Response
```json
{
  "data": { /* resource */ }
}
```

### List Response
```json
{
  "data": [ /* array */ ]
}
```

### Error Response
```json
{
  "error": "Error message"
}
```

## HTTP Status Codes

- `200` - Success (GET, PUT)
- `201` - Created (POST)
- `204` - No Content (DELETE)
- `400` - Bad Request
- `404` - Not Found
- `500` - Server Error

## Backup Management

### Automatic Backups
Backups are automatically created before:
- Creating transactions (POST)
- Updating transactions (PUT)
- Deleting transactions (DELETE)

### Manual Backup
```bash
curl -X POST http://localhost:8000/api/backup
```

### List Backups
```bash
curl http://localhost:8000/api/backups | jq '.data'
```

### Restore Backup
```bash
# 1. Stop server
pkill -f "php -S"

# 2. Unzip backup
cd backups
unzip database_backup_2024-01-15_14-30-00.zip

# 3. Replace database
mv database_backup_2024-01-15_14-30-00.sqlite ../database.sqlite

# 4. Restart server
cd ../public
php -S localhost:8000
```

## Database Maintenance

### Optimize Database
```bash
sqlite3 database.sqlite "VACUUM;"
sqlite3 database.sqlite "ANALYZE;"
```

### Check Integrity
```bash
sqlite3 database.sqlite "PRAGMA integrity_check;"
```

### View Schema Version
```bash
sqlite3 database.sqlite "SELECT * FROM schema_version;"
```

## Security Checklist

- [ ] Change CORS origin from `*` to specific domain in production
- [ ] Use environment variables for configuration
- [ ] Enable HTTPS in production
- [ ] Set up proper file permissions (755 for dirs, 644 for files)
- [ ] Regular backup rotation (keep last 10)
- [ ] Monitor error logs
- [ ] Use parameterized queries (already implemented)
- [ ] Validate all input data (already implemented)

## Production Deployment

### Apache
```apache
<VirtualHost *:80>
    DocumentRoot /path/to/backend/public
    <Directory /path/to/backend/public>
        AllowOverride All
        Require all granted
    </Directory>
</VirtualHost>
```

### Nginx
```nginx
server {
    root /path/to/backend/public;
    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }
    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
        include fastcgi_params;
    }
}
```

## Useful SQL Queries

```sql
-- Count transactions by type
SELECT type, COUNT(*) FROM transactions GROUP BY type;

-- Total amount by category
SELECT category, SUM(amount) FROM transactions GROUP BY category;

-- Monthly summary
SELECT strftime('%Y-%m', transaction_date) as month,
       type,
       COUNT(*) as count,
       SUM(amount) as total
FROM transactions
GROUP BY month, type;

-- Recent transactions
SELECT * FROM transactions ORDER BY created_at DESC LIMIT 10;
```
