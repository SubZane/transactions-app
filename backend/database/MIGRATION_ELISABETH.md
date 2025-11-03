# Database Migration: Add Elisabeth Lee-Norman

## Overview

This migration adds Elisabeth Lee-Norman as a new user and transfers all non-Andreas transactions to her account.

## What This Migration Does

1. **Adds Elisabeth Lee-Norman**
   - User ID: `aa16f241-ec56-4724-9221-31c5646ddc7a`
   - Email: `elisabeth@lee-norman.com`
   - Name: Elisabeth Lee-Norman

2. **Updates Transactions**
   - Transfers all transactions from other users (e.g., Mary Watson) to Elisabeth
   - Keeps Andreas's transactions unchanged
   - Updates the `updated_at` timestamp for modified transactions

## Files Included

- `migrate_add_elisabeth.sql` - SQL migration script (manual execution)
- `migrate_add_elisabeth.php` - PHP migration script (automated with verification)
- `run_migration.sh` - Bash script to run the migration
- `MIGRATION_ELISABETH.md` - This documentation file

## How to Run the Migration

### Option 1: Using the PHP Script (Recommended)

Run from the command line:

```bash
cd backend/database
php migrate_add_elisabeth.php
```

Or run from the browser:

```
http://your-domain/backend/database/migrate_add_elisabeth.php
```

### Option 2: Using the Bash Script

```bash
cd backend/database
./run_migration.sh
```

### Option 3: Manual SQL Execution

```bash
cd backend/database
sqlite3 transactions.db < migrate_add_elisabeth.sql
```

## What to Expect

The PHP script will show you:

1. ✓ Current users in the database
2. ✓ Adding Elisabeth (or confirming she exists)
3. ✓ Identifying Andreas
4. ✓ Transaction counts BEFORE migration
5. ✓ Number of transactions updated
6. ✓ Transaction counts AFTER migration
7. ✓ Sample transactions by Elisabeth

### Example Output

```
✓ Connected to database
==================================================

STEP 1: Checking existing users...
Current users in database:
  - ID: 1 | Andreas Lee-Norman | andreas@lee-norman.com
  - ID: 2 | Mary Watson | mary.watson@example.com

STEP 2: Adding Elisabeth Lee-Norman...
  ✓ Elisabeth added with ID: 3

STEP 3: Identifying Andreas...
  ✓ Andreas found: ID 1 - Andreas Lee-Norman

STEP 4: Analyzing transactions before migration...
Transaction counts BEFORE migration:
  - Andreas Lee-Norman: 45 transactions
  - Mary Watson: 38 transactions

STEP 5: Updating transactions to Elisabeth...
  ✓ Updated 38 transactions to Elisabeth

STEP 6: Verifying transactions after migration...
Transaction counts AFTER migration:
  - Andreas Lee-Norman: 45 transactions
  - Elisabeth Lee-Norman: 38 transactions

✓ Migration completed successfully!
```

## Verification

After running the migration, verify the changes:

### Check Users

```sql
SELECT * FROM users;
```

### Check Transaction Counts

```sql
SELECT
    u.firstname,
    u.surname,
    COUNT(t.id) as transaction_count
FROM users u
LEFT JOIN transactions t ON u.id = t.user_id
GROUP BY u.id;
```

### Check Elisabeth's Transactions

```sql
SELECT *
FROM transactions
WHERE user_id = (SELECT id FROM users WHERE user_id = 'aa16f241-ec56-4724-9221-31c5646ddc7a')
ORDER BY transaction_date DESC
LIMIT 10;
```

## Safety Features

The PHP script includes:

- ✅ Database existence check
- ✅ Transaction rollback on errors
- ✅ Duplicate user prevention
- ✅ Before/after comparison
- ✅ Detailed logging
- ✅ Safe identification of Andreas

## Rollback

If you need to undo this migration:

```sql
-- Delete Elisabeth
DELETE FROM users WHERE user_id = 'aa16f241-ec56-4724-9221-31c5646ddc7a';

-- Note: Transactions will be deleted due to CASCADE constraint
-- To preserve them, first update them back to their original user_id
```

## Important Notes

1. **Backup First**: Always backup your database before running migrations:

   ```bash
   cp transactions.db transactions.db.backup
   ```

2. **Test First**: If possible, test on a copy of the database first

3. **Andreas Detection**: The script looks for users with:
   - firstname = 'andreas' (case-insensitive)
   - OR email containing 'andreas'
   - Falls back to user ID 1 if not found

4. **Transaction Ownership**: All transactions not owned by Andreas will be transferred to Elisabeth

## After Migration

1. **Update Supabase**: Make sure Elisabeth's Supabase auth account uses the same UUID
2. **Test Login**: Have Elisabeth log in to verify the account works
3. **Verify Data**: Check that transactions appear correctly in the UI
4. **Check Balances**: Ensure household balances calculate correctly

## Troubleshooting

### "Database file not found"

- Make sure you're in the correct directory
- Check that `transactions.db` exists

### "Andreas not found"

- The script will fall back to user ID 1
- Verify manually which user is Andreas

### "Elisabeth already exists"

- The script will use the existing Elisabeth record
- Check if transactions need updating

### Permission Denied

- Make sure the script has execute permissions: `chmod +x run_migration.sh`
- Ensure PHP has write access to the database file

## Questions?

If you encounter any issues or have questions about this migration, check:

1. The migration output for error messages
2. The database backup (if created)
3. SQLite database logs
4. PHP error logs

## Migration History

- **Date**: November 2, 2025
- **Purpose**: Add Elisabeth Lee-Norman as a household member
- **Impact**: ~38 transactions transferred from test user to Elisabeth
- **Status**: Ready to run
