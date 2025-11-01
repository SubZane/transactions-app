<?php

/**
 * Migration Script: Add Elisabeth Lee-Norman
 *
 * This script:
 * 1. Adds Elisabeth Lee-Norman as a new user
 * 2. Updates all transactions from the second user (Mary Watson) to Elisabeth
 *
 * Usage: Run this script from the browser or command line
 * Browser: http://your-domain/backend/database/migrate_add_elisabeth.php
 * CLI: php migrate_add_elisabeth.php
 */

// Database configuration
$dbPath = __DIR__ . '/../../data/database.sqlite';

// Step 1: Check if database exists
if (!file_exists($dbPath)) {
	die("❌ Error: Database file not found at: $dbPath\n");
}

try {
	// Connect to SQLite database
	$db = new PDO('sqlite:' . $dbPath);
	$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

	echo "✓ Connected to database\n";
	echo "==================================================\n\n";

	// Start transaction
	$db->beginTransaction();

	// STEP 1: Check existing users
	echo "STEP 1: Checking existing users...\n";
	$stmt = $db->query("SELECT id, user_id, email, firstname, surname FROM users ORDER BY id");
	$users = $stmt->fetchAll(PDO::FETCH_ASSOC);

	echo "Current users in database:\n";
	foreach ($users as $user) {
		echo "  - ID: {$user['id']} | {$user['firstname']} {$user['surname']} | {$user['email']}\n";
	}
	echo "\n";

	// STEP 2: Add Elisabeth Lee-Norman
	echo "STEP 2: Adding Elisabeth Lee-Norman...\n";

	// Check if Elisabeth already exists
	$stmt = $db->prepare("SELECT id FROM users WHERE user_id = :user_id");
	$stmt->execute(['user_id' => 'aa16f241-ec56-4724-9221-31c5646ddc7a']);
	$existingElisabeth = $stmt->fetch();

	if ($existingElisabeth) {
		echo "  ℹ Elisabeth already exists with ID: {$existingElisabeth['id']}\n";
		$elisabethId = $existingElisabeth['id'];
	} else {
		// Find next available ID
		$stmt = $db->query("SELECT MAX(id) as max_id FROM users");
		$maxId = $stmt->fetch(PDO::FETCH_ASSOC)['max_id'];
		$nextId = $maxId + 1;

		$stmt = $db->prepare("
            INSERT INTO users (id, user_id, email, firstname, surname, created_at, updated_at)
            VALUES (:id, :user_id, :email, :firstname, :surname, datetime('now'), datetime('now'))
        ");

		$stmt->execute([
			'id' => $nextId,
			'user_id' => 'aa16f241-ec56-4724-9221-31c5646ddc7a',
			'email' => 'elisabeth@lee-norman.com',
			'firstname' => 'Elisabeth',
			'surname' => 'Lee-Norman'
		]);

		$elisabethId = $nextId;
		echo "  ✓ Elisabeth added with ID: $elisabethId\n";
	}
	echo "\n";

	// STEP 3: Identify Andreas
	echo "STEP 3: Identifying Andreas...\n";
	$stmt = $db->query("
        SELECT id, email, firstname, surname
        FROM users
        WHERE LOWER(firstname) = 'andreas'
           OR LOWER(email) LIKE '%andreas%'
        LIMIT 1
    ");
	$andreas = $stmt->fetch(PDO::FETCH_ASSOC);

	if ($andreas) {
		echo "  ✓ Andreas found: ID {$andreas['id']} - {$andreas['firstname']} {$andreas['surname']}\n";
		$andreasId = $andreas['id'];
	} else {
		echo "  ⚠ Andreas not found by name, assuming user ID 1 is Andreas\n";
		$andreasId = 1;
	}
	echo "\n";

	// STEP 4: Count transactions before migration
	echo "STEP 4: Analyzing transactions before migration...\n";
	$stmt = $db->query("
        SELECT u.id, u.firstname, u.surname, COUNT(t.id) as count
        FROM users u
        LEFT JOIN transactions t ON u.id = t.user_id
        GROUP BY u.id
        ORDER BY u.id
    ");
	$beforeCounts = $stmt->fetchAll(PDO::FETCH_ASSOC);

	echo "Transaction counts BEFORE migration:\n";
	foreach ($beforeCounts as $count) {
		echo "  - {$count['firstname']} {$count['surname']}: {$count['count']} transactions\n";
	}
	echo "\n";

	// STEP 5: Update transactions that aren't by Andreas
	echo "STEP 5: Updating transactions to Elisabeth...\n";
	$stmt = $db->prepare("
        UPDATE transactions
        SET user_id = :elisabeth_id,
            updated_at = datetime('now')
        WHERE user_id != :andreas_id
    ");

	$stmt->execute([
		'elisabeth_id' => $elisabethId,
		'andreas_id' => $andreasId
	]);

	$updatedCount = $stmt->rowCount();
	echo "  ✓ Updated $updatedCount transactions to Elisabeth\n";
	echo "\n";

	// STEP 6: Count transactions after migration
	echo "STEP 6: Verifying transactions after migration...\n";
	$stmt = $db->query("
        SELECT u.id, u.firstname, u.surname, COUNT(t.id) as count
        FROM users u
        LEFT JOIN transactions t ON u.id = t.user_id
        GROUP BY u.id
        ORDER BY u.id
    ");
	$afterCounts = $stmt->fetchAll(PDO::FETCH_ASSOC);

	echo "Transaction counts AFTER migration:\n";
	foreach ($afterCounts as $count) {
		echo "  - {$count['firstname']} {$count['surname']}: {$count['count']} transactions\n";
	}
	echo "\n";

	// STEP 7: Show sample Elisabeth transactions
	echo "STEP 7: Sample transactions by Elisabeth...\n";
	$stmt = $db->prepare("
        SELECT t.id, t.type, t.amount, t.description, t.transaction_date
        FROM transactions t
        WHERE t.user_id = :elisabeth_id
        ORDER BY t.transaction_date DESC
        LIMIT 5
    ");
	$stmt->execute(['elisabeth_id' => $elisabethId]);
	$sampleTransactions = $stmt->fetchAll(PDO::FETCH_ASSOC);

	foreach ($sampleTransactions as $trans) {
		$type = strtoupper($trans['type']);
		echo "  - {$trans['transaction_date']} | $type | {$trans['amount']} kr | {$trans['description']}\n";
	}
	echo "\n";

	// Commit transaction
	$db->commit();

	echo "==================================================\n";
	echo "✓ Migration completed successfully!\n";
	echo "==================================================\n\n";

	echo "Summary:\n";
	echo "  - Elisabeth Lee-Norman added with user_id: aa16f241-ec56-4724-9221-31c5646ddc7a\n";
	echo "  - $updatedCount transactions updated to Elisabeth\n";
	echo "  - Andreas's transactions remain unchanged\n";
} catch (PDOException $e) {
	// Rollback on error
	if ($db->inTransaction()) {
		$db->rollBack();
	}

	echo "✗ Migration failed!\n";
	echo "Error: " . $e->getMessage() . "\n";
	exit(1);
}
