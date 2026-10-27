import { useState } from 'react';
import Flash from '../components/Flash.jsx';
import UserForm from '../components/UserForm.jsx';
import UserList from '../components/UserList.jsx';
import { api } from '../api.js';
import { useFetch, useFlash } from '../hooks.js';

// Admin view: add, update and delete users.
export default function UserManagement({ currentUser }) {
  const { data: users, loading, error, reload } = useFetch(api.getUsers);
  const [editing, setEditing] = useState(null);
  const [flash, setFlash] = useFlash();

  const handleSave = async (user) => {
    try {
      if (editing) {
        await api.updateUser(editing.id, user);
        setFlash({ type: 'success', text: `${user.name} updated` });
        setEditing(null);
      } else {
        await api.addUser(user);
        setFlash({ type: 'success', text: `${user.name} added` });
      }
      reload();
      return true;
    } catch (err) {
      setFlash({ type: 'error', text: err.message });
      return false;
    }
  };

  const handleDelete = async (user) => {
    if (!window.confirm(`Delete user ${user.name}?`)) return;
    try {
      await api.deleteUser(user.id);
      setFlash({ type: 'success', text: `${user.name} deleted` });
      if (editing?.id === user.id) setEditing(null);
      reload();
    } catch (err) {
      setFlash({ type: 'error', text: err.message });
    }
  };

  return (
    <section>
      <h1>User Management</h1>
      <Flash flash={flash} />
      <UserForm initialUser={editing} onSubmit={handleSave} onCancel={editing ? () => setEditing(null) : null} />

      <h2>All Users</h2>
      {loading && <p className="empty">Loading…</p>}
      {error && <div className="flash flash-error">{error}</div>}
      {!loading && !error && (
        <UserList
          users={users}
          currentUserId={currentUser.id}
          onEdit={(u) => {
            setEditing(u);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onDelete={handleDelete}
        />
      )}
    </section>
  );
}
