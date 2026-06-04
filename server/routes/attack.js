import { Router } from 'express';
import * as attack from '../services/attackService.js';

const router = Router();

router.get('/tactics', async (_req, res, next) => {
  try {
    const tactics = await attack.getTactics();
    res.json({ tactics });
  } catch (err) {
    next(err);
  }
});

router.get('/techniques', async (req, res, next) => {
  try {
    const { tactic, search, limit } = req.query;
    const techniques = await attack.getTechniques({ tactic, search, limit: parseInt(limit, 10) || 100 });
    res.json({ techniques });
  } catch (err) {
    next(err);
  }
});

router.get('/techniques/:id', async (req, res, next) => {
  try {
    const technique = await attack.getTechniqueById(req.params.id);
    res.json(technique);
  } catch (err) {
    next(err);
  }
});

router.get('/search', async (req, res, next) => {
  try {
    const { q } = req.query;
    const techniques = await attack.searchTechniques(q || '');
    res.json({ techniques });
  } catch (err) {
    next(err);
  }
});

export default router;
