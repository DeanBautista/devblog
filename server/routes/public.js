const express = require('express');
const { getHomeData, listPublicArticles } = require('../controllers/public');

const router = express.Router();

router.get('/home', getHomeData);
router.get('/articles', listPublicArticles);

module.exports = router;
