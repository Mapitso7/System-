import { useEffect, useState } from 'react';

const emptyValues = (currentUser) => ({
  book_id: '',
  type: 'borrow',
  quantity: 1,
  user_id: currentUser.role === 'admin' ? '' : String(currentUser.id),
  note: '',
});

// Form to add stock (new arrivals) or deduct stock (borrowing).
// Also used to edit an existing transaction when initialTransaction is passed.
export default function TransactionForm({ books, users, currentUser, initialTransaction, onSubmit, onCancel }) {
  const isAdmin = currentUser.role === 'admin';
  const editing = Boolean(initialTransaction);
  const [values, setValues] = useState(() => emptyValues(currentUser));
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initialTransaction) {
      const t = initialTransaction;
      setValues({
        book_id: String(t.book_id),
        type: t.type,
        quantity: t.quantity,
        user_id: t.user_id ? String(t.user_id) : '',
        note: t.note || '',
      });
    } else {
      setValues(emptyValues(currentUser));
    }
    setError('');
  }, [initialTransaction, currentUser]);

  const selected = books.find((b) => String(b.id) === values.book_id);
  // Stock available for a borrow; when editing, the old transaction's effect is given back first
  let available = selected?.quantity ?? 0;
  if (editing && selected) {
    const t = initialTransaction;
    available += t.type === 'borrow' ? t.quantity : -t.quantity;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const setType = (type) => {
    setValues((prev) => ({
      ...prev,
      type,
      // Stock additions are recorded against the staff member doing them
      user_id: type === 'add' ? String(currentUser.id) : isAdmin ? '' : String(currentUser.id),
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const qty = Number(values.quantity);
    if (!values.book_id) return setError('Choose a book');
    if (!Number.isInteger(qty) || qty < 1) return setError('Quantity must be at least 1');
    if (values.type === 'borrow' && !values.user_id) return setError('Choose the member who is borrowing');
    if (values.type === 'borrow' && selected && qty > available) {
      return setError(`Only ${available} available`);
    }

    setSaving(true);
    const ok = await onSubmit({
      ...values,
      book_id: Number(values.book_id),
      user_id: values.user_id ? Number(values.user_id) : null,
      quantity: qty,
    });
    setSaving(false);
    if (ok && !editing) setValues((prev) => ({ ...emptyValues(currentUser), type: prev.type, user_id: prev.type === 'add' ? String(currentUser.id) : emptyValues(currentUser).user_id }));
  };

  return (
    <form className="card form" onSubmit={handleSubmit} noValidate>
      <h3>{editing ? `Edit Transaction #${initialTransaction.id}` : 'Record Transaction'}</h3>

      <div className="toggle-group">
        {isAdmin && (
          <button
            type="button"
            className={values.type === 'add' ? 'toggle active-add' : 'toggle'}
            onClick={() => setType('add')}
          >
            ＋ Add Stock
          </button>
        )}
        <button
          type="button"
          className={values.type === 'borrow' ? 'toggle active-borrow' : 'toggle'}
          onClick={() => setType('borrow')}
        >
          − Borrow (Deduct)
        </button>
      </div>

      <div className="form-grid">
        <label className="field">
          <span>Book</span>
          <select name="book_id" value={values.book_id} onChange={handleChange} disabled={editing}>
            <option value="">-- Select a book --</option>
            {books.map((b) => (
              <option key={b.id} value={b.id}>
                {b.title} ({b.quantity} in stock)
              </option>
            ))}
          </select>
        </label>

        {values.type === 'borrow' && (
          <label className="field">
            <span>Borrower</span>
            {isAdmin ? (
              <select name="user_id" value={values.user_id} onChange={handleChange}>
                <option value="">-- Select a member --</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.membership_id})
                  </option>
                ))}
              </select>
            ) : (
              <input value={`${currentUser.name} (${currentUser.membership_id})`} disabled />
            )}
          </label>
        )}

        <label className="field">
          <span>Quantity</span>
          <input name="quantity" type="number" min="1" value={values.quantity} onChange={handleChange} />
        </label>
        <label className="field field-wide">
          <span>Note (optional)</span>
          <input
            name="note"
            value={values.note}
            onChange={handleChange}
            placeholder={values.type === 'add' ? 'e.g. New delivery from supplier' : 'e.g. Due back in 2 weeks'}
          />
        </label>
      </div>

      {error && <p className="error-text">{error}</p>}
      <div className="form-actions">
        <button className="btn btn-primary" type="submit" disabled={saving}>
          {saving ? 'Saving…' : editing ? 'Save Changes' : values.type === 'add' ? 'Add Stock' : 'Deduct Stock'}
        </button>
        {onCancel && <button className="btn btn-outline" type="button" onClick={onCancel}>Cancel</button>}
      </div>
    </form>
  );
}
