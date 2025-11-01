# Security Quick Reference

## ✅ Security Files Checklist

After deployment, verify these files exist on your server:

```bash
# Check all .htaccess files are present
ls -la data/.htaccess
ls -la backend/.htaccess
ls -la backend/database/.htaccess
ls -la backend/database/backups/.htaccess
```

## 🔒 Security Test Commands

Run these tests after deploying to verify security:

### Test 1: Database Access (Should Return 403)

```bash
curl -I https://xpens.lee-norman.com/data/database.sqlite
```

**Expected:** `HTTP/1.1 403 Forbidden`

### Test 2: Directory Browsing (Should Return 403)

```bash
curl -I https://xpens.lee-norman.com/backend/database/
```

**Expected:** `HTTP/1.1 403 Forbidden`

### Test 3: Hidden Files (Should Return 403)

```bash
curl -I https://xpens.lee-norman.com/backend/.env
```

**Expected:** `HTTP/1.1 403 Forbidden`

### Test 4: Backup Files (Should Return 403)

```bash
curl -I https://xpens.lee-norman.com/backend/database/backups/
```

**Expected:** `HTTP/1.1 403 Forbidden`

### Test 5: Migration Scripts (Should Return 403)

```bash
curl -I https://xpens.lee-norman.com/backend/database/schema.sql
```

**Expected:** `HTTP/1.1 403 Forbidden`

### Test 6: API Endpoints (Should Work)

```bash
curl -I https://xpens.lee-norman.com/backend/users.php
curl -I https://xpens.lee-norman.com/backend/transactions.php
curl -I https://xpens.lee-norman.com/backend/categories.php
```

**Expected:** `HTTP/1.1 200 OK` or `HTTP/1.1 401 Unauthorized` (NOT 403)

## 🚨 If Tests Fail

### 403 on API endpoints

**Problem:** `.htaccess` is blocking PHP files
**Fix:** Check `backend/.htaccess` has:

```apache
<FilesMatch "\.php$">
    Require all granted
</FilesMatch>
```

### Database accessible (NOT 403)

**Problem:** `.htaccess` not working or missing
**Fix:**

1. Upload `data/.htaccess` to server
2. Verify Apache allows `.htaccess`:
   ```apache
   AllowOverride All
   ```
3. Check file permissions:
   ```bash
   chmod 644 data/.htaccess
   ```

### 500 Internal Server Error

**Problem:** Apache configuration issue
**Fix:** Check error logs:

```bash
tail -f /var/log/apache2/error.log
```

## 📋 Quick Deploy Command

```bash
# Deploy with security files included
rsync -avz --delete \
  --include='backend/' \
  --include='backend/.htaccess' \
  --include='backend/database/' \
  --include='backend/database/.htaccess' \
  --include='backend/database/backups/' \
  --include='backend/database/backups/.htaccess' \
  --include='dist/' \
  --exclude='data/database.sqlite' \
  ./ user@server:/var/www/xpens.lee-norman.com/
```

## 🔐 File Permissions

```bash
# On server after deployment
chmod 755 data/
chmod 644 data/.htaccess
chmod 644 data/database.sqlite
chmod 755 backend/
chmod 644 backend/.htaccess
chmod 755 backend/database/
chmod 644 backend/database/.htaccess
```

## 📊 Security Headers Check

```bash
# Check security headers are set
curl -I https://xpens.lee-norman.com/backend/users.php | grep -E "(X-Frame|X-XSS|X-Content)"
```

**Expected:**

```
X-Content-Type-Options: nosniff
X-Frame-Options: SAMEORIGIN
X-XSS-Protection: 1; mode=block
```

## 🎯 One-Command Security Audit

```bash
#!/bin/bash
echo "=== Security Audit ==="
echo ""
echo "1. Database access:"
curl -Is https://xpens.lee-norman.com/data/database.sqlite | head -1
echo ""
echo "2. Database directory:"
curl -Is https://xpens.lee-norman.com/backend/database/ | head -1
echo ""
echo "3. Backup directory:"
curl -Is https://xpens.lee-norman.com/backend/database/backups/ | head -1
echo ""
echo "4. Schema file:"
curl -Is https://xpens.lee-norman.com/backend/database/schema.sql | head -1
echo ""
echo "5. API endpoint:"
curl -Is https://xpens.lee-norman.com/backend/users.php | head -1
echo ""
echo "Expected: First 4 should be 403, last one should be 200 or 401"
```

Save as `security-audit.sh`, make executable, and run:

```bash
chmod +x security-audit.sh
./security-audit.sh
```

---

**Quick Tip:** Bookmark this file for quick reference during deployments!
