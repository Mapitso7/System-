import { useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Dashboard from './pages/Dashboard.jsx';
import BookManagement from './pages/BookManagement.jsx';
import Transactions from './pages/Transactions.jsx';
import UserManagement from './pages/UserManagement.jsx';
import LoginPage from './pages/LoginPage.jsx';

function loadSavedUser() {
  try {
    return JSON.parse(localStorage.getItem('libraryUser')) || null;
  } catch {
    return null;
  }
}

export default function App() {
  // Logged-in user lives in App state and is passed down as props
  const [user, setUser] = useState(loadSavedUser);

  const handleLogin = (u) => {
    setUser(u);
    localStorage.setItem('libraryUser', JSON.stringify(u));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('libraryUser');
  };

  return (
    <>
      {user && <Navbar user={user} onLogout={handleLogout} />}
      <main className="container">
        <Routes>
          <Route
            path="/login"
            element={user ? <Navigate to="/" replace /> : <LoginPage onLogin={handleLogin} />}
          />
          <Route path="/" element={<ProtectedRoute user={user}><Dashboard /></ProtectedRoute>} />
          <Route
            path="/books"
            element={<ProtectedRoute user={user} adminOnly><BookManagement /></ProtectedRoute>}
          />
          <Route
            path="/transactions"
            element={<ProtectedRoute user={user}><Transactions user={user} /></ProtectedRoute>}
          />
          <Route
            path="/users"
            element={<ProtectedRoute user={user} adminOnly><UserManagement currentUser={user} /></ProtectedRoute>}
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
}
