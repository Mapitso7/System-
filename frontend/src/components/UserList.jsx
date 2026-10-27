export default function UserList({ users, currentUserId, onEdit, onDelete }) {
  if (!users.length) return <p className="empty">No users yet.</p>;

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Membership ID</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td data-label="Name">{u.name}</td>
              <td data-label="Membership ID">{u.membership_id}</td>
              <td data-label="Role">
                <span className={u.role === 'admin' ? 'badge badge-admin' : 'badge badge-ok'}>{u.role}</span>
              </td>
              <td data-label="Actions" className="actions">
                <button className="btn btn-small" onClick={() => onEdit(u)}>Update</button>
                <button
                  className="btn btn-small btn-danger"
                  onClick={() => onDelete(u)}
                  disabled={u.id === currentUserId}
                  title={u.id === currentUserId ? "You can't delete yourself" : ''}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
