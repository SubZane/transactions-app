-- Migration: Add Elisabeth Lee-Norman and update transactions
-- Date: 2025-11-02
-- Description: Add new user Elisabeth and assign non-Andreas transactions to her

-- =============================================================================
-- STEP 1: Add Elisabeth Lee-Norman
-- =============================================================================
INSERT OR IGNORE INTO users (id, user_id, email, firstname, surname, created_at, updated_at)
VALUES (
    3,
    'aa16f241-ec56-4724-9221-31c5646ddc7a',
    'elisabeth@lee-norman.com',
    'Elisabeth',
    'Lee-Norman',
    datetime('now'),
    datetime('now')
);

-- =============================================================================
-- STEP 2: Update transactions that aren't by Andreas
-- =============================================================================
-- First, let's identify Andreas by checking the users table
-- Assuming the user with email containing 'andreas' or id=1 is Andreas
-- We'll update all transactions from user_id=2 (Mary Watson / fake user) to user_id=3 (Elisabeth)

-- Update all transactions from the fake/second user to Elisabeth
UPDATE transactions
SET user_id = 3,
    updated_at = datetime('now')
WHERE user_id = 2;

-- =============================================================================
-- VERIFICATION QUERIES (uncomment to run)
-- =============================================================================
-- Check all users
-- SELECT * FROM users;

-- Check transaction counts by user
-- SELECT u.firstname, u.surname, COUNT(t.id) as transaction_count
-- FROM users u
-- LEFT JOIN transactions t ON u.id = t.user_id
-- GROUP BY u.id;

-- Check transactions by Elisabeth
-- SELECT * FROM transactions WHERE user_id = 3 ORDER BY transaction_date DESC LIMIT 10;
