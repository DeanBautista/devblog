const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const { coverImageUploadMiddleware } = require('../middleware/coverImageUpload');
const {
	submitPost,
	uploadPostCoverImage,
	deletePostCoverImage,
	getPostById,
	getPostBySlug,
	updatePost,
	listPosts,
	deletePost,
} = require('../controllers/posts');

const router = express.Router();

router.post('/submitpost', authMiddleware, submitPost);
router.post('/cover-image', authMiddleware, coverImageUploadMiddleware, uploadPostCoverImage);
router.post('/cover-image/delete', authMiddleware, deletePostCoverImage);
router.get('/slug/:slug', authMiddleware, getPostBySlug);
router.get('/:id', authMiddleware, getPostById);
router.put('/:id', authMiddleware, updatePost);
router.get('/', authMiddleware, listPosts);
router.delete('/:id', authMiddleware, deletePost);

module.exports = router;
