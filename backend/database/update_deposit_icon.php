<?php

/**
 * Migration: Update Deposit category icon to AccountBalanceIcon
 * Changes icon from AccountBalanceWallet to AccountBalance (bank icon)
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

	// Update Deposit category icon
	$stmt = $db->prepare("UPDATE categories SET icon = 'AccountBalanceIcon' WHERE name = 'Deposit' AND type = 'expense'");
	$stmt->execute();
	$updated = $stmt->rowCount();

	if ($updated > 0) {
		echo "✅ Updated Deposit category icon to AccountBalanceIcon (bank icon)\n";
	} else {
		echo "ℹ️  No Deposit category found to update\n";
	}

	echo "Migration completed successfully for $env environment!\n";
} catch (PDOException $e) {
	echo "Migration failed: " . $e->getMessage() . "\n";
	exit(1);
}
