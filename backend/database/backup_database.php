<?php

/**
 * Database Backup Utility
 *
 * Creates a timestamped backup of the SQLite database
 * Backups are stored in backend/database/backups/ directory
 *
 * Usage:
 *   require_once 'backup_database.php';
 *   backupDatabase(); // Returns backup filename or false on error
 */

function backupDatabase(): string|false
{
	// Database path
	$dbPath = __DIR__ . '/../../data/database.sqlite';
	$backupDir = __DIR__ . '/backups';

	// Create backups directory if it doesn't exist
	if (!is_dir($backupDir)) {
		if (!mkdir($backupDir, 0755, true)) {
			error_log("Failed to create backup directory: $backupDir");
			return false;
		}
		echo "Created backup directory: $backupDir\n";
	}

	// Check if database exists
	if (!file_exists($dbPath)) {
		error_log("Database file not found: $dbPath");
		return false;
	}

	// Generate backup filename with timestamp
	$timestamp = date('Y-m-d_His');
	$backupFilename = "database_backup_{$timestamp}.sqlite";
	$backupPath = $backupDir . '/' . $backupFilename;

	// Copy database file
	if (copy($dbPath, $backupPath)) {
		echo "✅ Database backed up successfully: $backupFilename\n";
		echo "   Location: $backupPath\n";

		// Get file sizes
		$originalSize = filesize($dbPath);
		$backupSize = filesize($backupPath);
		echo "   Size: " . formatBytes($backupSize) . "\n";

		return $backupFilename;
	} else {
		error_log("Failed to create backup: $backupPath");
		return false;
	}
}

function formatBytes($bytes, $precision = 2): string
{
	$units = ['B', 'KB', 'MB', 'GB'];
	$bytes = max($bytes, 0);
	$pow = floor(($bytes ? log($bytes) : 0) / log(1024));
	$pow = min($pow, count($units) - 1);
	$bytes /= pow(1024, $pow);
	return round($bytes, $precision) . ' ' . $units[$pow];
}

function listBackups(): array
{
	$backupDir = __DIR__ . '/backups';
	if (!is_dir($backupDir)) {
		return [];
	}

	$backups = [];
	$files = scandir($backupDir);

	foreach ($files as $file) {
		if (preg_match('/^database_backup_(\d{4}-\d{2}-\d{2}_\d{6})\.sqlite$/', $file, $matches)) {
			$backups[] = [
				'filename' => $file,
				'path' => $backupDir . '/' . $file,
				'timestamp' => $matches[1],
				'size' => filesize($backupDir . '/' . $file),
				'date' => filemtime($backupDir . '/' . $file),
			];
		}
	}

	// Sort by date (newest first)
	usort($backups, fn($a, $b) => $b['date'] - $a['date']);

	return $backups;
}

// If run directly, create a backup
if (basename(__FILE__) === basename($_SERVER['SCRIPT_FILENAME'])) {
	echo "Database Backup Utility\n";
	echo "======================\n\n";

	$result = backupDatabase();

	if ($result) {
		echo "\n📦 Available backups:\n";
		$backups = listBackups();
		foreach ($backups as $backup) {
			echo "  - {$backup['filename']} (" . formatBytes($backup['size']) . ")\n";
		}
		echo "\n✅ Backup completed successfully!\n";
		exit(0);
	} else {
		echo "\n❌ Backup failed!\n";
		exit(1);
	}
}
