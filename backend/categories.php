<?php

/**
 * Categories API Endpoint
 *
 * Endpoints:
 * - GET    /api/categories           - List all categories
 * - GET    /api/categories/{id}      - Get category by ID
 * - GET    /api/categories/type/{type} - Get categories by type (withdrawal/expense)
 * - POST   /api/categories           - Create new category
 * - PUT    /api/categories/{id}      - Update category
 * - DELETE /api/categories/{id}      - Delete category
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
require_once __DIR__ . '/database/config.php';

try {
	$db = getDatabaseConnection();
} catch (PDOException $e) {
	http_response_code(500);
	echo json_encode(['error' => 'Database connection failed', 'message' => $e->getMessage()]);
	exit;
}

// 5. Routing logic
$method = $_SERVER['REQUEST_METHOD'];
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$pathParts = explode('/', trim($path, '/'));

// Find 'categories.php' or 'categories' in path
$apiIndex = array_search('categories.php', $pathParts);
if ($apiIndex === false) {
	$apiIndex = array_search('categories', $pathParts);
}

// 6. Route to handlers
try {
	if ($method === 'GET' && isset($pathParts[$apiIndex + 1]) && $pathParts[$apiIndex + 1] === 'type' && isset($pathParts[$apiIndex + 2])) {
		// GET /categories/type/{type}
		getCategoriesByType($db, $pathParts[$apiIndex + 2]);
	} elseif ($method === 'GET' && isset($pathParts[$apiIndex + 1])) {
		// GET /categories/{id}
		getCategoryById($db, $pathParts[$apiIndex + 1]);
	} elseif ($method === 'GET') {
		// GET /categories
		getAllCategories($db);
	} elseif ($method === 'POST') {
		// POST /categories
		createCategory($db);
	} elseif ($method === 'PUT' && isset($pathParts[$apiIndex + 1])) {
		// PUT /categories/{id}
		updateCategory($db, $pathParts[$apiIndex + 1]);
	} elseif ($method === 'DELETE' && isset($pathParts[$apiIndex + 1])) {
		// DELETE /categories/{id}
		deleteCategory($db, $pathParts[$apiIndex + 1]);
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
 * Get all categories
 * No authentication required (shared resource)
 */
function getAllCategories($db)
{
	$stmt = $db->query("SELECT id, name, type, description, color, created_at, updated_at FROM categories ORDER BY type, name");
	echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
}

/**
 * Get category by ID
 */
function getCategoryById($db, $id)
{
	$stmt = $db->prepare("SELECT id, name, type, description, color, created_at, updated_at FROM categories WHERE id = ?");
	$stmt->execute([$id]);
	$category = $stmt->fetch(PDO::FETCH_ASSOC);

	if (!$category) {
		http_response_code(404);
		echo json_encode(['error' => 'Category not found']);
		return;
	}

	echo json_encode($category);
}

/**
 * Get categories by type (withdrawal or expense)
 */
function getCategoriesByType($db, $type)
{
	$type = urldecode($type);

	// Validate type
	if (!in_array($type, ['withdrawal', 'expense'])) {
		http_response_code(400);
		echo json_encode(['error' => 'Invalid type. Must be "withdrawal" or "expense"']);
		return;
	}

	$stmt = $db->prepare("SELECT id, name, type, description, color, created_at, updated_at FROM categories WHERE type = ? ORDER BY name");
	$stmt->execute([$type]);
	echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
}

/**
 * Create new category
 * Requires authentication
 */
