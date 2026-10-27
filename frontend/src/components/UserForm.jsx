import { useEffect, useState } from 'react';

const EMPTY = { name: '', membership_id: '', role: 'member', password: '' };

// Controlled form to add or update a user.
export default function UserForm({ initialUser, onSubmit, onCancel }) {
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const editing = Boolean(initialUser);

  useEffect(() => {
    setValues(initialUser ? { ...initialUser, password: '' } : EMPTY);
    setErrors({});
  }, [initialUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const validate = () => {
    const errs = {};
    if (!values.name.trim()) errs.name = 'Name is required';
    if (!values.membership_id.trim()) errs.membership_id = 'Membership ID is required';
    if (!editing && values.password.length < 6) errs.password = 'At least 6 characters';
    if (editing && values.password && values.password.length < 6) errs.password = 'At least 6 characters';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setSaving(true);
    const { name, membership_id, role, password } = values;
    const ok = await onSubmit({ name, membership_id, role, password });
    setSaving(false);
    if (ok && !editing) setValues(EMPTY);
  };

  return (
    <form className="card form" onSubmit={handleSubmit} noValidate>
      <h3>{editing ? 'Update User' : 'Add New User'}</h3>
      <div className="form-grid">
        <label className="field">
          <span>Name</span>
          <input name="name" value={values.name} onChange={handleChange} className={errors.name ? 'invalid' : ''} />
          {errors.name && <small className="error-text">{errors.name}</small>}
        </label>
        <label className="field">
          <span>Membership ID</span>
          <input
            name="membership_id"
            value={values.membership_id}
            onChange={handleChange}
            className={errors.membership_id ? 'invalid' : ''}
          />
          {errors.membership_id && <small className="error-text">{errors.membership_id}</small>}
        </label>
        <label className="field">
          <span>Role</span>
          <select name="role" value={values.role} onChange={handleChange}>
            <option value="member">Member</option>
            <option value="admin">Admin</option>
          </select>
        </label>
        <label className="field">
          <span>{editing ? 'New Password (leave blank to keep)' : 'Password'}</span>
          <input
            name="password"
            type="password"
            value={values.password}
            onChange={handleChange}
            className={errors.password ? 'invalid' : ''}
          />
          {errors.password && <small className="error-text">{errors.password}</small>}
        </label>
      </div>
      <div className="form-actions">
        <button className="btn btn-primary" type="submit" disabled={saving}>
          {saving ? 'Saving…' : editing ? 'Update User' : 'Add User'}
        </button>
        {onCancel && <button className="btn btn-outline" type="button" onClick={onCancel}>Cancel</button>}
      </div>
    </form>
  );
}
