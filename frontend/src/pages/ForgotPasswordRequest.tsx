import React, { useState } from 'react';
import { authService } from '../services/api';
import { useNavigate, Link } from 'react-router-dom';

export default function ForgotPasswordRequest() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return setError('Please enter your email address.');
    setLoading(true);
    setError(null);
    try {
      await authService.requestReset(email);
      setSuccess(
        'Verification code sent to your email. It expires in 5 minutes. Redirecting to the reset form...'
      );
      try {
        sessionStorage.setItem('resetEmail', email);
      } catch {
        /* sessionStorage unavailable; fallback below */
      }
      setTimeout(() => navigate('/reset-password', { state: { email } }), 1500);
    } catch (err: any) {
      if (err.response?.status === 429) {
        setError(err.response.data?.error || 'Too many requests. Please wait a moment and retry.');
      }
      setError(err.response?.data?.error || 'Unable to send verification code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Account Recovery</h2>
          <p>Enter your email to receive a municipal verification code.</p>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && (
          <div className="success-message">
            {success}
          </div>
        )}

        <form onSubmit={handleRequestCode} className="auth-form">
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
          <button type="submit" className="btn btn-primary btn-submit" disabled={loading} style={{ width: '100%' }}>
            {loading ? 'Processing...' : 'Send Verification Code'}
          </button>
          <div className="auth-footer" style={{ marginTop: '24px' }}>
            <Link to="/login">&larr; Back to Login</Link>
          </div>
        </form>
      </div>
    </div>
  );
}