# Backend Architecture Guide

A reusable pattern for building lightweight PHP + SQLite backends with React frontends.

## Philosophy

This architecture follows these principles:

- **Simple**: No complex frameworks, just clean PHP with clear patterns
- **Secure**: CORS protection, authentication helpers, input validation by default
- **Portable**: SQLite database, easy to deploy anywhere
- **Maintainable**: Clear separation of concerns, migration system, consistent patterns
- **Scalable**: Can start small and migrate to MySQL/PostgreSQL later if needed

## Project Structure

```
your-project/
├── backend/
│   ├── auth-helper.php          # Authentication utilities (reusable)
│   ├── cors.php                 # CORS configuration (reusable)
│   ├── [entity].php             # One file per entity (users, projects, etc.)
│   └── database/
│       ├── schema.sql           # Complete database schema
│       ├── [dbname].sqlite      # SQLite database file (gitignored)
│       ├── migrate_*.php        # Migration scripts (timestamped/descriptive)
│       ├── backup_database.php  # Backup utility (reusable)
│       └── backups/             # Backup storage (gitignored)
├── src/
│   ├── services/
│   │   ├── apiService.ts        # Base API client with auth interceptor
│   │   └── [entity]Service.ts   # One service per entity
│   └── config/
│       └── supabase.ts          # Supabase client configuration
├── .env                         # Secrets ONLY (never commit)
├── .env.development             # Dev config (commit)
├── .env.production              # Prod config (commit)
├── .env.example                 # Template (commit)
└── vite.config.ts               # Build config with backend file copying
```

## Naming Conventions

### Files

- **Backend API**: `[entity].php` (singular, lowercase) - e.g., `user.php`, `project.php`, `task.php`
- **Migrations**: `migrate_[descriptive_name].php` - e.g., `migrate_add_status_column.php`
- **Frontend Service**: `[entity]Service.ts` (camelCase) - e.g., `userService.ts`, `projectService.ts`

### Environment Variables

- **Pattern**: `VITE_API_[ENTITY]_URL` for API endpoints
- **Example**: `VITE_API_USERS_URL`, `VITE_API_PROJECTS_URL`
- **Secrets**: Always use `VITE_` prefix for client-exposed vars in Vite

### Database

- **Tables**: plural, snake_case - e.g., `users`, `projects`, `role_assignments`
- **Columns**: snake_case - e.g., `user_id`, `created_at`, `is_active`
- **Foreign Keys**: `[table]_id` - e.g., `user_id`, `project_id`
- **Timestamps**: Always include `created_at` and `updated_at`
- **Soft Delete**: Use `deleted_at` column (NULL = active)

## Core Patterns

### 1. Database Schema Pattern

Every table follows this structure:

```sql
CREATE TABLE IF NOT EXISTS [table_name] (
    id INTEGER PRIMARY KEY AUTOINCREMENT,  -- Always use INTEGER PRIMARY KEY
    -- Your business columns here
    user_id TEXT,                           -- Foreign key to auth user (if owned)
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    deleted_at TEXT,                        -- For soft deletes (optional)
    FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- Always add indexes for foreign keys and frequently queried columns
CREATE INDEX IF NOT EXISTS idx_[table]_[column] ON [table]([column]);
```

**Key Rules:**

- Use `TEXT` for dates in ISO 8601 format (`YYYY-MM-DD` or `YYYY-MM-DD HH:MM:SS`)
- Use `INTEGER` for IDs (auto-increment)
- Use `REAL` for decimals
- Always use `IF NOT EXISTS` for idempotency
- Always create indexes on foreign keys
- Use `CHECK` constraints for validation where appropriate

### 2. API Endpoint Pattern

Each entity gets one PHP file with this structure:

