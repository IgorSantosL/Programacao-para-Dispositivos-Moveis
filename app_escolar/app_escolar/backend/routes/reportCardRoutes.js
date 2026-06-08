const express = require('express');
const { getReportCard } = require('../controllers/reportCardController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/boletim/:matricula', authenticate, authorize('admin', 'professor', 'aluno'), getReportCard);

module.exports = router;
