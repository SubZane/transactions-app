# Data Directory

This directory contains the production SQLite database file.

## Files

- `database.sqlite` - Production database (not tracked in git)

## Important Notes

⚠️ **DO NOT deploy or overwrite this directory on your server!**

This folder is kept separate from the `backend/` directory to ensure your production database is never accidentally overwritten during deployment.

## Deployment Instructions

When deploying updates:

1. **Deploy only the `backend/` folder** - This contains your PHP API files
2. **Deploy the `dist/` folder** - This contains your built frontend files
3. **NEVER touch the `data/` folder** - Your database lives here

## Backup

The database backup script automatically backs up to:

```
backend/database/backups/
```

You can manually backup with:

```bash
php backend/database/backup_database.php
```

## Database Location

All PHP files have been updated to use:

```php
$dbPath = __DIR__ . '/../data/database.sqlite';
```

This keeps the database one level above the `backend/` folder, safe from deployment overwrites.
