-- Populate dummy transactions for 2023 and 2024
-- User IDs: 1 (Andreas), 2 (Mary)
-- Categories: 1-Childrens Clothes, 2-Groceries, 3-House Renovation, 4-Other, 5-Petrol, 6-Restaurant, 7-Shopping, 8-Vacation

-- 2023 Transactions
-- January 2023
INSERT INTO transactions (user_id, category_id, type, amount, description, transaction_date, created_at, updated_at) VALUES
(1, 2, 'expense', 850, 'Weekly groceries', '2023-01-05', datetime('now'), datetime('now')),
(2, 5, 'expense', 650, 'Gas station', '2023-01-08', datetime('now'), datetime('now')),
(1, NULL, 'deposit', 35000, 'January salary', '2023-01-15', datetime('now'), datetime('now')),
(2, NULL, 'deposit', 38000, 'January salary', '2023-01-15', datetime('now'), datetime('now')),
(1, 6, 'expense', 480, 'Dinner at Italian place', '2023-01-20', datetime('now'), datetime('now')),
(2, 7, 'expense', 1200, 'New clothes', '2023-01-25', datetime('now'), datetime('now'));

-- February 2023
INSERT INTO transactions (user_id, category_id, type, amount, description, transaction_date, created_at, updated_at) VALUES
(1, 2, 'expense', 920, 'Weekly groceries', '2023-02-03', datetime('now'), datetime('now')),
(2, 1, 'expense', 450, 'Kids winter jackets', '2023-02-10', datetime('now'), datetime('now')),
(1, NULL, 'deposit', 35000, 'February salary', '2023-02-15', datetime('now'), datetime('now')),
(2, NULL, 'deposit', 38000, 'February salary', '2023-02-15', datetime('now'), datetime('now')),
(1, 5, 'expense', 720, 'Gas station', '2023-02-18', datetime('now'), datetime('now')),
(2, 6, 'expense', 650, 'Lunch meeting', '2023-02-22', datetime('now'), datetime('now'));

-- March 2023
INSERT INTO transactions (user_id, category_id, type, amount, description, transaction_date, created_at, updated_at) VALUES
(1, 2, 'expense', 1100, 'Monthly groceries', '2023-03-05', datetime('now'), datetime('now')),
(2, 7, 'expense', 890, 'Spring shopping', '2023-03-10', datetime('now'), datetime('now')),
(1, NULL, 'deposit', 35000, 'March salary', '2023-03-15', datetime('now'), datetime('now')),
(2, NULL, 'deposit', 38000, 'March salary', '2023-03-15', datetime('now'), datetime('now')),
(1, 3, 'expense', 15000, 'Bathroom renovation materials', '2023-03-20', datetime('now'), datetime('now')),
(2, 5, 'expense', 680, 'Petrol', '2023-03-25', datetime('now'), datetime('now'));

-- April 2023
INSERT INTO transactions (user_id, category_id, type, amount, description, transaction_date, created_at, updated_at) VALUES
(1, 2, 'expense', 950, 'Weekly groceries', '2023-04-02', datetime('now'), datetime('now')),
(2, 1, 'expense', 320, 'Kids shoes', '2023-04-08', datetime('now'), datetime('now')),
(1, NULL, 'deposit', 35000, 'April salary', '2023-04-15', datetime('now'), datetime('now')),
(2, NULL, 'deposit', 38000, 'April salary', '2023-04-15', datetime('now'), datetime('now')),
(1, 6, 'expense', 520, 'Family dinner', '2023-04-22', datetime('now'), datetime('now')),
(2, 7, 'expense', 750, 'Shopping', '2023-04-28', datetime('now'), datetime('now'));

