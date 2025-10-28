<?php

/**
 * Transactions API Endpoint
 *
 * Endpoints:
 * - GET    /api/transactions                    - List all transactions for authenticated user
 * - GET    /api/transactions/{id}               - Get transaction by ID
 * - GET    /api/transactions/user/{user_id}     - Get transactions by user_id
 * - GET    /api/transactions/type/{type}        - Get transactions by type (deposit/expense)
 * - GET    /api/transactions/category/{category_id} - Get transactions by category
 * - POST   /api/transactions                    - Create new transaction
 * - PUT    /api/transactions/{id}               - Update transaction
 * - DELETE /api/transactions/{id}               - Delete transaction
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
$dbPath = __DIR__ . '/database.sqlite';
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

// Find 'transactions.php' or 'transactions' in path
$apiIndex = array_search('transactions.php', $pathParts);
if ($apiIndex === false) {
	$apiIndex = array_search('transactions', $pathParts);
}

// 6. Route to handlers
try {
	if ($method === 'GET' && isset($pathParts[$apiIndex + 1]) && $pathParts[$apiIndex + 1] === 'user' && isset($pathParts[$apiIndex + 2])) {
		// GET /transactions/user/{user_id}
		getTransactionsByUserId($db, $pathParts[$apiIndex + 2]);
	} elseif ($method === 'GET' && isset($pathParts[$apiIndex + 1]) && $pathParts[$apiIndex + 1] === 'type' && isset($pathParts[$apiIndex + 2])) {
		// GET /transactions/type/{type}
		getTransactionsByType($db, $pathParts[$apiIndex + 2]);
	} elseif ($method === 'GET' && isset($pathParts[$apiIndex + 1]) && $pathParts[$apiIndex + 1] === 'category' && isset($pathParts[$apiIndex + 2])) {
		// GET /transactions/category/{category_id}
		getTransactionsByCategory($db, $pathParts[$apiIndex + 2]);
	} elseif ($method === 'GET' && isset($pathParts[$apiIndex + 1])) {
		// GET /transactions/{id}
		getTransactionById($db, $pathParts[$apiIndex + 1]);
	} elseif ($method === 'GET') {
		// GET /transactions (for authenticated user)
		getAllTransactions($db);
	} elseif ($method === 'POST') {
		// POST /transactions
		createTransaction($db);
	} elseif ($method === 'PUT' && isset($pathParts[$apiIndex + 1])) {
		// PUT /transactions/{id}
		updateTransaction($db, $pathParts[$apiIndex + 1]);
	} elseif ($method === 'DELETE' && isset($pathParts[$apiIndex + 1])) {
		// DELETE /transactions/{id}
		deleteTransaction($db, $pathParts[$apiIndex + 1]);
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
 * Get all transactions for authenticated user
 * Requires authentication
 */
