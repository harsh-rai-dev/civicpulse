import { Router } from 'express';
import { AuthRequest, authenticate } from '../middleware/auth';
import { listComplaints } from '../models/complaint';
import { getVoteCount } from '../models/vote';

const router = Router();

router.use(authenticate);

router.get('/stats', async (req: AuthRequest, res) => {
  if (req.user!.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
  const complaints = await listComplaints({});
  const total = complaints.length;
  const critical = complaints.filter(c => c.priority_level === 'Critical').length;
  const high = complaints.filter(c => c.priority_level === 'High').length;
  const pending = complaints.filter(c => c.status === 'Pending').length;
  const inProgress = complaints.filter(c => c.status === 'In Progress').length;
  const resolved = complaints.filter(c => c.status === 'Resolved').length;
  res.json({ total, critical, high, pending, inProgress, resolved });
});

router.get('/complaints', async (req: AuthRequest, res) => {
  if (req.user!.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
  const filters = req.query as any;
  const complaints = await listComplaints(filters);
  const enriched = await Promise.all(complaints.map(async c => ({
    ...c,
    voteCount: await getVoteCount(c.id),
  })));
  
  // Municipal Corporation Queue Rule:
  // 1. Emergency complaints always come first
  // 2. Then highest priority score / upvotes
  // 3. First-come-first-served (created_at ASC) for tiebreaking
  enriched.sort((a, b) => {
    if (a.is_emergency && !b.is_emergency) return -1;
    if (!a.is_emergency && b.is_emergency) return 1;
    if (b.priority_score !== a.priority_score) return b.priority_score - a.priority_score;
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
  });

  res.json(enriched);
});

export default router;
