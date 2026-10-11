import React, { useEffect, useState, useMemo } from 'react';
import DashboardHeader from '../components/DashboardHeader';
import StatCard from '../components/StatCard';
import ReportForm from '../components/ReportForm';
import ComplaintCard from '../components/ComplaintCard';
import FilterBar from '../components/FilterBar';
import EmptyState from '../components/EmptyState';
import { complaintService, voteService } from '../services/api';
import { Complaint } from '../types';

export default function Dashboard() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [votedComplaintIds, setVotedComplaintIds] = useState<Set<string>>(new Set());
  const [communityScope, setCommunityScope] = useState<'my_block' | 'city_wide'>('my_block');

  const [search, setSearch] = useState('');
  const [zone, setZone] = useState('All');
  const [block, setBlock] = useState('All');
  const [category, setCategory] = useState('All');
  const [priority, setPriority] = useState('All');
  const [status, setStatus] = useState('All');
  const [sort, setSort] = useState('newest');

  const currentUserId = localStorage.getItem('userId');
  const userBlock = localStorage.getItem('userBlock') || localStorage.getItem('blockDivision') || 'Block A';

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const list = await complaintService.list();
      setComplaints(list);
      const votedIds = new Set<string>();
      list.forEach((c: Complaint) => { if (c.hasVoted) votedIds.add(c.id); });
      setVotedComplaintIds(votedIds);
      setError(null);
    } catch (err: any) {
      setError('Unable to load complaints. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchComplaints(); }, []);

  const myReports = useMemo(() => {
    return currentUserId ? complaints.filter(c => c.user_id === currentUserId) : [];
  }, [complaints, currentUserId]);

  const communityReports = useMemo(() => {
    let list = currentUserId ? complaints.filter(c => c.user_id !== currentUserId) : complaints;
    if (communityScope === 'my_block') {
      list = list.filter(c => !c.block_division || c.block_division === userBlock);
    }
    return list;
  }, [complaints, currentUserId, communityScope, userBlock]);

  const visibleReports = useMemo(() => {
    let list = communityReports;

    if (search) {
      const s = search.toLowerCase();
      list = list.filter(c =>
        c.description.toLowerCase().includes(s) ||
        c.landmark.toLowerCase().includes(s) ||
        c.category.toLowerCase().includes(s)
      );
    }

    const normalize = (val: string) => val.toLowerCase().replace(/_/g, ' ').trim();

    if (zone !== 'All') list = list.filter(c => normalize(c.zone) === normalize(zone));
    if (block !== 'All') list = list.filter(c => normalize(c.block_division || '') === normalize(block));
    if (category !== 'All') list = list.filter(c => normalize(c.category) === normalize(category));
    if (priority !== 'All') list = list.filter(c => normalize(c.priority_level) === normalize(priority));
    if (status !== 'All') list = list.filter(c => normalize(c.status) === normalize(status));

    return [...list].sort((a, b) => {
      switch (sort) {
        case 'oldest': return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'priorityDesc': return b.priority_score - a.priority_score;
        case 'priorityAsc': return a.priority_score - b.priority_score;
        case 'newest':
        default: return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });
  }, [communityReports, search, zone, block, category, priority, status, sort]);

  const stats = useMemo(() => {
    return {
      total: myReports.length,
      pending: myReports.filter(c => c.status === 'Pending').length,
      inProgress: myReports.filter(c => c.status === 'In Progress').length,
      resolved: myReports.filter(c => c.status === 'Resolved').length,
    };
  }, [myReports]);

  const handleUpvote = async (id: string) => {
    try {
      await voteService.upvote(id);
      setVotedComplaintIds(prev => new Set(prev).add(id));
      await fetchComplaints();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Unable to record vote.');
    }
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="dashboard-page">
      <DashboardHeader
        onReportClick={() => scrollToSection('report-section')}
        onExploreClick={() => scrollToSection('community-section')}
      />

      <div className="container" style={{ marginTop: '-40px', position: 'relative', zIndex: 20 }}>
        <div className="stats-row">
          <StatCard label="Total Reports" value={stats.total} variant="primary" description="Your submissions" />
          <StatCard label="Pending" value={stats.pending} variant="warning" description="Awaiting review" />
          <StatCard label="In Progress" value={stats.inProgress} variant="info" description="Action being taken" />
          <StatCard label="Resolved" value={stats.resolved} variant="success" description="Completed tasks" />
        </div>

        <section id="report-section" className="section-padding">
          <ReportForm onSuccess={fetchComplaints} />
        </section>

        <section className="section-padding" style={{ borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h2 className="section-title" style={{ fontSize: '28px', marginBottom: '8px' }}>My Reports</h2>
              <p style={{ color: 'var(--muted)', fontSize: '15px' }}>Track the progress of your submitted issues.</p>
            </div>
          </div>

          {myReports.length === 0 ? (
            <EmptyState title="No reports yet" description="You haven't submitted any civic reports." actionText="Report an Issue" onAction={() => scrollToSection('report-section')} />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' }}>
              {myReports.map(c => <ComplaintCard key={c.id} complaint={c} />)}
            </div>
          )}
        </section>

        <section id="community-section" className="section-padding" style={{ borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h2 className="section-title" style={{ fontSize: '28px', marginBottom: '8px' }}>Community Issues</h2>
              <p style={{ color: 'var(--muted)', fontSize: '15px' }}>Support existing reports to prioritize action.</p>
            </div>
            <div style={{ display: 'flex', gap: '8px', backgroundColor: 'var(--card)', padding: '4px', borderRadius: '10px', border: '1px solid var(--border)' }}>
              <button className={`btn ${communityScope === 'my_block' ? 'btn-primary' : 'btn-ghost'}`} style={{ padding: '8px 16px', fontSize: '14px' }} onClick={() => setCommunityScope('my_block')}>My Block ({userBlock})</button>
              <button className={`btn ${communityScope === 'city_wide' ? 'btn-primary' : 'btn-ghost'}`} style={{ padding: '8px 16px', fontSize: '14px' }} onClick={() => setCommunityScope('city_wide')}>City-Wide</button>
            </div>
          </div>

          <div className="card" style={{ marginBottom: '32px', padding: '20px' }}>
            <FilterBar search={search} onSearchChange={setSearch} zone={zone} onZoneChange={setZone} blockDivision={block} onBlockDivisionChange={setBlock} category={category} onCategoryChange={setCategory} priority={priority} onPriorityChange={setPriority} status={status} onStatusChange={setStatus} sort={sort} onSortChange={setSort} onReset={() => {setSearch(''); setZone('All'); setBlock('All'); setCategory('All'); setPriority('All'); setStatus('All'); setSort('newest');}} />
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>Loading...</div>
          ) : visibleReports.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <p style={{ marginBottom: '16px' }}>No issues match your filters.</p>
              <button className="btn btn-primary" onClick={() => {
                setSearch(''); setZone('All'); setBlock('All'); setCategory('All'); setPriority('All'); setStatus('All'); setSort('newest');
              }}>Reset Filters</button>
            </div>
          ) : (
            <>
              <p style={{ marginBottom: '16px', color: 'var(--muted)' }}>Showing {visibleReports.length} of {communityReports.length} issues</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' }}>
                {visibleReports.map(c => (
                  <ComplaintCard key={c.id} complaint={c} isCommunity={true} onUpvote={handleUpvote} currentUserVoted={votedComplaintIds.has(c.id)} />
                ))}
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}