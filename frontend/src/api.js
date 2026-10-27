// All communication with the Express backend goes through the Fetch API here.
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

async function request(path, options = {}) {
  let res;
  try {
    res = await fetch(`${API_URL}${path}`, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });
  } catch {
    throw new Error('Cannot reach the server. Is the backend running?');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

export const api = {
  // Books
  getBooks: () => request('/books'),
  addBook: (book) => request('/books', { method: 'POST', body: book }),
  updateBook: (id, book) => request(`/books/${id}`, { method: 'PUT', body: book }),
  deleteBook: (id) => request(`/books/${id}`, { method: 'DELETE' }),

  // Transactions
  getTransactions: () => request('/transactions'),
  addTransaction: (tx) => request('/transactions', { method: 'POST', body: tx }),
  updateTransaction: (id, tx) => request(`/transactions/${id}`, { method: 'PUT', body: tx }),
  deleteTransaction: (id) => request(`/transactions/${id}`, { method: 'DELETE' }),

  // Users
  login: (credentials) => request('/users/login', { method: 'POST', body: credentials }),
  getUsers: () => request('/users'),
  addUser: (user) => request('/users', { method: 'POST', body: user }),
  updateUser: (id, user) => request(`/users/${id}`, { method: 'PUT', body: user }),
  deleteUser: (id) => request(`/users/${id}`, { method: 'DELETE' }),
};
