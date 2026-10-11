import React from 'react';
import ReportForm from '../components/ReportForm';
import { useNavigate } from 'react-router-dom';

export default function ReportIssue() {
  const navigate = useNavigate();

  return (
    <div className="report-issue-page">
      <div className="page-header">
        <div className="container">
          <span className="badge badge-teal">Digital Dispatch</span>
          <h1 className="page-heading">Report a Civic Issue</h1>
          <p className="page-subtitle">Help your community identify and resolve local problems by providing accurate location details and issue context.</p>
        </div>
      </div>

      <div className="container section-padding">
        <ReportForm onSuccess={() => navigate('/dashboard')} />
      </div>
    </div>
  );
}