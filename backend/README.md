# Transactions App - Backend API

A RESTful API built with PHP, Slim Framework, and SQLite for managing financial transactions.

## 🚀 Features

- RESTful API with CRUD operations for transactions
- SQLite database with automatic schema initialization
- Automatic database backups with date-stamped zip files
- Transaction categorization
- Transaction summary and statistics
- CORS support for frontend integration
- Input validation and error handling

## 📋 Prerequisites

- PHP 8.1 or higher
- Composer
- SQLite3
- Apache or Nginx (optional, for production)

## 🛠️ Setup Instructions

### 1. Install Dependencies

```bash
cd backend
composer install
```

### 2. Initialize Database

The database will be automatically created and initialized when you first run the application. The schema includes:
- Transactions table
- Categories table
- Schema version tracking

### 3. Start Development Server

Using PHP built-in server:

```bash
cd backend/public
php -S localhost:8000
```

The API will be available at `http://localhost:8000`

### 4. Test the API

```bash
curl http://localhost:8000/
```

Expected response:
```json
{
    "status": "ok",
    "message": "Transactions API is running",
    "version": "1.0.0"
}
```

## 📁 Directory Structure

```
backend/
├── public/              # Public web root
│   ├── index.php        # Application entry point
│   └── .htaccess        # Apache rewrite rules
├── src/
│   ├── Controllers/     # API endpoint controllers
│   │   ├── TransactionController.php
│   │   └── CategoryController.php
│   ├── Models/          # Data models
│   │   ├── Transaction.php
│   │   └── Category.php
│   ├── Middleware/      # HTTP middleware
│   │   └── CorsMiddleware.php
│   └── Database/        # Database utilities
│       ├── Database.php
│       ├── DatabaseBackup.php
│       └── schema.sql
├── config/              # Configuration files
│   └── config.php
├── backups/             # Database backups (auto-created)
├── docs/                # Documentation
│   └── PHP_SQLITE_BEST_PRACTICES.md
├── vendor/              # Composer dependencies
├── composer.json
└── database.sqlite      # SQLite database (auto-created)
```

## 🌐 API Endpoints

### Health Check

```
GET /
```

### Transactions

```
GET    /api/transactions              # List all transactions
GET    /api/transactions/{id}         # Get single transaction
POST   /api/transactions              # Create transaction
PUT    /api/transactions/{id}         # Update transaction
DELETE /api/transactions/{id}         # Delete transaction
GET    /api/transactions/summary/stats # Get transaction summary
```

### Categories

```
GET    /api/categories                # List all categories
GET    /api/categories/{id}           # Get single category
POST   /api/categories                # Create category
```

### Backups

```
POST   /api/backup                    # Create database backup
GET    /api/backups                   # List all backups
```

## 📝 API Usage Examples

### Create a Transaction

```bash
curl -X POST http://localhost:8000/api/transactions \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user123",
    "amount": 50.00,
    "category": "Groceries",
    "description": "Weekly shopping",
    "transaction_date": "2024-01-15 14:30:00",
    "type": "expense"
  }'
```

Response:
```json
{
  "data": {
    "id": 1,
    "user_id": "user123",
    "amount": 50.00,
    "category": "Groceries",
    "description": "Weekly shopping",
    "transaction_date": "2024-01-15 14:30:00",
    "type": "expense",
    "created_at": "2024-01-15 14:30:00",
    "updated_at": "2024-01-15 14:30:00"
  }
}
```

### Get All Transactions

```bash
curl http://localhost:8000/api/transactions?user_id=user123
```

With filters:
```bash
curl "http://localhost:8000/api/transactions?user_id=user123&type=expense&category=Groceries&start_date=2024-01-01"
```

### Update a Transaction

```bash
curl -X PUT http://localhost:8000/api/transactions/1 \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user123",
    "amount": 75.00,
    "category": "Groceries",
    "description": "Updated shopping",
    "transaction_date": "2024-01-15 14:30:00",
    "type": "expense"
  }'
```

### Delete a Transaction

```bash
curl -X DELETE "http://localhost:8000/api/transactions/1?user_id=user123"
```

### Get Transaction Summary

```bash
curl "http://localhost:8000/api/transactions/summary/stats?user_id=user123"
```

Response:
```json
{
  "data": [
    {
      "type": "income",
      "count": 5,
      "total": 2500.00,
      "average": 500.00
    },
    {
      "type": "expense",
      "count": 10,
      "total": 1200.50,
      "average": 120.05
    }
  ]
}
```

### Get Categories

```bash
curl http://localhost:8000/api/categories
```

