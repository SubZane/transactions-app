<?php

/**
 * Database Structure Checker
 * Compares actual database structure with schema.sql
 */

require_once __DIR__ . '/config.php';

try {
	$db = getDatabaseConnection();

	echo "=== ACTUAL DATABASE STRUCTURE ===\n\n";

	// Check users table structure
	echo "USERS TABLE:\n";
	$result = $db->query("PRAGMA table_info(users)");
	while ($row = $result->fetch(PDO::FETCH_ASSOC)) {
		echo "- {$row['name']}: {$row['type']} " . ($row['notnull'] ? 'NOT NULL' : 'NULL') .
			($row['dflt_value'] ? " DEFAULT {$row['dflt_value']}" : '') .
			($row['pk'] ? ' PRIMARY KEY' : '') . "\n";
	}

	echo "\nCATEGORIES TABLE:\n";
	$result = $db->query("PRAGMA table_info(categories)");
	while ($row = $result->fetch(PDO::FETCH_ASSOC)) {
		echo "- {$row['name']}: {$row['type']} " . ($row['notnull'] ? 'NOT NULL' : 'NULL') .
			($row['dflt_value'] ? " DEFAULT {$row['dflt_value']}" : '') .
			($row['pk'] ? ' PRIMARY KEY' : '') . "\n";
	}

	echo "\nTRANSACTIONS TABLE:\n";
	$result = $db->query("PRAGMA table_info(transactions)");
	while ($row = $result->fetch(PDO::FETCH_ASSOC)) {
		echo "- {$row['name']}: {$row['type']} " . ($row['notnull'] ? 'NOT NULL' : 'NULL') .
			($row['dflt_value'] ? " DEFAULT {$row['dflt_value']}" : '') .
			($row['pk'] ? ' PRIMARY KEY' : '') . "\n";
	}

	echo "\n=== ADDITIONAL TABLES ===\n";
	$result = $db->query("SELECT name FROM sqlite_master WHERE type='table' AND name NOT IN ('users', 'categories', 'transactions')");
	while ($row = $result->fetch(PDO::FETCH_ASSOC)) {
		echo "- {$row['name']}\n";
	}

	echo "\n=== INDEXES ===\n";
	$result = $db->query("SELECT name, tbl_name FROM sqlite_master WHERE type='index' AND name NOT LIKE 'sqlite_%'");
	while ($row = $result->fetch(PDO::FETCH_ASSOC)) {
		echo "- {$row['name']} on {$row['tbl_name']}\n";
	}
} catch (PDOException $e) {
	echo "Error: " . $e->getMessage() . "\n";
}
