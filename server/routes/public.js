const express = require('express');
const { getHomeData, getPublicTags, listPublicArticles } = require('../controllers/public');

const router = express.Router();

router.get('/home', getHomeData);
router.get('/tags', getPublicTags);
router.get('/articles', listPublicArticles);

module.exports = router;
