// Wraps async route handlers so rejected promises reach the error handler
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// Central error handler: turns DB errors into friendly JSON responses
function errorHandler(err, req, res, next) {
  console.error(err);
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ error: 'A record with that unique value already exists' });
  }
  if (err.code === 'ECONNREFUSED' || err.code === 'ER_ACCESS_DENIED_ERROR') {
    return res.status(500).json({ error: 'Cannot connect to the database' });
  }
  res.status(err.status || 500).json({ error: err.message || 'Server error' });
}

module.exports = { asyncHandler, errorHandler };
