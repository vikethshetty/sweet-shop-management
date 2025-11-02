CREATE DATABASE sweet_shop;

\c sweet_shop;

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'customer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE sweets (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sweets_category ON sweets(category);
CREATE INDEX idx_sweets_price ON sweets(price);

-- Insert sample data
INSERT INTO sweets (name, category, price, quantity) VALUES
('Chocolate Truffle', 'Chocolate', 2.50, 100),
('Gummy Bears', 'Gummies', 1.50, 50),
('Lollipop', 'Hard Candy', 0.75, 200),
('Caramel Square', 'Caramel', 1.25, 75),
('Fruit Chews', 'Chewy Candy', 1.00, 150);