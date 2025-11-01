# Security Configuration

## Overview

This project includes `.htaccess` files to protect sensitive directories and files from unauthorized web access.

## Protected Directories

### 1. `/data/` - Production Database

**Location:** `data/.htaccess`

**Protection:**

- ✅ Blocks all direct web access
- ✅ Prevents directory browsing
- ✅ Denies access to all files (including `.sqlite` files)
- ✅ Blocks common database extensions

**Why:** This directory contains your production SQLite database and should NEVER be accessible via web browser.

### 2. `/backend/` - API Directory

**Location:** `backend/.htaccess`

**Protection:**

- ✅ Disables directory browsing
- ✅ Blocks database files (`.sqlite`, `.db`, etc.)
- ✅ Blocks hidden files (`.env`, `.git`, etc.)
- ✅ Blocks backup files (`.bak`, `.backup`, `.old`)
- ✅ Blocks config files (`.json`, `.md`, `.sh`)
- ✅ Allows only PHP API files to be accessed
- ✅ Sets security headers (X-Frame-Options, X-XSS-Protection, etc.)

**Why:** Only your PHP API endpoints should be accessible, not the internal files.

### 3. `/backend/database/` - Migration Scripts

**Location:** `backend/database/.htaccess`

**Protection:**

- ✅ Blocks all access to this directory
- ✅ Prevents browsing of migration scripts
- ✅ Denies access to all files

**Why:** Migration scripts and schema files should never be accessible via web.

### 4. `/backend/database/backups/` - Database Backups

**Location:** `backend/database/backups/.htaccess`

**Protection:**

- ✅ Blocks all access to backup files
- ✅ Prevents downloading of database backups

**Why:** Database backups contain sensitive data and should never be publicly accessible.

## File Types Blocked

Across all directories, the following file types are blocked:

- **Database:** `.sqlite`, `.sqlite3`, `.db`, `.db3`, `.sql`
- **Backups:** `.bak`, `.backup`, `.old`, `.tmp`, `.temp`
- **Config:** `.env`, `.json`, `.md`, `.sh`, `.lock`
- **Editor:** `.swp`, `~`, `.gitignore`
- **Hidden:** Any file starting with `.`

## Security Headers

The backend `.htaccess` sets these security headers:

```apache
X-Content-Type-Options: nosniff
X-Frame-Options: SAMEORIGIN
X-XSS-Protection: 1; mode=block
```

These help prevent:

- MIME type sniffing attacks
- Clickjacking attacks
- Cross-site scripting (XSS) attacks

## Testing Security

### Test 1: Database Access (Should Fail)

Try accessing your database directly:

```
https://xpens.lee-norman.com/data/database.sqlite
```

**Expected:** 403 Forbidden error

### Test 2: Directory Browsing (Should Fail)

Try browsing directories:

```
https://xpens.lee-norman.com/backend/database/
```

**Expected:** 403 Forbidden error

### Test 3: Hidden Files (Should Fail)

Try accessing hidden files:

```
https://xpens.lee-norman.com/backend/.env
```

**Expected:** 403 Forbidden error

### Test 4: API Access (Should Work)

Your API endpoints should still work:

```
https://xpens.lee-norman.com/backend/users.php
https://xpens.lee-norman.com/backend/transactions.php
https://xpens.lee-norman.com/backend/categories.php
```

**Expected:** Normal API response (or auth error if not logged in)

## Deployment Checklist

When deploying, ensure these `.htaccess` files are uploaded:

- [ ] `data/.htaccess`
- [ ] `backend/.htaccess`
- [ ] `backend/database/.htaccess`
- [ ] `backend/database/backups/.htaccess`

## Apache Configuration

These `.htaccess` files require Apache with `mod_authz_core` (Apache 2.4+) or `mod_access` (Apache 2.2).

Make sure `.htaccess` files are enabled in your Apache config:

```apache
<Directory /var/www/xpens.lee-norman.com>
    AllowOverride All
</Directory>
```

## Nginx Alternative

If you're using Nginx instead of Apache, add these rules to your server block:

```nginx
# Block access to data directory
location /data/ {
    deny all;
    return 403;
}

# Block access to database files
location ~ \.(sqlite|sqlite3|db|db3|sql)$ {
    deny all;
    return 403;
}

# Block access to hidden files
location ~ /\. {
    deny all;
    return 403;
}

# Block access to backend database directory
location /backend/database/ {
    deny all;
    return 403;
}

# Allow only PHP files in backend
location /backend/ {
    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
        include snippets/fastcgi-php.conf;
    }
    location ~ \.(bak|backup|old|json|md|sh)$ {
        deny all;
        return 403;
    }
}
```

## Additional Security Recommendations

### 1. File Permissions

```bash
# On your server
chmod 755 data/
chmod 644 data/database.sqlite
chmod 755 backend/
chmod 644 backend/.htaccess
chmod 644 data/.htaccess
```

### 2. Owner/Group

```bash
# On your server (adjust for your setup)
chown -R www-data:www-data data/
chown -R www-data:www-data backend/
```

### 3. SSL/TLS

Always use HTTPS to encrypt data in transit:

- Obtain SSL certificate (Let's Encrypt is free)
- Force HTTPS redirects
- Enable HSTS headers

### 4. Database Encryption

Consider encrypting your SQLite database at rest:

```bash
# Using SQLCipher
sqlite3 database.sqlite
PRAGMA key = 'your-encryption-key';
```

### 5. Regular Backups

Run automated backups regularly:

```bash
# Add to crontab
0 2 * * * php /var/www/xpens.lee-norman.com/backend/database/backup_database.php
```

### 6. Monitor Access Logs

Regularly check for suspicious access attempts:

```bash
grep "403" /var/log/apache2/access.log | grep -E "(\.sqlite|\.db|/data/)"
```

## Troubleshooting

### Issue: 500 Internal Server Error

**Cause:** Apache doesn't support `.htaccess` or `AllowOverride` is disabled

**Fix:**

```apache
# In your Apache config
<Directory /var/www/xpens.lee-norman.com>
    AllowOverride All
</Directory>
```

### Issue: API endpoints return 403

**Cause:** `.htaccess` rules are too restrictive

**Fix:** Check that `backend/.htaccess` allows PHP files:

```apache
<FilesMatch "\.php$">
    Require all granted
</FilesMatch>
```

### Issue: Database still accessible

**Cause:** `.htaccess` file not uploaded or not working

**Fix:**

1. Verify file exists: `ls -la data/.htaccess`
2. Check Apache config allows `.htaccess`
3. Test: `curl -I https://xpens.lee-norman.com/data/database.sqlite`

## Security Audit

Run this security audit after deployment:

```bash
# Test database access
curl -I https://xpens.lee-norman.com/data/database.sqlite
# Expected: 403 Forbidden

# Test directory browsing
curl -I https://xpens.lee-norman.com/backend/database/
# Expected: 403 Forbidden

# Test hidden files
curl -I https://xpens.lee-norman.com/backend/.env
# Expected: 403 Forbidden

# Test API access
curl -I https://xpens.lee-norman.com/backend/users.php
# Expected: 200 OK or 401 Unauthorized (not 403)
```

## Incident Response

If you detect unauthorized access attempts:

1. **Review logs immediately**
2. **Change database location** if compromised
3. **Update passwords** for all users
4. **Review and tighten security rules**
5. **Monitor for data exfiltration**
6. **Notify users** if data was accessed

---

**Last Updated:** November 2, 2025  
**Status:** ✅ Security files deployed  
**Maintainer:** Review quarterly or after any security incident