function createCategory($db)
{
	requireAuth();

	$input = json_decode(file_get_contents('php://input'), true);

	// Validate required fields
	if (!isset($input['name']) || empty(trim($input['name']))) {
		http_response_code(400);
		echo json_encode(['error' => 'name is required']);
		return;
	}

	if (!isset($input['type']) || empty(trim($input['type']))) {
		http_response_code(400);
		echo json_encode(['error' => 'type is required']);
		return;
	}

	// Validate type
	if (!in_array($input['type'], ['withdrawal', 'expense'])) {
		http_response_code(400);
		echo json_encode(['error' => 'type must be "withdrawal" or "expense"']);
		return;
	}

	// Check if category with same name already exists
	$stmt = $db->prepare("SELECT id FROM categories WHERE name = ?");
	$stmt->execute([trim($input['name'])]);
	if ($stmt->fetch()) {
		http_response_code(409);
		echo json_encode(['error' => 'Category with this name already exists']);
		return;
	}

	// Create category
	$stmt = $db->prepare("
        INSERT INTO categories (name, type, description, color, created_at, updated_at)
        VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))
    ");
	$stmt->execute([
		trim($input['name']),
		trim($input['type']),
		isset($input['description']) ? trim($input['description']) : null,
		isset($input['color']) ? trim($input['color']) : null,
	]);

	// Return created category
	$stmt = $db->prepare("SELECT id, name, type, description, color, created_at, updated_at FROM categories WHERE id = ?");
	$stmt->execute([$db->lastInsertId()]);
	http_response_code(201);
	echo json_encode($stmt->fetch(PDO::FETCH_ASSOC));
}

/**
 * Update category
 * All fields except type are editable
 * Requires authentication
 */
function updateCategory($db, $id)
{
	requireAuth();

	$input = json_decode(file_get_contents('php://input'), true);

	// Check if category exists
	$stmt = $db->prepare("SELECT id FROM categories WHERE id = ?");
	$stmt->execute([$id]);
	if (!$stmt->fetch()) {
		http_response_code(404);
		echo json_encode(['error' => 'Category not found']);
		return;
	}

	// Validate fields
	if (isset($input['name']) && empty(trim($input['name']))) {
		http_response_code(400);
		echo json_encode(['error' => 'name cannot be empty']);
		return;
	}

	// Check for duplicate name (if name is being changed)
	if (isset($input['name'])) {
		$stmt = $db->prepare("SELECT id FROM categories WHERE name = ? AND id != ?");
		$stmt->execute([trim($input['name']), $id]);
		if ($stmt->fetch()) {
			http_response_code(409);
			echo json_encode(['error' => 'Category with this name already exists']);
			return;
		}
	}

	// Update only provided fields
	$updates = [];
	$params = [];

	if (isset($input['name'])) {
		$updates[] = 'name = ?';
		$params[] = trim($input['name']);
	}

	if (isset($input['description'])) {
		$updates[] = 'description = ?';
		$params[] = trim($input['description']);
	}

	if (isset($input['color'])) {
		$updates[] = 'color = ?';
		$params[] = trim($input['color']);
	}

	if (empty($updates)) {
		http_response_code(400);
		echo json_encode(['error' => 'No fields to update']);
		return;
	}

	$updates[] = "updated_at = datetime('now')";
	$params[] = $id;

	$sql = "UPDATE categories SET " . implode(', ', $updates) . " WHERE id = ?";
	$stmt = $db->prepare($sql);
	$stmt->execute($params);

	// Return updated category
	$stmt = $db->prepare("SELECT id, name, type, description, color, created_at, updated_at FROM categories WHERE id = ?");
	$stmt->execute([$id]);
	echo json_encode($stmt->fetch(PDO::FETCH_ASSOC));
}

/**
 * Delete category
 * Hard delete - use with caution (transactions may reference this category)
 * Requires authentication
 */
function deleteCategory($db, $id)
{
	requireAuth();

	// Check if category is being used by any transactions
	$stmt = $db->prepare("SELECT COUNT(*) FROM transactions WHERE category_id = ?");
	$stmt->execute([$id]);
	$count = $stmt->fetchColumn();

	if ($count > 0) {
		http_response_code(409);
		echo json_encode([
			'error' => 'Cannot delete category',
			'message' => "This category is used by {$count} transaction(s). Please reassign or delete those transactions first."
		]);
		return;
	}

	$stmt = $db->prepare("DELETE FROM categories WHERE id = ?");
	$stmt->execute([$id]);

	if ($stmt->rowCount() === 0) {
		http_response_code(404);
		echo json_encode(['error' => 'Category not found']);
		return;
	}

	http_response_code(204); // No content
}
