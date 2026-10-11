import React, { useState } from 'react';
import { Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import Home from './pages/Home';
import ForgotPasswordRequest from './pages/ForgotPasswordRequest';
import ForgotPasswordReset from './pages/ForgotPasswordReset';
import Dashboard from './pages/Dashboard';
import ReportIssue from './pages/ReportIssue';
import ComplaintDetail from './pages/ComplaintDetail';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  const location = useLocation();
  const [session, setSession] = React.useState({
    token: localStorage.getItem('token'),
    role: localStorage.getItem('role')
  });
  const [navOpen, setNavOpen] = useState(false);

  React.useEffect(() => {
    const handleStorage = () => {
      setSession({
        token: localStorage.getItem('token'),
        role: localStorage.getItem('role')
      });
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const refreshSession = () => {
    setSession({
      token: localStorage.getItem('token'),
      role: localStorage.getItem('role')
    });
  };

  const handleLogout = () => {
    localStorage.clear();
    refreshSession();
    window.location.href = '/';
  };

  const { token, role } = session;

  const renderHeader = () => {
    const isActive = (path: string) => location.pathname === path;

    return (
      <header className="site-header">
        <div className="container header-inner">
          <Link to="/" className="logo">
            <div className="logo-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
              </svg>
            </div>
            <div className="logo-text">
              <span className="logo-title">CivicPulse</span>
              <span className="logo-tagline">SMART CIVIC MANAGEMENT</span>
            </div>
          </Link>

          <nav className="main-nav" role="navigation" aria-label="Main navigation">
            <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>Home</Link>
            {!token && (
              <>
                <a href="/#how-it-works" className="nav-link">How It Works</a>
                <Link to="/login" className="nav-link">Community Issues</Link>
              </>
            )}
            {token && role === 'admin' && (
              <Link to="/admin" className={`nav-link ${isActive('/admin') ? 'active' : ''}`}>Dispatch Console</Link>
            )}
            {token && role !== 'admin' && (
              <>
                <Link to="/dashboard" className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}>Dashboard</Link>
                <Link to="/report" className={`nav-link ${isActive('/report') ? 'active' : ''}`}>Report Issue</Link>
              </>
            )}
          </nav>

          <div className="auth-nav">
            {token ? (
              <button className="btn btn-navy" onClick={handleLogout}>Logout</button>
            ) : (
              <>
                <Link to="/login" className="nav-link-text">Login</Link>
                <Link to="/register" className="btn btn-primary">Register</Link>
              </>
            )}
          </div>

          <button
            className="hamburger"
            onClick={() => setNavOpen(!navOpen)}
            aria-expanded={navOpen}
            aria-controls="main-nav"
            aria-label={navOpen ? 'Close menu' : 'Open menu'}
          >
            <span className={navOpen ? 'open' : ''}></span>
            <span className={navOpen ? 'open' : ''}></span>
            <span className={navOpen ? 'open' : ''}></span>
          </button>
        </div>
      </header>
    );
  };

  return (
    <div className="app-shell">
      {renderHeader()}
      
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home token={token} role={role} />} />
          <Route path="/register" element={<Register onAuthSuccess={refreshSession} />} />
          <Route path="/login" element={<Login onAuthSuccess={refreshSession} />} />
          <Route path="/forgot-password" element={<ForgotPasswordRequest />} />
          <Route path="/reset-password" element={<ForgotPasswordReset />} />
          <Route
            path="/dashboard"
            element={
              !token ? (
                <Navigate to="/login" />
              ) : role === 'admin' ? (
                <Navigate to="/admin" replace />
              ) : (
                <Dashboard />
              )
            }
          />
          <Route
            path="/report"
            element={
              !token ? (
                <Navigate to="/login" />
              ) : role === 'admin' ? (
                <Navigate to="/admin" replace />
              ) : (
                <ReportIssue />
              )
            }
          />
          <Route path="/complaint/:id" element={token ? <ComplaintDetail /> : <Navigate to="/login" />} />
          <Route path="/admin" element={token && role === 'admin' ? <AdminDashboard /> : <Navigate to="/login" />} />
        </Routes>
      </main>

      <footer className="site-footer">
        <div className="container footer-grid">
          <div className="footer-brand">
            <span className="footer-logo">CivicPulse</span>
            <p>Smart Civic Complaint & Priority Management</p>
          </div>
          <nav className="footer-links" aria-label="Footer navigation">
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><a href="/#how-it-works">How It Works</a></li>
              <li><Link to="/login">Community Issues</Link></li>
              <li><Link to="/register">Register</Link></li>
            </ul>
          </nav>
          <div className="footer-info">
            <h4>Project Info</h4>
            <p>Academic Demonstration Project</p>
            <p>&copy; 2026 CivicPulse Team</p>
            <p>Built for faculty-facing evaluation</p>
          </div>
        </div>
        <div className="container footer-bottom">
          <p>Academic Demonstration Project &copy; 2026 CivicPulse Team</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