```php
<?php
/**
 * [Entity] API Endpoint
 *
 * Endpoints:
 * - GET    /api/[entity]         - List all
 * - GET    /api/[entity]/{id}    - Get one
 * - POST   /api/[entity]         - Create
 * - PUT    /api/[entity]/{id}    - Update
 * - DELETE /api/[entity]/{id}    - Delete
 */

// 1. CORS (always first)
require_once __DIR__ . '/cors.php';
cors();

// 2. Response type
header('Content-Type: application/json');

// 3. Auth helper
require_once __DIR__ . '/auth-helper.php';

// 4. Database connection
$dbPath = __DIR__ . '/database/[dbname].sqlite';
try {
    $db = new PDO('sqlite:' . $dbPath);
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed', 'message' => $e->getMessage()]);
    exit;
}

// 5. Routing logic
$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$pathParts = explode('/', trim($path, '/'));

// Find endpoint in path
$apiIndex = array_search('[entity].php', $pathParts);
if ($apiIndex === false) {
    $apiIndex = array_search('[entity]', $pathParts);
}

// 6. Route to handlers
try {
    if ($method === 'GET' && isset($pathParts[$apiIndex + 1])) {
        getOne($db, $pathParts[$apiIndex + 1]);
    } elseif ($method === 'GET') {
        getAll($db);
    } elseif ($method === 'POST') {
        create($db);
    } elseif ($method === 'PUT' && isset($pathParts[$apiIndex + 1])) {
        update($db, $pathParts[$apiIndex + 1]);
    } elseif ($method === 'DELETE' && isset($pathParts[$apiIndex + 1])) {
        delete($db, $pathParts[$apiIndex + 1]);
    } else {
        http_response_code(404);
        echo json_encode(['error' => 'Endpoint not found']);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Internal server error', 'message' => $e->getMessage()]);
}

// 7. Handler functions (getAll, getOne, create, update, delete)
?>
```

**Key Rules:**

- Always load CORS first
- Set JSON content type
- Use try-catch for all database operations
- Return appropriate HTTP status codes (200, 201, 204, 400, 401, 404, 500)
- Always use prepared statements (NEVER concatenate SQL)
- Validate input before database operations
- Return created/updated resource after POST/PUT

### 3. Handler Function Pattern

```php
function getAll($db) {
    // Auth optional for reads (depends on requirements)
    // $user = requireAuth();

    $stmt = $db->query("SELECT * FROM [table] WHERE deleted_at IS NULL ORDER BY created_at DESC");
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
}

function getOne($db, $id) {
    $stmt = $db->prepare("SELECT * FROM [table] WHERE id = ? AND deleted_at IS NULL");
    $stmt->execute([$id]);
    $item = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$item) {
        http_response_code(404);
        echo json_encode(['error' => 'Not found']);
        return;
    }

    echo json_encode($item);
}

function create($db) {
    $user = requireAuth();  // Always require auth for writes

    $input = json_decode(file_get_contents('php://input'), true);

    // Validate required fields
    if (!isset($input['required_field']) || empty(trim($input['required_field']))) {
        http_response_code(400);
        echo json_encode(['error' => 'required_field is required']);
        return;
    }

    $stmt = $db->prepare("
        INSERT INTO [table] (field1, field2, user_id, created_at, updated_at)
        VALUES (?, ?, ?, datetime('now'), datetime('now'))
    ");
    $stmt->execute([
        $input['field1'],
        $input['field2'] ?? null,
        $user['sub']
    ]);

    // Return created resource
    $stmt = $db->prepare("SELECT * FROM [table] WHERE id = ?");
    $stmt->execute([$db->lastInsertId()]);
    http_response_code(201);
    echo json_encode($stmt->fetch(PDO::FETCH_ASSOC));
}

function update($db, $id) {
    $user = requireAuth();

    $input = json_decode(file_get_contents('php://input'), true);

    // Check existence
    $stmt = $db->prepare("SELECT * FROM [table] WHERE id = ?");
    $stmt->execute([$id]);
    if (!$stmt->fetch()) {
        http_response_code(404);
        echo json_encode(['error' => 'Not found']);
        return;
    }

    // Update
    $stmt = $db->prepare("
        UPDATE [table]
        SET field1 = ?, field2 = ?, updated_at = datetime('now')
        WHERE id = ?
    ");
    $stmt->execute([$input['field1'], $input['field2'], $id]);

    // Return updated resource
    $stmt = $db->prepare("SELECT * FROM [table] WHERE id = ?");
    $stmt->execute([$id]);
    echo json_encode($stmt->fetch(PDO::FETCH_ASSOC));
}

function delete($db, $id) {
    $user = requireAuth();

    // Soft delete (preferred)
    $stmt = $db->prepare("UPDATE [table] SET deleted_at = datetime('now') WHERE id = ?");
    // Hard delete (use carefully)
    // $stmt = $db->prepare("DELETE FROM [table] WHERE id = ?");

    $stmt->execute([$id]);

    if ($stmt->rowCount() === 0) {
        http_response_code(404);
        echo json_encode(['error' => 'Not found']);
        return;
    }

    http_response_code(204);  // No content
}
```

