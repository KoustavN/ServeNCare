import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Send } from 'lucide-react';
import { auth as authApi } from '../api/client';
import './LoginPage.css';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authApi.forgotPassword(email);
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="login-page">
        <Link to="/login" className="back-to-home">
          <ArrowLeft size={20} /> Back to Login
        </Link>
        <div className="login-container" style={{ maxWidth: '480px' }}>
          <div className="login-form-section" style={{ width: '100%' }}>
            <div className="login-form-wrapper">
              <div className="form-header">
                <h2>Check your email</h2>
                <p>If an account exists with <strong>{email}</strong>, you will receive a password reset link shortly.</p>
              </div>
              <p className="login-success" style={{ color: 'var(--primary-green)', marginTop: '1rem' }}>
                In development, the reset link may be printed in the server console.
              </p>
              <Link to="/login" className="btn-primary" style={{ display: 'inline-flex', marginTop: '1.5rem', textDecoration: 'none' }}>
                Back to Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-page">
      <Link to="/login" className="back-to-home">
        <ArrowLeft size={20} /> Back to Login
      </Link>
      <div className="login-container" style={{ maxWidth: '480px' }}>
        <div className="login-form-section" style={{ width: '100%' }}>
          <div className="login-form-wrapper">
            <div className="form-header">
              <h2>Forgot password?</h2>
              <p>Enter your email and we'll send you a link to reset your password.</p>
            </div>
            {error && <p className="login-error">{error}</p>}
            <form onSubmit={handleSubmit} className="login-form">
              <div className="form-group">
                <label htmlFor="email">
                  <Mail size={18} /> Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  required
                />
              </div>
              <button type="submit" className="btn-primary login-btn" disabled={loading}>
                <Send size={20} /> {loading ? 'Sending…' : 'Send reset link'}
              </button>
            </form>
            <div className="signup-prompt" style={{ marginTop: '1.5rem' }}>
              <p>Remember your password? <Link to="/login">Sign In</Link></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
