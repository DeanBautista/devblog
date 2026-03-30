const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const { submitPost } = require('../controllers/posts');

const router = express.Router();

router.post('/submitpost', authMiddleware, submitPost);

module.exports = router;
