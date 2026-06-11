-- IAPHD NATCON 2026 MySQL Database Schema
-- You can import this file directly into phpMyAdmin.

CREATE DATABASE IF NOT EXISTS u695381285_natcon2026;
USE u695381285_natcon2026;

-- 1. Delegates Registration Table
CREATE TABLE IF NOT EXISTS registrations (
    id VARCHAR(50) PRIMARY KEY, -- Holds unique delegate IDs (e.g. REG-1001)
    fullName VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    mobile VARCHAR(20) NOT NULL,
    gender VARCHAR(20),
    institution VARCHAR(255),
    designation VARCHAR(100),
    councilRegNo VARCHAR(100),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    pincode VARCHAR(20),
    tier VARCHAR(50) NOT NULL, -- classic, premium, elite
    category VARCHAR(50) NOT NULL, -- Faculty, PG, etc.
    iaphdNo VARCHAR(50),
    foodPreference VARCHAR(50),
    hasAccompanying VARCHAR(10),
    accompanyingName VARCHAR(255),
    accompanyingCount INT DEFAULT 0,
    accompanyingFood VARCHAR(50),
    transactionId VARCHAR(100), -- Razorpay Payment / Transaction ID
    paymentDate DATE,
    amountPaid DECIMAL(10, 2),
    status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, CONFIRMED, FAILED
    offline_online VARCHAR(20) DEFAULT 'online',
    profilePic LONGTEXT DEFAULT NULL,
    password VARCHAR(255) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Admin Accounts Table
CREATE TABLE IF NOT EXISTS admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL, -- Encrypted hash
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Seed Default Admin User
-- Credentials: Username = 'admin', Password = 'admin123' (bcrypt hash)
INSERT INTO admins (username, password) 
VALUES ('admin', '$2b$10$qR6QdM8G.P8R07GZ5U/M1O0Q2R0K6J2y9L3jX.1n.UuY4P5C.4X4G')
ON DUPLICATE KEY UPDATE username=username;

-- 4. Dynamic CMS Configs Table
CREATE TABLE IF NOT EXISTS settings (
    `key` VARCHAR(100) PRIMARY KEY,
    `value` LONGTEXT NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Event Schedule / Sessions Table
CREATE TABLE IF NOT EXISTS schedules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    dayNumber INT NOT NULL,
    timeSlot VARCHAR(100) NOT NULL,
    title VARCHAR(255) NOT NULL,
    speaker VARCHAR(255) NOT NULL,
    venue VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Sponsors Table
CREATE TABLE IF NOT EXISTS sponsors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    logoUrl TEXT NOT NULL,
    tier VARCHAR(100) NOT NULL, -- Platinum, Gold, Silver
    orderIndex INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Announcements / News Table
CREATE TABLE IF NOT EXISTS announcements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    isActive BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Media Gallery Table
CREATE TABLE IF NOT EXISTS gallery (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255),
    mediaUrl TEXT NOT NULL,
    mediaType VARCHAR(50) DEFAULT 'image', -- image, video
    category VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Submissions Table (Abstracts & Presentations)
CREATE TABLE IF NOT EXISTS submissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    regId VARCHAR(50) NOT NULL,
    fullName VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    mobile VARCHAR(20) NOT NULL,
    type VARCHAR(50) NOT NULL, -- abstract, presentation
    category VARCHAR(100) NOT NULL,
    fileUrl TEXT NOT NULL,
    fileName VARCHAR(255) DEFAULT NULL,
    status VARCHAR(20) DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (regId) REFERENCES registrations(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
