CREATE TABLE IF NOT EXISTS users (
    id INT(11) AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL,
    password VARCHAR(255) NULL,
    verified BOOLEAN DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS labels (
    id INT AUTO_INCREMENT PRIMARY KEY,
    type VARCHAR(255),
    description TEXT,
    file_url TEXT,
);

ALTER TABLE labels ADD COLUMN qr_code_url TEXT;
ALTER TABLE users ADD COLUMN google_id VARCHAR(255);
