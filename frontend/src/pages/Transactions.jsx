import { useMemo, useState } from 'react';
import Flash from '../components/Flash.jsx';
import TransactionForm from '../components/TransactionForm.jsx';
import TransactionHistory from '../components/TransactionHistory.jsx';
import { api } from '../api.js';
import { useFetch, useFlash } from '../hooks.js';

export default function Transactions({ user }) {
  const isAdmin = user.role === 'admin';
  const books = useFetch(api.getBooks);
  const users = useFetch(api.getUsers);
  const history = useFetch(api.getTransactions);
  const [editing, setEditing] = useState(null);
  const [flash, setFlash] = useFlash();
  const [filters, setFilters] = useState({ type: '', search: '', mine: !isAdmin });

  const refresh = () => {
    books.reload();
    history.reload();
  };

  // Filter the history by type, by text, and (for members) to their own borrowing
  const shown = useMemo(() => {
    const q = filters.search.toLowerCase();
    return history.data.filter((t) =>
      (!filters.type || t.type === filters.type) &&
      (!filters.mine || t.user_id === user.id) &&
      (!q || [t.book_title, t.user_name, t.membership_id, t.note].some((f) => f?.toLowerCase().includes(q)))
    );
  }, [history.data, filters, user.id]);

  const handleSubmit = async (tx) => {
    try {
      if (editing) {
        const { newQuantity, transaction } = await api.updateTransaction(editing.id, tx);
        setFlash({ type: 'success', text: `Transaction updated — "${transaction.book_title}" now has ${newQuantity} in stock` });
        setEditing(null);
      } else {
        const { newQuantity, transaction } = await api.addTransaction(tx);
        const who = tx.type === 'borrow' ? ` to ${transaction.user_name}` : '';
        setFlash({
          type: 'success',
          text: `${tx.type === 'add' ? 'Added' : 'Lent'} ${tx.quantity}${who} — "${transaction.book_title}" now has ${newQuantity} in stock`,
        });
      }
      refresh();
      return true;
    } catch (err) {
      setFlash({ type: 'error', text: err.message });
      return false;
    }
  };

  const handleDelete = async (t) => {
    const undo = t.type === 'borrow' ? `return ${t.quantity} cop${t.quantity === 1 ? 'y' : 'ies'} to stock` : `remove ${t.quantity} from stock`;
    if (!window.confirm(`Delete this transaction? This will ${undo}.`)) return;
    try {
      const { newQuantity } = await api.deleteTransaction(t.id);
      setFlash({ type: 'success', text: `Transaction deleted — "${t.book_title}" now has ${newQuantity} in stock` });
      if (editing?.id === t.id) setEditing(null);
      refresh();
    } catch (err) {
      setFlash({ type: 'error', text: err.message });
    }
  };

  const setFilter = (name, value) => setFilters((prev) => ({ ...prev, [name]: value }));

  return (
    <section>
      <h1>Transactions</h1>
      <Flash flash={flash} />
      {books.error && <div className="flash flash-error">{books.error}</div>}

      <TransactionForm
        books={books.data}
        users={users.data}
        currentUser={user}
        initialTransaction={editing}
        onSubmit={handleSubmit}
        onCancel={editing ? () => setEditing(null) : null}
      />

      <h2>Transaction History</h2>
      <div className="toolbar">
        <input
          className="search"
          placeholder="Search by book, member or note…"
          value={filters.search}
          onChange={(e) => setFilter('search', e.target.value)}
        />
        <select value={filters.type} onChange={(e) => setFilter('type', e.target.value)}>
          <option value="">All types</option>
          <option value="borrow">Borrowed</option>
          <option value="add">Stock added</option>
        </select>
        <label className="checkbox">
          <input type="checkbox" checked={filters.mine} onChange={(e) => setFilter('mine', e.target.checked)} />
          Only mine
        </label>
      </div>

      {history.loading && <p className="empty">Loading…</p>}
      {history.error && <div className="flash flash-error">{history.error}</div>}
      {!history.loading && !history.error && (
        <TransactionHistory
          transactions={shown}
          onEdit={isAdmin ? (t) => { setEditing(t); window.scrollTo({ top: 0, behavior: 'smooth' }); } : null}
          onDelete={isAdmin ? handleDelete : null}
        />
      )}
    </section>
  );
}
