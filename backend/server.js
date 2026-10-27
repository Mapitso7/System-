const express = require('express');
const cors = require('cors');
require('dotenv').config();

const booksRouter = require('./routes/books');
const transactionsRouter = require('./routes/transactions');
const usersRouter = require('./routes/users');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();

// Middleware
app.use(cors());          // allow the React dev server (port 5173) to call the API
app.use(express.json());  // parse JSON request bodies

// Routes
app.get('/', (req, res) => res.json({ message: 'Library API is running' }));
app.use('/books', booksRouter);
app.use('/transactions', transactionsRouter);
app.use('/users', usersRouter);

// Unknown routes + errors
app.use((req, res) => res.status(404).json({ error: 'Route not found' }));
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
