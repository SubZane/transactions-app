-- Transactions App Database Schema
-- SQLite database for tracking income and expenses
-- Created: 2025-10-21

-- =============================================================================
-- USERS TABLE
-- =============================================================================
-- Stores user profile information linked to Supabase authentication
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT, -- Supabase auth user ID (UUID)
    email TEXT NOT NULL UNIQUE,
    firstname TEXT NOT NULL,
    surname TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Index for fast email lookups (used for authentication)
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Unique index for user_id lookups (primary lookup method)
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_user_id ON users(user_id);

-- =============================================================================
-- CATEGORIES TABLE
-- =============================================================================
-- Predefined categories for transactions (shared across all users)
CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    type TEXT NOT NULL CHECK(type IN ('deposit', 'expense')),
    description TEXT,
    icon TEXT, -- Icon name for UI (e.g., 'ShoppingCartIcon')
    color TEXT, -- Color for UI (e.g., 'primary', 'success', 'error')
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Index for filtering by transaction type
CREATE INDEX IF NOT EXISTS idx_categories_type ON categories(type);

-- =============================================================================
-- TRANSACTIONS TABLE
-- =============================================================================
-- Individual transaction records (user-owned)
-- Note: category_id is nullable to allow deposits without categories
-- Note: amount is INTEGER (Swedish kronor, minimum 1 kr, no decimals)
CREATE TABLE IF NOT EXISTS transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    category_id INTEGER NULL,
    type TEXT NOT NULL CHECK(type IN ('deposit', 'expense')),
    amount INTEGER NOT NULL CHECK(amount >= 1),
    description TEXT,
    transaction_date TEXT NOT NULL, -- ISO 8601 format: YYYY-MM-DD
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_category_id ON transactions(category_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(transaction_date);

-- Composite index for common query pattern (user's transactions by date)
CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON transactions(user_id, transaction_date);

-- =============================================================================
-- SCHEMA VERSION TABLE
-- =============================================================================
-- Tracks database migrations and schema changes
CREATE TABLE IF NOT EXISTS schema_version (
    version INTEGER PRIMARY KEY,
    applied_at TEXT NOT NULL DEFAULT (datetime('now')),
    description TEXT
);

-- =============================================================================
-- SEED DATA - CATEGORIES
-- =============================================================================
-- Predefined categories for expenses and deposits

-- Expense Categories
INSERT OR IGNORE INTO categories (id, name, type, description, icon, color) VALUES
(1, 'Groceries', 'expense', 'Food and household items', 'ShoppingCartIcon', 'primary'),
(2, 'Car', 'expense', 'Gas, maintenance, parking, tolls', 'DirectionsCarIcon', 'info'),
(3, 'Restaurants', 'expense', 'Dining out, cafes, takeout', 'BuildingStorefrontIcon', 'warning'),
(4, 'Entertainment', 'expense', 'Movies, games, hobbies', 'MusicalNoteIcon', 'secondary'),
(5, 'Healthcare', 'expense', 'Medical, dental, pharmacy', 'HeartIcon', 'error'),
(6, 'Utilities', 'expense', 'Electric, water, internet, phone', 'BoltIcon', 'accent'),
(7, 'Shopping', 'expense', 'Clothes, electronics, personal items', 'ShoppingBagIcon', 'primary'),
(8, 'Housing', 'expense', 'Rent, mortgage, home maintenance', 'HomeIcon', 'neutral'),
(9, 'Education', 'expense', 'Courses, books, tuition', 'AcademicCapIcon', 'info'),
(10, 'Other Expenses', 'expense', 'Miscellaneous expenses', 'EllipsisHorizontalCircleIcon', 'neutral');

-- Deposit Categories
INSERT OR IGNORE INTO categories (id, name, type, description, icon, color) VALUES
(11, 'Salary', 'deposit', 'Monthly salary or wages', 'BanknotesIcon', 'success'),
(12, 'Freelance', 'deposit', 'Freelance or contract work', 'BriefcaseIcon', 'success'),
(13, 'Investment', 'deposit', 'Dividends, interest, returns', 'ChartBarIcon', 'success'),
(14, 'Other Income', 'deposit', 'Miscellaneous income', 'PlusCircleIcon', 'success');

-- =============================================================================
-- INITIAL SCHEMA VERSION
-- =============================================================================
INSERT OR IGNORE INTO schema_version (version, description) VALUES
(1, 'Initial schema with users, categories, and transactions tables'),
(2, 'Added user_id column to users table for Supabase auth integration');