**Key Rules:**

- Always require authentication for CREATE, UPDATE, DELETE
- Always validate input before database operations
- Always check if resource exists before UPDATE/DELETE
- Return the created/updated resource (helps frontend state management)
- Use soft deletes when possible (set `deleted_at` instead of DELETE)
- Filter out soft-deleted items in queries (`WHERE deleted_at IS NULL`)

### 4. Frontend Service Pattern

Each entity gets a TypeScript service:

```typescript
import api from './apiService';

const API_BASE_URL = import.meta.env.VITE_API_[ENTITY]_URL;

export interface [Entity] {
  id: number;
  // Your fields here
  user_id: string;
  created_at: string;
  updated_at: string;
}

export const [entity]Service = {
  async getAll(): Promise<[Entity][]> {
    const response = await api.get(API_BASE_URL);
    return response.data;
  },

  async getById(id: number): Promise<[Entity]> {
    const response = await api.get(`${API_BASE_URL}/${id}`);
    return response.data;
  },

  async create(data: Partial<[Entity]>): Promise<[Entity]> {
    const response = await api.post(API_BASE_URL, data);
    return response.data;
  },

  async update(id: number, data: Partial<[Entity]>): Promise<[Entity]> {
    const response = await api.put(`${API_BASE_URL}/${id}`, data);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`${API_BASE_URL}/${id}`);
  },
};
```

**Key Rules:**

- One service file per entity
- Use environment variables for API URLs
- Export TypeScript interface matching database schema
- Use `Partial<>` for create/update to allow optional fields
- Handle errors at component level, not service level
- Return raw data (let components handle state management)

### 5. Migration Pattern

```php
<?php
/**
 * Migration: [Descriptive name]
 *
 * Purpose: [Why this change is needed]
 *
 * Rollback: [How to undo this change if needed]
 *
 * How to run: php backend/database/migrate_[name].php
 */

$dbPath = __DIR__ . '/[dbname].sqlite';

if (!file_exists($dbPath)) {
    die("Error: Database not found at: $dbPath\n");
}

try {
    $db = new PDO('sqlite:' . $dbPath);
    $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    echo "Starting migration: [Name]...\n";

    $db->beginTransaction();

    // Your migration steps here
    // Step 1: Add column
    $db->exec("ALTER TABLE [table] ADD COLUMN [column] [type]");

    // Step 2: Update existing data
    $db->exec("UPDATE [table] SET [column] = [default] WHERE [column] IS NULL");

    // Step 3: Create new table/index
    $db->exec("CREATE INDEX idx_[table]_[column] ON [table]([column])");

    $db->commit();

    echo "\n✅ Migration completed successfully!\n";

} catch (PDOException $e) {
    if ($db->inTransaction()) {
        $db->rollBack();
    }
    die("❌ Migration failed: " . $e->getMessage() . "\n");
}
?>
```

**Key Rules:**

- Always use transactions
- Always include rollback instructions in comments
- Name descriptively: `migrate_add_status_to_users.php`
- Test on database backup first
- Update `schema.sql` after successful migration
- Never delete old migrations (keep history)
- Run migrations sequentially (order matters)

## Setup Steps for New Project

### 1. Create Directory Structure

### 1. Create Directory Structure

```bash
mkdir -p backend/database
mkdir -p src/services
mkdir -p src/config
```

### 2. Copy Reusable Files

Copy these files from this project (they rarely change):

- `backend/cors.php` - CORS handler (update allowed origins)
- `backend/auth-helper.php` - Authentication helpers
- `backend/database/backup_database.php` - Backup utility (update paths)

### 3. Create Database Schema

Create `backend/database/schema.sql` with your tables following the pattern above.

### 4. Create Setup Script

Create `backend/database/setup-database.php` to initialize database from schema.

### 5. Create Environment Files

