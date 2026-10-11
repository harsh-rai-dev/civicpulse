import { useState } from 'react';
import { authService } from '../services/api';
import { useNavigate, Link } from 'react-router-dom';
import { Building2, Users } from 'lucide-react';
import PasswordInput from '../components/PasswordInput';

interface LoginProps {
  onAuthSuccess?: () => void;
}

type RoleChoice = 'citizen' | 'admin';

export default function Login({ onAuthSuccess }: LoginProps) {
  const [role, setRole] = useState<RoleChoice | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Both email and password are required.');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await authService.login({ 
        email, 
        password, 
        portal: role === 'admin' ? 'official' : 'citizen' 
      });
      
      // Since authService.login returns res.data directly, res IS the response body
      const user = res.user;

      localStorage.setItem('token', res.token);
      localStorage.setItem('role', user.role);
      localStorage.setItem('userName', user.name);
      localStorage.setItem('userId', user.id);
      if (user.block_division) {
        localStorage.setItem('userBlock', user.block_division);
      }
      if (onAuthSuccess) {
        onAuthSuccess();
      }
      navigate(user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err: any) {
      if (err.response) {
        // API error
        setError(err.response?.data?.error || 'Login failed. Please check your credentials.');
      } else {
        // Processing error
        console.error('Login processing error:', err);
        setError('Logged in but failed to process response.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (!role) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-header">
            <h2>Choose your portal</h2>
            <p>Select how you would like to sign in</p>
          </div>

          <div className="role-options">
            <button
              type="button"
              className="role-card"
              onClick={() => setRole('citizen')}
            >
              <div className="role-icon teal">
                <Users size={24} />
              </div>
              <div className="role-info">
                <h3>Citizen Portal</h3>
                <p>Report issues and track status</p>
              </div>
              <svg className="role-chevron" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>

            <button
              type="button"
              className="role-card"
              onClick={() => setRole('admin')}
            >
              <div className="role-icon navy">
                <Building2 size={24} />
              </div>
              <div className="role-info">
                <h3>Municipal Authority</h3>
                <p>Review priority queue and dispatch</p>
              </div>
              <svg className="role-chevron" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </div>

          <p className="auth-footer">
            No account yet? <Link to="/register">Register as a citizen</Link>
          </p>
        </div>
      </div>
    );
  }

  const isAdmin = role === 'admin';

  return (
    <div className="auth-page">
      <div className="auth-card">
        <button
          type="button"
          className="btn btn-ghost"
          onClick={() => {
            setRole(null);
            setError(null);
          }}
          style={{ marginBottom: '16px', padding: '8px 16px', fontSize: '14px', width: 'fit-content' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}>
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Back to portal selection
        </button>

        <div className="auth-header">
          <h2>{isAdmin ? 'Official Sign In' : 'Citizen Sign In'}</h2>
          <p>{isAdmin ? 'Dispatch console for municipal authority.' : 'Sign in to report and track your civic complaints.'}</p>
        </div>

        {isAdmin && (
          <div style={{ backgroundColor: 'rgba(212, 138, 0, 0.1)', color: '#D48A00', padding: '1rem', borderRadius: '8px', marginBottom: '20px', fontSize: '14px' }}>
            <strong>Restricted:</strong> Authorized municipal officers only.
          </div>
        )}

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handle} className="auth-form">
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">{isAdmin ? 'Official Email' : 'Email'}</label>
            <input
              id="login-email"
              type="email"
              className="form-input"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
          </div>
            <div className="form-group">
              <label className="form-label" htmlFor="login-password">Password</label>
                <PasswordInput
                  id="login-password"
                  value={password}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />

            </div>


          {!isAdmin && (
            <div className="form-link">
              <Link to="/forgot-password">Forgot password?</Link>
            </div>
          )}

          <button type="submit" className="btn btn-primary btn-submit" disabled={submitting} style={{ width: '100%' }}>
            {submitting ? 'Verifying...' : 'Sign In'}
          </button>
        </form>

        {isAdmin && (
          <div style={{ marginTop: '24px', padding: '16px', backgroundColor: 'var(--bg)', borderRadius: '8px', fontSize: '13px', color: 'var(--muted)' }}>
            <strong>Demo:</strong> admin@civicpulse.gov.in / Admin@1234
          </div>
        )}

        <p className="auth-footer" style={{ marginTop: '24px' }}>
          No account yet? <Link to="/register">Register as a citizen</Link>
        </p>
      </div>
    </div>
  );
}