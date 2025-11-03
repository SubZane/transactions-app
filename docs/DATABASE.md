# Database Documentation

## Database Architecture

The transactions app uses SQLite databases located in the `data/` folder. There are three main database environments:

### Database Files

| Database     | File Path                      | Purpose                     |
| ------------ | ------------------------------ | --------------------------- |
| **Original** | `data/database.sqlite`         | Main production database    |
| **Preview**  | `data/database-preview.sqlite` | Preview/staging environment |
| **Server**   | `data/database-server.sqlite`  | Server environment          |

### Database Schema

All databases share the same schema structure defined in `backend/database/schema.sql`:

#### Tables

1. **users** - User profile information linked to Supabase authentication
2. **categories** - Predefined transaction categories (shared across all users)
3. **transactions** - Individual transaction records (user-owned)
4. **schema_version** - Database migration tracking

#### Key Schema Details

- **Amount Storage**: `INTEGER` type (Swedish kronor, no decimals, minimum 1 kr)
- **Date Format**: ISO 8601 format (YYYY-MM-DD)
- **User Authentication**: Links to Supabase via `user_id` field
- **Foreign Keys**: Proper cascading and restrict constraints

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
