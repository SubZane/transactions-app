-- Update Categories Table
-- Remove old categories and add new ones

-- Delete all existing categories
DELETE FROM categories;

-- Reset the autoincrement counter
DELETE FROM sqlite_sequence WHERE name='categories';

-- Insert new expense categories
INSERT INTO categories (id, name, type, description, icon, color) VALUES
(1, 'Childrens Clothes', 'expense', 'Clothing for children', 'ShoppingBagIcon', 'primary'),
(2, 'Groceries', 'expense', 'Food and household items', 'ShoppingCartIcon', 'primary'),
(3, 'Petrol', 'expense', 'Fuel for vehicles', 'TruckIcon', 'info'),
(4, 'Other', 'expense', 'Miscellaneous expenses', 'EllipsisHorizontalCircleIcon', 'neutral'),
(5, 'House Renovation', 'expense', 'Home improvement and repairs', 'HomeIcon', 'accent'),
(6, 'Restaurant', 'expense', 'Dining out and takeout', 'BuildingStorefrontIcon', 'warning'),
(7, 'Vacation', 'expense', 'Travel and vacation expenses', 'GlobeAltIcon', 'secondary'),
(8, 'Shopping', 'expense', 'General shopping and personal items', 'ShoppingBagIcon', 'primary');
