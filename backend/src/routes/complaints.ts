import { Router } from 'express';
import { AuthRequest, authenticate } from '../middleware/auth';
import { createComplaint, getComplaintById, listComplaints, updateComplaintStatus, deleteComplaint } from '../models/complaint';
import { addVote, getVoteCount, hasUserVoted } from '../models/vote';
import { Storage } from '../storage';

const router = Router();

router.use(authenticate);

router.post('/', async (req: AuthRequest, res) => {
  console.log('POST /api/complaints - Incoming request body:', req.body);
  const { zone, block_division, landmark, category, description, image_path, is_emergency } = req.body;
  if (!zone || !landmark || !category || !description) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  const complaint = await createComplaint({
    user_id: req.user!.id,
    zone,
    block_division,
    landmark,
    category,
    description,
    image_path,
    is_emergency: !!is_emergency,
  });
  res.status(201).json(complaint);
});

router.get('/', async (req: AuthRequest, res) => {
  const filters = req.query as any;
  const complaints = await listComplaints(filters);
  const userId = req.user?.id;
  const enriched = await Promise.all(complaints.map(async c => ({
    ...c,
    voteCount: await getVoteCount(c.id),
    hasVoted: userId ? await hasUserVoted(userId, c.id) : false,
  })));
  res.json(enriched);
});

router.get('/:id', async (req: AuthRequest, res) => {
  const complaint = await getComplaintById(req.params.id);
  if (!complaint) return res.status(404).json({ error: 'Complaint not found' });
  const voteCount = await getVoteCount(complaint.id);
  const hasVoted = req.user?.id ? await hasUserVoted(req.user.id, complaint.id) : false;
  res.json({ ...complaint, voteCount, hasVoted });
});

router.patch('/:id/status', async (req: AuthRequest, res) => {
  if (req.user!.role !== 'admin') return res.status(403).json({ error: 'Admin only' });
  const { status, admin_reply } = req.body;
  if (!['Pending', 'In Progress', 'Resolved'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }
  if (status === 'Resolved' && !admin_reply) {
    return res.status(400).json({ error: 'A resolution note is required when marking as Resolved' });
  }
  const complaint = await getComplaintById(req.params.id);
  if (!complaint) return res.status(404).json({ error: 'Complaint not found' });
  await updateComplaintStatus(req.params.id, status);
  if (status === 'Resolved') {
    await Storage.setComplaintResolution(req.params.id, admin_reply);
  }
  res.json({ message: 'Status updated' });
});

router.delete('/:id', async (req: AuthRequest, res) => {
  const complaint = await getComplaintById(req.params.id);
  if (!complaint) return res.status(404).json({ error: 'Complaint not found' });
  if (complaint.user_id !== req.user!.id && req.user!.role !== 'admin') {
    return res.status(403).json({ error: 'You are not allowed to withdraw this complaint' });
  }
  await deleteComplaint(req.params.id);
  res.json({ message: 'Complaint withdrawn' });
});

export default router;
