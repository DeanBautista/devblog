const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const { submitPost } = require('../controllers/posts');

const router = express.Router();

router.post('/submitpost', authMiddleware, submitPost);
const { listPosts } = require('../controllers/posts');


router.get('/', authMiddleware, listPosts);

module.exports = router;
