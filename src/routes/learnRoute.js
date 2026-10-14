const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

// In-memory runtime caches for maximum performance
let metaData = null;
const categoryCache = new Map(); // categoryId -> parsed JSON
const phrasesByLangCat = new Map(); // key "lang:cat" -> array of phrases

const CATEGORIES_DIR = path.join(__dirname, '..', 'data', 'categories');
const META_FILE = path.join(CATEGORIES_DIR, 'meta.json');
const FULL_FILE = path.join(__dirname, '..', 'data', 'learn_data.json');

function loadMetaData() {
  try {
    if (fs.existsSync(META_FILE)) {
      metaData = JSON.parse(fs.readFileSync(META_FILE, 'utf8'));
      console.log(`[LearnRoute] Loaded metadata (${metaData.languages.length} langs, ${metaData.categories.length} categories).`);
    } else if (fs.existsSync(FULL_FILE)) {
      const raw = JSON.parse(fs.readFileSync(FULL_FILE, 'utf8'));
      metaData = {
        version: raw.version,
        totalLanguages: raw.languages.length,
        totalCategories: raw.categories.length,
        totalPhrases: raw.totalPhrases,
        languages: raw.languages,
        categories: raw.categories
      };
    }
  } catch (err) {
    console.error('[LearnRoute] Failed to load metadata:', err.message);
  }
}

// Initial metadata load (< 5 KB, instant 0ms)
loadMetaData();

// Helper to get category data with runtime cache
function getCategoryData(categoryId) {
  if (categoryCache.has(categoryId)) {
    return categoryCache.get(categoryId);
  }

  const catPath = path.join(CATEGORIES_DIR, `${categoryId}.json`);
  if (fs.existsSync(catPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(catPath, 'utf8'));
      categoryCache.set(categoryId, data);

      // Pre-index lang:cat lookups
      for (const [langCode, list] of Object.entries(data.phrases || {})) {
        phrasesByLangCat.set(`${langCode}:${categoryId}`, list);
      }

      console.log(`[LearnRoute] Runtime cached category '${categoryId}' (${data.totalPhrases} phrases).`);
      return data;
    } catch (e) {
      console.error(`[LearnRoute] Error reading category ${categoryId}:`, e.message);
    }
  }
  return null;
}

// 1. GET /api/learn/meta
// Lightweight metadata for languages and categories (~5 KB)
router.get('/meta', (req, res) => {
  if (!metaData) loadMetaData();
  if (!metaData) {
    return res.status(503).json({ status: 'error', message: 'Metadata initializing' });
  }

  res.set('Cache-Control', 'public, max-age=86400');
  return res.status(200).json({
    status: 'success',
    ...metaData
  });
});

// 2. GET /api/learn/languages
router.get('/languages', (req, res) => {
  if (!metaData) loadMetaData();
  if (!metaData) {
    return res.status(503).json({ status: 'error', message: 'Metadata initializing' });
  }

  res.set('Cache-Control', 'public, max-age=86400');
  return res.status(200).json({
    status: 'success',
    total: metaData.languages.length,
    languages: metaData.languages
  });
});

// 3. GET /api/learn/categories
router.get('/categories', (req, res) => {
  if (!metaData) loadMetaData();
  if (!metaData) {
    return res.status(503).json({ status: 'error', message: 'Metadata initializing' });
  }

  res.set('Cache-Control', 'public, max-age=86400');
  return res.status(200).json({
    status: 'success',
    total: metaData.categories.length,
    categories: metaData.categories
  });
});

// 4. GET /api/learn/category/:categoryId
// Runtime on-demand category fetch with optional ?lang=... filter
router.get('/category/:categoryId', (req, res) => {
  const { categoryId } = req.params;
  const lang = req.query.lang ? req.query.lang.toLowerCase() : null;

  const data = getCategoryData(categoryId);
  if (!data) {
    return res.status(404).json({ status: 'error', message: `Category '${categoryId}' not found` });
  }

  res.set('Cache-Control', 'public, max-age=86400');

  // If specific language requested, return only that language's phrases (~15-20 KB)
  if (lang) {
    const list = (data.phrases && data.phrases[lang]) || (data.phrases && data.phrases['en']) || [];
    return res.status(200).json({
      status: 'success',
      categoryId,
      lang,
      totalPhrases: list.length,
      phrases: list
    });
  }

  // Otherwise return the full category deck across all languages
  return res.status(200).json({
    status: 'success',
    categoryId,
    totalPhrases: data.totalPhrases,
    phrases: data.phrases
  });
});

// 5. GET /api/learn/phrases
// Query parameters: lang (required), category (optional), limit, offset, search
router.get('/phrases', (req, res) => {
  const lang = (req.query.lang || 'es').toLowerCase();
  const category = req.query.category;
  const search = (req.query.search || '').trim().toLowerCase();
  const limit = req.query.limit === 'all' ? 1000 : parseInt(req.query.limit, 10) || 50;
  const offset = parseInt(req.query.offset, 10) || 0;

  let pool = [];

  if (category) {
    const key = `${lang}:${category}`;
    if (!phrasesByLangCat.has(key)) {
      getCategoryData(category);
    }
    pool = phrasesByLangCat.get(key) || phrasesByLangCat.get(`en:${category}`) || [];
  } else {
    // If all categories requested, load all categories into runtime cache
    if (!metaData) loadMetaData();
    const cats = (metaData && metaData.categories) ? metaData.categories : [];
    for (const c of cats) {
      const key = `${lang}:${c.id}`;
      if (!phrasesByLangCat.has(key)) {
        getCategoryData(c.id);
      }
      const subList = phrasesByLangCat.get(key) || [];
      pool.push(...subList);
    }
  }

  if (search.length > 0) {
    pool = pool.filter((p) =>
      p.english.toLowerCase().includes(search) ||
      p.native.toLowerCase().includes(search) ||
      (p.phonetic && p.phonetic.toLowerCase().includes(search))
    );
  }

  const total = pool.length;
  const paged = pool.slice(offset, offset + limit);

  res.set('Cache-Control', 'public, max-age=3600');
  return res.status(200).json({
    status: 'success',
    lang,
    category: category || 'all',
    total,
    count: paged.length,
    offset,
    limit,
    phrases: paged,
  });
});

// 6. GET /api/learn/all?lang=...
router.get('/all', (req, res) => {
  const lang = (req.query.lang || 'es').toLowerCase();

  if (!metaData) loadMetaData();
  const cats = (metaData && metaData.categories) ? metaData.categories : [];
  const pool = [];

  for (const c of cats) {
    const key = `${lang}:${c.id}`;
    if (!phrasesByLangCat.has(key)) {
      getCategoryData(c.id);
    }
    const subList = phrasesByLangCat.get(key) || [];
    pool.push(...subList);
  }

  res.set('Cache-Control', 'public, max-age=86400');
  return res.status(200).json({
    status: 'success',
    lang,
    total: pool.length,
    phrases: pool,
  });
});

module.exports = router;
