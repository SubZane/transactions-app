<?php

return [
    'database' => [
        'path' => __DIR__ . '/../database.sqlite',
    ],
    'backup' => [
        'directory' => __DIR__ . '/../backups',
        'keep_count' => 10, // Number of backups to keep
    ],
    'api' => [
        'version' => '1.0.0',
        'prefix' => '/api',
    ],
];
