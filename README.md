# Library Management System

Web Application Development (BIWA2110) – Lab Test

A full-stack app for managing library books, stock levels, borrowing transactions and users.

- **frontend/** – React (Vite) app using hooks, React Router and the Fetch API
- **backend/** – Express REST API connected to MySQL

## Features

| Area | What it does |
| --- | --- |
| Dashboard | Book availability as cards or a table, search, stock totals, low-stock highlighting (fewer than 2 copies) |
| Book Management | Add books (title, author, genre, ISBN, initial quantity), edit and delete them |
| Transactions | Add stock when books arrive, deduct stock when a member borrows (borrower recorded), edit/delete entries, history with search and filters |
| User Management | Login form; admin view to add, update and delete users (name, membership ID, role) |

Members can see the Dashboard, borrow books for themselves and view their own history. Admins can also add stock, lend to any member, correct transactions, and use Book Management and User Management.

## Setup

### 1. Database (MySQL)

```bash
cd backend
mysql -u root -p < schema.sql
```

This creates `library_db` with the `users`, `books` and `transactions` tables and some sample books.

### 2. Backend

```bash
cd backend
cp .env.example .env      # then put your MySQL password in .env
npm install
npm run seed              # creates the admin account
npm start                 # http://localhost:5000
```

Default admin login: **Membership ID** `ADMIN001`, **Password** `admin123`

### 3. Frontend

```bash
cd frontend
npm install
npm run dev               # http://localhost:5173
```

## API endpoints

| Method | Route | Purpose |
| --- | --- | --- |
| GET | /books | List books |
| GET | /books/:id | Get one book |
| POST | /books | Add a book |
| PUT | /books/:id | Update a book |
| DELETE | /books/:id | Delete a book |
| GET | /transactions | Transaction history (filters: `?book_id=`, `?user_id=`, `?type=`) |
| GET | /transactions/:id | Get one transaction |
| POST | /transactions | Add (`type: "add"`) or deduct (`type: "borrow"`, with the borrower's `user_id`) stock |
| PUT | /transactions/:id | Correct a transaction (old stock effect is undone, new one applied) |
| DELETE | /transactions/:id | Delete a transaction and undo its effect on stock |
| POST | /users/login | Log in |
| GET | /users | List users |
| GET | /users/:id | Get one user |
| POST | /users | Add a user |
| PUT | /users/:id | Update a user |
| DELETE | /users/:id | Delete a user |

Stock changes run inside a database transaction, so a borrow can never take stock below zero and the stock level always matches the history log. Passwords are hashed with bcrypt.

## Project structure

```
backend/
  server.js               Express app, express.json() + cors middleware
  db.js                   MySQL connection pool
  schema.sql              Tables + sample data
  seed.js                 Creates the admin user
  middleware/errorHandler.js
  routes/books.js | transactions.js | users.js
frontend/src/
  App.jsx                 Routes + logged-in user state
  api.js                  Fetch API calls
  hooks.js                useFetch / useFlash custom hooks
  components/             Navbar, BookList, BookForm, StockBadge, TransactionForm,
                          TransactionHistory, LoginForm, UserForm, UserList, Flash, ProtectedRoute
  pages/                  Dashboard, BookManagement, Transactions, UserManagement, LoginPage
```
