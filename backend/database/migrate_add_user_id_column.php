<?php

/**
 * Migration: Add user_id column to users table
 *
 * Purpose: Store Supabase auth user ID (UUID) to link users table with Supabase auth
 *
 * Rollback: ALTER TABLE users DROP COLUMN user_id;
 *
 * How to run: php backend/database/migrate_add_user_id_column.php
 */

$dbPath = __DIR__ . '/../database.sqlite';

if (!file_exists($dbPath)) {
	die("Error: Database not found at: $dbPath\n");
}

try {
	$db = new PDO('sqlite:' . $dbPath);
	$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

	echo "Starting migration: Add user_id column...\n";

	$db->beginTransaction();

	// Step 1: Add user_id column (TEXT to support UUIDs)
	echo "- Adding user_id column...\n";
	$db->exec("ALTER TABLE users ADD COLUMN user_id TEXT");

	// Step 2: Create unique index on user_id for fast lookups and uniqueness
	echo "- Creating unique index on user_id...\n";
	$db->exec("CREATE UNIQUE INDEX IF NOT EXISTS idx_users_user_id ON users(user_id)");

	// Step 3: Update schema version
	echo "- Updating schema version...\n";
	$db->exec("INSERT OR IGNORE INTO schema_version (version, description) VALUES (2, 'Added user_id column to users table')");

	$db->commit();

	echo "\n✅ Migration completed successfully!\n";
	echo "Next steps:\n";
	echo "1. Update schema.sql to include user_id column\n";
	echo "2. Update backend endpoint to support user_id lookups\n";
	echo "3. Update frontend to use user_id instead of email\n";
} catch (PDOException $e) {
	if ($db->inTransaction()) {
		$db->rollBack();
	}
	die("❌ Migration failed: " . $e->getMessage() . "\n");
}