-- May 2023
INSERT INTO transactions (user_id, category_id, type, amount, description, transaction_date, created_at, updated_at) VALUES
(1, 2, 'expense', 1050, 'Groceries', '2023-05-05', datetime('now'), datetime('now')),
(2, 5, 'expense', 700, 'Gas', '2023-05-10', datetime('now'), datetime('now')),
(1, NULL, 'deposit', 35000, 'May salary', '2023-05-15', datetime('now'), datetime('now')),
(2, NULL, 'deposit', 38000, 'May salary', '2023-05-15', datetime('now'), datetime('now')),
(1, 8, 'expense', 12000, 'Weekend trip', '2023-05-20', datetime('now'), datetime('now')),
(2, 6, 'expense', 480, 'Restaurant', '2023-05-27', datetime('now'), datetime('now'));

-- June 2023
INSERT INTO transactions (user_id, category_id, type, amount, description, transaction_date, created_at, updated_at) VALUES
(1, 2, 'expense', 980, 'Groceries', '2023-06-03', datetime('now'), datetime('now')),
(2, 1, 'expense', 550, 'Summer clothes for kids', '2023-06-10', datetime('now'), datetime('now')),
(1, NULL, 'deposit', 35000, 'June salary', '2023-06-15', datetime('now'), datetime('now')),
(2, NULL, 'deposit', 38000, 'June salary', '2023-06-15', datetime('now'), datetime('now')),
(1, 5, 'expense', 750, 'Petrol', '2023-06-20', datetime('now'), datetime('now')),
(2, 7, 'expense', 920, 'Shopping', '2023-06-28', datetime('now'), datetime('now'));

-- July 2023
INSERT INTO transactions (user_id, category_id, type, amount, description, transaction_date, created_at, updated_at) VALUES
(1, 2, 'expense', 1200, 'Groceries', '2023-07-05', datetime('now'), datetime('now')),
(2, 8, 'expense', 35000, 'Summer vacation', '2023-07-15', datetime('now'), datetime('now')),
(1, NULL, 'deposit', 35000, 'July salary', '2023-07-15', datetime('now'), datetime('now')),
(2, NULL, 'deposit', 38000, 'July salary', '2023-07-15', datetime('now'), datetime('now')),
(1, 6, 'expense', 890, 'Restaurant on vacation', '2023-07-20', datetime('now'), datetime('now')),
(2, 5, 'expense', 1200, 'Road trip gas', '2023-07-25', datetime('now'), datetime('now'));

-- August 2023
INSERT INTO transactions (user_id, category_id, type, amount, description, transaction_date, created_at, updated_at) VALUES
(1, 2, 'expense', 1050, 'Groceries', '2023-08-05', datetime('now'), datetime('now')),
(2, 1, 'expense', 890, 'Back to school clothes', '2023-08-10', datetime('now'), datetime('now')),
(1, NULL, 'deposit', 35000, 'August salary', '2023-08-15', datetime('now'), datetime('now')),
(2, NULL, 'deposit', 38000, 'August salary', '2023-08-15', datetime('now'), datetime('now')),
(1, 7, 'expense', 650, 'Shopping', '2023-08-20', datetime('now'), datetime('now')),
(2, 5, 'expense', 680, 'Gas', '2023-08-28', datetime('now'), datetime('now'));

-- September 2023
INSERT INTO transactions (user_id, category_id, type, amount, description, transaction_date, created_at, updated_at) VALUES
(1, 2, 'expense', 1100, 'Groceries', '2023-09-05', datetime('now'), datetime('now')),
(2, 6, 'expense', 540, 'Restaurant', '2023-09-12', datetime('now'), datetime('now')),
(1, NULL, 'deposit', 35000, 'September salary', '2023-09-15', datetime('now'), datetime('now')),
(2, NULL, 'deposit', 38000, 'September salary', '2023-09-15', datetime('now'), datetime('now')),
(1, 3, 'expense', 8500, 'Kitchen renovation', '2023-09-20', datetime('now'), datetime('now')),
(2, 5, 'expense', 720, 'Petrol', '2023-09-25', datetime('now'), datetime('now'));

