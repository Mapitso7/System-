import { useState } from 'react';
import BookForm from '../components/BookForm.jsx';
import BookList from '../components/BookList.jsx';
import Flash from '../components/Flash.jsx';
import { api } from '../api.js';
import { useFetch, useFlash } from '../hooks.js';

export default function BookManagement() {
  const { data: books, loading, error, reload } = useFetch(api.getBooks);
  const [editing, setEditing] = useState(null);
  const [flash, setFlash] = useFlash();

  const handleAdd = async (book) => {
    try {
      await api.addBook(book);
      setFlash({ type: 'success', text: `"${book.title}" added` });
      reload();
      return true;
    } catch (err) {
      setFlash({ type: 'error', text: err.message });
      return false;
    }
  };

  const handleUpdate = async (book) => {
    try {
      await api.updateBook(editing.id, book);
      setFlash({ type: 'success', text: `"${book.title}" updated` });
      setEditing(null);
      reload();
      return true;
    } catch (err) {
      setFlash({ type: 'error', text: err.message });
      return false;
    }
  };

  const handleDelete = async (book) => {
    if (!window.confirm(`Delete "${book.title}"? Its transaction history will also be removed.`)) return;
    try {
      await api.deleteBook(book.id);
      setFlash({ type: 'success', text: `"${book.title}" deleted` });
      if (editing?.id === book.id) setEditing(null);
      reload();
    } catch (err) {
      setFlash({ type: 'error', text: err.message });
    }
  };

  return (
    <section>
      <h1>Book Management</h1>
      <Flash flash={flash} />

      {editing ? (
        <BookForm
          initialBook={editing}
          onSubmit={handleUpdate}
          onCancel={() => setEditing(null)}
          submitLabel="Save Changes"
        />
      ) : (
        <BookForm onSubmit={handleAdd} />
      )}

      <h2>All Books</h2>
      {loading && <p className="empty">Loading…</p>}
      {error && <div className="flash flash-error">{error}</div>}
      {!loading && !error && (
        <BookList
          books={books}
          onEdit={(b) => {
            setEditing(b);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onDelete={handleDelete}
        />
      )}
    </section>
  );
}
