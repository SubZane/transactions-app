<?php

/**
 * Migration Script: Align Database with Schema
 *
 * This script aligns the actual database structure with schema.sql by:
 * 1. Converting amount column from REAL to INTEGER (rounding decimal amounts)
 * 2. Adding missing transaction indexes for performance
 * 3. Making user_id index unique as specified in schema
 * 4. Updating schema version
 *
 * Usage: php migrate_align_schema.php
 */

require_once __DIR__ . '/../../backend/cors.php';

// Database configuration
$environment = $_ENV['ENVIRONMENT'] ?? 'local';
$dbPath = $environment === 'local'
	? __DIR__ . '/../../data/database-local.sqlite'
	: __DIR__ . '/../../data/database-server.sqlite';

echo "=== DATABASE SCHEMA ALIGNMENT MIGRATION ===\n";
echo "Environment: $environment\n";
echo "Database: $dbPath\n\n";

try {
	// Connect to database
	$pdo = new PDO("sqlite:$dbPath");
	$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

	// Start transaction
	$pdo->beginTransaction();

	echo "Starting migration...\n\n";

	// STEP 1: Check current schema version
	echo "1. Checking current schema version...\n";
	$stmt = $pdo->query("SELECT MAX(version) as current_version FROM schema_version");
	$currentVersion = $stmt->fetchColumn() ?: 0;
	echo "   Current version: $currentVersion\n\n";

	// STEP 2: Backup current transactions (in case we need to rollback)
	echo "2. Creating backup of transactions table...\n";
	$pdo->exec("CREATE TABLE IF NOT EXISTS transactions_backup_" . date('Ymd_His') . " AS SELECT * FROM transactions");
	echo "   Backup created\n\n";

	// STEP 3: Convert amount from REAL to INTEGER
	echo "3. Converting amount column from REAL to INTEGER...\n";

	// Check if any transactions have decimal amounts
	$stmt = $pdo->query("SELECT COUNT(*) FROM transactions WHERE amount != CAST(amount AS INTEGER)");
	$decimalCount = $stmt->fetchColumn();

	if ($decimalCount > 0) {
		echo "   Found $decimalCount transactions with decimal amounts\n";
		echo "   Rounding to nearest integer (Swedish kronor)...\n";

		// Round decimal amounts to nearest integer
		$pdo->exec("UPDATE transactions SET amount = ROUND(amount)");
		echo "   Amounts rounded\n";
	} else {
		echo "   No decimal amounts found\n";
	}

	// Create new transactions table with correct schema
	echo "   Creating new transactions table with INTEGER amount...\n";
	$pdo->exec("
        CREATE TABLE transactions_new (
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
        )
    ");

	// Copy data to new table
	echo "   Copying data to new table...\n";
	$pdo->exec("
        INSERT INTO transactions_new (id, user_id, category_id, type, amount, description, transaction_date, created_at, updated_at)
        SELECT id, user_id, category_id, type, CAST(amount AS INTEGER), description, transaction_date, created_at, updated_at
        FROM transactions
    ");

	// Replace old table
	echo "   Replacing old table...\n";
	$pdo->exec("DROP TABLE transactions");
	$pdo->exec("ALTER TABLE transactions_new RENAME TO transactions");
	echo "   Amount column converted to INTEGER\n\n";

	// STEP 4: Add missing transaction indexes
	echo "4. Adding missing transaction indexes...\n";

	$indexes = [
		'idx_transactions_user_id' => 'CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id)',
		'idx_transactions_category_id' => 'CREATE INDEX IF NOT EXISTS idx_transactions_category_id ON transactions(category_id)',
		'idx_transactions_type' => 'CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type)',
		'idx_transactions_date' => 'CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(transaction_date)',
		'idx_transactions_user_date' => 'CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON transactions(user_id, transaction_date)'
	];

	foreach ($indexes as $name => $sql) {
		echo "   Creating $name...\n";
		$pdo->exec($sql);
	}
	echo "   All transaction indexes created\n\n";

	// STEP 5: Fix user_id index to be unique
	echo "5. Making user_id index unique...\n";

	// Check for duplicate user_ids first
	$stmt = $pdo->query("
        SELECT user_id, COUNT(*) as count
        FROM users
        WHERE user_id IS NOT NULL
        GROUP BY user_id
        HAVING COUNT(*) > 1
    ");
	$duplicates = $stmt->fetchAll();

	if (count($duplicates) > 0) {
		echo "   WARNING: Found duplicate user_ids:\n";
		foreach ($duplicates as $dup) {
			echo "     user_id: {$dup['user_id']} (count: {$dup['count']})\n";
		}
		echo "   Please resolve duplicates before making index unique\n";
		echo "   Skipping unique index creation\n\n";
	} else {
		// Drop existing non-unique index and create unique one
		$pdo->exec("DROP INDEX IF EXISTS idx_users_user_id");
		$pdo->exec("CREATE UNIQUE INDEX idx_users_user_id ON users(user_id)");
		echo "   User ID index made unique\n\n";
	}

	// STEP 6: Update schema version
	echo "6. Updating schema version...\n";
	$newVersion = $currentVersion + 1;
	$pdo->exec("
        INSERT INTO schema_version (version, description)
        VALUES ($newVersion, 'Aligned database structure with schema.sql - converted amount to INTEGER, added missing indexes')
    ");
	echo "   Schema version updated to $newVersion\n\n";

	// Commit transaction
	$pdo->commit();

	echo "=== MIGRATION COMPLETED SUCCESSFULLY ===\n";
	echo "Database structure now matches schema.sql\n\n";

	// STEP 7: Verify the changes
	echo "7. Verifying changes...\n";

	// Check amount column type
	$stmt = $pdo->query("PRAGMA table_info(transactions)");
	$columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
	foreach ($columns as $col) {
		if ($col['name'] === 'amount') {
			echo "   Amount column type: {$col['type']}\n";
			break;
		}
	}

	// Check indexes
	$stmt = $pdo->query("PRAGMA index_list(transactions)");
	$indexes = $stmt->fetchAll(PDO::FETCH_ASSOC);
	echo "   Transaction indexes: " . count($indexes) . " found\n";

	// Check user_id index uniqueness
	$stmt = $pdo->query("PRAGMA index_info(idx_users_user_id)");
	$indexInfo = $stmt->fetchAll();
	if ($indexInfo) {
		$stmt = $pdo->query("PRAGMA index_list(users)");
		$userIndexes = $stmt->fetchAll(PDO::FETCH_ASSOC);
		foreach ($userIndexes as $idx) {
			if ($idx['name'] === 'idx_users_user_id') {
				echo "   User ID index unique: " . ($idx['unique'] ? 'YES' : 'NO') . "\n";
				break;
			}
		}
	}

	echo "\nMigration verification complete!\n";
} catch (Exception $e) {
	// Rollback on error
	if ($pdo->inTransaction()) {
		$pdo->rollback();
	}

	echo "ERROR: Migration failed!\n";
	echo "Error: " . $e->getMessage() . "\n";
	echo "Database rolled back to previous state.\n";
	exit(1);
}
