<?php

/**
 * Migration: Rename Transportation category to Car
 * Updates the category name from "Transportation" to "Car" and updates its description and icon
 */

// Database configuration
$dbPath = __DIR__ . '/../../data/database.sqlite';

try {
	$db = new PDO('sqlite:' . $dbPath);
	$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

	echo "Starting migration: Rename Petrol to Car\n";

	// Update the category name, description, and icon
	$stmt = $db->prepare("
        UPDATE categories
        SET name = 'Car',
            description = 'Gas, maintenance, parking, tolls',
            icon = 'DirectionsCarIcon',
            updated_at = datetime('now')
        WHERE id = 3 AND name = 'Petrol'
    ");

	$stmt->execute();
	$rowsAffected = $stmt->rowCount();

	if ($rowsAffected > 0) {
		echo "✓ Successfully renamed 'Petrol' to 'Car' ($rowsAffected row updated)\n";
	} else {
		echo "! No rows updated (category may already be renamed or not found)\n";
	}

	// Verify the update
	$stmt = $db->prepare("SELECT id, name, description, icon FROM categories WHERE id = 3");
	$stmt->execute();
	$category = $stmt->fetch(PDO::FETCH_ASSOC);

	echo "\nCurrent category #3:\n";
	echo "  Name: {$category['name']}\n";
	echo "  Description: {$category['description']}\n";
	echo "  Icon: {$category['icon']}\n";

	echo "\n✓ Migration completed successfully!\n";
} catch (PDOException $e) {
	echo "✗ Migration failed: " . $e->getMessage() . "\n";
	exit(1);
}
