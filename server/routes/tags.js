const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const {
  listTags,
  createTag,
  updateTag,
  deleteTag,
  listTagPosts,
} = require('../controllers/tags');

const router = express.Router();

router.get('/', authMiddleware, listTags);
router.get('/:id/posts', authMiddleware, listTagPosts);
router.post('/', authMiddleware, createTag);
router.put('/:id', authMiddleware, updateTag);
router.delete('/:id', authMiddleware, deleteTag);

module.exports = router;
