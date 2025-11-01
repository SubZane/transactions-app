<?php

/**
 * Users API Endpoint
 *
 * Endpoints:
 * - GET    /api/users              - List all users (admin only)
 * - GET    /api/users/{id}         - Get user by ID
 * - GET    /api/users/email/{email} - Get user by email
 * - POST   /api/users              - Create new user
 * - PUT    /api/users/{id}         - Update user (firstname, surname)
 * - PUT    /api/users/email/{email} - Update user by email
 * - DELETE /api/users/{id}         - Delete user (soft delete)
 */

// 1. CORS (always first)
require_once __DIR__ . '/cors.php';
cors();

// 2. Response type
header('Content-Type: application/json');

// 3. Auth helper
require_once __DIR__ . '/auth-helper.php';

// 4. Legacy authentication helper function (for backward compatibility)
function getAuthToken()
{
	$headers = getallheaders();

	// Check Authorization header
	if (isset($headers['Authorization'])) {
		$authHeader = $headers['Authorization'];
		if (preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
			return $matches[1];
		}
	}

	return null;
}

// 5. Database connection
// Database connection
$dbPath = __DIR__ . '/../data/database.sqlite';
try {
	$db = new PDO('sqlite:' . $dbPath);
	$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
	http_response_code(500);
	echo json_encode(['error' => 'Database connection failed', 'message' => $e->getMessage()]);
	exit;
}

// 5. Routing logic
$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$pathParts = explode('/', trim($path, '/'));

// Find 'users.php' or 'users' in path
$apiIndex = array_search('users.php', $pathParts);
if ($apiIndex === false) {
	$apiIndex = array_search('users', $pathParts);
}

// 6. Route to handlers
try {
	if ($method === 'GET' && isset($pathParts[$apiIndex + 1]) && $pathParts[$apiIndex + 1] === 'email' && isset($pathParts[$apiIndex + 2])) {
		// GET /users/email/{email}
		getUserByEmail($db, $pathParts[$apiIndex + 2]);
	} elseif ($method === 'GET' && isset($pathParts[$apiIndex + 1]) && $pathParts[$apiIndex + 1] === 'user_id' && isset($pathParts[$apiIndex + 2])) {
		// GET /users/user_id/{user_id}
		getUserByUserId($db, $pathParts[$apiIndex + 2]);
	} elseif ($method === 'GET' && isset($pathParts[$apiIndex + 1])) {
		// GET /users/{id}
		getUserById($db, $pathParts[$apiIndex + 1]);
	} elseif ($method === 'GET') {
		// GET /users
		getAllUsers($db);
	} elseif ($method === 'POST') {
		// POST /users
		createUser($db);
	} elseif ($method === 'PUT' && isset($pathParts[$apiIndex + 1]) && $pathParts[$apiIndex + 1] === 'email' && isset($pathParts[$apiIndex + 2])) {
		// PUT /users/email/{email}
		updateUserByEmail($db, $pathParts[$apiIndex + 2]);
	} elseif ($method === 'PUT' && isset($pathParts[$apiIndex + 1]) && $pathParts[$apiIndex + 1] === 'user_id' && isset($pathParts[$apiIndex + 2])) {
		// PUT /users/user_id/{user_id}
		updateUserByUserId($db, $pathParts[$apiIndex + 2]);
	} elseif ($method === 'PUT' && isset($pathParts[$apiIndex + 1])) {
		// PUT /users/{id}
		updateUser($db, $pathParts[$apiIndex + 1]);
	} elseif ($method === 'DELETE' && isset($pathParts[$apiIndex + 1])) {
		// DELETE /users/{id}
		deleteUser($db, $pathParts[$apiIndex + 1]);
	} else {
		http_response_code(404);
		echo json_encode(['error' => 'Endpoint not found']);
	}
} catch (Exception $e) {
	http_response_code(500);
	echo json_encode(['error' => 'Internal server error', 'message' => $e->getMessage()]);
}

// =============================================================================
// HANDLER FUNCTIONS
// =============================================================================

/**
 * Get all users
 * Requires authentication
 */
function getAllUsers($db)
{
	requireAuth();

	$stmt = $db->query("SELECT id, user_id, email, firstname, surname, created_at, updated_at FROM users ORDER BY created_at DESC");
	echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
}

/**
 * Get user by ID
 */
function getUserById($db, $id)
{
	$stmt = $db->prepare("SELECT id, user_id, email, firstname, surname, created_at, updated_at FROM users WHERE id = ?");
	$stmt->execute([$id]);
	$user = $stmt->fetch(PDO::FETCH_ASSOC);

	if (!$user) {
		http_response_code(404);
		echo json_encode(['error' => 'User not found']);
		return;
	}

	echo json_encode($user);
}

