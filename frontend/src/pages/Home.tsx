import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, Zap, CheckCircle } from 'lucide-react';

interface HomeProps {
  token?: string | null;
  role?: string | null;
}

export default function Home({ token, role }: HomeProps) {
  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-grid">
            <div>
              <span className="hero-badge">Smart Civic Service Platform</span>
              <h1>Report Issues.<br />Improve Your <span>City.</span></h1>
              <p>Report civic problems, help prioritize urgent issues through community support, and track progress from submission to resolution.</p>
              <div className="hero-buttons">
                <Link to={token ? (role === 'admin' ? '/admin' : '/dashboard') : '/login'} className="btn btn-primary">
                  Report a Civic Issue
                </Link>
                <Link to={token ? (role === 'admin' ? '/admin' : '/dashboard') : '/register'} className="btn btn-outline">
                  Explore Community Issues
                </Link>
              </div>
              <p className="hero-caption">Designed as an academic Smart City demonstration platform.</p>
            </div>
            <div>
              <div className="hero-stats-card">
                <div className="stat-row">
                  <div className="stat-box">
                    <div className="stat-value">128</div>
                    <div className="stat-label">Issues Reported</div>
                  </div>
                  <div className="stat-box">
                    <div className="stat-value">86</div>
                    <div className="stat-label">Resolved</div>
                  </div>
                  <div className="stat-box">
                    <div className="stat-value">42</div>
                    <div className="stat-label">In Progress</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section" id="capabilities">
        <div className="container">
          <div className="section-header">
            <span className="section-label">Platform Capabilities</span>
            <h2 className="section-title">Platform Capabilities</h2>
            <p className="section-subtitle">Everything needed to manage civic workflows in one place.</p>
          </div>
          <div className="capabilities-grid">
            <div className="capability-card">
              <div className="capability-icon teal">
                <Building2 size={24} />
              </div>
              <h3>Report Civic Issues</h3>
              <p>Submit structured reports with location, category, description, and optional photographic evidence.</p>
            </div>
            <div className="capability-card">
              <div className="capability-icon gold">
                <Zap size={24} />
              </div>
              <h3>Smart Priority</h3>
              <p>Severity signals and community support help identify issues that need attention first.</p>
            </div>
            <div className="capability-card">
              <div className="capability-icon green">
                <CheckCircle size={24} />
              </div>
              <h3>Track Resolution</h3>
              <p>Follow complaint progress from Pending to In Progress to Resolved with official notes.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="section how-it-works" id="how-it-works">
        <div className="container">
          <div className="section-header">
            <span className="section-label">How It Works</span>
            <h2 className="section-title">How It Works</h2>
            <p className="section-subtitle">A transparent process from incident report to resolution.</p>
          </div>
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">01</div>
              <h3>Report</h3>
              <p>Citizens submit local issues with clear location markers and context.</p>
            </div>
            <div className="step-card">
              <div className="step-number">02</div>
              <h3>Prioritize</h3>
              <p>Severity checks and citizen upvotes deterministically prioritize urgency.</p>
            </div>
            <div className="step-card">
              <div className="step-number">03</div>
              <h3>Resolve</h3>
              <p>Municipal authorities inspect, resolve, and report back to the public.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Community Section */}
      <section className="section">
        <div className="container" style={{ display: 'flex', alignItems: 'center', gap: '64px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '300px' }}>
            <h2 className="section-title" style={{ textAlign: 'left', marginBottom: '16px', fontSize: '32px' }}>Community-Driven Action</h2>
            <p style={{ color: 'var(--muted)', fontSize: '16px', marginBottom: '24px', maxWidth: '520px' }}>
              Support existing reports instead of creating duplicates. Upvoting signals demand to administrators and elevates community importance.
            </p>
            <Link to="/register" className="btn btn-primary">Join the Community</Link>
          </div>
          <div style={{ flex: 1, minWidth: '300px' }}>
            <div className="card" style={{ borderLeft: '4px solid #C63D3D' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                <span className="badge" style={{ backgroundColor: 'rgba(198, 61, 61, 0.1)', color: '#C63D3D' }}>Critical Severity</span>
                <span className="badge" style={{ backgroundColor: 'rgba(15, 143, 149, 0.1)', color: 'var(--primary)' }}>In Progress</span>
              </div>
              <h4 style={{ marginBottom: '8px' }}>Open Drain Hazard Near School Gate</h4>
              <p style={{ fontSize: '14px', color: 'var(--muted)', marginBottom: '16px' }}>
                Zone 4 &bull; Block C &bull; Landmark: St. Jude Primary Entrance
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '16px', flexWrap: 'wrap', gap: '8px' }}>
                <span style={{ fontSize: '14px', fontWeight: '600', color: 'var(--primary)' }}>&#9650; 42 Community Upvotes</span>
                <span style={{ fontSize: '13px', color: 'var(--muted)' }}>Sample Report</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}