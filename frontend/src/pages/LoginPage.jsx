import { useNavigate } from 'react-router-dom';
import LoginForm from '../components/LoginForm.jsx';
import { api } from '../api.js';

export default function LoginPage({ onLogin }) {
  const navigate = useNavigate();

  // Returns an error message on failure, nothing on success
  const handleLogin = async (credentials) => {
    try {
      const user = await api.login(credentials);
      onLogin(user);
      navigate('/');
    } catch (err) {
      return err.message;
    }
  };

  return (
    <div className="login-page">
      <LoginForm onSubmit={handleLogin} />
    </div>
  );
}
