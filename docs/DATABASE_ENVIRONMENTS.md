# Multi-Environment Database Setup

This project now supports different databases for different environments to prevent data conflicts during development and testing.

## Database Files

- **Development & Preview**: `data/database-preview.sqlite` - Used during `npm run dev` and `npm run preview`
- **Server**: `data/database-server.sqlite` - Used in production/server builds
- **Original**: `data/database.sqlite` - Backup of original database

## Environment Detection

The system automatically detects the environment based on:

### Automatic Detection

- **Development**: `localhost:5173` (Vite dev server) → uses preview database
- **Preview**: `localhost:3000` or `localhost:4173` (preview servers) → uses preview database
- **Server**: Non-localhost domains (production) → uses server database

### Manual Override

You can manually specify the environment using:

1. **HTTP Header**: `X-App-Env: server|preview|development`
2. **URL Parameter**: `?env=server|preview|development`
3. **Environment Variable**: `APP_ENV=server|preview|development`

## Setup Instructions

### 1. Initial Setup

```bash
# Run the database setup script
./scripts/setup-databases.sh
```

This will:

- Create separate database files for each environment
- Copy your existing data to all environments
- Display current configuration

### 2. Verify Setup

Test the environment detection:

```bash
# Check which database is being used
curl http://localhost/backend/database/test-env.php

# Or with specific environment
curl -H "X-App-Env: preview" http://localhost/backend/database/test-env.php
```

### 3. Package Scripts

The existing npm scripts will automatically use the correct database:

```bash
# Uses preview database (shared with preview)
npm run dev

# Uses preview database (shared with development)
npm run preview

# Uses server database
npm run build:server
```

## File Structure

```
data/
├── database.sqlite         # Original database (backup)
├── database-preview.sqlite # Development & Preview database
└── database-server.sqlite  # Server database

backend/
├── database/
│   ├── config.php         # Database configuration logic
│   ├── test-env.php       # Environment testing endpoint
│   └── ...               # Migration scripts (updated to use config)
├── transactions.php       # Updated to use config
├── users.php             # Updated to use config
└── categories.php        # Updated to use config

src/utils/
└── environment.ts         # Frontend environment detection

scripts/
└── setup-databases.sh    # Database setup script
```

## How It Works

### Backend (PHP)

1. `backend/database/config.php` contains the environment detection logic
2. All PHP files include this config and use `getDatabaseConnection()`
3. The system automatically selects the correct database file
4. Environment info is logged for debugging

### Frontend (TypeScript)

1. `src/utils/environment.ts` detects the current environment
2. Axios interceptor adds `X-App-Env` header to all API requests
3. Backend receives the header and uses the appropriate database

## Benefits

- **Isolated Data**: Each environment has its own data
- **Safe Testing**: Preview mode won't affect production data
- **Easy Development**: Development database can be reset without affecting others
- **Automatic**: No manual configuration needed
- **Debugging**: Clear logging shows which database is being used

## Troubleshooting

### Check Current Environment

```bash
# View environment info
curl http://localhost/backend/database/test-env.php | jq
```

### Reset Databases

```bash
# Recreate all databases from main database
rm data/database-*.sqlite
./scripts/setup-databases.sh
```

### Manual Database Selection

Add `?env=development` to any URL to force a specific environment for testing.

## Migration Scripts

All migration scripts have been updated to use the environment-aware configuration:

```bash
# Run migration on current environment
php backend/database/migrate_add_user_id_column.php

# Run migration on specific environment
APP_ENV=preview php backend/database/migrate_add_user_id_column.php
```

The migration will automatically use the correct database based on the environment.
