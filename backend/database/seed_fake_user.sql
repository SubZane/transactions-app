-- Add a fake second user and sample transactions for testing
-- This creates realistic data to demonstrate the two-user balance feature

-- Insert fake user (Mary Watson)
INSERT OR IGNORE INTO users (id, user_id, email, firstname, surname, created_at, updated_at)
VALUES (2, 'fake-uuid-mary-watson', 'mary.watson@example.com', 'Mary', 'Watson', datetime('now'), datetime('now'));

-- Get the actual first user's ID (assuming it exists)
-- We'll add transactions for both users

-- Mary's Deposits (User ID: 2)
INSERT INTO transactions (user_id, category_id, type, amount, description, transaction_date, created_at, updated_at) VALUES
(2, 11, 'deposit', 45000, 'November Salary', '2025-11-01', datetime('now'), datetime('now')),
(2, 12, 'deposit', 8500, 'Freelance Design Work', '2025-11-15', datetime('now'), datetime('now')),
(2, 11, 'deposit', 45000, 'December Salary', '2025-12-01', datetime('now'), datetime('now'));

-- Mary's Expenses (User ID: 2)
INSERT INTO transactions (user_id, category_id, type, amount, description, transaction_date, created_at, updated_at) VALUES
(2, 1, 'expense', 3200, 'Weekly Groceries at ICA', '2025-11-05', datetime('now'), datetime('now')),
(2, 1, 'expense', 2800, 'Weekly Groceries at Coop', '2025-11-12', datetime('now'), datetime('now')),
(2, 1, 'expense', 3500, 'Weekly Groceries at ICA', '2025-11-19', datetime('now'), datetime('now')),
(2, 3, 'expense', 450, 'Lunch at Café Downtown', '2025-11-08', datetime('now'), datetime('now')),
(2, 3, 'expense', 890, 'Dinner at Italian Restaurant', '2025-11-14', datetime('now'), datetime('now')),
(2, 3, 'expense', 650, 'Coffee and Pastries', '2025-11-20', datetime('now'), datetime('now')),
(2, 2, 'expense', 1200, 'Gas Station Fill-up', '2025-11-06', datetime('now'), datetime('now')),
(2, 2, 'expense', 850, 'Public Transit Monthly Pass', '2025-11-01', datetime('now'), datetime('now')),
(2, 7, 'expense', 2500, 'New Winter Jacket', '2025-11-10', datetime('now'), datetime('now')),
(2, 7, 'expense', 1800, 'Shoes and Accessories', '2025-11-22', datetime('now'), datetime('now')),
(2, 4, 'expense', 450, 'Movie Tickets', '2025-11-16', datetime('now'), datetime('now')),
(2, 4, 'expense', 890, 'Concert Tickets', '2025-11-25', datetime('now'), datetime('now')),
(2, 6, 'expense', 650, 'Internet Bill', '2025-11-01', datetime('now'), datetime('now')),
(2, 6, 'expense', 450, 'Mobile Phone Bill', '2025-11-05', datetime('now'), datetime('now')),
(2, 10, 'expense', 350, 'Gym Membership', '2025-11-01', datetime('now'), datetime('now'));

-- Additional transactions for User 1 (to create imbalance for testing)
-- Assuming User 1 exists with ID 1
INSERT INTO transactions (user_id, category_id, type, amount, description, transaction_date, created_at, updated_at) VALUES
(1, 11, 'deposit', 42000, 'November Salary', '2025-11-01', datetime('now'), datetime('now')),
(1, 11, 'deposit', 42000, 'December Salary', '2025-12-01', datetime('now'), datetime('now')),
(1, 1, 'expense', 2200, 'Weekly Groceries', '2025-11-07', datetime('now'), datetime('now')),
(1, 1, 'expense', 2400, 'Weekly Groceries', '2025-11-14', datetime('now'), datetime('now')),
(1, 1, 'expense', 2600, 'Weekly Groceries', '2025-11-21', datetime('now'), datetime('now')),
(1, 3, 'expense', 750, 'Restaurant Dinner', '2025-11-10', datetime('now'), datetime('now')),
(1, 3, 'expense', 550, 'Lunch Out', '2025-11-18', datetime('now'), datetime('now')),
(1, 2, 'expense', 1500, 'Gas and Parking', '2025-11-09', datetime('now'), datetime('now')),
(1, 8, 'expense', 12000, 'Monthly Rent', '2025-11-01', datetime('now'), datetime('now')),
(1, 6, 'expense', 800, 'Electricity Bill', '2025-11-05', datetime('now'), datetime('now')),
(1, 6, 'expense', 350, 'Water Bill', '2025-11-05', datetime('now'), datetime('now')),
(1, 7, 'expense', 1200, 'New Headphones', '2025-11-12', datetime('now'), datetime('now')),
(1, 4, 'expense', 650, 'Streaming Subscriptions', '2025-11-01', datetime('now'), datetime('now')),
(1, 10, 'expense', 450, 'Miscellaneous', '2025-11-23', datetime('now'), datetime('now'));
