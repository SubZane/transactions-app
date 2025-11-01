<?php

/**
 * Migration: Rename Childrens Clothes category to Children
 * Updates the category name from "Childrens Clothes" to "Children" and sets ChildCare icon
 */

// Database configuration
$dbPath = __DIR__ . '/../../data/database.sqlite';

try {
	$db = new PDO('sqlite:' . $dbPath);
	$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

	echo "Starting migration: Rename Childrens Clothes to Children\n";

	// Update the category name, description, and icon
	$stmt = $db->prepare("
        UPDATE categories
        SET name = 'Children',
            description = 'Children clothing, toys, and activities',
            icon = 'ChildCareIcon',
            updated_at = datetime('now')
        WHERE id = 1 AND name = 'Childrens Clothes'
    ");

	$stmt->execute();
	$rowsAffected = $stmt->rowCount();

	if ($rowsAffected > 0) {
		echo "✓ Successfully renamed 'Childrens Clothes' to 'Children' ($rowsAffected row updated)\n";
	} else {
		echo "! No rows updated (category may already be renamed or not found)\n";
	}

	// Verify the update
	$stmt = $db->prepare("SELECT id, name, description, icon FROM categories WHERE id = 1");
	$stmt->execute();
	$category = $stmt->fetch(PDO::FETCH_ASSOC);

	echo "\nCurrent category #1:\n";
	echo "  Name: {$category['name']}\n";
	echo "  Description: {$category['description']}\n";
	echo "  Icon: {$category['icon']}\n";

	echo "\n✓ Migration completed successfully!\n";
} catch (PDOException $e) {
	echo "✗ Migration failed: " . $e->getMessage() . "\n";
	exit(1);
}
