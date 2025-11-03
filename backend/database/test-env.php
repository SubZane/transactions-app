<?php

/**
 * Database Environment Test
 * Use this to test which database is being used in different environments
 */

require_once __DIR__ . '/config.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type, X-App-Env');

try {
	$envInfo = getEnvironmentInfo();
	$dbPath = getDatabasePath();

	// Test database connection
	$db = getDatabaseConnection();

	// Get some basic stats from the database
	$stmt = $db->query("SELECT COUNT(*) as transaction_count FROM transactions");
	$transactionCount = $stmt->fetch(PDO::FETCH_ASSOC)['transaction_count'];

	$stmt = $db->query("SELECT COUNT(*) as user_count FROM users");
	$userCount = $stmt->fetch(PDO::FETCH_ASSOC)['user_count'];

	echo json_encode([
		'status' => 'success',
		'environment' => $envInfo,
		'database_exists' => file_exists($dbPath),
		'database_size' => file_exists($dbPath) ? filesize($dbPath) : 0,
		'statistics' => [
			'transactions' => $transactionCount,
			'users' => $userCount
		],
		'timestamp' => date('Y-m-d H:i:s')
	], JSON_PRETTY_PRINT);
} catch (Exception $e) {
	http_response_code(500);
	echo json_encode([
		'status' => 'error',
		'message' => $e->getMessage(),
		'environment' => getEnvironmentInfo(),
		'timestamp' => date('Y-m-d H:i:s')
	], JSON_PRETTY_PRINT);
}
