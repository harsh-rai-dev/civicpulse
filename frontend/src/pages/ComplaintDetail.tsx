import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import PriorityBadge from '../components/PriorityBadge';
import StatusBadge from '../components/StatusBadge';
import { complaintService, voteService } from '../services/api';
import { Complaint } from '../types';

export default function ComplaintDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [voting, setVoting] = useState(false);
  const [confirmWithdraw, setConfirmWithdraw] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const token = localStorage.getItem('token');
  const currentUserId = localStorage.getItem('userId');
  const role = localStorage.getItem('role');

  const loadComplaint = async () => {
    try {
      const complaint = await complaintService.get(id!);
      setComplaint(complaint);
      setError(null);
    } catch (err: any) {
      setError('Unable to load this complaint record.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadComplaint(); }, [id]);

  const handleUpvote = async () => {
    if (!complaint || complaint.hasVoted) return;
    setVoting(true);
    try {
      await voteService.upvote(id!);
      await loadComplaint();
      setNotice('Support recorded successfully.');
    } catch (err: any) {
      setError('Unable to record your support.');
    } finally {
      setVoting(false);
    }
  };

  const handleWithdraw = async () => {
    setWithdrawing(true);
    try {
      await complaintService.delete(id!);
      navigate('/dashboard');
    } catch (err: any) {
      setError('Unable to withdraw this complaint.');
      setConfirmWithdraw(false);
    } finally {
      setWithdrawing(false);
    }
  };

  if (loading) return <div className="container section-padding" style={{ textAlign: 'center' }}>Loading complaint record...</div>;

  if (error && !complaint) {
    return (
      <div className="container section-padding">
        <div className="error-message" style={{ textAlign: 'center', padding: '2rem' }}>
          <p style={{ marginBottom: '1rem' }}>{error}</p>
          <Link to="/dashboard" className="btn btn-secondary">Back to Dashboard</Link>
        </div>
      </div>
    );
  }

  if (!complaint) return <div className="container section-padding" style={{ textAlign: 'center' }}>Complaint not found.</div>;

  const isOwner = !!currentUserId && complaint.user_id === currentUserId;
  const canWithdraw = isOwner || role === 'admin';

  return (
    <div className="detail-page">
      <div className="page-header">
        <div className="container">
          <Link to="/dashboard" style={{ color: 'var(--muted)', fontSize: '15px', display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            Back to Dashboard
          </Link>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '32px' }}>
            <div>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap' }}>
                <span className="badge badge-navy">{complaint.category}</span>
                <span style={{ fontSize: '14px', color: 'var(--muted)' }}>ID: {complaint.id.substring(0, 8).toUpperCase()}</span>
              </div>
              <h1 className="page-heading" style={{ marginBottom: '8px', fontSize: '32px' }}>{complaint.landmark}</h1>
              <p style={{ color: 'var(--muted)', fontSize: '16px' }}>
                Zone {complaint.zone} &bull; {complaint.block_division} &bull; Reported on {new Date(complaint.created_at).toLocaleDateString()}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
              {complaint.is_emergency && <span className="badge priority-critical">Emergency</span>}
              <StatusBadge status={complaint.status} />
            </div>
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: '32px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '48px' }}>
          <main>
            {notice && <div className="success-message" style={{ marginBottom: '32px' }}>{notice}</div>}

            <section style={{ marginBottom: '48px' }}>
              <h3 className="section-title" style={{ fontSize: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '24px' }}>Description</h3>
              <p style={{ fontSize: '17px', whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>{complaint.description}</p>
            </section>

            {complaint.image_path && (
              <section style={{ marginBottom: '48px' }}>
                <h3 className="section-title" style={{ fontSize: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '24px' }}>Evidence</h3>
                <img src={complaint.image_path} alt="Evidence" style={{ maxWidth: '100%', borderRadius: '10px', border: '1px solid var(--border)' }} />
              </section>
            )}

            {complaint.status === 'Resolved' && complaint.admin_reply && (
              <section className="card" style={{ backgroundColor: 'rgba(31, 138, 91, 0.03)', borderLeft: '4px solid #1F8A5B', padding: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1F8A5B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                  </svg>
                  <h3 style={{ margin: 0, fontSize: '18px', color: '#1F8A5B' }}>Official Resolution Note</h3>
                </div>
                <p style={{ fontSize: '16px', marginBottom: '12px', lineHeight: 1.6 }}>{complaint.admin_reply}</p>
                {complaint.resolved_at && (
                  <span style={{ fontSize: '13px', color: 'var(--muted)' }}>
                    Resolved on {new Date(complaint.resolved_at).toLocaleString()}
                  </span>
                )}
              </section>
            )}
          </main>

          <aside>
            <div className="card" style={{ position: 'sticky', top: '100px' }}>
              <h3 style={{ fontSize: '18px', marginBottom: '24px' }}>Metrics & Actions</h3>

              <div style={{ marginBottom: '24px' }}>
                <span className="label-small">Calculated Priority</span>
                <PriorityBadge level={complaint.priority_level} score={complaint.priority_score} showScore={true} />
              </div>

              <div style={{ marginBottom: '24px', padding: '16px', backgroundColor: 'var(--bg)', borderRadius: '10px' }}>
                <span className="label-small">Community Support</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '24px', fontWeight: '800', color: 'var(--navy)' }}>{complaint.voteCount || 0}</span>
                  <span style={{ fontSize: '14px', color: 'var(--muted)' }}>Total Upvotes</span>
                </div>

                {role !== 'admin' && !isOwner && (
                  <button
                    className={`btn ${complaint.hasVoted ? 'btn-navy' : 'btn-primary'}`}
                    style={{ width: '100%', marginTop: '16px', padding: '10px' }}
                    onClick={handleUpvote}
                    disabled={voting || !!complaint.hasVoted}
                  >
                    {complaint.hasVoted ? 'Supported' : 'Support Issue'}
                  </button>
                )}
              </div>

              <div style={{ marginBottom: '20px' }}>
                <span className="label-small">Last Activity</span>
                <span style={{ fontSize: '15px' }}>{new Date(complaint.updated_at || complaint.created_at).toLocaleDateString()}</span>
              </div>

              {canWithdraw && (
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '20px', marginTop: '20px' }}>
                  {confirmWithdraw ? (
                    <div style={{ backgroundColor: 'rgba(198, 61, 61, 0.05)', padding: '16px', borderRadius: '10px' }}>
                      <p style={{ fontSize: '13px', color: '#C63D3D', marginBottom: '12px' }}>Are you sure? This cannot be undone.</p>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn btn-danger" style={{ flex: 1, padding: '8px', fontSize: '13px' }} onClick={handleWithdraw} disabled={withdrawing}>Yes, Withdraw</button>
                        <button className="btn btn-secondary" style={{ flex: 1, padding: '8px', fontSize: '13px' }} onClick={() => setConfirmWithdraw(false)}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <button className="btn btn-ghost" style={{ width: '100%', color: '#C63D3D', borderColor: '#C63D3D' }} onClick={() => setConfirmWithdraw(true)}>
                      Withdraw Complaint
                    </button>
                  )}
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}