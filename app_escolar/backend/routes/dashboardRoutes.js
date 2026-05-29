const express = require('express');
const { getSummary } = require('../controllers/dashboardController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/dashboard/summary', authenticate, authorize('admin', 'professor'), getSummary);

module.exports = router;