/**
 * Get user by email
 * Used for profile loading after Supabase authentication
 */
function getUserByEmail($db, $email)
{
	$email = urldecode($email);

	$stmt = $db->prepare("SELECT id, user_id, email, firstname, surname, created_at, updated_at FROM users WHERE email = ?");
	$stmt->execute([$email]);
	$user = $stmt->fetch(PDO::FETCH_ASSOC);

	if (!$user) {
		http_response_code(404);
		echo json_encode(['error' => 'User not found']);
		return;
	}

	echo json_encode($user);
}

/**
 * Get user by user_id (Supabase auth ID)
 * Primary method for profile loading
 */
function getUserByUserId($db, $userId)
{
	$userId = urldecode($userId);

	$stmt = $db->prepare("SELECT id, user_id, email, firstname, surname, created_at, updated_at FROM users WHERE user_id = ?");
	$stmt->execute([$userId]);
	$user = $stmt->fetch(PDO::FETCH_ASSOC);

	if (!$user) {
		http_response_code(404);
		echo json_encode(['error' => 'User not found']);
		return;
	}

	echo json_encode($user);
}

/**
 * Create new user
 * Requires authentication
 */
function createUser($db)
{
	requireAuth();

	$input = json_decode(file_get_contents('php://input'), true);

	// Validate required fields
	if (!isset($input['email']) || empty(trim($input['email']))) {
		http_response_code(400);
		echo json_encode(['error' => 'email is required']);
		return;
	}

	if (!isset($input['firstname']) || empty(trim($input['firstname']))) {
		http_response_code(400);
		echo json_encode(['error' => 'firstname is required']);
		return;
	}

	if (!isset($input['surname']) || empty(trim($input['surname']))) {
		http_response_code(400);
		echo json_encode(['error' => 'surname is required']);
		return;
	}

	// Check if user already exists (by email or user_id)
	if (isset($input['user_id'])) {
		$stmt = $db->prepare("SELECT id FROM users WHERE user_id = ?");
		$stmt->execute([$input['user_id']]);
		if ($stmt->fetch()) {
			http_response_code(409);
			echo json_encode(['error' => 'User with this user_id already exists']);
			return;
		}
	}

	$stmt = $db->prepare("SELECT id FROM users WHERE email = ?");
	$stmt->execute([$input['email']]);
	if ($stmt->fetch()) {
		http_response_code(409);
		echo json_encode(['error' => 'User with this email already exists']);
		return;
	}

	// Create user
	$stmt = $db->prepare("
        INSERT INTO users (user_id, email, firstname, surname, created_at, updated_at)
        VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))
    ");
	$stmt->execute([
		isset($input['user_id']) ? trim($input['user_id']) : null,
		trim($input['email']),
		trim($input['firstname']),
		trim($input['surname'])
	]);

	// Return created user
	$stmt = $db->prepare("SELECT id, email, firstname, surname, created_at, updated_at FROM users WHERE id = ?");
	$stmt->execute([$db->lastInsertId()]);
	http_response_code(201);
	echo json_encode($stmt->fetch(PDO::FETCH_ASSOC));
}

/**
 * Update user by ID
 * Only firstname and surname are editable
 * Requires authentication
 */
function updateUser($db, $id)
{
	requireAuth();

	$input = json_decode(file_get_contents('php://input'), true);

	// Check if user exists
	$stmt = $db->prepare("SELECT id FROM users WHERE id = ?");
	$stmt->execute([$id]);
	if (!$stmt->fetch()) {
		http_response_code(404);
		echo json_encode(['error' => 'User not found']);
		return;
	}

	// Validate fields
	if (isset($input['firstname']) && empty(trim($input['firstname']))) {
		http_response_code(400);
		echo json_encode(['error' => 'firstname cannot be empty']);
		return;
	}

	if (isset($input['surname']) && empty(trim($input['surname']))) {
		http_response_code(400);
		echo json_encode(['error' => 'surname cannot be empty']);
		return;
	}

	// Update only provided fields
	$updates = [];
	$params = [];

	if (isset($input['firstname'])) {
		$updates[] = 'firstname = ?';
		$params[] = trim($input['firstname']);
	}

	if (isset($input['surname'])) {
		$updates[] = 'surname = ?';
		$params[] = trim($input['surname']);
	}

	if (empty($updates)) {
		http_response_code(400);
		echo json_encode(['error' => 'No fields to update']);
		return;
	}

	$updates[] = "updated_at = datetime('now')";
	$params[] = $id;

	$sql = "UPDATE users SET " . implode(', ', $updates) . " WHERE id = ?";
	$stmt = $db->prepare($sql);
	$stmt->execute($params);

	// Return updated user
	$stmt = $db->prepare("SELECT id, email, firstname, surname, created_at, updated_at FROM users WHERE id = ?");
	$stmt->execute([$id]);
	echo json_encode($stmt->fetch(PDO::FETCH_ASSOC));
}

