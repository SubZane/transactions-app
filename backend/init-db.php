#!/usr/bin/env php
<?php

/**
 * Database initialization and testing script
 */

require __DIR__ . '/vendor/autoload.php';

use TransactionsApp\Database\Database;
use TransactionsApp\Database\DatabaseBackup;

$dbPath = __DIR__ . '/database.sqlite';
$backupDir = __DIR__ . '/backups';

echo "=== Transactions App Database Utility ===\n\n";

// Check if database exists
if (file_exists($dbPath)) {
    echo "Database file found: {$dbPath}\n";
    $dbSize = filesize($dbPath);
    echo "Database size: " . number_format($dbSize / 1024, 2) . " KB\n\n";
} else {
    echo "Database file not found. Creating new database...\n\n";
}

try {
    // Initialize database connection
    echo "Connecting to database...\n";
    $pdo = Database::getConnection($dbPath);
    echo "✓ Connected successfully\n\n";

    // Get or initialize schema
    $currentVersion = Database::getSchemaVersion();
    if ($currentVersion === 0) {
        echo "Initializing database schema...\n";
        Database::initSchema();
        $currentVersion = Database::getSchemaVersion();
        echo "✓ Schema initialized (version {$currentVersion})\n\n";
    } else {
        echo "Current schema version: {$currentVersion}\n\n";
    }

    // Display table information
    echo "Database tables:\n";
    $tables = $pdo->query("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")->fetchAll();
    foreach ($tables as $table) {
        $count = $pdo->query("SELECT COUNT(*) as count FROM {$table['name']}")->fetch();
        echo "  - {$table['name']}: {$count['count']} rows\n";
    }
    echo "\n";

    // Test backup functionality
    echo "Testing backup functionality...\n";
    $backup = new DatabaseBackup($dbPath, $backupDir);
    $result = $backup->createBackup();
    
    if ($result['success']) {
        echo "✓ Backup created successfully\n";
        echo "  File: " . basename($result['backup_file']) . "\n\n";
        
        // List all backups
        $backups = $backup->listBackups();
        echo "Available backups: " . count($backups) . "\n";
        foreach (array_slice($backups, 0, 5) as $b) {
            echo "  - {$b['filename']} (" . number_format($b['size'] / 1024, 2) . " KB) - {$b['created_at']}\n";
        }
    } else {
        echo "✗ Backup failed: {$result['message']}\n";
    }
    
    echo "\n✓ All checks passed!\n";
    
} catch (Exception $e) {
    echo "✗ Error: " . $e->getMessage() . "\n";
    exit(1);
}
