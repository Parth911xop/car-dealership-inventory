import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();

  if (!user) return null;

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        <Link to="/dashboard" className="navbar-brand">
          <span>🚘</span> AutoVault
        </Link>

        <div className="navbar-actions">
          {isAdmin && (
            <Link
              to="/admin"
              className={`btn btn-sm ${location.pathname === '/admin' ? 'btn-primary' : 'btn-secondary'}`}
              id="nav-admin-link"
            >
              ⚙️ Admin Panel
            </Link>
          )}
          <Link
            to="/dashboard"
            className={`btn btn-sm ${location.pathname === '/dashboard' ? 'btn-primary' : 'btn-secondary'}`}
            id="nav-dashboard-link"
          >
            🏠 Inventory
          </Link>

          <div className="navbar-user">
            <span>👤 {user.email.split('@')[0]}</span>
            <span className="role-badge">{user.role}</span>
          </div>

          <button id="logout-btn" className="btn btn-logout btn-sm" onClick={logout}>
            Sign out
          </button>
        </div>
      </div>
    </nav>
  );
}
