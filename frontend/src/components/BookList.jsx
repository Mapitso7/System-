import StockBadge from './StockBadge.jsx';
import { LOW_STOCK_LIMIT } from '../hooks.js';

// Table of books. Edit/Delete buttons appear only when handlers are passed.
export default function BookList({ books, onEdit, onDelete }) {
  if (!books.length) return <p className="empty">No books found.</p>;
  const editable = onEdit || onDelete;

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Author</th>
            <th>Genre</th>
            <th>ISBN</th>
            <th>Qty</th>
            <th>Status</th>
            {editable && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {books.map((b) => (
            <tr key={b.id} className={b.quantity < LOW_STOCK_LIMIT ? 'row-low' : ''}>
              <td data-label="Title">{b.title}</td>
              <td data-label="Author">{b.author}</td>
              <td data-label="Genre">{b.genre}</td>
              <td data-label="ISBN">{b.isbn}</td>
              <td data-label="Qty"><strong>{b.quantity}</strong></td>
              <td data-label="Status"><StockBadge quantity={b.quantity} /></td>
              {editable && (
                <td data-label="Actions" className="actions">
                  {onEdit && <button className="btn btn-small" onClick={() => onEdit(b)}>Update</button>}
                  {onDelete && (
                    <button className="btn btn-small btn-danger" onClick={() => onDelete(b)}>Delete</button>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
