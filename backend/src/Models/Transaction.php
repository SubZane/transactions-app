<?php

namespace TransactionsApp\Models;

use PDO;
use PDOException;

class Transaction
{
    private PDO $pdo;

    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
    }

    /**
     * Get all transactions for a user
     *
     * @param string $userId
     * @param array $filters Optional filters (type, category, start_date, end_date)
     * @return array
     */
    public function getAll(string $userId, array $filters = []): array
    {
        $sql = 'SELECT * FROM transactions WHERE user_id = :user_id';
        $params = ['user_id' => $userId];

        if (!empty($filters['type'])) {
            $sql .= ' AND type = :type';
            $params['type'] = $filters['type'];
        }

        if (!empty($filters['category'])) {
            $sql .= ' AND category = :category';
            $params['category'] = $filters['category'];
        }

        if (!empty($filters['start_date'])) {
            $sql .= ' AND transaction_date >= :start_date';
            $params['start_date'] = $filters['start_date'];
        }

        if (!empty($filters['end_date'])) {
            $sql .= ' AND transaction_date <= :end_date';
            $params['end_date'] = $filters['end_date'];
        }

        $sql .= ' ORDER BY transaction_date DESC, id DESC';

        try {
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute($params);
            return $stmt->fetchAll();
        } catch (PDOException $e) {
            throw new \RuntimeException('Failed to fetch transactions: ' . $e->getMessage());
        }
    }

    /**
     * Get a single transaction by ID
     *
     * @param int $id
     * @param string $userId
     * @return array|null
     */
    public function getById(int $id, string $userId): ?array
    {
        try {
            $stmt = $this->pdo->prepare(
                'SELECT * FROM transactions WHERE id = :id AND user_id = :user_id'
            );
            $stmt->execute(['id' => $id, 'user_id' => $userId]);
            $result = $stmt->fetch();
            return $result ?: null;
        } catch (PDOException $e) {
            throw new \RuntimeException('Failed to fetch transaction: ' . $e->getMessage());
        }
    }

    /**
     * Create a new transaction
     *
     * @param array $data
     * @return array
     */
    public function create(array $data): array
    {
        $sql = 'INSERT INTO transactions (user_id, amount, category, description, transaction_date, type) 
                VALUES (:user_id, :amount, :category, :description, :transaction_date, :type)';

        try {
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([
                'user_id' => $data['user_id'],
                'amount' => $data['amount'],
                'category' => $data['category'],
                'description' => $data['description'] ?? null,
                'transaction_date' => $data['transaction_date'],
                'type' => $data['type']
            ]);

            $id = (int) $this->pdo->lastInsertId();
            return $this->getById($id, $data['user_id']);
        } catch (PDOException $e) {
            throw new \RuntimeException('Failed to create transaction: ' . $e->getMessage());
        }
    }

    /**
     * Update a transaction
     *
     * @param int $id
     * @param string $userId
     * @param array $data
     * @return array|null
     */
    public function update(int $id, string $userId, array $data): ?array
    {
        // Check if transaction exists and belongs to user
        $existing = $this->getById($id, $userId);
        if (!$existing) {
            return null;
        }

        $sql = 'UPDATE transactions SET 
                amount = :amount,
                category = :category,
                description = :description,
                transaction_date = :transaction_date,
                type = :type,
                updated_at = datetime(\'now\')
                WHERE id = :id AND user_id = :user_id';

        try {
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([
                'id' => $id,
                'user_id' => $userId,
                'amount' => $data['amount'],
                'category' => $data['category'],
                'description' => $data['description'] ?? null,
                'transaction_date' => $data['transaction_date'],
                'type' => $data['type']
            ]);

            return $this->getById($id, $userId);
        } catch (PDOException $e) {
            throw new \RuntimeException('Failed to update transaction: ' . $e->getMessage());
        }
    }

    /**
     * Delete a transaction
     *
     * @param int $id
     * @param string $userId
     * @return bool
     */
    public function delete(int $id, string $userId): bool
    {
        try {
            $stmt = $this->pdo->prepare(
                'DELETE FROM transactions WHERE id = :id AND user_id = :user_id'
            );
            $stmt->execute(['id' => $id, 'user_id' => $userId]);
            return $stmt->rowCount() > 0;
        } catch (PDOException $e) {
            throw new \RuntimeException('Failed to delete transaction: ' . $e->getMessage());
        }
    }

    /**
     * Get transaction summary statistics
     *
     * @param string $userId
     * @param array $filters Optional filters (start_date, end_date)
     * @return array
     */
    public function getSummary(string $userId, array $filters = []): array
    {
        $sql = 'SELECT 
                    type,
                    COUNT(*) as count,
                    SUM(amount) as total,
                    AVG(amount) as average
                FROM transactions 
                WHERE user_id = :user_id';
        
        $params = ['user_id' => $userId];

        if (!empty($filters['start_date'])) {
            $sql .= ' AND transaction_date >= :start_date';
            $params['start_date'] = $filters['start_date'];
        }

        if (!empty($filters['end_date'])) {
            $sql .= ' AND transaction_date <= :end_date';
            $params['end_date'] = $filters['end_date'];
        }

        $sql .= ' GROUP BY type';

        try {
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute($params);
            return $stmt->fetchAll();
        } catch (PDOException $e) {
            throw new \RuntimeException('Failed to fetch summary: ' . $e->getMessage());
        }
    }
}
