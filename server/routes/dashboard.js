const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const { getAdminDashboardOverview } = require('../controllers/dashboard');

const router = express.Router();

router.get('/', authMiddleware, getAdminDashboardOverview);

module.exports = router;
