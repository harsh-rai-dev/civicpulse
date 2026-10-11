import { Router } from 'express';
import { AuthRequest, authenticate } from '../middleware/auth';
import { calculatePriority } from '../services/priority';

const router = Router();

router.use(authenticate);

/**
 * Explains the priority the engine would assign to a draft description.
 * The report form uses this so the citizen always sees exactly what the
 * server will compute, instead of duplicating the scoring rules in the client.
 */
router.post('/preview', (req: AuthRequest, res) => {
  const description = typeof req.body?.description === 'string' ? req.body.description : '';
  const isEmergency = req.body?.is_emergency === true;

  if (!description.trim()) {
    return res.json({ score: 0, level: 'Low', terms: [] });
  }

  const { score, level, terms } = calculatePriority(description, isEmergency);
  res.json({ score, level, terms });
});

export default router;