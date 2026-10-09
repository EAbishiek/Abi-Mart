-- db/seed.sql - Seed initial accounts, products, reviews, and demo orders
-- Pre-configured accounts for test login:
-- 1. ADMIN: admin@abimart.com (password: admin123)
-- 2. SELLER: seller@abimart.com (password: seller123)
-- 3. BUYER: buyer@abimart.com (password: buyer123)

INSERT OR IGNORE INTO users (id, name, email, password_hash, role, created_at)
VALUES 
(1, 'System Administrator', 'admin@abimart.com', '$2a$10$q2xN8/2C1L0.8hW8N.R8uuN0jJgM8Z3P8R1K6L4M2N0P8R1K6L4M2', 'ADMIN', '2026-07-27 10:00:00'),
(2, 'Abi Gaming Gear (Seller)', 'seller@abimart.com', '$2a$10$q2xN8/2C1L0.8hW8N.R8uuN0jJgM8Z3P8R1K6L4M2N0P8R1K6L4M2', 'SELLER', '2026-07-28 11:30:00'),
(3, 'Alex Mercer (Buyer)', 'buyer@abimart.com', '$2a$10$q2xN8/2C1L0.8hW8N.R8uuN0jJgM8Z3P8R1K6L4M2N0P8R1K6L4M2', 'BUYER', '2026-07-29 14:15:00');
