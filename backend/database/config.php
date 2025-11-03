<?php

/**
 * Database Configuration Helper
 * Determines which database to use based on environment
 */

/**
 * Get the database path based on the current environment
 *
 * @return string The path to the database file
 */
function getDatabasePath()
{
	// Determine environment based on various factors
	$environment = getEnvironment();

	$baseDir = __DIR__ . '/../../data';

	switch ($environment) {
		case 'server':
			return $baseDir . '/database-server.sqlite';
		case 'preview':
		case 'development':
		default:
			return $baseDir . '/database-preview.sqlite';
	}
}

/**
 * Determine the current environment
 *
 * @return string The current environment (server, preview, development)
 */
function getEnvironment()
{
	// Check for environment variable first
	if (isset($_ENV['APP_ENV'])) {
		return $_ENV['APP_ENV'];
	}

	// Check for HTTP headers that might indicate environment
	if (isset($_SERVER['HTTP_X_APP_ENV'])) {
		return $_SERVER['HTTP_X_APP_ENV'];
	}

	// Check for query parameter (useful for testing)
	if (isset($_GET['env'])) {
		return $_GET['env'];
	}

	// Try to determine based on server characteristics
	$serverName = $_SERVER['SERVER_NAME'] ?? '';
	$httpHost = $_SERVER['HTTP_HOST'] ?? '';

	// If running on localhost with port 3000 (preview), use preview database
	if (strpos($httpHost, 'localhost:3000') !== false || strpos($httpHost, '127.0.0.1:3000') !== false) {
		return 'preview';
	}

	// If running on localhost with port 4173 (vite preview), use preview database
	if (strpos($httpHost, 'localhost:4173') !== false || strpos($httpHost, '127.0.0.1:4173') !== false) {
		return 'preview';
	}

	// If running on localhost with dev server (5173), use development database
	if (strpos($httpHost, 'localhost:5173') !== false || strpos($httpHost, '127.0.0.1:5173') !== false) {
		return 'development';
	}

	// If running on a production-like domain, use server database
	if (!strpos($httpHost, 'localhost') && !strpos($httpHost, '127.0.0.1')) {
		return 'server';
	}

	// Default to development
	return 'development';
}

/**
 * Create a database connection using the appropriate database file
 *
 * @return PDO The database connection
 * @throws PDOException If connection fails
 */
function getDatabaseConnection()
{
	$dbPath = getDatabasePath();

	// Ensure the directory exists
	$dbDir = dirname($dbPath);
	if (!is_dir($dbDir)) {
		mkdir($dbDir, 0755, true);
	}

	try {
		$db = new PDO('sqlite:' . $dbPath);
		$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

		// Log which database is being used (for debugging)
		error_log("Using database: " . $dbPath . " (Environment: " . getEnvironment() . ")");

		return $db;
	} catch (PDOException $e) {
		error_log("Database connection failed: " . $e->getMessage());
		throw $e;
	}
}

/**
 * Get environment info for debugging
 *
 * @return array Environment information
 */
function getEnvironmentInfo()
{
	return [
		'environment' => getEnvironment(),
		'database_path' => getDatabasePath(),
		'server_name' => $_SERVER['SERVER_NAME'] ?? 'unknown',
		'http_host' => $_SERVER['HTTP_HOST'] ?? 'unknown',
		'request_uri' => $_SERVER['REQUEST_URI'] ?? 'unknown'
	];
}
