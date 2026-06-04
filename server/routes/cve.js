import { Router } from 'express';
import * as nvd from '../services/nvdService.js';

const router = Router();

router.get('/search', async (req, res, next) => {
  try {
    const { keyword, severity, year, type, cwe, page = 0, limit = 20 } = req.query;
    const startIndex = parseInt(page, 10) * parseInt(limit, 10);
    const data = await nvd.searchCves({
      keyword,
      severity,
      year,
      type,
      cwe,
      resultsPerPage: parseInt(limit, 10),
      startIndex,
    });
    res.json(data);
  } catch (err) {
    next(err);
  }
});

router.get('/:cveId', async (req, res, next) => {
  try {
    const cve = await nvd.getCveById(req.params.cveId);
    res.json(cve);
  } catch (err) {
    next(err);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const days = parseInt(req.query.days, 10) || 7;
    const data = await nvd.getRecentCves(days, parseInt(req.query.limit, 10) || 30);
    res.json(data);
  } catch (err) {
    next(err);
  }
});

export default router;
