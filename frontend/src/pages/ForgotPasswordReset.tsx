import React, { useState } from 'react';
import { authService } from '../services/api';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import PasswordInput from '../components/PasswordInput';

export default function ForgotPasswordReset() {
  const location = useLocation();
  const stateEmail = (location.state as any)?.email;
  const storedEmail = (() => {
    try {
      return sessionStorage.getItem('resetEmail') || '';
    } catch {
      return '';
    }
  })();
  const [email, setEmail] = useState(stateEmail || storedEmail);
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !newPassword || !confirmPassword) return setError('All fields are required.');
    if (newPassword !== confirmPassword) return setError('Passwords do not match.');
    setLoading(true);
    setError(null);
    try {
      await authService.resetPassword({ email, code, newPassword, confirmPassword });
      setSuccess('Password reset successfully! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to reset password. Please verify your code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Reset Password</h2>
          <p>Enter the 6-digit code from your email to set a new password.</p>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && (
          <div className="success-message">
            {success}
          </div>
        )}

        <form onSubmit={handleResetPassword} className="auth-form">
          <div className="form-group">
            <label className="form-label">Registered Email Address</label>
            <input
              type="email"
              className="form-input"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="citizen@example.com"
              required
              autoComplete="email"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Verification Code</label>
            <input
              type="text"
              className="form-input"
              value={code}
              onChange={e => setCode(e.target.value)}
              placeholder="6-digit code"
              maxLength={6}
              style={{ textAlign: 'center', letterSpacing: '4px', fontWeight: 700 }}
              required
              autoComplete="one-time-code"
            />
          </div>
          <div className="form-group">
            <label className="form-label">New Secure Password</label>
            <PasswordInput
              value={newPassword}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewPassword(e.target.value)}
              placeholder="Min 8 characters"
              required
              autoComplete="new-password"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Confirm New Password</label>
            <PasswordInput
              value={confirmPassword}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
              placeholder="Repeat new password"
              required
              autoComplete="new-password"
            />
          </div>
          <button type="submit" className="btn btn-primary btn-submit" disabled={loading} style={{ width: '100%' }}>
            {loading ? 'Updating Password...' : 'Reset Password'}
          </button>
          <div className="auth-footer" style={{ marginTop: '24px' }}>
            <Link to="/login">&larr; Back to Login</Link>
          </div>
        </form>
      </div>
    </div>
  );
}