<?php

/**
 * Migration: Rename Vacation category to Travel
 * Updates the category name from "Vacation" to "Travel" and sets CardTravel icon
 */

// Database configuration
$dbPath = __DIR__ . '/../../data/database.sqlite';

try {
	$db = new PDO('sqlite:' . $dbPath);
	$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

	echo "Starting migration: Rename Vacation to Travel\n";

	// Update the category name, description, and icon
	$stmt = $db->prepare("
        UPDATE categories
        SET name = 'Travel',
            description = 'Vacation, trips, and travel expenses',
            icon = 'CardTravelIcon',
            updated_at = datetime('now')
        WHERE id = 7 AND name = 'Vacation'
    ");

	$stmt->execute();
	$rowsAffected = $stmt->rowCount();

	if ($rowsAffected > 0) {
		echo "✓ Successfully renamed 'Vacation' to 'Travel' ($rowsAffected row updated)\n";
	} else {
		echo "! No rows updated (category may already be renamed or not found)\n";
	}

	// Verify the update
	$stmt = $db->prepare("SELECT id, name, description, icon FROM categories WHERE id = 7");
	$stmt->execute();
	$category = $stmt->fetch(PDO::FETCH_ASSOC);

	echo "\nCurrent category #7:\n";
	echo "  Name: {$category['name']}\n";
	echo "  Description: {$category['description']}\n";
	echo "  Icon: {$category['icon']}\n";

	echo "\n✓ Migration completed successfully!\n";
} catch (PDOException $e) {
	echo "✗ Migration failed: " . $e->getMessage() . "\n";
	exit(1);
}
