-- V2__gaming_store_expansion.sql - Expansion for Gaming Accessories E-Commerce Capstone

-- Add columns to products table if not present
ALTER TABLE products ADD COLUMN brand TEXT DEFAULT 'AbiMart Gaming';
ALTER TABLE products ADD COLUMN badge TEXT DEFAULT '';
ALTER TABLE products ADD COLUMN rating REAL DEFAULT 4.8;
ALTER TABLE products ADD COLUMN reviews_count INTEGER DEFAULT 0;
ALTER TABLE products ADD COLUMN specs_json TEXT DEFAULT '{}';

-- Add columns to orders table for realistic checkout
ALTER TABLE orders ADD COLUMN shipping_address_json TEXT DEFAULT '{}';
ALTER TABLE orders ADD COLUMN payment_method TEXT DEFAULT 'CARD';
ALTER TABLE orders ADD COLUMN tracking_number TEXT DEFAULT '';

-- Add user_name to reviews
ALTER TABLE reviews ADD COLUMN user_name TEXT DEFAULT 'Verified Gamer';
