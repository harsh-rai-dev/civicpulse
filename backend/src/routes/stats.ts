import { Router } from 'express';
import { listComplaints } from '../models/complaint';

const router = Router();

router.get('/', async (_req, res) => {
  const complaints = await listComplaints({});
  const total = complaints.length;
  const pending = complaints.filter(c => c.status === 'Pending').length;
  const inProgress = complaints.filter(c => c.status === 'In Progress').length;
  const resolved = complaints.filter(c => c.status === 'Resolved').length;
  res.json({ total, pending, inProgress, resolved });
});

export default router;