-- October 2023
INSERT INTO transactions (user_id, category_id, type, amount, description, transaction_date, created_at, updated_at) VALUES
(1, 2, 'expense', 980, 'Groceries', '2023-10-05', datetime('now'), datetime('now')),
(2, 1, 'expense', 650, 'Fall clothes for kids', '2023-10-10', datetime('now'), datetime('now')),
(1, NULL, 'deposit', 35000, 'October salary', '2023-10-15', datetime('now'), datetime('now')),
(2, NULL, 'deposit', 38000, 'October salary', '2023-10-15', datetime('now'), datetime('now')),
(1, 7, 'expense', 890, 'Shopping', '2023-10-22', datetime('now'), datetime('now')),
(2, 6, 'expense', 620, 'Dinner out', '2023-10-28', datetime('now'), datetime('now'));

-- November 2023
INSERT INTO transactions (user_id, category_id, type, amount, description, transaction_date, created_at, updated_at) VALUES
(1, 2, 'expense', 1150, 'Groceries', '2023-11-05', datetime('now'), datetime('now')),
(2, 5, 'expense', 700, 'Gas', '2023-11-10', datetime('now'), datetime('now')),
(1, NULL, 'deposit', 35000, 'November salary', '2023-11-15', datetime('now'), datetime('now')),
(2, NULL, 'deposit', 38000, 'November salary', '2023-11-15', datetime('now'), datetime('now')),
(1, 7, 'expense', 1200, 'Black Friday shopping', '2023-11-24', datetime('now'), datetime('now')),
(2, 6, 'expense', 580, 'Restaurant', '2023-11-28', datetime('now'), datetime('now'));

-- December 2023
INSERT INTO transactions (user_id, category_id, type, amount, description, transaction_date, created_at, updated_at) VALUES
(1, 2, 'expense', 1400, 'Christmas groceries', '2023-12-05', datetime('now'), datetime('now')),
(2, 7, 'expense', 3500, 'Christmas shopping', '2023-12-10', datetime('now'), datetime('now')),
(1, NULL, 'deposit', 35000, 'December salary', '2023-12-15', datetime('now'), datetime('now')),
(2, NULL, 'deposit', 38000, 'December salary', '2023-12-15', datetime('now'), datetime('now')),
(1, 1, 'expense', 980, 'Kids winter clothes', '2023-12-18', datetime('now'), datetime('now')),
(2, 6, 'expense', 890, 'Christmas dinner', '2023-12-24', datetime('now'), datetime('now'));

-- 2024 Transactions
-- January 2024
INSERT INTO transactions (user_id, category_id, type, amount, description, transaction_date, created_at, updated_at) VALUES
(1, 2, 'expense', 900, 'New year groceries', '2024-01-05', datetime('now'), datetime('now')),
(2, 5, 'expense', 680, 'Gas', '2024-01-08', datetime('now'), datetime('now')),
(1, NULL, 'deposit', 36000, 'January salary', '2024-01-15', datetime('now'), datetime('now')),
(2, NULL, 'deposit', 40000, 'January salary', '2024-01-15', datetime('now'), datetime('now')),
(1, 6, 'expense', 520, 'Restaurant', '2024-01-20', datetime('now'), datetime('now')),
(2, 7, 'expense', 1100, 'New year shopping', '2024-01-27', datetime('now'), datetime('now'));

-- February 2024
INSERT INTO transactions (user_id, category_id, type, amount, description, transaction_date, created_at, updated_at) VALUES
(1, 2, 'expense', 950, 'Groceries', '2024-02-03', datetime('now'), datetime('now')),
(2, 1, 'expense', 520, 'Kids clothes', '2024-02-10', datetime('now'), datetime('now')),
(1, NULL, 'deposit', 36000, 'February salary', '2024-02-15', datetime('now'), datetime('now')),
(2, NULL, 'deposit', 40000, 'February salary', '2024-02-15', datetime('now'), datetime('now')),
(1, 5, 'expense', 750, 'Petrol', '2024-02-18', datetime('now'), datetime('now')),
(2, 8, 'expense', 8500, 'Ski vacation', '2024-02-25', datetime('now'), datetime('now'));

