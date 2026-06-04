import { Router } from 'express';
import * as news from '../services/newsService.js';
import * as groq from '../services/groqService.js';

const router = Router();
let cache = { articles: [], fetchedAt: 0 };
const CACHE_MS = 15 * 60 * 1000;

async function getArticles() {
  if (cache.articles.length && Date.now() - cache.fetchedAt < CACHE_MS) {
    return cache.articles;
  }
  cache.articles = await news.fetchAllNews();
  cache.fetchedAt = Date.now();
  return cache.articles;
}

router.get('/', async (req, res, next) => {
  try {
    const articles = await getArticles();
    const { search, category, sort } = req.query;
    const filtered = news.filterNews(articles, { search, category, sort });
    const categories = news.getCategories(articles);
    res.json({ articles: filtered, categories, total: filtered.length });
  } catch (err) {
    next(err);
  }
});

router.post('/briefing', async (req, res, next) => {
  try {
    const articles = await getArticles();
    const briefing = await groq.summarizeNews(articles);
    res.json({ briefing });
  } catch (err) {
    next(err);
  }
});

router.post('/summarize', async (req, res, next) => {
  try {
    const { title, summary, source } = req.body;
    const result = await groq.summarizeArticle(title, summary, source);
    res.json({ summary: result });
  } catch (err) {
    next(err);
  }
});

export default router;
