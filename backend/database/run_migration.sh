#!/bin/bash

# Migration Runner Script
# Adds Elisabeth Lee-Norman and updates transactions

echo "=================================================="
echo "  Migration: Add Elisabeth Lee-Norman"
echo "=================================================="
echo ""
echo "This will:"
echo "  1. Add Elisabeth as a new user"
echo "  2. Update all non-Andreas transactions to Elisabeth"
echo ""
read -p "Continue? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Migration cancelled."
    exit 0
fi

echo ""
echo "Running migration..."
echo ""

# Run the PHP migration script
php migrate_add_elisabeth.php

echo ""
echo "Migration complete!"
echo ""
echo "You can verify the changes by checking:"
echo "  - Users table: SELECT * FROM users;"
echo "  - Transaction counts: SELECT u.firstname, COUNT(t.id) FROM users u LEFT JOIN transactions t ON u.id=t.user_id GROUP BY u.id;"
