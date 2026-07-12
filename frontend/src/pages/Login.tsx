import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: unknown) {
      setError(
        (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message ??
        'Invalid credentials. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-split">
      {/* Left panel */}
      <div className="auth-left">
        <div className="auth-left-glow-1" />
        <div className="auth-left-glow-2" />

        <div className="auth-brand">
          <div className="auth-logo-text">
            AUTO<span className="dot">VAULT</span>
          </div>
          <p className="auth-tagline">
            India's premium car dealership platform. Browse, search, and purchase vehicles from top brands.
          </p>
        </div>

        <div className="auth-features">
          {[
            { icon: '🚗', text: '13+ premium vehicles from top Indian & global brands' },
            { icon: '🔍', text: 'Smart sidebar filters by make, model, category & price' },
            { icon: '⚡', text: 'Real-time stock tracking with live purchase system' },
            { icon: '🛡️', text: 'Role-based access — secure JWT authentication' },
          ].map(f => (
            <div className="auth-feature" key={f.icon}>
              <div className="auth-feature-icon">{f.icon}</div>
              <span>{f.text}</span>
            </div>
          ))}
        </div>

        <div className="auth-showcase">
          {[
            { emoji: '🚙', label: 'SUV' },
            { emoji: '🚗', label: 'Sedan' },
            { emoji: '⚡', label: 'Electric' },
            { emoji: '🏎️', label: 'Sports' },
            { emoji: '🚘', label: 'Hatchback' },
            { emoji: '🛻', label: 'Truck' },
          ].map(c => (
            <div className="showcase-chip" key={c.label}>
              <span>{c.emoji}</span>
              <span>{c.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div className="auth-right">
        <div className="auth-form-box">
          <div className="auth-form-eyebrow">Welcome back</div>
          <div className="auth-form-title">Sign In</div>
          <div className="auth-form-sub">Enter your credentials to access your account</div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="login-email">Email Address</label>
              <input
                id="login-email"
                type="email"
                className="form-input"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoFocus
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="login-password">Password</label>
              <input
                id="login-password"
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>

            {error && <p className="form-error">⚠️ {error}</p>}

            <button
              id="login-submit"
              type="submit"
              className="btn btn-primary btn-full btn-lg"
              disabled={isLoading}
              style={{ marginTop: 4 }}
            >
              {isLoading ? '⏳ Signing in...' : 'Sign In →'}
            </button>
          </form>

          <div className="auth-footer">
            Don&apos;t have an account?{' '}
            <Link to="/register">Create one</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
