import { Router } from 'express';
import * as toolkit from '../services/toolkitService.js';
import * as groq from '../services/groqService.js';

const router = Router();

router.post('/cvss', async (req, res, next) => {
  try {
    const { input } = req.body;
    const result = toolkit.explainCvss(input);
    const explanation = await groq.toolkitExplain('CVSS Score', input, result);
    res.json({ result, explanation });
  } catch (err) {
    next(err);
  }
});

router.post('/hash', async (req, res, next) => {
  try {
    const { hash } = req.body;
    const result = toolkit.identifyHash(hash);
    const explanation = await groq.toolkitExplain('Hash Identifier', hash, result);
    res.json({ result, explanation });
  } catch (err) {
    next(err);
  }
});

router.post('/url', async (req, res, next) => {
  try {
    const { url } = req.body;
    const result = toolkit.analyzeUrl(url);
    const explanation = await groq.toolkitExplain('URL Risk Analyzer', url, result);
    res.json({ result, explanation });
  } catch (err) {
    next(err);
  }
});

router.post('/password', async (req, res, next) => {
  try {
    const { password } = req.body;
    const result = toolkit.analyzePassword(password);
    const explanation = await groq.toolkitExplain('Password Strength', '[redacted]', result);
    res.json({ result, explanation });
  } catch (err) {
    next(err);
  }
});

router.post('/headers', async (req, res, next) => {
  try {
    const { url } = req.body;
    const result = await toolkit.analyzeSecurityHeaders(url);
    const explanation = await groq.toolkitExplain('Security Headers', url, result);
    res.json({ result, explanation });
  } catch (err) {
    next(err);
  }
});

export default router;