-- March 2024
INSERT INTO transactions (user_id, category_id, type, amount, description, transaction_date, created_at, updated_at) VALUES
(1, 2, 'expense', 1050, 'Groceries', '2024-03-05', datetime('now'), datetime('now')),
(2, 7, 'expense', 920, 'Spring shopping', '2024-03-10', datetime('now'), datetime('now')),
(1, NULL, 'deposit', 36000, 'March salary', '2024-03-15', datetime('now'), datetime('now')),
(2, NULL, 'deposit', 40000, 'March salary', '2024-03-15', datetime('now'), datetime('now')),
(1, 6, 'expense', 580, 'Dinner', '2024-03-20', datetime('now'), datetime('now')),
(2, 5, 'expense', 700, 'Gas', '2024-03-28', datetime('now'), datetime('now'));

-- April 2024
INSERT INTO transactions (user_id, category_id, type, amount, description, transaction_date, created_at, updated_at) VALUES
(1, 2, 'expense', 980, 'Groceries', '2024-04-05', datetime('now'), datetime('now')),
(2, 1, 'expense', 450, 'Kids spring clothes', '2024-04-10', datetime('now'), datetime('now')),
(1, NULL, 'deposit', 36000, 'April salary', '2024-04-15', datetime('now'), datetime('now')),
(2, NULL, 'deposit', 40000, 'April salary', '2024-04-15', datetime('now'), datetime('now')),
(1, 3, 'expense', 12000, 'Garden renovation', '2024-04-20', datetime('now'), datetime('now')),
(2, 6, 'expense', 650, 'Restaurant', '2024-04-27', datetime('now'), datetime('now'));

-- May 2024
INSERT INTO transactions (user_id, category_id, type, amount, description, transaction_date, created_at, updated_at) VALUES
(1, 2, 'expense', 1100, 'Groceries', '2024-05-05', datetime('now'), datetime('now')),
(2, 5, 'expense', 720, 'Petrol', '2024-05-10', datetime('now'), datetime('now')),
(1, NULL, 'deposit', 36000, 'May salary', '2024-05-15', datetime('now'), datetime('now')),
(2, NULL, 'deposit', 40000, 'May salary', '2024-05-15', datetime('now'), datetime('now')),
(1, 7, 'expense', 850, 'Shopping', '2024-05-20', datetime('now'), datetime('now')),
(2, 6, 'expense', 520, 'Lunch', '2024-05-28', datetime('now'), datetime('now'));

-- June 2024
INSERT INTO transactions (user_id, category_id, type, amount, description, transaction_date, created_at, updated_at) VALUES
(1, 2, 'expense', 1050, 'Groceries', '2024-06-05', datetime('now'), datetime('now')),
(2, 1, 'expense', 680, 'Summer clothes for kids', '2024-06-10', datetime('now'), datetime('now')),
(1, NULL, 'deposit', 36000, 'June salary', '2024-06-15', datetime('now'), datetime('now')),
(2, NULL, 'deposit', 40000, 'June salary', '2024-06-15', datetime('now'), datetime('now')),
(1, 5, 'expense', 780, 'Gas', '2024-06-20', datetime('now'), datetime('now')),
(2, 7, 'expense', 950, 'Shopping', '2024-06-28', datetime('now'), datetime('now'));

-- July 2024
INSERT INTO transactions (user_id, category_id, type, amount, description, transaction_date, created_at, updated_at) VALUES
(1, 2, 'expense', 1300, 'Summer groceries', '2024-07-05', datetime('now'), datetime('now')),
(2, 8, 'expense', 42000, 'Summer vacation abroad', '2024-07-15', datetime('now'), datetime('now')),
(1, NULL, 'deposit', 36000, 'July salary', '2024-07-15', datetime('now'), datetime('now')),
(2, NULL, 'deposit', 40000, 'July salary', '2024-07-15', datetime('now'), datetime('now')),
(1, 6, 'expense', 920, 'Restaurant on vacation', '2024-07-20', datetime('now'), datetime('now')),
(2, 5, 'expense', 1400, 'Road trip fuel', '2024-07-25', datetime('now'), datetime('now'));

