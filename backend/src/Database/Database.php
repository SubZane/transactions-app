<?php

namespace TransactionsApp\Database;

use PDO;
use PDOException;

class Database
{
    private static ?PDO $connection = null;
    private static string $dbPath;

    /**
     * Initialize the database connection
     *
     * @param string $dbPath Path to the SQLite database file
     * @return PDO
     */
    public static function getConnection(string $dbPath = null): PDO
    {
        if ($dbPath !== null) {
            self::$dbPath = $dbPath;
        }

        if (self::$connection === null) {
            if (!isset(self::$dbPath)) {
                self::$dbPath = __DIR__ . '/../../database.sqlite';
            }

            try {
                self::$connection = new PDO('sqlite:' . self::$dbPath);
                self::$connection->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
                self::$connection->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
                
                // Enable foreign key constraints
                self::$connection->exec('PRAGMA foreign_keys = ON;');
            } catch (PDOException $e) {
                throw new \RuntimeException("Database connection failed: " . $e->getMessage());
            }
        }

        return self::$connection;
    }

    /**
     * Initialize the database schema
     *
     * @param string $schemaPath Path to the schema SQL file
     * @return bool
     */
    public static function initSchema(string $schemaPath = null): bool
    {
        if ($schemaPath === null) {
            $schemaPath = __DIR__ . '/schema.sql';
        }

        if (!file_exists($schemaPath)) {
            throw new \RuntimeException("Schema file not found: {$schemaPath}");
        }

        try {
            $sql = file_get_contents($schemaPath);
            $pdo = self::getConnection();
            $pdo->exec($sql);
            return true;
        } catch (PDOException $e) {
            throw new \RuntimeException("Failed to initialize schema: " . $e->getMessage());
        }
    }

    /**
     * Close the database connection
     */
    public static function closeConnection(): void
    {
        self::$connection = null;
    }

    /**
     * Get the current schema version
     *
     * @return int
     */
    public static function getSchemaVersion(): int
    {
        try {
            $pdo = self::getConnection();
            $stmt = $pdo->query('SELECT MAX(version) as version FROM schema_version');
            $result = $stmt->fetch();
            return (int) ($result['version'] ?? 0);
        } catch (PDOException $e) {
            return 0;
        }
    }
}
