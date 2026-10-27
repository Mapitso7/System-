import { Navigate } from 'react-router-dom';

// Sends visitors to /login, and members away from admin-only pages.
export default function ProtectedRoute({ user, adminOnly = false, children }) {
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
}