-- August 2024
INSERT INTO transactions (user_id, category_id, type, amount, description, transaction_date, created_at, updated_at) VALUES
(1, 2, 'expense', 1100, 'Groceries', '2024-08-05', datetime('now'), datetime('now')),
(2, 1, 'expense', 950, 'Back to school shopping', '2024-08-10', datetime('now'), datetime('now')),
(1, NULL, 'deposit', 36000, 'August salary', '2024-08-15', datetime('now'), datetime('now')),
(2, NULL, 'deposit', 40000, 'August salary', '2024-08-15', datetime('now'), datetime('now')),
(1, 7, 'expense', 720, 'Shopping', '2024-08-20', datetime('now'), datetime('now')),
(2, 5, 'expense', 700, 'Petrol', '2024-08-28', datetime('now'), datetime('now'));

-- September 2024
INSERT INTO transactions (user_id, category_id, type, amount, description, transaction_date, created_at, updated_at) VALUES
(1, 2, 'expense', 1050, 'Groceries', '2024-09-05', datetime('now'), datetime('now')),
(2, 6, 'expense', 580, 'Restaurant', '2024-09-12', datetime('now'), datetime('now')),
(1, NULL, 'deposit', 36000, 'September salary', '2024-09-15', datetime('now'), datetime('now')),
(2, NULL, 'deposit', 40000, 'September salary', '2024-09-15', datetime('now'), datetime('now')),
(1, 3, 'expense', 9500, 'Bedroom renovation', '2024-09-20', datetime('now'), datetime('now')),
(2, 5, 'expense', 750, 'Gas', '2024-09-25', datetime('now'), datetime('now'));

-- October 2024
INSERT INTO transactions (user_id, category_id, type, amount, description, transaction_date, created_at, updated_at) VALUES
(1, 2, 'expense', 1000, 'Groceries', '2024-10-05', datetime('now'), datetime('now')),
(2, 1, 'expense', 720, 'Fall clothes for kids', '2024-10-10', datetime('now'), datetime('now')),
(1, NULL, 'deposit', 36000, 'October salary', '2024-10-15', datetime('now'), datetime('now')),
(2, NULL, 'deposit', 40000, 'October salary', '2024-10-15', datetime('now'), datetime('now')),
(1, 7, 'expense', 890, 'Shopping', '2024-10-22', datetime('now'), datetime('now')),
(2, 6, 'expense', 650, 'Dinner', '2024-10-28', datetime('now'), datetime('now'));

-- November 2024
INSERT INTO transactions (user_id, category_id, type, amount, description, transaction_date, created_at, updated_at) VALUES
(1, 2, 'expense', 1200, 'Groceries', '2024-11-05', datetime('now'), datetime('now')),
(2, 5, 'expense', 730, 'Petrol', '2024-11-10', datetime('now'), datetime('now')),
(1, NULL, 'deposit', 36000, 'November salary', '2024-11-15', datetime('now'), datetime('now')),
(2, NULL, 'deposit', 40000, 'November salary', '2024-11-15', datetime('now'), datetime('now')),
(1, 7, 'expense', 1350, 'Black Friday deals', '2024-11-29', datetime('now'), datetime('now')),
(2, 6, 'expense', 620, 'Restaurant', '2024-11-30', datetime('now'), datetime('now'));

-- December 2024
INSERT INTO transactions (user_id, category_id, type, amount, description, transaction_date, created_at, updated_at) VALUES
(1, 2, 'expense', 1500, 'Christmas groceries', '2024-12-05', datetime('now'), datetime('now')),
(2, 7, 'expense', 4200, 'Christmas presents', '2024-12-10', datetime('now'), datetime('now')),
(1, NULL, 'deposit', 36000, 'December salary', '2024-12-15', datetime('now'), datetime('now')),
(2, NULL, 'deposit', 40000, 'December salary', '2024-12-15', datetime('now'), datetime('now')),
(1, 1, 'expense', 1100, 'Kids winter gear', '2024-12-18', datetime('now'), datetime('now')),
(2, 6, 'expense', 950, 'Christmas dinner', '2024-12-24', datetime('now'), datetime('now'));
