import React from 'react';
import { Link } from 'react-router-dom';
import PriorityBadge from './PriorityBadge';
import StatusBadge from './StatusBadge';

interface Complaint {
  id: string;
  zone: string;
  block_division?: string;
  landmark: string;
  category: string;
  description: string;
  is_emergency?: boolean;
  priority_level: string;
  priority_score: number;
  status: string;
  admin_reply?: string;
  resolved_at?: string;
  created_at: string;
  voteCount?: number;
  user_id?: string;
}

interface ComplaintCardProps {
  complaint: Complaint;
  isCommunity?: boolean;
  onUpvote?: (id: string) => void;
  currentUserVoted?: boolean;
}

export default function ComplaintCard({ complaint, isCommunity = false, onUpvote, currentUserVoted = false }: ComplaintCardProps) {
  const dateStr = new Date(complaint.created_at).toLocaleDateString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric'
  });

  return (
    <div className="complaint-card">
      <div className="complaint-card-header">
        <span className="badge badge-teal">{complaint.category}</span>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {complaint.is_emergency && (
            <span className="badge priority-critical">Emergency</span>
          )}
          <StatusBadge status={complaint.status} />
        </div>
      </div>

      <h3 className="complaint-card-title">{complaint.landmark}</h3>

      <p className="complaint-card-meta">
        Zone: {complaint.zone} {complaint.block_division && `• Block: ${complaint.block_division}`} • {dateStr}
      </p>

      <p style={{ fontSize: '15px', color: 'var(--navy)', marginBottom: '16px', lineHeight: 1.6 }}>
        {complaint.description.length > 120 ? complaint.description.substring(0, 120) + '...' : complaint.description}
      </p>

      {complaint.status === 'Resolved' && complaint.admin_reply && (
        <div style={{ backgroundColor: 'rgba(31, 138, 91, 0.06)', borderLeft: '3px solid #1F8A5B', padding: '10px 14px', borderRadius: '4px', marginBottom: '16px', fontSize: '13px' }}>
          <div style={{ fontWeight: '600', color: '#1F8A5B', marginBottom: '4px' }}>Official Resolution Note:</div>
          <div style={{ color: 'var(--navy)', lineHeight: 1.5 }}>{complaint.admin_reply}</div>
        </div>
      )}

      <div className="complaint-card-footer">
        <PriorityBadge level={complaint.priority_level} score={complaint.priority_score} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {isCommunity && onUpvote && (
            <button
              type="button"
              className={`btn ${currentUserVoted ? 'btn-navy' : 'btn-primary'}`}
              style={{ padding: '8px 14px', fontSize: '13px' }}
              onClick={() => !currentUserVoted && onUpvote(complaint.id)}
              disabled={currentUserVoted}
            >
              &#9650; {complaint.voteCount || 0}
            </button>
          )}

          {!isCommunity && (
            <span className="complaint-votes">
              &#9650; {complaint.voteCount || 0} votes
            </span>
          )}

          <Link to={`/complaint/${complaint.id}`} style={{ fontSize: '14px', fontWeight: '600', color: 'var(--primary)' }}>
            Details &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}