<?php

/**
 * CORS Configuration
 * Allows cross-origin requests for API access
 */

function cors()
{
	// Allow from any origin
	if (isset($_SERVER['HTTP_ORIGIN'])) {
		// Allow all origins
		header("Access-Control-Allow-Origin: *");
		header('Access-Control-Allow-Credentials: true');
		header('Access-Control-Max-Age: 86400'); // cache for 1 day
	}

	// Access-Control headers are received during OPTIONS requests
	if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
		if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_METHOD'])) {
			// Support all common HTTP methods including PATCH
			header("Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS");
		}

		if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS'])) {
			header("Access-Control-Allow-Headers: {$_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']}");
		}

		exit(0);
	}
}
