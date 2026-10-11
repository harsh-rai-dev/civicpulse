import React from 'react';
import { Link } from 'react-router-dom';

interface DashboardHeaderProps {
  onReportClick: () => void;
  onExploreClick: () => void;
}

export default function DashboardHeader({ onReportClick, onExploreClick }: DashboardHeaderProps) {
  const userName = localStorage.getItem('userName') || 'Citizen';

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="dashboard-header">
      <div className="container">
        <div style={{ maxWidth: '800px' }}>
          <span className="badge badge-teal">Citizen Dashboard</span>
          <h1 style={{ marginBottom: '12px' }}>
            {getGreeting()}, {userName}
          </h1>
          <p style={{ color: 'var(--muted)', marginBottom: '24px', fontSize: '17px' }}>
            Track your reports and explore civic issues in your community. Help prioritize urgent problems for municipal action.
          </p>

          <div className="dashboard-actions">
            <button className="btn btn-primary" onClick={onReportClick}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              <span>Report a Civic Issue</span>
            </button>
            <button className="btn btn-outline" onClick={onExploreClick}>
              Explore Community Issues
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}