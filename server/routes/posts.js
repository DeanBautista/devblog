const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const {
	submitPost,
	getPostById,
	getPostBySlug,
	updatePost,
	listPosts,
	deletePost,
} = require('../controllers/posts');

const router = express.Router();

router.post('/submitpost', authMiddleware, submitPost);
router.get('/slug/:slug', authMiddleware, getPostBySlug);
router.get('/:id', authMiddleware, getPostById);
router.put('/:id', authMiddleware, updatePost);
router.get('/', authMiddleware, listPosts);
router.delete('/:id', authMiddleware, deletePost);

module.exports = router;
