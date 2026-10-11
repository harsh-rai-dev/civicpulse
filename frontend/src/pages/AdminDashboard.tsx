import React, { useEffect, useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import StatCard from '../components/StatCard';
import PriorityBadge from '../components/PriorityBadge';
import StatusBadge from '../components/StatusBadge';
import { adminService } from '../services/api';
import { Complaint, ComplaintStatus } from '../types';

const TAB_CONFIG = [
  { id: 'critical', label: 'Critical', emptyMessage: 'No critical complaints found.' },
  { id: 'pending', label: 'Pending', emptyMessage: 'No pending complaints found.' },
  { id: 'in-progress', label: 'In Progress', emptyMessage: 'No active tasks found.' },
  { id: 'resolved', label: 'Resolved', emptyMessage: 'No resolved complaints found.' },
] as const;

type TabId = typeof TAB_CONFIG[number]['id'];

const BLOCKS = ['All', 'Block A', 'Block B', 'Block C', 'Block D', 'Block E'];
const CATEGORIES = ['All', 'Road', 'Garbage', 'Water', 'Electricity', 'Streetlight', 'Safety', 'Other'];

export default function AdminDashboard() {
  const [searchParams, setSearchParams] = useSearchParams();
  const rawTab = (searchParams.get('tab') || 'critical').toLowerCase();
  const activeTabId: TabId = TAB_CONFIG.some(t => t.id === rawTab) ? (rawTab as TabId) : 'critical';

  const [stats, setStats] = useState<any>(null);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusUpdating, setStatusUpdating] = useState<string | null>(null);
  const [resolutionTarget, setResolutionTarget] = useState<Complaint | null>(null);
  const [resolutionNote, setResolutionNote] = useState('');
  const [resolutionError, setResolutionError] = useState<string | null>(null);
  const [banner, setBanner] = useState<{message: string, isError: boolean} | null>(null);

  const [selectedBlock, setSelectedBlock] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [search, setSearch] = useState('');

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [statsRes, complaintsRes] = await Promise.all([
        adminService.getStats(),
        adminService.getComplaints({}),
      ]);
      setStats(statsRes);
      setComplaints(complaintsRes);
      setError(null);
    } catch (err: any) {
      setError('Failed to load administrative records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAdminData(); }, []);

  const applyStatusChange = async (complaintId: string, newStatus: ComplaintStatus, adminReply?: string) => {
    try {
      setStatusUpdating(complaintId);
      if (newStatus === 'Resolved' && adminReply) {
        await adminService.resolve(complaintId, adminReply);
      } else {
        await adminService.updateStatus(complaintId, newStatus);
      }
      
      setComplaints(prev => prev.map(c => c.id === complaintId ? { 
        ...c, 
        status: newStatus, 
        admin_reply: adminReply || c.admin_reply,
        resolved_at: newStatus === 'Resolved' ? (c.resolved_at || new Date().toISOString()) : c.resolved_at
      } : c));
      
      setBanner({ message: 'Status updated successfully.', isError: false });
    } catch (err: any) {
      setBanner({ message: err.response?.data?.error || 'Status update failed.', isError: true });
    } finally {
      setStatusUpdating(null);
    }
  };

  const handleStatusSelect = (complaint: Complaint, newStatus: string) => {
    if (newStatus === complaint.status) return;
    if (newStatus === 'Resolved') {
      setResolutionTarget(complaint);
      setResolutionNote('');
      setResolutionError(null);
      return;
    }
    applyStatusChange(complaint.id, newStatus as ComplaintStatus);
  };

  const confirmResolution = async () => {
    if (!resolutionTarget || !resolutionNote.trim()) {
      setResolutionError('Resolution note is required.');
      return;
    }
    const target = resolutionTarget;
    const note = resolutionNote.trim();
    setResolutionTarget(null);
    setResolutionNote('');
    setResolutionError(null);
    await applyStatusChange(target.id, 'Resolved', note);
  };

  const cancelResolution = () => {
    setResolutionTarget(null);
    setResolutionNote('');
    setResolutionError(null);
    // Force re-render to revert the select element to the actual status
    setComplaints([...complaints]);
  };

  const filteredComplaints = useMemo(() => {
    let list = [...complaints];
    
    // Apply search and dropdown filters
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(c => 
        c.description.toLowerCase().includes(q) || 
        c.landmark.toLowerCase().includes(q) || 
        c.category.toLowerCase().includes(q) || 
        c.id.toLowerCase().includes(q)
      );
    }
    if (selectedBlock !== 'All') list = list.filter(c => c.block_division === selectedBlock);
    if (selectedCategory !== 'All') list = list.filter(c => c.category === selectedCategory);

    switch (activeTabId) {
      case 'critical':
        list = list.filter(c => (c.priority_level === 'Critical' || c.is_emergency) && c.status !== 'Resolved');
        break;
      case 'pending':
        list = list.filter(c => c.status === 'Pending');
        break;
      case 'in-progress':
        list = list.filter(c => c.status === 'In Progress');
        break;
      case 'resolved':
        list = list.filter(c => c.status === 'Resolved');
        break;
    }

    const priorityOrder: Record<string, number> = { 'Critical': 0, 'High': 1, 'Medium': 2, 'Low': 3 };
    list.sort((a, b) => {
      const pA = priorityOrder[a.priority_level] ?? 4;
      const pB = priorityOrder[b.priority_level] ?? 4;
      if (pA !== pB) return pA - pB;
      const vDiff = (b.voteCount || 0) - (a.voteCount || 0);
      if (vDiff !== 0) return vDiff;
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
    });

    return list;
  }, [complaints, activeTabId, search, selectedBlock, selectedCategory]);

  const tabCounts = useMemo(() => {
    return {
      'critical': complaints.filter(c => (c.priority_level === 'Critical' || c.is_emergency) && c.status !== 'Resolved').length,
      'pending': complaints.filter(c => c.status === 'Pending').length,
      'in-progress': complaints.filter(c => c.status === 'In Progress').length,
      'resolved': complaints.filter(c => c.status === 'Resolved').length,
    };
  }, [complaints]);

  const activeTabConfig = TAB_CONFIG.find(t => t.id === activeTabId) || TAB_CONFIG[0];

  return (
    <div className="admin-dashboard-page">
      <div className="page-header" style={{ backgroundColor: 'var(--navy)', color: '#fff', borderBottom: '1px solid var(--accent)' }}>
        <div className="container">
          <h1 className="page-heading" style={{ color: '#fff', marginBottom: '8px' }}>Dispatch Console</h1>
          <p style={{ color: '#94a3b8', fontSize: '18px' }}>Review priority complaints and manage municipal response.</p>
        </div>
      </div>

      <div className="container" style={{ marginTop: '-30px', position: 'relative', zIndex: 10 }}>
        {banner && (
          <div style={{ backgroundColor: banner.isError ? '#C63D3D' : '#1F8A5B', color: '#fff', padding: '12px 24px', borderRadius: '10px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{banner.message}</span>
            <button onClick={() => setBanner(null)} style={{ background: 'none', border: 'none', color: '#fff', fontWeight: 'bold', fontSize: '18px', lineHeight: 1, cursor: 'pointer' }}>×</button>
          </div>
        )}

        <div className="stats-row">
          <StatCard label="Critical" value={stats?.critical || 0} variant="warning" description="Immediate attention" />
          <StatCard label="High Prio" value={stats?.high || 0} variant="warning" description="High urgency" />
          <StatCard label="Pending" value={stats?.pending || 0} variant="primary" description="Awaiting review" />
          <StatCard label="In Progress" value={stats?.inProgress || 0} variant="info" description="Active tasks" />
          <StatCard label="Resolved" value={stats?.resolved || 0} variant="success" description="Completed" />
        </div>

        <div className="card" style={{ marginBottom: '32px', padding: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="label-small">Search</label>
              <input className="form-input" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search ID or text..." style={{ height: '44px' }} />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="label-small">Block</label>
              <select className="form-input" value={selectedBlock} onChange={e => setSelectedBlock(e.target.value)} style={{ height: '44px' }}>
                {BLOCKS.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="label-small">Category</label>
              <select className="form-input" value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} style={{ height: '44px' }}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
        </div>
        
        {/* Tab Bar */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', marginBottom: '20px', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            {TAB_CONFIG.map(tab => {
                const isActive = activeTabId === tab.id;
                const count = tabCounts[tab.id as keyof typeof tabCounts];
                return (
                    <button
                        key={tab.id}
                        onClick={() => setSearchParams({ tab: tab.id })}
                        style={{
                            padding: '12px 24px',
                            background: 'none',
                            border: 'none',
                            borderBottom: isActive ? '3px solid var(--teal)' : '3px solid transparent',
                            fontWeight: isActive ? '700' : '500',
                            color: isActive ? 'var(--navy)' : 'var(--muted)',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                            fontSize: '15px',
                            transition: 'all 0.2s ease',
                        }}
                    >
                        {tab.label} ({count})
                    </button>
                );
            })}
        </div>

        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 className="section-title" style={{ margin: 0, fontSize: '20px' }}>{activeTabConfig.label} Queue</h2>
            <button className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '13px' }} onClick={fetchAdminData}>Refresh</button>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Priority</th>
                  <th>Issue</th>
                  <th>Location</th>
                  <th>Votes</th>
                  <th>Reported</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredComplaints.length === 0 ? (
                  <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: 'var(--muted)', fontSize: '15px' }}>{activeTabConfig.emptyMessage}</td></tr>
                ) : (
                  filteredComplaints.map(c => (
                    <tr key={c.id} style={c.is_emergency ? { backgroundColor: 'rgba(198, 61, 61, 0.03)' } : {}}>
                      <td><PriorityBadge level={c.priority_level} score={c.priority_score} /></td>
                      <td>
                        <div style={{ fontWeight: '600', fontSize: '15px' }}>{c.category}</div>
                        <div style={{ fontSize: '13px', color: 'var(--muted)', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.description}</div>
                      </td>
                      <td>
                        <div style={{ fontSize: '14px' }}>{c.block_division}</div>
                        <div style={{ fontSize: '12px', color: 'var(--muted)' }}>Zone {c.zone} &bull; {c.landmark}</div>
                      </td>
                      <td style={{ fontWeight: '700' }}>&#9650; {c.voteCount || 0}</td>
                      <td style={{ fontSize: '13px' }}>{new Date(c.created_at).toLocaleDateString()}</td>
                      <td><StatusBadge status={c.status} /></td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <select
                            className="form-input"
                            style={{ height: '36px', padding: '0 10px', fontSize: '12px', width: '130px' }}
                            value={c.status}
                            onChange={(e) => handleStatusSelect(c, e.target.value)}
                            disabled={statusUpdating === c.id}
                          >
                            <option value="Pending">Pending</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Resolved">Resolved</option>
                          </select>
                          <Link to={`/complaint/${c.id}`} className="btn btn-secondary btn-sm">View</Link>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {resolutionTarget && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 39, 66, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div className="card" style={{ maxWidth: '500px', width: '100%', padding: '32px' }}>
            <h3 style={{ marginBottom: '8px' }}>Resolve Complaint</h3>
            <p style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: '24px' }}>Provide a brief resolution note for the citizen. This will be published on their dashboard.</p>

            {resolutionError && <div className="error-message" style={{ marginBottom: '16px' }}>{resolutionError}</div>}

            <div className="form-group">
              <label className="form-label">Official Response</label>
              <textarea
                className="form-input form-textarea"
                rows={4}
                value={resolutionNote}
                onChange={e => setResolutionNote(e.target.value)}
                placeholder="e.g. The requested repair has been completed by the local maintenance team."
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button className="btn btn-primary" onClick={confirmResolution} style={{ flex: 1 }} disabled={!resolutionNote.trim() || statusUpdating !== null}>Mark Resolved</button>
              <button className="btn btn-secondary" onClick={cancelResolution} style={{ flex: 1 }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
