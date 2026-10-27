const express = require('express');
const pool = require('../db');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

const SELECT_WITH_NAMES = `
  SELECT t.*, b.title AS book_title, u.name AS user_name, u.membership_id
  FROM transactions t
  JOIN books b ON b.id = t.book_id
  LEFT JOIN users u ON u.id = t.user_id`;

// How a transaction changes stock: "add" increases it, "borrow" decreases it
const effect = (type, qty) => (type === 'add' ? qty : -qty);

function validateTx({ type, quantity }) {
  if (!['add', 'borrow'].includes(type)) return 'Type must be "add" or "borrow"';
  const qty = Number(quantity);
  if (!Number.isInteger(qty) || qty < 1) return 'Quantity must be a whole number of 1 or more';
  return null;
}

function stockError(book) {
  return `Not enough stock: "${book.title}" has ${book.quantity} cop${book.quantity === 1 ? 'y' : 'ies'}`;
}

// Runs fn inside a DB transaction so stock levels and the log never disagree
async function withTransaction(fn) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const result = await fn(conn);
    await conn.commit();
    return result;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

// Error that carries an HTTP status, picked up by the error handler
const httpError = (status, message) => Object.assign(new Error(message), { status });

async function lockBook(conn, bookId) {
  const [rows] = await conn.query('SELECT * FROM books WHERE id = ? FOR UPDATE', [bookId]);
  if (!rows.length) throw httpError(404, 'Book not found');
  return rows[0];
}

async function lockTx(conn, id) {
  const [rows] = await conn.query('SELECT * FROM transactions WHERE id = ? FOR UPDATE', [id]);
  if (!rows.length) throw httpError(404, 'Transaction not found');
  return rows[0];
}

// GET /transactions - full history, newest first. Optional filters: ?book_id= ?user_id= ?type=
router.get('/', asyncHandler(async (req, res) => {
  const where = [];
  const params = [];
  for (const key of ['book_id', 'user_id', 'type']) {
    if (req.query[key]) {
      where.push(`t.${key} = ?`);
      params.push(req.query[key]);
    }
  }
  let sql = SELECT_WITH_NAMES;
  if (where.length) sql += ` WHERE ${where.join(' AND ')}`;
  sql += ' ORDER BY t.created_at DESC, t.id DESC';
  const [rows] = await pool.query(sql, params);
  res.json(rows);
}));

// GET /transactions/:id
router.get('/:id', asyncHandler(async (req, res) => {
  const [rows] = await pool.query(`${SELECT_WITH_NAMES} WHERE t.id = ?`, [req.params.id]);
  if (!rows.length) return res.status(404).json({ error: 'Transaction not found' });
  res.json(rows[0]);
}));

// POST /transactions - add stock ("add") or deduct stock ("borrow").
// user_id = the member who borrowed, or the staff member who added stock.
router.post('/', asyncHandler(async (req, res) => {
  const { book_id, user_id, type, quantity, note } = req.body;
  if (!book_id) return res.status(400).json({ error: 'Choose a book' });
  if (type === 'borrow' && !user_id) return res.status(400).json({ error: 'Choose the member who is borrowing' });
  const error = validateTx(req.body);
  if (error) return res.status(400).json({ error });
  const qty = Number(quantity);

  const { id, newQuantity } = await withTransaction(async (conn) => {
    const book = await lockBook(conn, book_id);
    const newQty = book.quantity + effect(type, qty);
    if (newQty < 0) throw httpError(400, stockError(book));

    await conn.query('UPDATE books SET quantity = ? WHERE id = ?', [newQty, book_id]);
    const [result] = await conn.query(
      'INSERT INTO transactions (book_id, user_id, type, quantity, note) VALUES (?, ?, ?, ?, ?)',
      [book_id, user_id || null, type, qty, note?.trim() || null]
    );
    return { id: result.insertId, newQuantity: newQty };
  });

  const [rows] = await pool.query(`${SELECT_WITH_NAMES} WHERE t.id = ?`, [id]);
  res.status(201).json({ transaction: rows[0], newQuantity });
}));

// PUT /transactions/:id - correct a transaction (type, quantity, borrower, note).
// The old effect on stock is undone and the new one applied.
router.put('/:id', asyncHandler(async (req, res) => {
  const { user_id, type, quantity, note } = req.body;
  const error = validateTx(req.body);
  if (error) return res.status(400).json({ error });
  if (type === 'borrow' && !user_id) return res.status(400).json({ error: 'Choose the member who is borrowing' });
  const qty = Number(quantity);

  const newQuantity = await withTransaction(async (conn) => {
    const tx = await lockTx(conn, req.params.id);
    const book = await lockBook(conn, tx.book_id);
    const newQty = book.quantity - effect(tx.type, tx.quantity) + effect(type, qty);
    if (newQty < 0) throw httpError(400, stockError(book));

    await conn.query('UPDATE books SET quantity = ? WHERE id = ?', [newQty, book.id]);
    await conn.query(
      'UPDATE transactions SET user_id = ?, type = ?, quantity = ?, note = ? WHERE id = ?',
      [user_id || null, type, qty, note?.trim() || null, tx.id]
    );
    return newQty;
  });

  const [rows] = await pool.query(`${SELECT_WITH_NAMES} WHERE t.id = ?`, [req.params.id]);
  res.json({ transaction: rows[0], newQuantity });
}));

// DELETE /transactions/:id - remove an entry and undo its effect on stock
// (deleting a borrow returns the copies; deleting a restock removes them).
router.delete('/:id', asyncHandler(async (req, res) => {
  const newQuantity = await withTransaction(async (conn) => {
    const tx = await lockTx(conn, req.params.id);
    const book = await lockBook(conn, tx.book_id);
    const newQty = book.quantity - effect(tx.type, tx.quantity);
    if (newQty < 0) {
      throw httpError(400, `Can't undo: "${book.title}" only has ${book.quantity} left in stock`);
    }
    await conn.query('UPDATE books SET quantity = ? WHERE id = ?', [newQty, book.id]);
    await conn.query('DELETE FROM transactions WHERE id = ?', [tx.id]);
    return newQty;
  });
  res.json({ message: 'Transaction deleted and stock adjusted', newQuantity });
}));

module.exports = router;
