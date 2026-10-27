import { useEffect, useState } from 'react';

const EMPTY = { title: '', author: '', genre: '', isbn: '', quantity: '' };

function validate(v) {
  const errors = {};
  if (!v.title.trim()) errors.title = 'Title is required';
  if (!v.author.trim()) errors.author = 'Author is required';
  if (!v.genre.trim()) errors.genre = 'Genre is required';
  const digits = v.isbn.replace(/-/g, '');
  if (!/^(\d{9}[\dX]|\d{13})$/i.test(digits)) errors.isbn = 'ISBN must be 10 or 13 digits';
  if (v.quantity === '' || !Number.isInteger(Number(v.quantity)) || Number(v.quantity) < 0) {
    errors.quantity = 'Enter a whole number (0 or more)';
  }
  return errors;
}

// Controlled form used both to add a new book and to edit an existing one.
export default function BookForm({ initialBook, onSubmit, onCancel, submitLabel = 'Add Book' }) {
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setValues(initialBook ? { ...initialBook, quantity: String(initialBook.quantity) } : EMPTY);
    setErrors({});
  }, [initialBook]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length) return;

    setSaving(true);
    const ok = await onSubmit({ ...values, quantity: Number(values.quantity) });
    setSaving(false);
    if (ok && !initialBook) setValues(EMPTY);
  };

  const field = (name, label, type = 'text', extra = {}) => (
    <label className="field">
      <span>{label}</span>
      <input
        name={name}
        type={type}
        value={values[name]}
        onChange={handleChange}
        className={errors[name] ? 'invalid' : ''}
        {...extra}
      />
      {errors[name] && <small className="error-text">{errors[name]}</small>}
    </label>
  );

  return (
    <form className="card form" onSubmit={handleSubmit} noValidate>
      <h3>{initialBook ? 'Edit Book' : 'Add New Book'}</h3>
      <div className="form-grid">
        {field('title', 'Title')}
        {field('author', 'Author')}
        {field('genre', 'Genre')}
        {field('isbn', 'ISBN', 'text', { placeholder: '978-0-13-235088-4' })}
        {field('quantity', initialBook ? 'Quantity' : 'Initial Quantity', 'number', { min: 0 })}
      </div>
      <div className="form-actions">
        <button className="btn btn-primary" type="submit" disabled={saving}>
          {saving ? 'Saving…' : submitLabel}
        </button>
        {onCancel && (
          <button className="btn btn-outline" type="button" onClick={onCancel}>Cancel</button>
        )}
      </div>
    </form>
  );
}
