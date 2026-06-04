import { Router } from 'express';
import * as groq from '../services/groqService.js';
import * as nvd from '../services/nvdService.js';

const router = Router();

router.post('/analyze', async (req, res, next) => {
  try {
    const { input, cveId } = req.body;
    if (!input?.trim()) {
      return res.status(400).json({ error: 'Input is required' });
    }

    let cveContext = null;
    if (cveId) {
      try {
        cveContext = await nvd.getCveById(cveId);
      } catch {
        /* optional context */
      }
    }

    const analysis = await groq.analyzeThreat(input, cveContext);
    res.json({ analysis });
  } catch (err) {
    next(err);
  }
});

router.post('/explain', async (req, res, next) => {
  try {
    const { cveId } = req.body;
    if (!cveId?.trim()) {
      return res.status(400).json({ error: 'CVE ID is required' });
    }

    const cveData = await nvd.getCveById(cveId);
    const explanation = await groq.explainThreat(cveData.id, cveData);
    res.json({ cve: cveData, explanation });
  } catch (err) {
    next(err);
  }
});

router.post('/chat', async (req, res, next) => {
  try {
    const { messages } = req.body;
    if (!messages?.length) {
      return res.status(400).json({ error: 'Messages are required' });
    }

    const reply = await groq.cyberAssistant(messages);
    res.json({ reply });
  } catch (err) {
    next(err);
  }
});

export default router;
