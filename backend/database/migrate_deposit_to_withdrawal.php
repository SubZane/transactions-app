<?php

/**
 * Migration: Change 'deposit' type to 'withdrawal'
 * Updates both categories and transactions tables by recreating them without CHECK constraints
 */

// Determine database based on environment
$env = getenv('ENVIRONMENT') ?: 'local';
$dbFile = match ($env) {
	'preview' => __DIR__ . '/../../data/database-preview.sqlite',
	'server' => __DIR__ . '/../../data/database-server.sqlite',
	default => __DIR__ . '/../../data/database.sqlite'
};

try {
	// Connect to database
	$db = new PDO("sqlite:$dbFile");
	$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

	echo "Connected to database: $dbFile\n";

	// Begin transaction
	$db->beginTransaction();

	// Step 1: Create temporary categories table with new CHECK constraint
	$db->exec("CREATE TABLE categories_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        type TEXT NOT NULL CHECK(type IN ('withdrawal', 'expense')),
        description TEXT,
        icon TEXT,
        color TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )");

	// Copy data, changing 'deposit' to 'withdrawal'
	$db->exec("INSERT INTO categories_new (id, name, type, description, icon, color, created_at, updated_at)
               SELECT id, name,
                      CASE WHEN type = 'deposit' THEN 'withdrawal' ELSE type END,
                      description, icon, color, created_at, updated_at
               FROM categories");

	// Drop old table and rename new one
	$db->exec("DROP TABLE categories");
	$db->exec("ALTER TABLE categories_new RENAME TO categories");
	$db->exec("CREATE INDEX idx_categories_type ON categories(type)");

	echo "Updated categories table\n";

	// Step 2: Create temporary transactions table with new CHECK constraint
	$db->exec("CREATE TABLE transactions_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        category_id INTEGER NULL,
        type TEXT NOT NULL CHECK(type IN ('withdrawal', 'expense')),
        amount INTEGER NOT NULL CHECK(amount >= 1),
        description TEXT,
        transaction_date TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT
    )");

	// Copy data, changing 'deposit' to 'withdrawal'
	$db->exec("INSERT INTO transactions_new (id, user_id, category_id, type, amount, description, transaction_date, created_at, updated_at)
               SELECT id, user_id, category_id,
                      CASE WHEN type = 'deposit' THEN 'withdrawal' ELSE type END,
                      amount, description, transaction_date, created_at, updated_at
               FROM transactions");

	// Drop old table and rename new one
	$db->exec("DROP TABLE transactions");
	$db->exec("ALTER TABLE transactions_new RENAME TO transactions");
	$db->exec("CREATE INDEX idx_transactions_user_id ON transactions(user_id)");
	$db->exec("CREATE INDEX idx_transactions_category_id ON transactions(category_id)");
	$db->exec("CREATE INDEX idx_transactions_type ON transactions(type)");
	$db->exec("CREATE INDEX idx_transactions_date ON transactions(transaction_date)");
	$db->exec("CREATE INDEX idx_transactions_user_date ON transactions(user_id, transaction_date)");

	echo "Updated transactions table\n";

	// Commit transaction
	$db->commit();

	echo "Migration completed successfully for $env environment!\n";
} catch (PDOException $e) {
	if (isset($db)) {
		$db->rollBack();
	}
	echo "Migration failed: " . $e->getMessage() . "\n";
	exit(1);
}