/**
 * Update user by email
 * Only firstname and surname are editable
 * Requires authentication
 */
function updateUserByEmail($db, $email)
{
	requireAuth();

	$email = urldecode($email);
	$input = json_decode(file_get_contents('php://input'), true);

	// Check if user exists
	$stmt = $db->prepare("SELECT id FROM users WHERE email = ?");
	$stmt->execute([$email]);
	$user = $stmt->fetch();

	if (!$user) {
		http_response_code(404);
		echo json_encode(['error' => 'User not found']);
		return;
	}

	// Validate fields
	if (isset($input['firstname']) && empty(trim($input['firstname']))) {
		http_response_code(400);
		echo json_encode(['error' => 'firstname cannot be empty']);
		return;
	}

	if (isset($input['surname']) && empty(trim($input['surname']))) {
		http_response_code(400);
		echo json_encode(['error' => 'surname cannot be empty']);
		return;
	}

	// Update only provided fields
	$updates = [];
	$params = [];

	if (isset($input['firstname'])) {
		$updates[] = 'firstname = ?';
		$params[] = trim($input['firstname']);
	}

	if (isset($input['surname'])) {
		$updates[] = 'surname = ?';
		$params[] = trim($input['surname']);
	}

	if (empty($updates)) {
		http_response_code(400);
		echo json_encode(['error' => 'No fields to update']);
		return;
	}

	$updates[] = "updated_at = datetime('now')";
	$params[] = $email;

	$sql = "UPDATE users SET " . implode(', ', $updates) . " WHERE email = ?";
	$stmt = $db->prepare($sql);
	$stmt->execute($params);

	// Return updated user
	$stmt = $db->prepare("SELECT id, user_id, email, firstname, surname, created_at, updated_at FROM users WHERE email = ?");
	$stmt->execute([$email]);
	echo json_encode($stmt->fetch(PDO::FETCH_ASSOC));
}

/**
 * Update user by user_id (Supabase auth ID)
 * Only firstname and surname are editable
 * Requires authentication
 */
function updateUserByUserId($db, $userId)
{
	requireAuth();

	$userId = urldecode($userId);
	$input = json_decode(file_get_contents('php://input'), true);

	// Check if user exists
	$stmt = $db->prepare("SELECT id FROM users WHERE user_id = ?");
	$stmt->execute([$userId]);
	$user = $stmt->fetch();

	if (!$user) {
		http_response_code(404);
		echo json_encode(['error' => 'User not found']);
		return;
	}

	// Validate fields
	if (isset($input['firstname']) && empty(trim($input['firstname']))) {
		http_response_code(400);
		echo json_encode(['error' => 'firstname cannot be empty']);
		return;
	}

	if (isset($input['surname']) && empty(trim($input['surname']))) {
		http_response_code(400);
		echo json_encode(['error' => 'surname cannot be empty']);
		return;
	}

	// Update only provided fields
	$updates = [];
	$params = [];

	if (isset($input['firstname'])) {
		$updates[] = 'firstname = ?';
		$params[] = trim($input['firstname']);
	}

	if (isset($input['surname'])) {
		$updates[] = 'surname = ?';
		$params[] = trim($input['surname']);
	}

	if (empty($updates)) {
		http_response_code(400);
		echo json_encode(['error' => 'No fields to update']);
		return;
	}

	$updates[] = "updated_at = datetime('now')";
	$params[] = $userId;

	$sql = "UPDATE users SET " . implode(', ', $updates) . " WHERE user_id = ?";
	$stmt = $db->prepare($sql);
	$stmt->execute($params);

	// Return updated user
	$stmt = $db->prepare("SELECT id, user_id, email, firstname, surname, created_at, updated_at FROM users WHERE user_id = ?");
	$stmt->execute([$userId]);
	echo json_encode($stmt->fetch(PDO::FETCH_ASSOC));
}

/**
 * Delete user (soft delete would go here if we add deleted_at column)
 * For now, this is a hard delete
 * Requires authentication
 */
function deleteUser($db, $id)
{
	requireAuth();

	$stmt = $db->prepare("DELETE FROM users WHERE id = ?");
	$stmt->execute([$id]);

	if ($stmt->rowCount() === 0) {
		http_response_code(404);
		echo json_encode(['error' => 'User not found']);
		return;
	}

	http_response_code(204); // No content
}
