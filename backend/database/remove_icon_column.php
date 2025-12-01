<?php

/**
 * Migration: Remove icon column from categories table
 * Icons are managed in the frontend, not in the database
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

	// Create new categories table without icon column
	$db->exec("CREATE TABLE categories_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        type TEXT NOT NULL CHECK(type IN ('withdrawal', 'expense')),
        description TEXT,
        color TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )");

	// Copy data (excluding icon column)
	$db->exec("INSERT INTO categories_new (id, name, type, description, color, created_at, updated_at)
               SELECT id, name, type, description, color, created_at, updated_at
               FROM categories");

	// Drop old table and rename new one
	$db->exec("DROP TABLE categories");
	$db->exec("ALTER TABLE categories_new RENAME TO categories");
	$db->exec("CREATE INDEX idx_categories_type ON categories(type)");

	echo "✅ Removed icon column from categories table\n";

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
