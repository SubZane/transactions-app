<?php
// Check which databases actually exist and have transactions table
$databases = [
	'/Users/andreaslee-norman/Sites/transactions-app/data/database.sqlite',
	'/Users/andreaslee-norman/Sites/transactions-app/data/database-preview.sqlite',
	'/Users/andreaslee-norman/Sites/transactions-app/data/database-server.sqlite',
	'/Users/andreaslee-norman/Sites/transactions-app/data/database-local.sqlite',
	'/Users/andreaslee-norman/Sites/transactions-app/backend/database.sqlite'
];

foreach ($databases as $dbPath) {
	$name = basename($dbPath);
	echo "=== $name ===\n";

	if (!file_exists($dbPath)) {
		echo "File doesn't exist\n\n";
		continue;
	}

	try {
		$pdo = new PDO("sqlite:$dbPath");

		// Check if transactions table exists
		$stmt = $pdo->query("SELECT name FROM sqlite_master WHERE type='table' AND name='transactions'");
		if ($stmt->fetchColumn()) {
			// Get amount column type
			$stmt = $pdo->query("PRAGMA table_info(transactions)");
			$columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
			foreach ($columns as $col) {
				if ($col['name'] === 'amount') {
					echo "Has transactions table, amount type: {$col['type']}\n";
					break;
				}
			}

			// Count transactions
			$stmt = $pdo->query("SELECT COUNT(*) FROM transactions");
			$count = $stmt->fetchColumn();
			echo "Transaction count: $count\n";
		} else {
			echo "No transactions table\n";
		}
	} catch (Exception $e) {
		echo "Error: " . $e->getMessage() . "\n";
	}

	echo "\n";
}
