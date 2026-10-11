import { Router } from 'express';
import { AuthRequest, authenticate } from '../middleware/auth';
import { addVote, hasUserVoted } from '../models/vote';

const router = Router();

router.use(authenticate);

router.post('/:complaintId', async (req: AuthRequest, res) => {
  if (req.user!.role === 'admin') {
    return res.status(403).json({ error: 'Officials cannot vote. Only citizens may upvote complaints.' });
  }
  const { complaintId } = req.params;
  const userId = req.user!.id;
  const already = await hasUserVoted(userId, complaintId);
  if (already) return res.status(409).json({ error: 'Duplicate vote' });
  await addVote(userId, complaintId);
  res.json({ message: 'Vote recorded' });
});

export default router;
