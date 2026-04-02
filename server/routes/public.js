const express = require('express');
const {
  getHomeData,
  getPublicTags,
  listPublicArticles,
  getPublicArticleBySlug,
} = require('../controllers/public');

const router = express.Router();

router.get('/home', getHomeData);
router.get('/tags', getPublicTags);
router.get('/articles', listPublicArticles);
router.get('/articles/:slug', getPublicArticleBySlug);

module.exports = router;
