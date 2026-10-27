import { useMemo, useState } from 'react';
import BookList from '../components/BookList.jsx';
import StockBadge from '../components/StockBadge.jsx';
import { api } from '../api.js';
import { useFetch, LOW_STOCK_LIMIT } from '../hooks.js';

export default function Dashboard() {
  const { data: books, loading, error } = useFetch(api.getBooks);
  const [view, setView] = useState('cards');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return books.filter((b) =>
      [b.title, b.author, b.genre, b.isbn].some((f) => f.toLowerCase().includes(q))
    );
  }, [books, search]);

  const stats = useMemo(() => ({
    titles: books.length,
    copies: books.reduce((sum, b) => sum + b.quantity, 0),
    low: books.filter((b) => b.quantity < LOW_STOCK_LIMIT).length,
  }), [books]);

  const lowStock = books.filter((b) => b.quantity < LOW_STOCK_LIMIT);

  return (
    <section>
      <h1>Dashboard</h1>

      <div className="stats">
        <div className="stat"><span>{stats.titles}</span>Book titles</div>
        <div className="stat"><span>{stats.copies}</span>Copies in stock</div>
        <div className="stat stat-warn"><span>{stats.low}</span>Low stock (&lt; {LOW_STOCK_LIMIT})</div>
      </div>

      {lowStock.length > 0 && (
        <div className="alert">
          ⚠️ <strong>Low stock:</strong> {lowStock.map((b) => `${b.title} (${b.quantity})`).join(', ')}
        </div>
      )}

      <div className="toolbar">
        <input
          className="search"
          placeholder="Search by title, author, genre or ISBN…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="toggle-group compact">
          <button className={view === 'cards' ? 'toggle active-add' : 'toggle'} onClick={() => setView('cards')}>Cards</button>
          <button className={view === 'table' ? 'toggle active-add' : 'toggle'} onClick={() => setView('table')}>Table</button>
        </div>
      </div>

      {loading && <p className="empty">Loading books…</p>}
      {error && <div className="flash flash-error">{error}</div>}

      {!loading && !error && (view === 'table' ? (
        <BookList books={filtered} />
      ) : (
        <div className="book-grid">
          {filtered.map((b) => (
            <article key={b.id} className={b.quantity < LOW_STOCK_LIMIT ? 'book-card low' : 'book-card'}>
              <h3>{b.title}</h3>
              <p className="muted">{b.author}</p>
              <p className="genre">{b.genre}</p>
              <div className="book-card-footer">
                <span className="qty">{b.quantity} <small>copies</small></span>
                <StockBadge quantity={b.quantity} />
              </div>
            </article>
          ))}
          {!filtered.length && <p className="empty">No books match your search.</p>}
        </div>
      ))}
    </section>
  );
}
