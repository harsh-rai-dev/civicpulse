import { useState } from 'react';
import { authService } from '../services/api';
import { useNavigate, Link } from 'react-router-dom';
import PasswordInput from '../components/PasswordInput';

interface RegisterProps {
  onAuthSuccess?: () => void;
}

export default function Register({ onAuthSuccess }: RegisterProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [blockDivision, setBlockDivision] = useState('Block A');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await authService.register({ name, email, password, passwordConfirmation: confirm, block_division: blockDivision });
      
      localStorage.setItem('token', res.token);
      localStorage.setItem('role', res.user.role);
      localStorage.setItem('userName', res.user.name);
      localStorage.setItem('userId', res.user.id);
      localStorage.setItem('userBlock', res.user.block_division || blockDivision);
      
      if (onAuthSuccess) {
        onAuthSuccess();
      }
      navigate('/dashboard');
    } catch (err: any) {
      if (err.response) {
        setError(err.response?.data?.error || 'Registration failed');
      } else {
        console.error('Registration processing error:', err);
        setError('Registered but failed to process response.');
      }
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Create account</h2>
          <p>Help your community by providing accurate location details for reporting.</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handle} className="auth-form">
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              className="form-input"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Enter your full name"
              required
              autoComplete="name"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type='email'
              className="form-input"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="name@example.com"
              required
              autoComplete="email"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Municipal Block</label>
            <select
              className="form-input"
              value={blockDivision}
              onChange={e => setBlockDivision(e.target.value)}
              required
            >
              <option value="Block A">Block A</option>
              <option value="Block B">Block B</option>
              <option value="Block C">Block C</option>
              <option value="Block D">Block D</option>
              <option value="Block E">Block E</option>
            </select>
          </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <PasswordInput
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                placeholder="Min. 8 characters"
                required
                autoComplete="new-password"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <PasswordInput
                value={confirm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirm(e.target.value)}
                placeholder="Repeat password"
                required
                autoComplete="new-password"
              />
            </div>


          <button type='submit' className="btn btn-primary btn-submit" style={{ width: '100%' }}>Create Account</button>
        </form>

        <p className="auth-footer" style={{ marginTop: '24px' }}>
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}