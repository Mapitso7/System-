import { useState } from 'react';

export default function LoginForm({ onSubmit }) {
  const [values, setValues] = useState({ membership_id: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setValues((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!values.membership_id.trim() || !values.password) {
      return setError('Enter your membership ID and password');
    }
    setLoading(true);
    const err = await onSubmit(values);
    setLoading(false);
    if (err) setError(err);
  };

  return (
    <form className="card form login-card" onSubmit={handleSubmit} noValidate>
      <h2>Library Login</h2>
      <label className="field">
        <span>Membership ID</span>
        <input name="membership_id" value={values.membership_id} onChange={handleChange} autoFocus />
      </label>
      <label className="field">
        <span>Password</span>
        <input name="password" type="password" value={values.password} onChange={handleChange} />
      </label>
      {error && <p className="error-text">{error}</p>}
      <button className="btn btn-primary btn-block" type="submit" disabled={loading}>
        {loading ? 'Signing in…' : 'Login'}
      </button>
    </form>
  );
}
