import { Router } from 'express';
import * as ioc from '../services/iocService.js';
import * as groq from '../services/groqService.js';

const router = Router();

router.post('/analyze', async (req, res, next) => {
  try {
    const { value, type: requestedType } = req.body;
    if (!value?.trim()) {
      return res.status(400).json({ error: 'IOC value is required' });
    }

    const type = requestedType || ioc.detectIocType(value);
    const heuristics = ioc.analyzeIocHeuristics(value.trim(), type);
    const aiAnalysis = await groq.analyzeIoc(value.trim(), type, heuristics);

    res.json({
      ...heuristics,
      aiAnalysis,
    });
  } catch (err) {
    next(err);
  }
});

router.get('/detect-type', (req, res) => {
  const { value } = req.query;
  if (!value) return res.status(400).json({ error: 'Value required' });
  res.json({ type: ioc.detectIocType(value) });
});

export default router;
