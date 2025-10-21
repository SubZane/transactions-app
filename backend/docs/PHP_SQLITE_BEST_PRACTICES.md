# PHP and SQLite Best Practices

This document outlines best practices and rules when working with PHP and SQLite in the Transactions App backend.

## Table of Contents
- [Database Management](#database-management)
- [PHP Coding Standards](#php-coding-standards)
- [SQLite Best Practices](#sqlite-best-practices)
- [API Development](#api-development)
- [Security](#security)
- [Error Handling](#error-handling)
- [Testing](#testing)

## Database Management

### 1. Always Backup Before Changes

**CRITICAL**: Always create a backup of the database before making any changes to data or schema.

```php
// Create backup before modifying data
$backup = new DatabaseBackup($dbPath, $backupDir);
$result = $backup->createBackup();

if (!$result['success']) {
    error_log('Backup warning: ' . $result['message']);
}

// Proceed with data modification
$transaction = $transactionModel->create($data);
```

### 2. Backup Naming Convention

Backups are automatically named with timestamps and zipped:
- Format: `database_backup_YYYY-MM-DD_HH-MM-SS.zip`
- Example: `database_backup_2024-01-15_14-30-45.zip`

### 3. Schema Version Tracking

Always update the schema version when making database changes:

```sql
-- After making schema changes
INSERT INTO schema_version (version, description) 
VALUES (2, 'Added new column for transaction notes');
```

### 4. Keep Backup History

The system maintains the last 10 backups by default. To clean old backups:

```php
$backup = new DatabaseBackup($dbPath, $backupDir);
$deletedCount = $backup->cleanOldBackups(10); // Keep 10 most recent
```

## PHP Coding Standards

### 1. Use Type Declarations

Always use strict types and type hints:

```php
<?php

declare(strict_types=1);

namespace TransactionsApp\Models;

class Transaction
{
    public function getById(int $id, string $userId): ?array
    {
        // Implementation
    }
}
```

### 2. Follow PSR-12 Coding Style

- Use 4 spaces for indentation
- Opening braces on the same line for methods
- One statement per line
- Use meaningful variable and function names

```php
// ✅ Good
public function calculateTotal(array $items): float
{
    $total = 0.0;
    foreach ($items as $item) {
        $total += $item['amount'];
    }
    return $total;
}

// ❌ Bad
public function calc($i){return array_sum($i);}
```

### 3. Use PDO with Prepared Statements

Always use prepared statements to prevent SQL injection:

```php
// ✅ Good
$stmt = $pdo->prepare('SELECT * FROM transactions WHERE id = :id');
$stmt->execute(['id' => $id]);

// ❌ Bad - SQL injection risk
$result = $pdo->query("SELECT * FROM transactions WHERE id = $id");
```

### 4. Proper Namespace Organization

```
TransactionsApp\
├── Controllers\     # HTTP request handlers
├── Models\          # Data access layer
├── Middleware\      # Request/response middleware
├── Database\        # Database utilities
└── Services\        # Business logic layer
```

## SQLite Best Practices

### 1. Enable Foreign Keys

Always enable foreign key constraints:

```php
$pdo->exec('PRAGMA foreign_keys = ON;');
```

### 2. Use Indexes Wisely

Create indexes on frequently queried columns:

```sql
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(transaction_date);
```

### 3. Use Transactions for Multiple Operations

Wrap multiple database operations in a transaction:

```php
try {
    $pdo->beginTransaction();
    
    // Multiple operations
    $stmt1->execute();
    $stmt2->execute();
    
    $pdo->commit();
} catch (PDOException $e) {
    $pdo->rollBack();
    throw $e;
}
```

### 4. Use ISO 8601 Date Format

Store dates in ISO 8601 format for proper sorting and filtering:

```sql
-- Store dates as: YYYY-MM-DD HH:MM:SS
INSERT INTO transactions (transaction_date) VALUES ('2024-01-15 14:30:45');
```

### 5. Regular VACUUM Operations

Periodically run VACUUM to optimize database size:

```php
// Run during maintenance window
$pdo->exec('VACUUM;');
```

### 6. Use ANALYZE for Query Optimization

Update SQLite statistics for better query planning:

```php
$pdo->exec('ANALYZE;');
```

## API Development

### 1. RESTful Endpoint Design

Follow REST conventions:

```
GET    /api/transactions          # List all transactions
GET    /api/transactions/{id}     # Get single transaction
POST   /api/transactions          # Create transaction
PUT    /api/transactions/{id}     # Update transaction
DELETE /api/transactions/{id}     # Delete transaction
```

### 2. Consistent Response Format

Always return consistent JSON responses:

```php
// Success response
{
    "data": { /* resource data */ }
}

// Error response
{
    "error": "Error message here"
}

// List response
{
    "data": [ /* array of resources */ ]
}
```

### 3. HTTP Status Codes

Use appropriate status codes:

- `200 OK` - Successful GET, PUT, PATCH
- `201 Created` - Successful POST
- `204 No Content` - Successful DELETE
- `400 Bad Request` - Invalid request data
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

### 4. Validate Input Data

Always validate and sanitize input:

```php
// Validate required fields
$required = ['user_id', 'amount', 'category'];
foreach ($required as $field) {
    if (!isset($data[$field])) {
        return $this->jsonResponse($response, 
            ['error' => "Field '{$field}' is required"], 400);
    }
}

// Validate data types and ranges
if (!is_numeric($data['amount']) || $data['amount'] <= 0) {
    return $this->jsonResponse($response, 
        ['error' => 'Amount must be a positive number'], 400);
}
```

## Security

### 1. Prevent SQL Injection

- **Always** use prepared statements with parameter binding
- **Never** concatenate user input into SQL queries
- Use PDO or similar database abstraction layer

### 2. Input Validation

```php
// Validate transaction type
if (!in_array($data['type'], ['income', 'expense'])) {
    throw new InvalidArgumentException('Invalid transaction type');
}

// Validate numeric values
if (!is_numeric($amount) || $amount <= 0) {
    throw new InvalidArgumentException('Invalid amount');
}
```

### 3. Output Encoding

Always encode output to prevent XSS:

```php
// JSON encoding automatically handles escaping
$response->getBody()->write(json_encode($data));
```

### 4. Environment Variables

Store sensitive configuration in environment variables:

```php
// Never hardcode credentials
$apiKey = getenv('API_KEY');
```

### 5. CORS Configuration

Configure CORS appropriately for your environment:

```php
// In production, specify allowed origins instead of '*'
->withHeader('Access-Control-Allow-Origin', 'https://yourdomain.com')
```

## Error Handling

### 1. Use Try-Catch Blocks

```php
try {
    $transaction = $this->transactionModel->create($data);
    return $this->jsonResponse($response, ['data' => $transaction], 201);
} catch (PDOException $e) {
    error_log('Database error: ' . $e->getMessage());
    return $this->jsonResponse($response, 
        ['error' => 'Database operation failed'], 500);
} catch (Exception $e) {
    error_log('Unexpected error: ' . $e->getMessage());
    return $this->jsonResponse($response, 
        ['error' => 'Internal server error'], 500);
}
```

### 2. Log Errors Appropriately

```php
// Log errors but don't expose internal details to users
error_log('Failed to create transaction: ' . $e->getMessage());

// Return generic error message to user
return ['error' => 'Operation failed. Please try again.'];
```

### 3. Handle Database Connection Failures

```php
try {
    $pdo = Database::getConnection($dbPath);
} catch (Exception $e) {
    error_log('Database connection failed: ' . $e->getMessage());
    http_response_code(503);
    echo json_encode(['error' => 'Service temporarily unavailable']);
    exit;
}
```

## Testing

### 1. Unit Testing

Test individual components in isolation:

```php
use PHPUnit\Framework\TestCase;

class TransactionTest extends TestCase
{
    public function testCreateTransaction(): void
    {
        $transaction = $this->transactionModel->create([
            'user_id' => 'user123',
            'amount' => 100.00,
            'category' => 'Groceries',
            'transaction_date' => '2024-01-15 14:30:00',
            'type' => 'expense'
        ]);
        
        $this->assertNotNull($transaction['id']);
        $this->assertEquals(100.00, $transaction['amount']);
    }
}
```

### 2. Integration Testing

Test complete API endpoints:

```php
public function testTransactionEndpoint(): void
{
    $response = $this->post('/api/transactions', [
        'user_id' => 'user123',
        'amount' => 50.00,
        'category' => 'Food',
        'transaction_date' => '2024-01-15 12:00:00',
        'type' => 'expense'
    ]);
    
    $this->assertEquals(201, $response->getStatusCode());
}
```

### 3. Test Database Operations

Use a separate test database:

```php
protected function setUp(): void
{
    $this->testDb = ':memory:'; // Use in-memory database for tests
    $this->pdo = Database::getConnection($this->testDb);
    Database::initSchema();
}
```

## Development Workflow

### 1. Before Making Changes

1. Create a database backup
2. Review the current schema
3. Plan your changes
4. Update schema.sql if needed

### 2. Making Changes

1. Implement changes in appropriate files
2. Update schema version if database changes are made
3. Test changes locally
4. Verify backups are working

### 3. After Changes

1. Run tests to ensure nothing broke
2. Update documentation if needed
3. Commit changes with descriptive messages
4. Clean old backups if needed

## Maintenance Tasks

### Regular Maintenance

1. **Daily**: Check error logs
2. **Weekly**: Review and clean old backups
3. **Monthly**: Run VACUUM and ANALYZE on the database
4. **Quarterly**: Review and optimize indexes

### Database Optimization

```php
// Analyze database for query optimization
$pdo->exec('ANALYZE;');

// Compact database file
$pdo->exec('VACUUM;');

// Check database integrity
$result = $pdo->query('PRAGMA integrity_check;')->fetchAll();
```

## Common Pitfalls to Avoid

### 1. ❌ Not Using Prepared Statements

```php
// NEVER do this
$sql = "SELECT * FROM transactions WHERE id = " . $_GET['id'];
```

### 2. ❌ Ignoring Backup Failures

```php
// Don't ignore backup failures
$backup->createBackup(); // ❌ Not checking result

// Do this instead
$result = $backup->createBackup(); // ✅
if (!$result['success']) {
    error_log('Backup failed: ' . $result['message']);
}
```

### 3. ❌ Not Validating Input

```php
// Always validate before using
if (empty($data['user_id'])) {
    throw new InvalidArgumentException('user_id is required');
}
```

### 4. ❌ Exposing Internal Errors

```php
// Don't expose internal details
catch (Exception $e) {
    return ['error' => $e->getMessage()]; // ❌

// Return generic error to user
catch (Exception $e) {
    error_log($e->getMessage());
    return ['error' => 'Operation failed']; // ✅
}
```

## Resources

- [PHP Manual](https://www.php.net/manual/)
- [SQLite Documentation](https://www.sqlite.org/docs.html)
- [Slim Framework Documentation](https://www.slimframework.com/docs/)
- [PSR-12 Coding Standard](https://www.php-fig.org/psr/psr-12/)
- [PDO Documentation](https://www.php.net/manual/en/book.pdo.php)

## Questions or Improvements?

If you have questions about these best practices or suggestions for improvements:
1. Open an issue in the repository
2. Discuss with the team
3. Update this document with agreed-upon changes
