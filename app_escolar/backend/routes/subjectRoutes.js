const express = require('express');
const { createSubject, listSubjects, listSubjectsWithoutTeacher } = require('../controllers/subjectController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/disciplinas', authenticate, listSubjects);
router.get('/disciplinas-disponiveis', authenticate, authorize('admin'), listSubjectsWithoutTeacher);
router.post('/disciplinas', authenticate, authorize('admin'), createSubject);

module.exports = router;
