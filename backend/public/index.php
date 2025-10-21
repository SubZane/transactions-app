<?php

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Slim\Factory\AppFactory;
use TransactionsApp\Database\Database;
use TransactionsApp\Database\DatabaseBackup;
use TransactionsApp\Models\Transaction;
use TransactionsApp\Models\Category;
use TransactionsApp\Controllers\TransactionController;
use TransactionsApp\Controllers\CategoryController;
use TransactionsApp\Middleware\CorsMiddleware;

require __DIR__ . '/../vendor/autoload.php';

// Initialize database
$dbPath = __DIR__ . '/../database.sqlite';
$backupDir = __DIR__ . '/../backups';

try {
    $pdo = Database::getConnection($dbPath);
    
    // Initialize schema if database is new
    if (!file_exists($dbPath) || Database::getSchemaVersion() === 0) {
        Database::initSchema();
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database initialization failed: ' . $e->getMessage()]);
    exit;
}

// Create Slim app
$app = AppFactory::create();

// Add error middleware
$app->addErrorMiddleware(true, true, true);

// Add CORS middleware
$app->add(new CorsMiddleware());

// Initialize dependencies
$backup = new DatabaseBackup($dbPath, $backupDir);
$transactionModel = new Transaction($pdo);
$categoryModel = new Category($pdo);
$transactionController = new TransactionController($transactionModel, $backup);
$categoryController = new CategoryController($categoryModel);

// Define routes

// Health check
$app->get('/', function (Request $request, Response $response) {
    $data = [
        'status' => 'ok',
        'message' => 'Transactions API is running',
        'version' => '1.0.0'
    ];
    $response->getBody()->write(json_encode($data));
    return $response->withHeader('Content-Type', 'application/json');
});

// Transaction routes
$app->get('/api/transactions', [$transactionController, 'index']);
$app->get('/api/transactions/{id}', [$transactionController, 'show']);
$app->post('/api/transactions', [$transactionController, 'create']);
$app->put('/api/transactions/{id}', [$transactionController, 'update']);
$app->delete('/api/transactions/{id}', [$transactionController, 'delete']);
$app->get('/api/transactions/summary/stats', [$transactionController, 'summary']);

// Category routes
$app->get('/api/categories', [$categoryController, 'index']);
$app->get('/api/categories/{id}', [$categoryController, 'show']);
$app->post('/api/categories', [$categoryController, 'create']);

// Backup routes
$app->post('/api/backup', function (Request $request, Response $response) use ($backup) {
    $result = $backup->createBackup();
    $status = $result['success'] ? 200 : 500;
    $response->getBody()->write(json_encode($result));
    return $response->withHeader('Content-Type', 'application/json')->withStatus($status);
});

$app->get('/api/backups', function (Request $request, Response $response) use ($backup) {
    $backups = $backup->listBackups();
    $response->getBody()->write(json_encode(['data' => $backups]));
    return $response->withHeader('Content-Type', 'application/json');
});

// Handle OPTIONS requests for CORS preflight
$app->options('/{routes:.+}', function (Request $request, Response $response) {
    return $response;
});

$app->run();
