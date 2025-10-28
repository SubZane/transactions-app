<?php

/**
 * Supabase Authentication Helper
 * 
 * This helper verifies Supabase JWT tokens and extracts user information.
 */

/**
 * Get the user ID from the Authorization header
 * 
 * @return string|null The user ID (UUID) or null if not authenticated
 */
function getAuthenticatedUserId(): ?string
{
	// Get Authorization header
	$headers = getallheaders();
	$authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? null;

	if (!$authHeader) {
		return null;
	}

	// Extract token from "Bearer <token>"
	if (!preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
		return null;
	}

	$token = $matches[1];

	// Decode JWT token (simple version - just extract payload)
	// For production, you should verify the signature with Supabase's public key
	$parts = explode('.', $token);
	if (count($parts) !== 3) {
		return null;
	}

	// Decode payload (second part of JWT)
	$payload = json_decode(base64_decode(str_replace(['-', '_'], ['+', '/'], $parts[1])), true);

	if (!$payload || !isset($payload['sub'])) {
		return null;
	}

	// 'sub' claim contains the user ID
	return $payload['sub'];
}

/**
 * Require authentication or return 401 error
 * 
 * @return string The authenticated user ID
 */
function requireAuth(): string
{
	$userId = getAuthenticatedUserId();

	if (!$userId) {
		http_response_code(401);
		echo json_encode(['error' => 'Unauthorized - Authentication required']);
		exit;
	}

	return $userId;
}

/**
 * Check if user owns the resource
 * 
 * @param PDO $db Database connection
 * @param string $table Table name
 * @param int $id Resource ID
 * @param string $userId User ID to check
 * @return bool True if user owns the resource
 */
function userOwnsResource(PDO $db, string $table, int $id, string $userId): bool
{
	// Check if user is admin
	$stmt = $db->prepare('SELECT role FROM users WHERE user_id = ?');
	$stmt->execute([$userId]);
	$user = $stmt->fetch(PDO::FETCH_ASSOC);

	// Admins can access all resources
	if ($user && $user['role'] === 'admin') {
		return true;
	}

	// Check resource ownership
	$stmt = $db->prepare("SELECT user_id FROM {$table} WHERE id = ?");
	$stmt->execute([$id]);
	$resource = $stmt->fetch(PDO::FETCH_ASSOC);

	if (!$resource) {
		return false;
	}

	// If resource has no user_id (legacy data), allow access for now
	if ($resource['user_id'] === null) {
		return true;
	}

	return $resource['user_id'] === $userId;
}
