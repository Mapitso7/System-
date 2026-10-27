const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../db');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();
const ROLES = ['admin', 'member'];
const PUBLIC_FIELDS = 'id, name, membership_id, role, created_at';

// POST /users/login - check membership ID + password
router.post('/login', asyncHandler(async (req, res) => {
  const { membership_id, password } = req.body;
  if (!membership_id?.trim() || !password) {
    return res.status(400).json({ error: 'Membership ID and password are required' });
  }
  const [rows] = await pool.query('SELECT * FROM users WHERE membership_id = ?', [membership_id.trim()]);
  const user = rows[0];
  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    return res.status(401).json({ error: 'Invalid membership ID or password' });
  }
  const { password_hash, ...safeUser } = user;
  res.json(safeUser);
}));

// GET /users - list users (password hashes never leave the server)
router.get('/', asyncHandler(async (req, res) => {
  const [rows] = await pool.query(`SELECT ${PUBLIC_FIELDS} FROM users ORDER BY name`);
  res.json(rows);
}));

// GET /users/:id
router.get('/:id', asyncHandler(async (req, res) => {
  const [rows] = await pool.query(`SELECT ${PUBLIC_FIELDS} FROM users WHERE id = ?`, [req.params.id]);
  if (!rows.length) return res.status(404).json({ error: 'User not found' });
  res.json(rows[0]);
}));

// POST /users - add a user
router.post('/', asyncHandler(async (req, res) => {
  const { name, membership_id, role, password } = req.body;
  if (!name?.trim() || !membership_id?.trim()) {
    return res.status(400).json({ error: 'Name and membership ID are required' });
  }
  if (!ROLES.includes(role)) return res.status(400).json({ error: 'Role must be admin or member' });
  if (!password || password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }
  const hash = await bcrypt.hash(password, 10);
  const [result] = await pool.query(
    'INSERT INTO users (name, membership_id, role, password_hash) VALUES (?, ?, ?, ?)',
    [name.trim(), membership_id.trim(), role, hash]
  );
  const [rows] = await pool.query(`SELECT ${PUBLIC_FIELDS} FROM users WHERE id = ?`, [result.insertId]);
  res.status(201).json(rows[0]);
}));

// PUT /users/:id - update details (password only changes if one is sent)
router.put('/:id', asyncHandler(async (req, res) => {
  const { name, membership_id, role, password } = req.body;
  if (!name?.trim() || !membership_id?.trim()) {
    return res.status(400).json({ error: 'Name and membership ID are required' });
  }
  if (!ROLES.includes(role)) return res.status(400).json({ error: 'Role must be admin or member' });
  if (password && password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  let sql = 'UPDATE users SET name = ?, membership_id = ?, role = ?';
  const params = [name.trim(), membership_id.trim(), role];
  if (password) {
    sql += ', password_hash = ?';
    params.push(await bcrypt.hash(password, 10));
  }
  sql += ' WHERE id = ?';
  params.push(req.params.id);

  const [result] = await pool.query(sql, params);
  if (!result.affectedRows) return res.status(404).json({ error: 'User not found' });
  const [rows] = await pool.query(`SELECT ${PUBLIC_FIELDS} FROM users WHERE id = ?`, [req.params.id]);
  res.json(rows[0]);
}));

// DELETE /users/:id
router.delete('/:id', asyncHandler(async (req, res) => {
  const [result] = await pool.query('DELETE FROM users WHERE id = ?', [req.params.id]);
  if (!result.affectedRows) return res.status(404).json({ error: 'User not found' });
  res.json({ message: 'User deleted' });
}));

module.exports = router;
