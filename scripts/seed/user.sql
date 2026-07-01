USE user_service_db;

SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE users;
SET FOREIGN_KEY_CHECKS = 1;

-- All accounts have the password 'Password@123'
INSERT INTO users (id, full_name, email, username, password_hash, role, status, created_at, updated_at) VALUES
(1, 'DRMS Administrator', 'admin01@gmail.com', 'admin01', '$2a$10$mC/0rUoX9e0c.a.d.k./3uN7Cj0v6VfF7q6p5Fp6mG8o7Fm6zZ2vS', 'ADMIN', 'ACTIVE', NOW(), NOW()),
(2, 'John Doe', 'donor01@gmail.com', 'donor01', '$2a$10$mC/0rUoX9e0c.a.d.k./3uN7Cj0v6VfF7q6p5Fp6mG8o7Fm6zZ2vS', 'DONOR', 'ACTIVE', NOW(), NOW()),
(3, 'Jane Smith', 'donor02@gmail.com', 'donor02', '$2a$10$mC/0rUoX9e0c.a.d.k./3uN7Cj0v6VfF7q6p5Fp6mG8o7Fm6zZ2vS', 'DONOR', 'ACTIVE', NOW(), NOW()),
(4, 'David Miller', 'donor03@gmail.com', 'donor03', '$2a$10$mC/0rUoX9e0c.a.d.k./3uN7Cj0v6VfF7q6p5Fp6mG8o7Fm6zZ2vS', 'DONOR', 'ACTIVE', NOW(), NOW()),
(5, 'Alice Johnson', 'manager01@gmail.com', 'manager01', '$2a$10$mC/0rUoX9e0c.a.d.k./3uN7Cj0v6VfF7q6p5Fp6mG8o7Fm6zZ2vS', 'SHELTER_MANAGER', 'ACTIVE', NOW(), NOW()),
(6, 'Bob Williams', 'manager02@gmail.com', 'manager02', '$2a$10$mC/0rUoX9e0c.a.d.k./3uN7Cj0v6VfF7q6p5Fp6mG8o7Fm6zZ2vS', 'SHELTER_MANAGER', 'ACTIVE', NOW(), NOW()),
(7, 'Carol Davis', 'manager03@gmail.com', 'manager03', '$2a$10$mC/0rUoX9e0c.a.d.k./3uN7Cj0v6VfF7q6p5Fp6mG8o7Fm6zZ2vS', 'SHELTER_MANAGER', 'ACTIVE', NOW(), NOW()),
(8, 'Emma Wilson', 'manager04@gmail.com', 'manager04', '$2a$10$mC/0rUoX9e0c.a.d.k./3uN7Cj0v6VfF7q6p5Fp6mG8o7Fm6zZ2vS', 'SHELTER_MANAGER', 'ACTIVE', NOW(), NOW());
