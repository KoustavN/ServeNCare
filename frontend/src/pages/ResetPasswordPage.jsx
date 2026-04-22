import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Lock, ArrowLeft, CheckCircle, Eye, EyeOff } from 'lucide-react';
import { auth as authApi } from '../api/client';
import './LoginPage.css';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!token) setError('Invalid reset link. Please request a new password reset.');
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      await authApi.resetPassword(token, password);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reset password. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="login-page">
        <Link to="/login" className="back-to-home">
          <ArrowLeft size={20} /> Back to Login
        </Link>
        <div className="login-container" style={{ maxWidth: '480px' }}>
          <div className="login-form-section" style={{ width: '100%' }}>
            <div className="login-form-wrapper">
              <div className="form-header">
                <div style={{ marginBottom: '1rem' }}>
                  <CheckCircle size={48} style={{ color: 'var(--primary-green)' }} />
                </div>
                <h2>Password reset</h2>
                <p>Your password has been updated. You can now sign in with your new password.</p>
              </div>
              <Link to="/login" className="btn-primary" style={{ display: 'inline-flex', marginTop: '1.5rem', textDecoration: 'none' }}>
                Sign In
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
              <h2>Set new password</h2>
              <p>Enter your new password below. It must be at least 6 characters.</p>
            </div>
            {error && <p className="login-error">{error}</p>}
            {!token ? (
              <p className="login-error">Missing reset token. Use the link from your email or <Link to="/forgot-password">request a new one</Link>.</p>
            ) : (
              <form onSubmit={handleSubmit} className="login-form">
                <div className="form-group">
                  <label htmlFor="password">
                    <Lock size={18} /> New Password
                  </label>
                  <div className="password-input-wrapper">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      minLength={6}
                      required
                    />
                    <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="confirmPassword">
                    <Lock size={18} /> Confirm Password
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    minLength={6}
                    required
                  />
                </div>
                <button type="submit" className="btn-primary login-btn" disabled={loading}>
                  {loading ? 'Resetting…' : 'Reset password'}
                </button>
              </form>
            )}
            <div className="signup-prompt" style={{ marginTop: '1.5rem' }}>
              <p>Remember your password? <Link to="/login">Sign In</Link></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
