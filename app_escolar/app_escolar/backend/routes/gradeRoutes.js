const express = require('express');
const { upsertGrades, listAcademicRecords } = require('../controllers/gradeController');
const { upsertFrequency } = require('../controllers/frequencyController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.post('/notas', authenticate, authorize('admin', 'professor'), upsertGrades);
router.post('/frequencias', authenticate, authorize('admin', 'professor'), upsertFrequency);
router.get('/academic-records', authenticate, authorize('admin', 'professor', 'aluno'), listAcademicRecords);

module.exports = router;