Filter by type:
```bash
curl http://localhost:8000/api/categories?type=expense
```

### Create Database Backup

```bash
curl -X POST http://localhost:8000/api/backup
```

Response:
```json
{
  "success": true,
  "message": "Backup created successfully",
  "backup_file": "/path/to/backups/database_backup_2024-01-15_14-30-45.zip"
}
```

## 🔒 Database Backups

### Automatic Backups

The system automatically creates a backup before any data-modifying operation (CREATE, UPDATE, DELETE). Backups are:
- Named with timestamp: `database_backup_YYYY-MM-DD_HH-MM-SS.zip`
- Stored in the `backups/` directory
- Compressed as ZIP files
- Limited to 10 most recent backups (configurable)

### Manual Backups

You can also create backups manually via the API:

```bash
curl -X POST http://localhost:8000/api/backup
```

### List Backups

```bash
curl http://localhost:8000/api/backups
```

### Restore from Backup

1. Stop the API server
2. Unzip the backup file
3. Replace `database.sqlite` with the backup
4. Restart the API server

```bash
# Example restoration
cd backend
unzip backups/database_backup_2024-01-15_14-30-45.zip
mv database_backup_2024-01-15_14-30-45.sqlite database.sqlite
```

## 🔧 Configuration

Edit `config/config.php` to customize:

```php
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
```

## 📚 Best Practices

See [PHP_SQLITE_BEST_PRACTICES.md](docs/PHP_SQLITE_BEST_PRACTICES.md) for comprehensive guidelines on:

- Database management and backups
- PHP coding standards
- SQLite optimization
- API development patterns
- Security practices
- Error handling
- Testing strategies

## 🚦 Development Guidelines

### Before Making Changes

1. Create a database backup
2. Review the current schema
3. Plan your changes

### Making Changes

1. Update `schema.sql` if database changes are needed
2. Increment schema version
3. Test changes locally
4. Verify backups are working

### Schema Updates

When updating the database schema:

1. Update `src/Database/schema.sql`
2. Add a new schema version entry:

```sql
INSERT INTO schema_version (version, description) 
VALUES (2, 'Description of changes');
```

## 🐛 Troubleshooting

### Database Connection Issues

- Check file permissions on `database.sqlite`
- Ensure SQLite extension is enabled in PHP
- Verify the database path in configuration

### Backup Failures

- Check write permissions on `backups/` directory
- Ensure sufficient disk space
- Verify ZIP extension is enabled in PHP

### CORS Errors

- Update CORS settings in `src/Middleware/CorsMiddleware.php`
- For production, specify allowed origins instead of `*`

## 🧪 Testing

### Manual Testing

Use tools like curl, Postman, or HTTPie to test endpoints:

```bash
# Test health check
curl http://localhost:8000/

# Create a test transaction
curl -X POST http://localhost:8000/api/transactions \
  -H "Content-Type: application/json" \
  -d '{"user_id":"test","amount":100,"category":"Test","transaction_date":"2024-01-15 12:00:00","type":"income"}'
```

### Automated Testing

PHPUnit is included for unit testing:

```bash
composer test
```

## 🔐 Security Considerations

1. **SQL Injection Prevention**: All queries use prepared statements
2. **Input Validation**: All inputs are validated before processing
3. **Error Handling**: Internal errors are logged, generic messages returned to users
4. **CORS**: Configure appropriately for production
5. **Environment Variables**: Use for sensitive configuration

## 📦 Production Deployment

### Apache Configuration

Create a virtual host:

```apache
<VirtualHost *:80>
    ServerName api.yourdomain.com
    DocumentRoot /path/to/backend/public
    
    <Directory /path/to/backend/public>
        AllowOverride All
        Require all granted
    </Directory>
    
    ErrorLog ${APACHE_LOG_DIR}/api-error.log
    CustomLog ${APACHE_LOG_DIR}/api-access.log combined
</VirtualHost>
```

### Nginx Configuration

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;
    root /path/to/backend/public;
    index index.php;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;
    }
}
```

### Production Checklist

- [ ] Update CORS settings to allow only specific origins
- [ ] Set up regular backup schedule
- [ ] Configure error logging
- [ ] Set appropriate file permissions
- [ ] Enable HTTPS
- [ ] Set up monitoring and alerting
- [ ] Configure rate limiting

## 📄 License

MIT

## 🤝 Contributing

1. Follow the coding standards in `docs/PHP_SQLITE_BEST_PRACTICES.md`
2. Test your changes thoroughly
3. Update documentation as needed
4. Create database backups before testing destructive operations
