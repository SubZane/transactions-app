<?php

/**
 * Migration: Add "Deposit" category for withdrawal type
 * Purpose: Add a new category called "Deposit" with type 'deposit' (withdrawal)
 * Run this script to add the new category to all database environments
 */

// Get database path from environment or use preview as default
$environment = $_ENV['ENVIRONMENT'] ?? 'preview';

$databases = [
	'preview' => __DIR__ . '/../../data/database-preview.sqlite',
	'server' => __DIR__ . '/../../data/database-server.sqlite',
	'local' => __DIR__ . '/../../data/database-local.sqlite',
	'original' => __DIR__ . '/../../data/database.sqlite'
];

// Allow command-line environment selection
if (php_sapi_name() === 'cli' && isset($argv[1])) {
	$environment = $argv[1];
}

$dbPath = $databases[$environment] ?? $databases['preview'];

if (!file_exists($dbPath)) {
	die("Error: Database file not found at: $dbPath\n");
}

echo "Adding 'Deposit' category to: $dbPath\n";

try {
	$pdo = new PDO("sqlite:$dbPath");
	$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

	// Check if Deposit category already exists
	$stmt = $pdo->prepare("SELECT COUNT(*) FROM categories WHERE name = ?");
	$stmt->execute(['Deposit']);
	$exists = $stmt->fetchColumn() > 0;

	if ($exists) {
		echo "ℹ️  'Deposit' category already exists. Skipping.\n";
		exit(0);
	}

	$pdo->beginTransaction();

	// Insert the new Deposit category (let SQLite auto-increment the ID)
	$stmt = $pdo->prepare("
        INSERT INTO categories (name, type, description, icon, color, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    ");

	$stmt->execute([
		'Deposit',
		'deposit',
		'Money deposited into account',
		'ArrowDownTrayIcon',
		'success'
	]);

	$newId = $pdo->lastInsertId();

	$pdo->commit();

	echo "✅ Successfully added 'Deposit' category with ID: $newId\n";
	echo "   Type: deposit (withdrawal)\n";
	echo "   Description: Money deposited into account\n";
	echo "   Icon: ArrowDownTrayIcon\n";
	echo "   Color: success\n";
} catch (Exception $e) {
	if ($pdo->inTransaction()) {
		$pdo->rollBack();
	}
	echo "❌ Migration failed: " . $e->getMessage() . "\n";
	exit(1);
}
