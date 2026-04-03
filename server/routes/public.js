const express = require('express');
const {
  getHomeData,
  getPublicTags,
  listPublicArticles,
  getPublicArticleBySlug,
  recordPublicArticleView,
  togglePublicArticleLike,
} = require('../controllers/public');

const router = express.Router();

router.get('/home', getHomeData);
router.get('/tags', getPublicTags);
router.get('/articles', listPublicArticles);
router.post('/articles/:slug/view', recordPublicArticleView);
router.post('/articles/:slug/like', togglePublicArticleLike);
router.get('/articles/:slug', getPublicArticleBySlug);

module.exports = router;
