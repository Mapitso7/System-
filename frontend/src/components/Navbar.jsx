import { useState } from 'react';
import { NavLink } from 'react-router-dom';

export default function Navbar({ user, onLogout }) {
  const [open, setOpen] = useState(false);
  const isAdmin = user.role === 'admin';

  const links = [
    { to: '/', label: 'Dashboard' },
    ...(isAdmin ? [{ to: '/books', label: 'Book Management' }] : []),
    { to: '/transactions', label: 'Transactions' },
    ...(isAdmin ? [{ to: '/users', label: 'User Management' }] : []),
  ];

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <span className="brand">LibraryMS</span>
        <button className="menu-toggle" onClick={() => setOpen(!open)} aria-label="Toggle menu">
          ☰
        </button>
        <nav className={open ? 'nav-links open' : 'nav-links'}>
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end onClick={() => setOpen(false)}>
              {l.label}
            </NavLink>
          ))}
          <span className="nav-user">
            {user.name} <small>({user.role})</small>
          </span>
          <button className="btn btn-outline" onClick={onLogout}>Logout</button>
        </nav>
      </div>
    </header>
  );
}
