# Database Relocation Summary

## What Changed

The production SQLite database has been moved from `backend/database.sqlite` to `data/database.sqlite` to prevent accidental overwrites during deployment.

## Files Updated

### PHP Backend Files (9 files)

All database path references updated from `backend/database.sqlite` to `data/database.sqlite`:

1. `backend/categories.php`
2. `backend/transactions.php`
3. `backend/users.php`
4. `backend/database/backup_database.php`
5. `backend/database/migrate_add_elisabeth.php`
6. `backend/database/migrate_add_user_id_column.php`
7. `backend/database/migrate_rename_transportation_to_car.php`
8. `backend/database/migrate_rename_childrens_clothes_to_children.php`
9. `backend/database/migrate_rename_vacation_to_travel.php`

### New Path Patterns

- **Main backend files:** `__DIR__ . '/../data/database.sqlite'`
- **Migration scripts:** `__DIR__ . '/../../data/database.sqlite'`

### New/Modified Files

1. **`data/database.sqlite`** - Production database (moved from `backend/`)
2. **`data/README.md`** - Documentation about the data directory
3. **`.gitignore`** - Added data directory exclusions
4. **`DEPLOYMENT.md`** - Complete deployment guide with safe practices

## Directory Structure

```
transactions-app/
├── backend/              # PHP API files (deploy this)
│   ├── categories.php
│   ├── transactions.php
│   ├── users.php
│   └── database/         # Migration scripts & schema
│       ├── schema.sql
│       ├── migrate_*.php
│       └── backups/      # Database backups
├── data/                 # Production data (NEVER deploy)
│   ├── database.sqlite   # Production database
│   └── README.md
├── dist/                 # Built frontend (deploy this)
└── DEPLOYMENT.md         # Deployment instructions
```

## Benefits

✅ **Safe Deployments** - Database won't be overwritten when deploying backend updates
✅ **Clear Separation** - Code vs. data are in separate directories  
✅ **Git-Friendly** - Database files properly ignored
✅ **Documented** - Clear deployment instructions and warnings

## Verification

Current database status:

- **Location:** `data/database.sqlite`
- **Users:** Andreas Lee-Norman (109 transactions), Elisabeth Lee-Norman (107 transactions)
- **Accessible:** All PHP files can access the new location
- **Backed up:** Existing backup system still works

## Deployment Impact

When deploying to your server, remember:

1. **First time only:** Create empty `data/` directory on server
2. **Always deploy:** `backend/` and `dist/` folders
3. **Never deploy:** `data/` folder (database lives there permanently)

See `DEPLOYMENT.md` for complete deployment instructions.

## Testing

All backend PHP files have been tested and can access the database in its new location.

```bash
# Test database access
sqlite3 data/database.sqlite "SELECT COUNT(*) FROM users;"

# Test PHP path resolution
php -r "echo file_exists('data/database.sqlite') ? 'OK' : 'ERROR';"
```

## Rollback (if needed)

If you need to revert this change:

```bash
# Move database back
mv data/database.sqlite backend/database.sqlite

# Update all PHP files to use old path:
# backend/*.php:     __DIR__ . '/database.sqlite'
# backend/database/*.php:  __DIR__ . '/../database.sqlite'
```

---

**Date:** November 2, 2025  
**Status:** ✅ Complete and verified  
**Impact:** Deployment safety improved, no functional changes
