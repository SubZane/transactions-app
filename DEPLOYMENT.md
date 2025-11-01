# Deployment Guide - Safe Database Handling

## Database Location

The production database has been moved to a separate `data/` directory to prevent accidental overwrites during deployment.

```
transactions-app/
├── backend/          ← Deploy this (PHP API files)
├── dist/             ← Deploy this (Built frontend)
└── data/             ← NEVER deploy this (Production database)
    └── database.sqlite
```

## Deployment Steps

### 1. Build for Production

```bash
npm run build:server
```

This creates optimized files in the `dist/` folder with production API URLs.

### 2. Deploy Frontend

Upload the `dist/` folder to your web server:

```bash
# Example using rsync
rsync -avz --delete dist/ user@server:/var/www/xpens.lee-norman.com/
```

### 3. Deploy Backend

Upload only the `backend/` folder (without database):

```bash
# Example using rsync
rsync -avz --exclude 'database.sqlite*' backend/ user@server:/var/www/xpens.lee-norman.com/backend/
```

**Important:** Use `--exclude` to prevent overwriting any old database files.

### 4. First-Time Server Setup

If this is your first deployment and the `data/` directory doesn't exist on the server:

```bash
# SSH into your server
ssh user@server

# Navigate to your app directory
cd /var/www/xpens.lee-norman.com/

# Create data directory
mkdir -p data

# Set permissions (adjust for your server setup)
chmod 755 data
chown www-data:www-data data

# Upload security .htaccess file (IMPORTANT!)
# This prevents anyone from accessing your database via web browser
# Upload data/.htaccess from your project

# Initialize database (only first time!)
sqlite3 data/database.sqlite < backend/database/schema.sql
```

**Security Note:** Make sure all `.htaccess` files are uploaded:

- `data/.htaccess` - Blocks all access to database
- `backend/.htaccess` - Protects backend directory
- `backend/database/.htaccess` - Blocks access to migration scripts
- `backend/database/backups/.htaccess` - Protects database backups

See `SECURITY.md` for complete security documentation.

## File Permissions

Make sure your web server can read/write the database:

```bash
# On your server
chmod 644 data/database.sqlite
chown www-data:www-data data/database.sqlite
```

## Backup Before Deployment

Always backup your production database before deploying:

```bash
# On your server
php backend/database/backup_database.php
```

Or manually:

```bash
# On your server
cp data/database.sqlite data/database.sqlite.backup-$(date +%Y%m%d-%H%M%S)
```

## What Gets Deployed vs. What Stays

### ✅ Always Deploy (Safe to overwrite)

- `dist/` - Frontend build
- `backend/*.php` - API files
- `backend/.htaccess` - Security configuration (IMPORTANT!)
- `backend/database/*.php` - Migration scripts
- `backend/database/*.sql` - Schema files
- `backend/database/.htaccess` - Security configuration (IMPORTANT!)
- `backend/database/backups/.htaccess` - Security configuration (IMPORTANT!)

### ❌ Never Deploy (Keep on server)

- `data/database.sqlite` - Production database
- `data/*.sqlite` - Any database files
- `data/.htaccess` - Security configuration (deploy once, then leave)
- `backend/database/backups/` - Database backups

### ⚠️ Deploy Once (First time only)

- `.htaccess` - Root server configuration (if using Apache)
- `data/` directory structure (create empty with .htaccess)

## Rollback Plan

If something goes wrong:

1. **Restore backend files:**

   ```bash
   # Re-deploy previous version
   rsync -avz old-backup/backend/ user@server:/var/www/xpens.lee-norman.com/backend/
   ```

2. **Restore database (if needed):**

   ```bash
   # SSH into server
   cd /var/www/xpens.lee-norman.com/
   cp backend/database/backups/[latest-backup].sqlite data/database.sqlite
   ```

3. **Restore frontend:**
   ```bash
   # Re-deploy previous version
   rsync -avz old-backup/dist/ user@server:/var/www/xpens.lee-norman.com/
   ```

## Environment-Specific Files

### Local Development

Uses: `.env.development.local` or `.env.local`

### Production Server

Uses: `.env.server.local` (baked into build)

Make sure your production URLs in `.env.server.local` are correct:

```bash
VITE_API_USERS_URL=https://xpens.lee-norman.com/backend/users.php
VITE_API_CATEGORIES_URL=https://xpens.lee-norman.com/backend/categories.php
VITE_API_TRANSACTIONS_URL=https://xpens.lee-norman.com/backend/transactions.php
```

## Automated Deployment Script (Optional)

Create a deployment script:

```bash
#!/bin/bash
# deploy.sh

set -e  # Exit on error

echo "Building for production..."
npm run build:server

echo "Deploying frontend..."
rsync -avz --delete dist/ user@server:/var/www/xpens.lee-norman.com/

echo "Deploying backend..."
rsync -avz --exclude 'database.sqlite*' backend/ user@server:/var/www/xpens.lee-norman.com/backend/

echo "✅ Deployment complete!"
echo "⚠️  Don't forget to test: https://xpens.lee-norman.com"
```

Make it executable:

```bash
chmod +x deploy.sh
```

Run it:

```bash
./deploy.sh
```

## Troubleshooting

### "Database not found" errors

Check file paths in PHP files. All should use:

```php
$dbPath = __DIR__ . '/../data/database.sqlite';  // In backend/*.php
$dbPath = __DIR__ . '/../../data/database.sqlite';  // In backend/database/*.php
```

### Permission errors

```bash
# On server
chmod 755 data
chmod 644 data/database.sqlite
chown -R www-data:www-data data
```

### Database locked errors

```bash
# Check if database is in use
lsof | grep database.sqlite

# Kill any hanging processes if needed
```

## Post-Deployment Checklist

- [ ] Frontend loads correctly
- [ ] Login works
- [ ] Transactions display
- [ ] Can add new transactions
- [ ] Can edit/delete transactions
- [ ] Offline mode works
- [ ] PWA updates properly
- [ ] Both users (Andreas & Elisabeth) can see their transactions
- [ ] Database backup runs successfully

## Support

If you encounter issues:

1. Check server error logs: `/var/log/apache2/error.log` or `/var/log/nginx/error.log`
2. Check PHP errors: `tail -f /var/log/php/error.log`
3. Test API endpoints directly: `curl https://xpens.lee-norman.com/backend/users.php`
4. Verify file permissions: `ls -la data/`
