import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setIsLoading(true);
    try {
      await register(email, password);
      navigate('/dashboard');
    } catch (err: unknown) {
      setError(
        (err as { response?: { data?: { error?: { message?: string } } } })?.response?.data?.error?.message ??
        'Registration failed. Please try again.'
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
            Join thousands of buyers exploring India's finest car inventory — from city hatchbacks to luxury SUVs.
          </p>
        </div>

        <div className="auth-features">
          {[
            { icon: '🚀', text: 'Get started in under 30 seconds — no credit card needed' },
            { icon: '🔎', text: 'Filter vehicles by brand, type, and your budget' },
            { icon: '📦', text: 'Real-time inventory — always know what\'s available' },
            { icon: '🔒', text: 'Your data is safe — bcrypt-hashed passwords + JWT' },
          ].map(f => (
            <div className="auth-feature" key={f.icon}>
              <div className="auth-feature-icon">{f.icon}</div>
              <span>{f.text}</span>
            </div>
          ))}
        </div>

        <div className="auth-showcase">
          {['Maruti Suzuki', 'Tata', 'Hyundai', 'Mahindra', 'Kia', 'Toyota'].map(brand => (
            <div className="showcase-chip" key={brand}>
              <span>🏷️</span>
              <span>{brand}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div className="auth-right">
        <div className="auth-form-box">
          <div className="auth-form-eyebrow">New here?</div>
          <div className="auth-form-title">Create Account</div>
          <div className="auth-form-sub">Fill in your details to get started</div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="register-email">Email Address</label>
              <input
                id="register-email"
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
              <label className="form-label" htmlFor="register-password">Password</label>
              <input
                id="register-password"
                type="password"
                className="form-input"
                placeholder="At least 6 characters"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="register-confirm">Confirm Password</label>
              <input
                id="register-confirm"
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                required
              />
            </div>

            {error && <p className="form-error">⚠️ {error}</p>}

            <button
              id="register-submit"
              type="submit"
              className="btn btn-primary btn-full btn-lg"
              disabled={isLoading}
              style={{ marginTop: 4 }}
            >
              {isLoading ? '⏳ Creating account...' : 'Create Account →'}
            </button>
          </form>

          <div className="auth-footer">
            Already have an account?{' '}
            <Link to="/login">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