```bash
# .env (never commit)
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=

# .env.development (commit)
VITE_API_[ENTITY]_URL=http://localhost/[project]/backend/[entity].php

# .env.production (commit)
VITE_API_[ENTITY]_URL=https://[domain]/backend/[entity].php

# .env.example (commit)
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

### 6. Create API Endpoints

For each entity, create `backend/[entity].php` following the API pattern above.

### 7. Create Frontend Services

For each entity, create `src/services/[entity]Service.ts` following the service pattern above.

### 8. Configure Build

Update `vite.config.ts` to copy backend files to dist:

```typescript
import { viteStaticCopy } from "vite-plugin-static-copy";

export default defineConfig({
	plugins: [
		viteStaticCopy({
			targets: [
				{ src: "backend/auth-helper.php", dest: "backend" },
				{ src: "backend/cors.php", dest: "backend" },
				{ src: "backend/[entity].php", dest: "backend" },
				{ src: "backend/database/[dbname].sqlite", dest: "backend/database" },
				{ src: "backend/database/schema.sql", dest: "backend/database" },
			],
		}),
	],
});
```

### 9. Update .gitignore

```
# Environment variables with secrets
.env
.env.local

# Database files (contains user data)
backend/database/*.sqlite
backend/database/backups/

# Lock files
backend/database/*.sqlite-wal
backend/database/*.sqlite-shm
backend/database/*.sqlite-journal
```

## Development Workflow

### Starting New Feature

1. **Database Change Needed?**

   - Create migration: `migrate_add_[feature].php`
   - Run migration: `php backend/database/migrate_[feature].php`
   - Update `schema.sql`

2. **New Entity?**

   - Add table to schema
   - Create `backend/[entity].php` from pattern
   - Create `src/services/[entity]Service.ts` from pattern
   - Add environment variables
   - Add to build config

3. **Test Locally**
   - Run dev server: `npm run dev`
   - Test CRUD operations
   - Check error handling

### Deploying to Production

1. **Run migrations on production database**

   ```bash
   php /path/to/backend/database/migrate_[name].php
   ```

2. **Build**

   ```bash
   npm run build:prod
   ```

3. **Deploy**
   - Upload `dist/` folder
   - Set database permissions (775 dir, 664 file)
   - Set environment variables on hosting platform
   - Test endpoints

## Best Practices

### Security

✅ **DO:**

- Always use prepared statements
- Require auth for write operations
- Validate all input
- Use specific CORS origins
- Keep secrets in `.env` (never commit)
- Use HTTPS in production

❌ **DON'T:**

- Concatenate SQL queries
- Trust user input
- Use `*` for CORS origins
- Commit API keys or secrets
- Expose detailed error messages in production

### Database

✅ **DO:**

- Use transactions for multiple operations
- Add indexes on foreign keys
- Use soft deletes when possible
- Include `created_at` and `updated_at`
- Use ISO 8601 for dates
- Backup before migrations

❌ **DON'T:**

- Run migrations without testing
- Delete old migrations
- Skip indexes on foreign keys
- Use timestamps without timezone info
- Hard delete when soft delete would work

### Code Organization

✅ **DO:**

- One endpoint file per entity
- One service file per entity
- Follow naming conventions consistently
- Keep reusable code in helpers
- Document migration purposes
- Use TypeScript interfaces

❌ **DON'T:**

- Mix multiple entities in one file
- Duplicate code across endpoints
- Use inconsistent naming
- Skip error handling
- Leave commented-out code

## Common Patterns

### Pattern: User-Owned Resources

```php
// In getAll()
$user = requireAuth();
$stmt = $db->prepare("SELECT * FROM [table] WHERE user_id = ?");
$stmt->execute([$user['sub']]);

// In create()
$stmt->execute([..., $user['sub']]);  // Set user_id

// In update()/delete()
// Check ownership before allowing
$stmt = $db->prepare("SELECT * FROM [table] WHERE id = ? AND user_id = ?");
$stmt->execute([$id, $user['sub']]);
if (!$stmt->fetch()) {
    http_response_code(403);
    echo json_encode(['error' => 'Forbidden']);
    return;
}
```

### Pattern: Soft Delete

```sql
-- Add column
ALTER TABLE [table] ADD COLUMN deleted_at TEXT;

-- Query active only
SELECT * FROM [table] WHERE deleted_at IS NULL;

-- Soft delete
UPDATE [table] SET deleted_at = datetime('now') WHERE id = ?;

-- Restore
UPDATE [table] SET deleted_at = NULL WHERE id = ?;
```

### Pattern: Pagination

```php
$page = $_GET['page'] ?? 1;
$perPage = $_GET['per_page'] ?? 20;
$offset = ($page - 1) * $perPage;

$stmt = $db->prepare("
    SELECT * FROM [table]
    WHERE deleted_at IS NULL
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
");
$stmt->execute([$perPage, $offset]);

$total = $db->query("SELECT COUNT(*) FROM [table] WHERE deleted_at IS NULL")->fetchColumn();

echo json_encode([
    'items' => $stmt->fetchAll(PDO::FETCH_ASSOC),
    'pagination' => [
        'page' => $page,
        'per_page' => $perPage,
        'total' => $total,
        'total_pages' => ceil($total / $perPage),
    ],
]);
```

### Pattern: Enumerated Values

```sql
-- In schema
CREATE TABLE [table] (
    status TEXT NOT NULL DEFAULT 'pending',
    CHECK(status IN ('pending', 'active', 'completed', 'cancelled'))
);
```

```typescript
// In TypeScript
export type Status = "pending" | "active" | "completed" | "cancelled";

export interface Entity {
	status: Status;
}
```

## Troubleshooting

### "Database locked"

- Check for `-wal`, `-shm` files
- Ensure directory is writable
- Set timeout: `PRAGMA busy_timeout=5000;`

### "Permission denied"

- Directory: `chmod 775 backend/database/`
- File: `chmod 664 backend/database/[dbname].sqlite`
- Owner: `chown www-data:www-data backend/database/`

### CORS errors

- Add origin to allowed list in `cors.php`
- Check preflight OPTIONS request
- Verify headers are sent

### "Could not find driver"

- Install: `php-pdo`, `php-sqlite3`, `php-pdo-sqlite`
- Check: `php -m | grep sqlite`

## Quick Reference Card

### New Entity Checklist

- [ ] Add table to `schema.sql`
- [ ] Create `backend/[entity].php`
- [ ] Create `src/services/[entity]Service.ts`
- [ ] Add `VITE_API_[ENTITY]_URL` to env files
- [ ] Add to `vite.config.ts` copy targets
- [ ] Test CRUD operations locally

### Migration Checklist

- [ ] Backup database first
- [ ] Create `migrate_[name].php`
- [ ] Test on backup database
- [ ] Run on development database
- [ ] Update `schema.sql`
- [ ] Commit migration file
- [ ] Run on production database

### Deployment Checklist

- [ ] Run new migrations on production DB
- [ ] Build: `npm run build:prod`
- [ ] Upload `dist/` folder
- [ ] Set database permissions
- [ ] Set environment variables
- [ ] Test all endpoints
- [ ] Check error logs

## Summary

This architecture provides a clear, consistent pattern for building lightweight backends:

- **One pattern** for all entities (easy to learn, easy to maintain)
- **Security by default** (auth, validation, prepared statements)
- **Simple deployment** (just upload dist/ folder)
- **Easy to extend** (follow the pattern for new features)
- **Database evolution** (migration system with rollback)

Copy and adapt these patterns for any new project! 🚀

## Summary

This architecture provides a clear, consistent pattern for building lightweight backends:

- **One pattern** for all entities (easy to learn, easy to maintain)
- **Security by default** (auth, validation, prepared statements)
- **Simple deployment** (just upload dist/ folder)
- **Easy to extend** (follow the pattern for new features)
- **Database evolution** (migration system with rollback)

Copy and adapt these patterns for any new project! 🚀

---

## Reference Implementation

This project (`itplanner-app`) contains working examples of all these patterns:

- **Reusable files**: `backend/cors.php`, `backend/auth-helper.php`
- **Example endpoints**: `backend/users.php`, `backend/projects.php`
- **Example services**: `src/services/userService.ts`, `src/services/projectService.ts`
- **Migration examples**: `backend/database/migrate_*.php`
- **Build config**: `vite.config.ts` with static copy setup

Refer to these files when implementing the patterns in a new project.
