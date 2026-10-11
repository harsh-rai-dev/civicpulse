import React from 'react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export default function EmptyState({
  title = 'No reports yet',
  description = 'Report your first civic issue and help improve your community.',
  actionText,
  onAction,
  icon,
}: EmptyStateProps) {
  return (
    <div style={{ textAlign: 'center', padding: '48px 24px' }}>
      <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'rgba(15, 143, 149, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', color: 'var(--primary)' }}>
        {icon || (
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
        )}
      </div>
      <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '8px', color: 'var(--navy)' }}>{title}</h3>
      <p style={{ color: 'var(--muted)', marginBottom: '24px', maxWidth: '360px', margin: '0 auto 24px', lineHeight: 1.6 }}>{description}</p>
      {actionText && onAction && (
        <button className="btn btn-primary" onClick={onAction}>
          {actionText}
        </button>
      )}
    </div>
  );
}