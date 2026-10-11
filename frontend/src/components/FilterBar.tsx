import React from 'react';

interface FilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  zone: string;
  onZoneChange: (value: string) => void;
  blockDivision: string;
  onBlockDivisionChange: (value: string) => void;
  category: string;
  onCategoryChange: (value: string) => void;
  priority: string;
  onPriorityChange: (value: string) => void;
  status: string;
  onStatusChange: (value: string) => void;
  sort: string;
  onSortChange: (value: string) => void;
  onReset: () => void;
}

const CATEGORIES = ['All', 'Road', 'Garbage', 'Water', 'Electricity', 'Streetlight', 'Safety', 'Other'];
const ZONES = ['All', 'North', 'South', 'East', 'West', 'Central'];
const BLOCKS = ['All', 'Block A', 'Block B', 'Block C', 'Block D', 'Block E'];
const PRIORITIES = ['All', 'Critical', 'High', 'Medium', 'Low'];
const STATUSES = ['All', 'Pending', 'In Progress', 'Resolved'];

export default function FilterBar({
  search,
  onSearchChange,
  zone,
  onZoneChange,
  blockDivision,
  onBlockDivisionChange,
  category,
  onCategoryChange,
  priority,
  onPriorityChange,
  status,
  onStatusChange,
  sort,
  onSortChange,
  onReset,
}: FilterBarProps) {
  const hasActiveFilters = search || zone !== 'All' || blockDivision !== 'All' || category !== 'All' || priority !== 'All' || status !== 'All' || sort !== 'newest';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div style={{ flex: 1, minWidth: '280px' }}>
          <label className="label-small">Search</label>
          <div style={{ position: 'relative' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              type="text"
              className="form-input"
              placeholder="Search by keyword, address, or category..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              style={{ paddingLeft: '40px' }}
            />
            {search && (
              <button type="button" onClick={() => onSearchChange('')} aria-label="Clear search" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--muted)', fontSize: '18px', cursor: 'pointer', lineHeight: 1 }}>×</button>
            )}
          </div>
        </div>

        <div style={{ minWidth: '200px' }}>
          <label className="label-small">Sort by</label>
          <select className="form-input" value={sort} onChange={(e) => onSortChange(e.target.value)}>
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="priorityDesc">Highest Priority First</option>
            <option value="priorityAsc">Lowest Priority First</option>
          </select>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div className="form-group" style={{ flex: 1, minWidth: '160px', marginBottom: 0 }}>
          <label className="label-small">Zone</label>
          <select className="form-input" value={zone} onChange={(e) => onZoneChange(e.target.value)}>
            {ZONES.map((z) => (
              <option key={z} value={z}>{z === 'All' ? 'All Zones' : `Zone ${z}`}</option>
            ))}
          </select>
        </div>

        <div className="form-group" style={{ flex: 1, minWidth: '160px', marginBottom: 0 }}>
          <label className="label-small">Block</label>
          <select className="form-input" value={blockDivision} onChange={(e) => onBlockDivisionChange(e.target.value)}>
            {BLOCKS.map((b) => (
              <option key={b} value={b}>{b === 'All' ? 'All Blocks' : b}</option>
            ))}
          </select>
        </div>

        <div className="form-group" style={{ flex: 1, minWidth: '180px', marginBottom: 0 }}>
          <label className="label-small">Category</label>
          <select className="form-input" value={category} onChange={(e) => onCategoryChange(e.target.value)}>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat === 'All' ? 'All Categories' : cat}</option>
            ))}
          </select>
        </div>

        <div className="form-group" style={{ flex: 1, minWidth: '160px', marginBottom: 0 }}>
          <label className="label-small">Priority</label>
          <select className="form-input" value={priority} onChange={(e) => onPriorityChange(e.target.value)}>
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>{p === 'All' ? 'All Priorities' : p}</option>
            ))}
          </select>
        </div>

        <div className="form-group" style={{ flex: 1, minWidth: '160px', marginBottom: 0 }}>
          <label className="label-small">Status</label>
          <select className="form-input" value={status} onChange={(e) => onStatusChange(e.target.value)}>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s === 'All' ? 'All Statuses' : s}</option>
            ))}
          </select>
        </div>

        {hasActiveFilters && (
          <button type="button" className="btn btn-ghost" style={{ height: '44px', marginBottom: '0', padding: '0 16px' }} onClick={onReset}>
            Reset Filters
          </button>
        )}
      </div>
    </div>
  );
}