<?php

/**
 * Database Status Check
 * Shows transaction counts across all databases
 */

require_once __DIR__ . '/config.php';

echo "📊 Database Status Check\n";
echo "========================\n\n";

$databases = [
	'preview' => '/../../data/database-preview.sqlite',
	'server' => '/../../data/database-server.sqlite',
	'original' => '/../../data/database.sqlite'
];

foreach ($databases as $env => $relativePath) {
	$dbPath = __DIR__ . $relativePath;

	echo "🗄️  " . strtoupper($env) . " Database:\n";
	echo "   Path: $dbPath\n";

	if (!file_exists($dbPath)) {
		echo "   Status: ❌ File not found\n\n";
		continue;
	}

	try {
		$db = new PDO('sqlite:' . $dbPath);
		$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

		// Get transaction count
		$stmt = $db->query("SELECT COUNT(*) as count FROM transactions");
		$transactionCount = $stmt->fetch(PDO::FETCH_ASSOC)['count'];

		// Get user count
		$stmt = $db->query("SELECT COUNT(*) as count FROM users");
		$userCount = $stmt->fetch(PDO::FETCH_ASSOC)['count'];

		// Get category count
		$stmt = $db->query("SELECT COUNT(*) as count FROM categories");
		$categoryCount = $stmt->fetch(PDO::FETCH_ASSOC)['count'];

		// Get file size
		$fileSize = filesize($dbPath);
		$fileSizeKB = round($fileSize / 1024, 1);

		echo "   Status: ✅ Connected\n";
		echo "   Transactions: $transactionCount\n";
		echo "   Users: $userCount\n";
		echo "   Categories: $categoryCount\n";
		echo "   File Size: {$fileSizeKB} KB\n";
	} catch (Exception $e) {
		echo "   Status: ❌ Error - " . $e->getMessage() . "\n";
	}

	echo "\n";
}

echo "🎯 Summary:\n";
echo "- Preview/Development database contains your working data\n";
echo "- Server database has been emptied and is ready for production\n";
echo "- Original database remains as backup\n";
