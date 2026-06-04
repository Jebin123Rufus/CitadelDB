import { Router } from 'express';
import * as nvd from '../services/nvdService.js';

const router = Router();

router.get('/', async (_req, res, next) => {
  try {
    const data = await nvd.getDashboardData();
    res.json(data);
  } catch (err) {
    next(err);
  }
});

router.get('/trends', async (_req, res, next) => {
  try {
    const data = await nvd.getTrendsAnalytics();
    res.json(data);
  } catch (err) {
    next(err);
  }
});

export default router;
