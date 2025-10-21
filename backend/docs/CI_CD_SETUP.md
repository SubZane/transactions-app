# CI/CD Workflow Example for Backend

This is a suggested GitHub Actions workflow for the PHP backend. 
To activate, move this file to `.github/workflows/backend-ci.yml`

## Workflow File

```yaml
name: Backend CI

on:
  push:
    branches: [ main, develop ]
    paths:
      - 'backend/**'
  pull_request:
    branches: [ main, develop ]
    paths:
      - 'backend/**'

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup PHP
      uses: shivammathur/setup-php@v2
      with:
        php-version: '8.1'
        extensions: pdo, pdo_sqlite, zip
        coverage: xdebug
    
    - name: Validate composer.json
      working-directory: backend
      run: composer validate --strict
    
    - name: Cache Composer packages
      uses: actions/cache@v3
      with:
        path: backend/vendor
        key: ${{ runner.os }}-php-${{ hashFiles('backend/composer.lock') }}
        restore-keys: |
          ${{ runner.os }}-php-
    
    - name: Install dependencies
      working-directory: backend
      run: composer install --prefer-dist --no-progress
    
    - name: Check PHP syntax
      working-directory: backend
      run: find src -name "*.php" -exec php -l {} \;
    
    - name: Run PHPUnit tests
      working-directory: backend
      run: composer test
    
    - name: Initialize test database
      working-directory: backend
      run: php init-db.php
    
    - name: Test backup functionality
      working-directory: backend
      run: php demo-backup.php

  lint:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup PHP
      uses: shivammathur/setup-php@v2
      with:
        php-version: '8.1'
        tools: phpcs
    
    - name: Run PHP_CodeSniffer
      working-directory: backend
      run: phpcs --standard=PSR12 src/ || true
```

## Manual Testing Commands

Before pushing, test locally:

```bash
# Check PHP syntax
cd backend
find src -name "*.php" -exec php -l {} \;

# Run tests (when implemented)
composer test

# Initialize database
php init-db.php

# Test backup
php demo-backup.php
```

## Deployment Workflow Example

```yaml
name: Deploy Backend

on:
  push:
    branches: [ production ]
    paths:
      - 'backend/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup PHP
      uses: shivammathur/setup-php@v2
      with:
        php-version: '8.1'
    
    - name: Install dependencies
      working-directory: backend
      run: composer install --prefer-dist --no-dev --optimize-autoloader
    
    - name: Create backup on server
      run: |
        ssh user@server 'curl -X POST http://localhost:8000/api/backup'
    
    - name: Deploy via rsync
      run: |
        rsync -avz --exclude 'database.sqlite' \
                   --exclude 'backups/' \
                   --exclude '.git' \
                   backend/ user@server:/path/to/backend/
    
    - name: Clear PHP opcache
      run: |
        ssh user@server 'sudo systemctl reload php8.1-fpm'
```

## Docker Setup Example

### Dockerfile
```dockerfile
FROM php:8.1-apache

# Install extensions
RUN apt-get update && apt-get install -y \
    sqlite3 \
    libsqlite3-dev \
    zip \
    unzip \
    && docker-php-ext-install pdo pdo_sqlite

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Copy application
COPY backend /var/www/html
WORKDIR /var/www/html

# Install dependencies
RUN composer install --no-dev --optimize-autoloader

# Set permissions
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html

# Enable mod_rewrite
RUN a2enmod rewrite

# Expose port
EXPOSE 80

# Set document root
ENV APACHE_DOCUMENT_ROOT=/var/www/html/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf
RUN sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf
```

### docker-compose.yml
```yaml
version: '3.8'

services:
  backend:
    build: .
    ports:
      - "8000:80"
    volumes:
      - ./backend:/var/www/html
      - backend-db:/var/www/html/database.sqlite
      - backend-backups:/var/www/html/backups
    environment:
      - PHP_OPCACHE_ENABLE=1
      - PHP_OPCACHE_MEMORY_CONSUMPTION=128

volumes:
  backend-db:
  backend-backups:
```

### Usage
```bash
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f backend

# Access container
docker-compose exec backend bash

# Initialize database
docker-compose exec backend php init-db.php

# Stop
docker-compose down
```

## Environment-Specific Configuration

### Development
```php
// config/config.dev.php
return [
    'database' => [
        'path' => __DIR__ . '/../database.sqlite',
    ],
    'backup' => [
        'directory' => __DIR__ . '/../backups',
        'keep_count' => 5,
    ],
    'debug' => true,
    'cors' => [
        'origin' => '*', // Allow all origins in dev
    ],
];
```

### Production
```php
// config/config.prod.php
return [
    'database' => [
        'path' => '/var/data/transactions/database.sqlite',
    ],
    'backup' => [
        'directory' => '/var/backups/transactions',
        'keep_count' => 30,
    ],
    'debug' => false,
    'cors' => [
        'origin' => 'https://yourdomain.com',
    ],
];
```

## Monitoring Setup

### Health Check Endpoint
The API includes a health check at `/` that can be monitored:

```bash
# Simple uptime monitoring
*/5 * * * * curl -f http://localhost:8000/ || echo "API is down" | mail -s "Alert" admin@example.com

# Advanced monitoring with response time
curl -w "@curl-format.txt" -o /dev/null -s http://localhost:8000/
```

### Database Monitoring
```bash
# Check database size
du -h backend/database.sqlite

# Check backup count
ls -1 backend/backups/*.zip | wc -l

# Monitor backup age
find backend/backups -name "*.zip" -mtime +1 -ls
```

## Notes

- Adjust paths and configurations based on your deployment environment
- Ensure proper permissions for database and backup directories
- Set up automated backup rotation
- Monitor disk space for database and backups
- Consider setting up database replication for high availability
