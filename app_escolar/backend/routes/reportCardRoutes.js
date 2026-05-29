const express = require('express');
const { getReportCard, listAcademicRecords } = require('../controllers/reportCardController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/boletim/:matricula', authenticate, authorize('admin', 'professor', 'aluno'), getReportCard);
router.get('/academic-records', authenticate, authorize('admin', 'professor'), listAcademicRecords);

module.exports = router;
