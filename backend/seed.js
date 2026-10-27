// Creates the first admin account (run once after schema.sql): npm run seed
const bcrypt = require('bcryptjs');
const pool = require('./db');

async function seed() {
  const hash = await bcrypt.hash('admin123', 10);
  await pool.query(
    `INSERT INTO users (name, membership_id, role, password_hash)
     VALUES (?, ?, 'admin', ?)
     ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash)`,
    ['Library Admin', 'ADMIN001', hash]
  );
  console.log('Admin ready -> Membership ID: ADMIN001  Password: admin123');
  await pool.end();
}

seed().catch((err) => {
  console.error('Seeding failed:', err.message);
  process.exit(1);
});
