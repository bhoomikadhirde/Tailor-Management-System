-- Tailor Management System - MySQL Database Schema
-- Run this script in your MySQL instance (e.g., workbench or CLI)

CREATE DATABASE IF NOT EXISTS tailor_db;
USE tailor_db;

-- 1. Users Table (Role-based authentication)
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL, -- 'ADMIN', 'TAILOR', 'CUSTOMER'
    full_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Client Profiles Table
CREATE TABLE IF NOT EXISTS clients (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    email VARCHAR(100),
    address TEXT,
    gender VARCHAR(10) NOT NULL, -- 'MALE', 'FEMALE', 'OTHER'
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Custom Measurements Table (One-to-One with Client)
CREATE TABLE IF NOT EXISTS measurements (
    id VARCHAR(50) PRIMARY KEY,
    client_id VARCHAR(50) NOT NULL,
    neck DECIMAL(5,2),
    chest DECIMAL(5,2),
    bust DECIMAL(5,2),
    waist DECIMAL(5,2),
    hips DECIMAL(5,2),
    shoulder DECIMAL(5,2),
    sleeves DECIMAL(5,2),
    length DECIMAL(5,2),
    inseam DECIMAL(5,2),
    cuff DECIMAL(5,2),
    collar DECIMAL(5,2),
    upper_arm DECIMAL(5,2),
    notes TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Orders Table (Custom status workflows)
CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR(50) PRIMARY KEY,
    client_id VARCHAR(50) NOT NULL,
    order_number VARCHAR(30) NOT NULL UNIQUE,
    clothing_type VARCHAR(50) NOT NULL,
    fabric_details TEXT,
    status VARCHAR(30) NOT NULL, -- 'PENDING', 'FABRIC_RECEIVED', 'CUTTING', 'STITCHING', 'TRIAL', 'COMPLETED', 'DELIVERED'
    price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    discount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    tax DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    total DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    amount_paid DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    payment_status VARCHAR(20) NOT NULL, -- 'UNPAID', 'PARTIAL', 'PAID'
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    due_date TIMESTAMP NOT NULL,
    notes TEXT,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Order Measurement Snapshots (Saves measurements at the time of order placement)
CREATE TABLE IF NOT EXISTS order_measurements (
    id VARCHAR(50) PRIMARY KEY,
    order_id VARCHAR(50) NOT NULL UNIQUE,
    neck DECIMAL(5,2),
    chest DECIMAL(5,2),
    bust DECIMAL(5,2),
    waist DECIMAL(5,2),
    hips DECIMAL(5,2),
    shoulder DECIMAL(5,2),
    sleeves DECIMAL(5,2),
    length DECIMAL(5,2),
    inseam DECIMAL(5,2),
    cuff DECIMAL(5,2),
    collar DECIMAL(5,2),
    upper_arm DECIMAL(5,2),
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Invoices Table
CREATE TABLE IF NOT EXISTS invoices (
    id VARCHAR(50) PRIMARY KEY,
    invoice_number VARCHAR(30) NOT NULL UNIQUE,
    order_id VARCHAR(50) NOT NULL UNIQUE,
    client_id VARCHAR(50) NOT NULL,
    issue_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    due_date TIMESTAMP NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    discount DECIMAL(10,2) NOT NULL,
    tax DECIMAL(10,2) NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    amount_paid DECIMAL(10,2) NOT NULL,
    payment_status VARCHAR(20) NOT NULL,
    notes TEXT,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Insert Seed Users with Pre-hashed passwords (BCrypt matching 'admin123' etc.)
INSERT INTO users (id, username, email, password_hash, role, full_name) VALUES
('usr_1', 'admin_owner', 'admin@tailor.com', '$2a$12$6K8p2UfT1pSg9179yOq1uOWdC6f5N3Zf9/Dsk8h89xN5vFzCmsN8y', 'ADMIN', 'Bhoomika Sterling'),
('usr_2', 'master_cutter', 'tailor@tailor.com', '$2a$12$RWe8LidO8P7gbe971SlyOW03fVv89K59z/6G6x77O76XNskC9OzyO', 'TAILOR', 'Master Cutter Ramesh'),
('usr_3', 'arthur_p', 'customer@tailor.com', '$2a$12$K8p2UfT1pSg9179yOq1uOWdC6f5N3Zf9/Dsk8h89xN5vFzCmsN8y', 'CUSTOMER', 'Arthur Pendelton')
ON DUPLICATE KEY UPDATE id=id;
