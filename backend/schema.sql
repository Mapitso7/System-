-- Library Management System database (MySQL)
-- Run with:  mysql -u root -p < schema.sql

CREATE DATABASE IF NOT EXISTS library_db;
USE library_db;

DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS books;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(100) NOT NULL,
  membership_id VARCHAR(50)  NOT NULL UNIQUE,
  role          ENUM('admin', 'member') NOT NULL DEFAULT 'member',
  password_hash VARCHAR(255) NOT NULL,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE books (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  title      VARCHAR(200) NOT NULL,
  author     VARCHAR(150) NOT NULL,
  genre      VARCHAR(80)  NOT NULL,
  isbn       VARCHAR(20)  NOT NULL UNIQUE,
  quantity   INT NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Every stock movement is logged here (borrowing history + restocks)
CREATE TABLE transactions (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  book_id    INT NOT NULL,
  user_id    INT NULL,
  type       ENUM('add', 'borrow') NOT NULL,
  quantity   INT NOT NULL CHECK (quantity > 0),
  note       VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Sample books
INSERT INTO books (title, author, genre, isbn, quantity) VALUES
  ('Things Fall Apart', 'Chinua Achebe', 'Fiction', '9780385474542', 5),
  ('Clean Code', 'Robert C. Martin', 'Technology', '9780132350884', 1),
  ('Long Walk to Freedom', 'Nelson Mandela', 'Biography', '9780316548182', 3),
  ('Eloquent JavaScript', 'Marijn Haverbeke', 'Technology', '9781593279509', 0);
