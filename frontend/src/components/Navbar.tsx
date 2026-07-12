import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();

  if (!user) return null;

  return (
    <nav className="navbar">
      {/* Brand */}
      <div className="navbar-brand">
        <span>🚘</span>
        AUTO<span className="brand-dot">VAULT</span>
      </div>

      {/* Nav links */}
      <div className="navbar-nav">
        <Link
          to="/dashboard"
          id="nav-dashboard-link"
          className={`nav-btn ${location.pathname === '/dashboard' ? 'active' : ''}`}
        >
          Inventory
        </Link>
        {isAdmin && (
          <Link
            to="/admin"
            id="nav-admin-link"
            className={`nav-btn ${location.pathname === '/admin' ? 'active' : ''}`}
          >
            Admin Panel
          </Link>
        )}
      </div>

      {/* Right: user info + logout */}
      <div className="navbar-right">
        <div className="user-chip">
          <span style={{ fontSize: 12 }}>👤</span>
          <span style={{ fontSize: 12 }}>{user.email.split('@')[0]}</span>
          <span className={`role-badge ${user.role === 'USER' ? 'user-role' : ''}`}>
            {user.role}
          </span>
        </div>
        <button id="logout-btn" className="btn-logout" onClick={logout}>
          Sign out
        </button>
      </div>
    </nav>
  );
}
