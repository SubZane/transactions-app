#!/usr/bin/env php
<?php

/**
 * Example script demonstrating the backup workflow
 * This shows how backups are automatically created before database modifications
 */

require __DIR__ . '/vendor/autoload.php';

use TransactionsApp\Database\Database;
use TransactionsApp\Database\DatabaseBackup;
use TransactionsApp\Models\Transaction;

$dbPath = __DIR__ . '/database.sqlite';
$backupDir = __DIR__ . '/backups';

echo "=== Backup Demonstration Script ===\n\n";

try {
    // Initialize
    $pdo = Database::getConnection($dbPath);
    $backup = new DatabaseBackup($dbPath, $backupDir);
    $transactionModel = new Transaction($pdo);

    // Show current backups
    echo "Current backups:\n";
    $backups = $backup->listBackups();
    echo "  Count: " . count($backups) . "\n\n";

    // Simulate a data modification workflow
    echo "Simulating transaction creation...\n";
    
    // 1. Create backup BEFORE modifying data
    echo "  1. Creating backup before modification...\n";
    $result = $backup->createBackup();
    if ($result['success']) {
        echo "     ✓ Backup created: " . basename($result['backup_file']) . "\n";
    }

    // 2. Perform the data modification
    echo "  2. Creating transaction...\n";
    $transaction = $transactionModel->create([
        'user_id' => 'demo-user',
        'amount' => 99.99,
        'category' => 'Test',
        'description' => 'Demo transaction',
        'transaction_date' => date('Y-m-d H:i:s'),
        'type' => 'expense'
    ]);
    echo "     ✓ Transaction created (ID: {$transaction['id']})\n\n";

    // Show updated backup count
    $backups = $backup->listBackups();
    echo "Updated backup count: " . count($backups) . "\n\n";

    // Show recent backups
    echo "Recent backups:\n";
    foreach (array_slice($backups, 0, 3) as $b) {
        $size = number_format($b['size'] / 1024, 2);
        echo "  - {$b['filename']} ({$size} KB) - {$b['created_at']}\n";
    }

    echo "\n✓ Demonstration complete!\n";
    echo "\nNote: In production, backups are automatically created before:\n";
    echo "  - Creating new transactions (POST)\n";
    echo "  - Updating transactions (PUT)\n";
    echo "  - Deleting transactions (DELETE)\n";

} catch (Exception $e) {
    echo "✗ Error: " . $e->getMessage() . "\n";
    exit(1);
}
