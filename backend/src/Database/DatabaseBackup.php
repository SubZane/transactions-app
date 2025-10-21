<?php

namespace TransactionsApp\Database;

use ZipArchive;

class DatabaseBackup
{
    private string $dbPath;
    private string $backupDir;

    public function __construct(string $dbPath, string $backupDir)
    {
        $this->dbPath = $dbPath;
        $this->backupDir = $backupDir;

        if (!is_dir($this->backupDir)) {
            mkdir($this->backupDir, 0755, true);
        }
    }

    /**
     * Create a backup of the database with date in filename and zip it
     *
     * @return array{success: bool, message: string, backup_file?: string}
     */
    public function createBackup(): array
    {
        if (!file_exists($this->dbPath)) {
            return [
                'success' => false,
                'message' => 'Database file not found: ' . $this->dbPath
            ];
        }

        // Generate backup filename with date
        $date = date('Y-m-d_H-i-s');
        $backupFileName = 'database_backup_' . $date . '.sqlite';
        $backupFilePath = $this->backupDir . '/' . $backupFileName;
        $zipFileName = 'database_backup_' . $date . '.zip';
        $zipFilePath = $this->backupDir . '/' . $zipFileName;

        try {
            // Copy the database file
            if (!copy($this->dbPath, $backupFilePath)) {
                return [
                    'success' => false,
                    'message' => 'Failed to copy database file'
                ];
            }

            // Create zip archive
            $zip = new ZipArchive();
            if ($zip->open($zipFilePath, ZipArchive::CREATE) !== true) {
                // Clean up the unzipped backup
                unlink($backupFilePath);
                return [
                    'success' => false,
                    'message' => 'Failed to create zip archive'
                ];
            }

            // Add the database file to the zip
            $zip->addFile($backupFilePath, $backupFileName);
            $zip->close();

            // Remove the unzipped backup file
            unlink($backupFilePath);

            return [
                'success' => true,
                'message' => 'Backup created successfully',
                'backup_file' => $zipFilePath
            ];
        } catch (\Exception $e) {
            // Clean up any partial files
            if (file_exists($backupFilePath)) {
                unlink($backupFilePath);
            }
            if (file_exists($zipFilePath)) {
                unlink($zipFilePath);
            }

            return [
                'success' => false,
                'message' => 'Backup failed: ' . $e->getMessage()
            ];
        }
    }

    /**
     * List all available backups
     *
     * @return array
     */
    public function listBackups(): array
    {
        $backups = [];
        $files = glob($this->backupDir . '/database_backup_*.zip');

        foreach ($files as $file) {
            $backups[] = [
                'filename' => basename($file),
                'path' => $file,
                'size' => filesize($file),
                'created_at' => date('Y-m-d H:i:s', filemtime($file))
            ];
        }

        // Sort by creation time (newest first)
        usort($backups, function ($a, $b) {
            return $b['created_at'] <=> $a['created_at'];
        });

        return $backups;
    }

    /**
     * Delete old backups, keeping only the specified number of recent backups
     *
     * @param int $keepCount Number of recent backups to keep
     * @return int Number of deleted backups
     */
    public function cleanOldBackups(int $keepCount = 10): int
    {
        $backups = $this->listBackups();
        $deleteCount = 0;

        if (count($backups) > $keepCount) {
            $toDelete = array_slice($backups, $keepCount);
            foreach ($toDelete as $backup) {
                if (file_exists($backup['path']) && unlink($backup['path'])) {
                    $deleteCount++;
                }
            }
        }

        return $deleteCount;
    }
}
