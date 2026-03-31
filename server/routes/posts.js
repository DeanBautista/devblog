const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const { submitPost, listPosts, deletePost } = require('../controllers/posts');

const router = express.Router();

router.post('/submitpost', authMiddleware, submitPost);
router.get('/', authMiddleware, listPosts);
router.delete('/:id', authMiddleware, deletePost);

module.exports = router;
