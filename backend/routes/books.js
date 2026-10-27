const express = require('express');
const pool = require('../db');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

// Validate the fields of a book; returns an error message or null
function validateBook({ title, author, genre, isbn, quantity }, requireQuantity = true) {
  if (!title?.trim() || !author?.trim() || !genre?.trim() || !isbn?.trim()) {
    return 'Title, author, genre and ISBN are required';
  }
  if (!/^[0-9X-]{10,17}$/i.test(isbn.trim())) {
    return 'ISBN must be 10 or 13 digits (dashes allowed)';
  }
  if (requireQuantity && (!Number.isInteger(Number(quantity)) || Number(quantity) < 0)) {
    return 'Quantity must be a whole number of 0 or more';
  }
  return null;
}

// GET /books - list all books
router.get('/', asyncHandler(async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM books ORDER BY title');
  res.json(rows);
}));

// GET /books/:id - one book
router.get('/:id', asyncHandler(async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM books WHERE id = ?', [req.params.id]);
  if (!rows.length) return res.status(404).json({ error: 'Book not found' });
  res.json(rows[0]);
}));

// POST /books - add a book with its initial quantity
router.post('/', asyncHandler(async (req, res) => {
  const error = validateBook(req.body);
  if (error) return res.status(400).json({ error });

  const { title, author, genre, isbn, quantity } = req.body;
  const [result] = await pool.query(
    'INSERT INTO books (title, author, genre, isbn, quantity) VALUES (?, ?, ?, ?, ?)',
    [title.trim(), author.trim(), genre.trim(), isbn.trim(), Number(quantity)]
  );
  const [rows] = await pool.query('SELECT * FROM books WHERE id = ?', [result.insertId]);
  res.status(201).json(rows[0]);
}));

// PUT /books/:id - update book details
router.put('/:id', asyncHandler(async (req, res) => {
  const error = validateBook(req.body);
  if (error) return res.status(400).json({ error });

  const { title, author, genre, isbn, quantity } = req.body;
  const [result] = await pool.query(
    'UPDATE books SET title = ?, author = ?, genre = ?, isbn = ?, quantity = ? WHERE id = ?',
    [title.trim(), author.trim(), genre.trim(), isbn.trim(), Number(quantity), req.params.id]
  );
  if (!result.affectedRows) return res.status(404).json({ error: 'Book not found' });
  const [rows] = await pool.query('SELECT * FROM books WHERE id = ?', [req.params.id]);
  res.json(rows[0]);
}));

// DELETE /books/:id - remove a book (its transactions cascade)
router.delete('/:id', asyncHandler(async (req, res) => {
  const [result] = await pool.query('DELETE FROM books WHERE id = ?', [req.params.id]);
  if (!result.affectedRows) return res.status(404).json({ error: 'Book not found' });
  res.json({ message: 'Book deleted' });
}));

module.exports = router;
