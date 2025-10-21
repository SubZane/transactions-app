<?php

namespace TransactionsApp\Controllers;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use TransactionsApp\Models\Transaction;
use TransactionsApp\Database\DatabaseBackup;

class TransactionController
{
    private Transaction $transactionModel;
    private DatabaseBackup $backup;

    public function __construct(Transaction $transactionModel, DatabaseBackup $backup)
    {
        $this->transactionModel = $transactionModel;
        $this->backup = $backup;
    }

    /**
     * Get all transactions
     */
    public function index(Request $request, Response $response): Response
    {
        $queryParams = $request->getQueryParams();
        $userId = $queryParams['user_id'] ?? '';

        if (empty($userId)) {
            return $this->jsonResponse($response, ['error' => 'user_id is required'], 400);
        }

        $filters = [
            'type' => $queryParams['type'] ?? null,
            'category' => $queryParams['category'] ?? null,
            'start_date' => $queryParams['start_date'] ?? null,
            'end_date' => $queryParams['end_date'] ?? null,
        ];

        try {
            $transactions = $this->transactionModel->getAll($userId, array_filter($filters));
            return $this->jsonResponse($response, ['data' => $transactions]);
        } catch (\Exception $e) {
            return $this->jsonResponse($response, ['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Get a single transaction
     */
    public function show(Request $request, Response $response, array $args): Response
    {
        $id = (int) $args['id'];
        $queryParams = $request->getQueryParams();
        $userId = $queryParams['user_id'] ?? '';

        if (empty($userId)) {
            return $this->jsonResponse($response, ['error' => 'user_id is required'], 400);
        }

        try {
            $transaction = $this->transactionModel->getById($id, $userId);
            
            if (!$transaction) {
                return $this->jsonResponse($response, ['error' => 'Transaction not found'], 404);
            }

            return $this->jsonResponse($response, ['data' => $transaction]);
        } catch (\Exception $e) {
            return $this->jsonResponse($response, ['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Create a new transaction
     */
    public function create(Request $request, Response $response): Response
    {
        $data = json_decode((string) $request->getBody(), true);

        // Create backup before making changes
        $backupResult = $this->backup->createBackup();
        if (!$backupResult['success']) {
            error_log('Backup warning: ' . $backupResult['message']);
        }

        // Validate required fields
        $required = ['user_id', 'amount', 'category', 'transaction_date', 'type'];
        foreach ($required as $field) {
            if (!isset($data[$field])) {
                return $this->jsonResponse($response, ['error' => "Field '{$field}' is required"], 400);
            }
        }

        // Validate type
        if (!in_array($data['type'], ['income', 'expense'])) {
            return $this->jsonResponse($response, ['error' => 'Type must be either income or expense'], 400);
        }

        // Validate amount
        if (!is_numeric($data['amount']) || $data['amount'] <= 0) {
            return $this->jsonResponse($response, ['error' => 'Amount must be a positive number'], 400);
        }

        try {
            $transaction = $this->transactionModel->create($data);
            return $this->jsonResponse($response, ['data' => $transaction], 201);
        } catch (\Exception $e) {
            return $this->jsonResponse($response, ['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Update a transaction
     */
    public function update(Request $request, Response $response, array $args): Response
    {
        $id = (int) $args['id'];
        $data = json_decode((string) $request->getBody(), true);

        // Create backup before making changes
        $backupResult = $this->backup->createBackup();
        if (!$backupResult['success']) {
            error_log('Backup warning: ' . $backupResult['message']);
        }

        // Validate required fields
        $required = ['user_id', 'amount', 'category', 'transaction_date', 'type'];
        foreach ($required as $field) {
            if (!isset($data[$field])) {
                return $this->jsonResponse($response, ['error' => "Field '{$field}' is required"], 400);
            }
        }

        // Validate type
        if (!in_array($data['type'], ['income', 'expense'])) {
            return $this->jsonResponse($response, ['error' => 'Type must be either income or expense'], 400);
        }

        // Validate amount
        if (!is_numeric($data['amount']) || $data['amount'] <= 0) {
            return $this->jsonResponse($response, ['error' => 'Amount must be a positive number'], 400);
        }

        try {
            $transaction = $this->transactionModel->update($id, $data['user_id'], $data);
            
            if (!$transaction) {
                return $this->jsonResponse($response, ['error' => 'Transaction not found'], 404);
            }

            return $this->jsonResponse($response, ['data' => $transaction]);
        } catch (\Exception $e) {
            return $this->jsonResponse($response, ['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Delete a transaction
     */
    public function delete(Request $request, Response $response, array $args): Response
    {
        $id = (int) $args['id'];
        $queryParams = $request->getQueryParams();
        $userId = $queryParams['user_id'] ?? '';

        if (empty($userId)) {
            return $this->jsonResponse($response, ['error' => 'user_id is required'], 400);
        }

        // Create backup before making changes
        $backupResult = $this->backup->createBackup();
        if (!$backupResult['success']) {
            error_log('Backup warning: ' . $backupResult['message']);
        }

        try {
            $deleted = $this->transactionModel->delete($id, $userId);
            
            if (!$deleted) {
                return $this->jsonResponse($response, ['error' => 'Transaction not found'], 404);
            }

            return $this->jsonResponse($response, ['message' => 'Transaction deleted successfully']);
        } catch (\Exception $e) {
            return $this->jsonResponse($response, ['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Get transaction summary
     */
    public function summary(Request $request, Response $response): Response
    {
        $queryParams = $request->getQueryParams();
        $userId = $queryParams['user_id'] ?? '';

        if (empty($userId)) {
            return $this->jsonResponse($response, ['error' => 'user_id is required'], 400);
        }

        $filters = [
            'start_date' => $queryParams['start_date'] ?? null,
            'end_date' => $queryParams['end_date'] ?? null,
        ];

        try {
            $summary = $this->transactionModel->getSummary($userId, array_filter($filters));
            return $this->jsonResponse($response, ['data' => $summary]);
        } catch (\Exception $e) {
            return $this->jsonResponse($response, ['error' => $e->getMessage()], 500);
        }
    }

    /**
     * Helper method to return JSON response
     */
    private function jsonResponse(Response $response, array $data, int $status = 200): Response
    {
        $response->getBody()->write(json_encode($data));
        return $response
            ->withHeader('Content-Type', 'application/json')
            ->withStatus($status);
    }
}
