const express = require('express');
const { getDashboardStats } = require('../controllers/dashboardController');
const { protect, requireRole } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/dashboard', protect, requireRole('admin'), getDashboardStats);

module.exports = router;
