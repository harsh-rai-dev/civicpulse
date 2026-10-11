import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import PriorityBadge from './PriorityBadge';
import { complaintService } from '../services/api';
import api from '../services/api';

interface ReportFormProps {
  onSuccess: (complaint: any) => void;
}

const CATEGORIES = ['Road', 'Garbage', 'Water', 'Electricity', 'Streetlight', 'Safety', 'Other'];
const ZONES = ['North', 'South', 'East', 'West', 'Central', 'Downtown', 'Suburbs'];
const BLOCKS = ['Block A', 'Block B', 'Block C', 'Block D', 'Block E'];

interface PriorityPreview {
  score: number;
  level: string;
  terms: string[];
}

export default function ReportForm({ onSuccess }: ReportFormProps) {
  const [category, setCategory] = useState('');
  const [zone, setZone] = useState('');
  const [blockDivision, setBlockDivision] = useState(localStorage.getItem('userBlock') || 'Block A');
  const [landmark, setLandmark] = useState('');
  const [description, setDescription] = useState('');
  const [isEmergency, setIsEmergency] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedComplaint, setSubmittedComplaint] = useState<any | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const token = localStorage.getItem('token');
  const [priorityEstimate, setPriorityEstimate] = useState<PriorityPreview | null>(null);

  useEffect(() => {
    if (!token || (!description.trim() && !isEmergency)) {
      setPriorityEstimate(null);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await api.post('/api/priority/preview', { description, is_emergency: isEmergency });
        setPriorityEstimate(res.data);
      } catch {
        setPriorityEstimate(null);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [description, isEmergency, token]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category || !zone || !landmark || !description) {
      setError('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const payload = { category, zone, block_division: blockDivision, landmark, description, is_emergency: isEmergency, image_path: imagePreview || undefined };
      const res = await complaintService.create(payload as any);
      setSubmittedComplaint(res);
      setCategory(''); setZone(''); setLandmark(''); setDescription(''); setIsEmergency(false); setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      onSuccess(res);
    } catch (err: any) {
      console.error('Complaint submission error:', err);
      const message = err.response?.data?.error || err.message || 'Failed to submit complaint';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="report-form-section" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="card" style={{ padding: '32px' }}>
        <div style={{ marginBottom: '32px' }}>
          <h2 className="section-title" style={{ fontSize: '24px', marginBottom: '8px' }}>Report a Civic Issue</h2>
          <p style={{ color: 'var(--muted)' }}>Help your community identify and resolve local problems.</p>
        </div>

        {error && <div className="error-message" style={{ marginBottom: '24px' }}>{error}</div>}

        {submittedComplaint && (
          <div className="success-message" style={{ marginBottom: '32px' }}>
            <h4 style={{ color: '#1F8A5B', marginBottom: '8px' }}>Complaint Registered Successfully</h4>
            <p style={{ fontSize: '15px', marginBottom: '16px' }}>Tracking ID: <strong>{submittedComplaint.id}</strong></p>
            <div style={{ display: 'flex', gap: '12px' }}>
              <Link to={`/complaint/${submittedComplaint.id}`} className="btn btn-primary" style={{ padding: '10px 16px', fontSize: '14px' }}>View Details</Link>
              <button onClick={() => setSubmittedComplaint(null)} className="btn btn-outline" style={{ padding: '10px 16px', fontSize: '14px' }}>Report Another</button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ fontSize: '16px', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>Location</h3>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Zone</label>
                <select className="form-input" value={zone} onChange={e => setZone(e.target.value)} required>
                  <option value="">Select Zone</option>
                  {ZONES.map(z => <option key={z} value={z}>{z}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Municipal Block</label>
                <select className="form-input" value={blockDivision} onChange={e => setBlockDivision(e.target.value)} required>
                  {BLOCKS.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Landmark / Address</label>
              <input className="form-input" value={landmark} onChange={e => setLandmark(e.target.value)} placeholder="e.g. Near City Park Entrance" required />
            </div>
          </div>

          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ fontSize: '16px', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>Issue Details</h3>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Category</label>
                <select className="form-input" value={category} onChange={e => setCategory(e.target.value)} required>
                  <option value="">Select Category</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Type</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <label style={{ fontSize: '15px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input type="checkbox" checked={isEmergency} onChange={e => setIsEmergency(e.target.checked)} style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }} />
                    Emergency / Urgent
                  </label>
                </div>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-input form-textarea" value={description} onChange={e => setDescription(e.target.value)} placeholder="Provide context about the issue..." required />
            </div>

            <div className="card" style={{ backgroundColor: 'var(--bg)', padding: '16px', border: '1px dashed var(--border)', marginTop: '16px' }}>
              <div style={{ display: 'flex', gap: '12px' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '2px' }}>
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="16" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
                <div style={{ fontSize: '14px', color: 'var(--muted)' }}>
                  <strong>Automatic Prioritization:</strong> Priority is calculated automatically using severity information and community support.
                </div>
              </div>
              {priorityEstimate && (
                <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '14px', color: 'var(--muted)' }}>Estimated initial severity:</span>
                  <PriorityBadge level={priorityEstimate.level} score={priorityEstimate.score} showScore={true} />
                </div>
              )}
            </div>
          </div>

          <div>
            <h3 style={{ fontSize: '16px', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '16px', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>Evidence</h3>
            <div className="form-group">
              <label className="form-label">Attach Photo (Optional)</label>
              <input type="file" accept="image/*" onChange={handleImageChange} ref={fileInputRef} style={{ fontSize: '14px' }} />
            </div>
            {imagePreview && (
              <div style={{ position: 'relative', display: 'inline-block', marginTop: '12px' }}>
                <img src={imagePreview} alt="Preview" style={{ maxWidth: '200px', borderRadius: '10px', border: '1px solid var(--border)' }} />
                <button type="button" onClick={() => setImagePreview(null)} style={{ position: 'absolute', top: '-8px', right: '-8px', backgroundColor: '#C63D3D', color: 'white', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>×</button>
              </div>
            )}
          </div>

          <div style={{ marginTop: '32px', borderTop: '1px solid var(--border)', paddingTop: '32px' }}>
            <button type="submit" className="btn btn-primary" style={{ minWidth: '200px' }} disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Complaint'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}