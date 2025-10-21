<?php

namespace TransactionsApp\Models;

use PDO;
use PDOException;

class Category
{
    private PDO $pdo;

    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
    }

    /**
     * Get all categories
     *
     * @param string|null $type Filter by type (income/expense)
     * @return array
     */
    public function getAll(?string $type = null): array
    {
        $sql = 'SELECT * FROM categories';
        $params = [];

        if ($type !== null) {
            $sql .= ' WHERE type = :type';
            $params['type'] = $type;
        }

        $sql .= ' ORDER BY name ASC';

        try {
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute($params);
            return $stmt->fetchAll();
        } catch (PDOException $e) {
            throw new \RuntimeException('Failed to fetch categories: ' . $e->getMessage());
        }
    }

    /**
     * Get a single category by ID
     *
     * @param int $id
     * @return array|null
     */
    public function getById(int $id): ?array
    {
        try {
            $stmt = $this->pdo->prepare('SELECT * FROM categories WHERE id = :id');
            $stmt->execute(['id' => $id]);
            $result = $stmt->fetch();
            return $result ?: null;
        } catch (PDOException $e) {
            throw new \RuntimeException('Failed to fetch category: ' . $e->getMessage());
        }
    }

    /**
     * Create a new category
     *
     * @param array $data
     * @return array
     */
    public function create(array $data): array
    {
        $sql = 'INSERT INTO categories (name, type) VALUES (:name, :type)';

        try {
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([
                'name' => $data['name'],
                'type' => $data['type']
            ]);

            $id = (int) $this->pdo->lastInsertId();
            return $this->getById($id);
        } catch (PDOException $e) {
            throw new \RuntimeException('Failed to create category: ' . $e->getMessage());
        }
    }
}
