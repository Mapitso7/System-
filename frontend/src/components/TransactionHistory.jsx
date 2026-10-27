// Log of every stock movement, newest first. Edit/Delete shown when handlers are passed.
export default function TransactionHistory({ transactions, onEdit, onDelete }) {
  if (!transactions.length) return <p className="empty">No transactions found.</p>;
  const editable = onEdit || onDelete;

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Book</th>
            <th>Type</th>
            <th>Qty</th>
            <th>Borrower / Staff</th>
            <th>Note</th>
            {editable && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {transactions.map((t) => (
            <tr key={t.id}>
              <td data-label="Date">{new Date(t.created_at).toLocaleString()}</td>
              <td data-label="Book">{t.book_title}</td>
              <td data-label="Type">
                <span className={t.type === 'add' ? 'badge badge-ok' : 'badge badge-borrow'}>
                  {t.type === 'add' ? 'Stock added' : 'Borrowed'}
                </span>
              </td>
              <td data-label="Qty">{t.type === 'add' ? `+${t.quantity}` : `−${t.quantity}`}</td>
              <td data-label="Borrower / Staff">
                {t.user_name ? `${t.user_name} (${t.membership_id})` : '—'}
              </td>
              <td data-label="Note">{t.note || '—'}</td>
              {editable && (
                <td data-label="Actions" className="actions">
                  {onEdit && <button className="btn btn-small" onClick={() => onEdit(t)}>Update</button>}
                  {onDelete && (
                    <button className="btn btn-small btn-danger" onClick={() => onDelete(t)}>Delete</button>
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
