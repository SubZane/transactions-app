<?php

/**
 * Simple Migration: Change amount to INTEGER and add missing indexes
 * Applies to ALL databases (local and server)
 */

// Database paths - from build scripts
$databases = [
	'original' => __DIR__ . '/../../data/database.sqlite',
	'preview' => __DIR__ . '/../../data/database-preview.sqlite',
	'server' => __DIR__ . '/../../data/database-server.sqlite'
];

foreach ($databases as $env => $dbPath) {
	echo "=== Processing $env database ===\n";
	echo "Path: $dbPath\n";

	if (!file_exists($dbPath)) {
		echo "Database file doesn't exist, skipping...\n\n";
		continue;
	}

	try {
		$pdo = new PDO("sqlite:$dbPath");
		$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

		// Start transaction
		$pdo->beginTransaction();

		echo "1. Converting amount column from REAL to INTEGER...\n";

		// Create new transactions table with INTEGER amount
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

		// Copy data, rounding amounts to integers
		$pdo->exec("
            INSERT INTO transactions_new (id, user_id, category_id, type, amount, description, transaction_date, created_at, updated_at)
            SELECT id, user_id, category_id, type, ROUND(amount), description, transaction_date, created_at, updated_at
            FROM transactions
        ");

		// Replace old table
		$pdo->exec("DROP TABLE transactions");
		$pdo->exec("ALTER TABLE transactions_new RENAME TO transactions");

		echo "2. Adding missing indexes...\n";

		// Add all missing transaction indexes
		$pdo->exec("CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id)");
		$pdo->exec("CREATE INDEX IF NOT EXISTS idx_transactions_category_id ON transactions(category_id)");
		$pdo->exec("CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type)");
		$pdo->exec("CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(transaction_date)");
		$pdo->exec("CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON transactions(user_id, transaction_date)");

		// Commit changes
		$pdo->commit();

		echo "✅ $env database updated successfully!\n\n";
	} catch (Exception $e) {
		if ($pdo->inTransaction()) {
			$pdo->rollback();
		}
		echo "❌ Error updating $env database: " . $e->getMessage() . "\n\n";
	}
}

echo "Migration complete!\n";