function getAllTransactions($db)
{
	$user = requireAuth();

	// Get user_id from users table
	$stmt = $db->prepare("SELECT id FROM users WHERE user_id = ?");
	$stmt->execute([$user]);
	$dbUser = $stmt->fetch(PDO::FETCH_ASSOC);

	if (!$dbUser) {
		http_response_code(404);
		echo json_encode(['error' => 'User not found']);
		return;
	}

	$stmt = $db->prepare("
        SELECT
            t.id,
            t.user_id,
            t.category_id,
            t.type,
            t.amount,
            t.description,
            t.transaction_date,
            t.created_at,
            t.updated_at,
            c.name as category_name,
            c.icon as category_icon,
            c.color as category_color,
            u.firstname as user_firstname,
            u.surname as user_surname
        FROM transactions t
        LEFT JOIN categories c ON t.category_id = c.id
        LEFT JOIN users u ON t.user_id = u.id
        WHERE t.user_id = ?
        ORDER BY t.transaction_date DESC, t.created_at DESC
    ");
	$stmt->execute([$dbUser['id']]);
	echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
}

/**
 * Get transaction by ID
 * Requires authentication and ownership
 */
function getTransactionById($db, $id)
{
	$user = requireAuth();

	// Get user_id from users table
	$stmt = $db->prepare("SELECT id FROM users WHERE user_id = ?");
	$stmt->execute([$user]);
	$dbUser = $stmt->fetch(PDO::FETCH_ASSOC);

	if (!$dbUser) {
		http_response_code(404);
		echo json_encode(['error' => 'User not found']);
		return;
	}

	$stmt = $db->prepare("
        SELECT
            t.id,
            t.user_id,
            t.category_id,
            t.type,
            t.amount,
            t.description,
            t.transaction_date,
            t.created_at,
            t.updated_at,
            c.name as category_name,
            c.icon as category_icon,
            c.color as category_color,
            u.firstname as user_firstname,
            u.surname as user_surname
        FROM transactions t
        LEFT JOIN categories c ON t.category_id = c.id
        LEFT JOIN users u ON t.user_id = u.id
        WHERE t.id = ? AND t.user_id = ?
    ");
	$stmt->execute([$id, $dbUser['id']]);
	$transaction = $stmt->fetch(PDO::FETCH_ASSOC);

	if (!$transaction) {
		http_response_code(404);
		echo json_encode(['error' => 'Transaction not found']);
		return;
	}

	echo json_encode($transaction);
}

/**
 * Get transactions by user_id (Supabase auth ID)
 * Requires authentication
 */
function getTransactionsByUserId($db, $userId)
{
	$user = requireAuth();
	$userId = urldecode($userId);

	// Verify user is requesting their own transactions
	if ($user !== $userId) {
		http_response_code(403);
		echo json_encode(['error' => 'Forbidden', 'message' => 'You can only access your own transactions']);
		return;
	}

	// Get user_id from users table
	$stmt = $db->prepare("SELECT id FROM users WHERE user_id = ?");
	$stmt->execute([$userId]);
	$dbUser = $stmt->fetch(PDO::FETCH_ASSOC);

	if (!$dbUser) {
		http_response_code(404);
		echo json_encode(['error' => 'User not found']);
		return;
	}

	$stmt = $db->prepare("
        SELECT
            t.id,
            t.user_id,
            t.category_id,
            t.type,
            t.amount,
            t.description,
            t.transaction_date,
            t.created_at,
            t.updated_at,
            c.name as category_name,
            c.icon as category_icon,
            c.color as category_color,
            u.firstname as user_firstname,
            u.surname as user_surname
        FROM transactions t
        LEFT JOIN categories c ON t.category_id = c.id
        LEFT JOIN users u ON t.user_id = u.id
        WHERE t.user_id = ?
        ORDER BY t.transaction_date DESC, t.created_at DESC
    ");
	$stmt->execute([$dbUser['id']]);
	echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
}

/**
 * Get transactions by type (deposit or expense)
 * Requires authentication - returns only user's transactions
 */
function getTransactionsByType($db, $type)
{
	$user = requireAuth();
	$type = urldecode($type);

	// Validate type
	if (!in_array($type, ['deposit', 'expense'])) {
		http_response_code(400);
		echo json_encode(['error' => 'Invalid type. Must be "deposit" or "expense"']);
		return;
	}

	// Get user_id from users table
	$stmt = $db->prepare("SELECT id FROM users WHERE user_id = ?");
	$stmt->execute([$user]);
	$dbUser = $stmt->fetch(PDO::FETCH_ASSOC);

	if (!$dbUser) {
		http_response_code(404);
		echo json_encode(['error' => 'User not found']);
		return;
	}

	$stmt = $db->prepare("
        SELECT
            t.id,
            t.user_id,
            t.category_id,
            t.type,
            t.amount,
            t.description,
            t.transaction_date,
            t.created_at,
            t.updated_at,
            c.name as category_name,
            c.icon as category_icon,
            c.color as category_color,
            u.firstname as user_firstname,
            u.surname as user_surname
        FROM transactions t
        LEFT JOIN categories c ON t.category_id = c.id
        LEFT JOIN users u ON t.user_id = u.id
        WHERE t.type = ? AND t.user_id = ?
        ORDER BY t.transaction_date DESC, t.created_at DESC
    ");
	$stmt->execute([$type, $dbUser['id']]);
	echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
}

/**
 * Get transactions by category
 * Requires authentication - returns only user's transactions
 */
function getTransactionsByCategory($db, $categoryId)
{
	$user = requireAuth();

	// Get user_id from users table
	$stmt = $db->prepare("SELECT id FROM users WHERE user_id = ?");
	$stmt->execute([$user]);
	$dbUser = $stmt->fetch(PDO::FETCH_ASSOC);

	if (!$dbUser) {
		http_response_code(404);
		echo json_encode(['error' => 'User not found']);
		return;
	}

	$stmt = $db->prepare("
        SELECT
            t.id,
            t.user_id,
            t.category_id,
            t.type,
            t.amount,
            t.description,
            t.transaction_date,
            t.created_at,
            t.updated_at,
            c.name as category_name,
            c.icon as category_icon,
            c.color as category_color,
            u.firstname as user_firstname,
            u.surname as user_surname
        FROM transactions t
        LEFT JOIN categories c ON t.category_id = c.id
        LEFT JOIN users u ON t.user_id = u.id
        WHERE t.category_id = ? AND t.user_id = ?
        ORDER BY t.transaction_date DESC, t.created_at DESC
    ");
	$stmt->execute([$categoryId, $dbUser['id']]);
	echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
}

/**
 * Create new transaction
 * Requires authentication
 */
function createTransaction($db)
{
	$user = requireAuth();

	$input = json_decode(file_get_contents('php://input'), true);

	// Get user_id from users table
	$stmt = $db->prepare("SELECT id FROM users WHERE user_id = ?");
	$stmt->execute([$user]);
	$dbUser = $stmt->fetch(PDO::FETCH_ASSOC);

	if (!$dbUser) {
		http_response_code(404);
		echo json_encode(['error' => 'User not found']);
		return;
	}

	// Validate required fields
	if (!isset($input['type']) || empty(trim($input['type']))) {
		http_response_code(400);
		echo json_encode(['error' => 'type is required']);
		return;
	}

	// Validate type
	if (!in_array($input['type'], ['deposit', 'expense'])) {
		http_response_code(400);
		echo json_encode(['error' => 'type must be "deposit" or "expense"']);
		return;
	}

	if (!isset($input['amount']) || !is_numeric($input['amount'])) {
		http_response_code(400);
		echo json_encode(['error' => 'amount is required and must be a number']);
		return;
	}

	if ($input['amount'] < 1) {
		http_response_code(400);
		echo json_encode(['error' => 'amount must be at least 1 kr']);
		return;
	}

	if (!isset($input['transaction_date']) || empty(trim($input['transaction_date']))) {
		http_response_code(400);
		echo json_encode(['error' => 'transaction_date is required']);
		return;
	}

	// Category is required for expenses, optional for deposits
	if ($input['type'] === 'expense') {
		if (!isset($input['category_id']) || empty($input['category_id'])) {
			http_response_code(400);
			echo json_encode(['error' => 'category_id is required for expenses']);
			return;
		}

		// Validate category exists
		$stmt = $db->prepare("SELECT id, type FROM categories WHERE id = ?");
		$stmt->execute([$input['category_id']]);
		$category = $stmt->fetch(PDO::FETCH_ASSOC);

		if (!$category) {
			http_response_code(404);
			echo json_encode(['error' => 'Category not found']);
			return;
		}

		// Verify category type matches transaction type
		if ($category['type'] !== $input['type']) {
			http_response_code(400);
			echo json_encode(['error' => "Category type ({$category['type']}) does not match transaction type ({$input['type']})"]);
			return;
		}
	} elseif ($input['type'] === 'deposit') {
		// For deposits, category_id should be null
		$input['category_id'] = null;
	}

	// Create transaction
	$stmt = $db->prepare("
        INSERT INTO transactions (user_id, category_id, type, amount, description, transaction_date, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    ");
	$stmt->execute([
		$dbUser['id'],
		$input['category_id'],
		trim($input['type']),
		$input['amount'],
		isset($input['description']) ? trim($input['description']) : null,
		trim($input['transaction_date']),
	]);

	// Return created transaction
	$stmt = $db->prepare("
        SELECT
            t.id,
            t.user_id,
            t.category_id,
            t.type,
            t.amount,
            t.description,
            t.transaction_date,
            t.created_at,
            t.updated_at,
            c.name as category_name,
            c.icon as category_icon,
            c.color as category_color,
            u.firstname as user_firstname,
            u.surname as user_surname
        FROM transactions t
        LEFT JOIN categories c ON t.category_id = c.id
        LEFT JOIN users u ON t.user_id = u.id
        WHERE t.id = ?
    ");
	$stmt->execute([$db->lastInsertId()]);
	http_response_code(201);
	echo json_encode($stmt->fetch(PDO::FETCH_ASSOC));
}

/**
 * Update transaction
 * All fields except user_id are editable
 * Requires authentication and ownership
 */
function updateTransaction($db, $id)
{
	$user = requireAuth();

	$input = json_decode(file_get_contents('php://input'), true);

	// Get user_id from users table
	$stmt = $db->prepare("SELECT id FROM users WHERE user_id = ?");
	$stmt->execute([$user]);
	$dbUser = $stmt->fetch(PDO::FETCH_ASSOC);

	if (!$dbUser) {
		http_response_code(404);
		echo json_encode(['error' => 'User not found']);
		return;
	}

	// Check if transaction exists and user owns it
	$stmt = $db->prepare("SELECT id, type FROM transactions WHERE id = ? AND user_id = ?");
	$stmt->execute([$id, $dbUser['id']]);
	$transaction = $stmt->fetch(PDO::FETCH_ASSOC);

	if (!$transaction) {
		http_response_code(404);
		echo json_encode(['error' => 'Transaction not found']);
		return;
	}

	// Validate fields
	if (isset($input['amount']) && (!is_numeric($input['amount']) || $input['amount'] < 1)) {
		http_response_code(400);
		echo json_encode(['error' => 'amount must be at least 1 kr']);
		return;
	}

	if (isset($input['type']) && !in_array($input['type'], ['deposit', 'expense'])) {
		http_response_code(400);
		echo json_encode(['error' => 'type must be "deposit" or "expense"']);
		return;
	}

	// Determine the transaction type (new or existing)
	$newType = isset($input['type']) ? $input['type'] : $transaction['type'];

	// If category is being changed, validate it
	if (isset($input['category_id'])) {
		// For deposits, category_id should be null
		if ($newType === 'deposit') {
			$input['category_id'] = null;
		} else if ($newType === 'expense') {
			// For expenses, validate category exists and matches type
			if ($input['category_id'] === null) {
				http_response_code(400);
				echo json_encode(['error' => 'category_id is required for expenses']);
				return;
			}

			$stmt = $db->prepare("SELECT id, type FROM categories WHERE id = ?");
			$stmt->execute([$input['category_id']]);
			$category = $stmt->fetch(PDO::FETCH_ASSOC);

			if (!$category) {
				http_response_code(404);
				echo json_encode(['error' => 'Category not found']);
				return;
			}

			if ($category['type'] !== $newType) {
				http_response_code(400);
				echo json_encode(['error' => "Category type ({$category['type']}) does not match transaction type ({$newType})"]);
				return;
			}
		}
	}

	// Update only provided fields
	$updates = [];
	$params = [];

	if (isset($input['category_id'])) {
		$updates[] = 'category_id = ?';
		$params[] = $input['category_id'];
	}

	if (isset($input['type'])) {
		$updates[] = 'type = ?';
		$params[] = trim($input['type']);
	}

	if (isset($input['amount'])) {
		$updates[] = 'amount = ?';
		$params[] = $input['amount'];
	}

	if (isset($input['description'])) {
		$updates[] = 'description = ?';
		$params[] = trim($input['description']);
	}

	if (isset($input['transaction_date'])) {
		$updates[] = 'transaction_date = ?';
		$params[] = trim($input['transaction_date']);
	}

	if (empty($updates)) {
		http_response_code(400);
		echo json_encode(['error' => 'No fields to update']);
		return;
	}

	$updates[] = "updated_at = datetime('now')";
	$params[] = $id;

	$sql = "UPDATE transactions SET " . implode(', ', $updates) . " WHERE id = ?";
	$stmt = $db->prepare($sql);
	$stmt->execute($params);

	// Return updated transaction
	$stmt = $db->prepare("
        SELECT
            t.id,
            t.user_id,
            t.category_id,
            t.type,
            t.amount,
            t.description,
            t.transaction_date,
            t.created_at,
            t.updated_at,
            c.name as category_name,
            c.icon as category_icon,
            c.color as category_color,
            u.firstname as user_firstname,
            u.surname as user_surname
        FROM transactions t
        LEFT JOIN categories c ON t.category_id = c.id
        LEFT JOIN users u ON t.user_id = u.id
        WHERE t.id = ?
    ");
	$stmt->execute([$id]);
	echo json_encode($stmt->fetch(PDO::FETCH_ASSOC));
}

/**
 * Delete transaction
 * Requires authentication and ownership
 */
function deleteTransaction($db, $id)
{
	$user = requireAuth();

	// Get user_id from users table
	$stmt = $db->prepare("SELECT id FROM users WHERE user_id = ?");
	$stmt->execute([$user]);
	$dbUser = $stmt->fetch(PDO::FETCH_ASSOC);

	if (!$dbUser) {
		http_response_code(404);
		echo json_encode(['error' => 'User not found']);
		return;
	}

	// Delete only if user owns the transaction
	$stmt = $db->prepare("DELETE FROM transactions WHERE id = ? AND user_id = ?");
	$stmt->execute([$id, $dbUser['id']]);

	if ($stmt->rowCount() === 0) {
		http_response_code(404);
		echo json_encode(['error' => 'Transaction not found']);
		return;
	}

	http_response_code(204); // No content
}
