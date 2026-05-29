const express = require('express');
const { createSubject, listSubjects } = require('../controllers/subjectController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/disciplinas', authenticate, listSubjects);
router.post('/disciplinas', authenticate, authorize('admin'), createSubject);

module.exports = router;
