const express = require('express');
const { createStudent, listStudents } = require('../controllers/studentController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/alunos', authenticate, listStudents);
router.post('/alunos', authenticate, authorize('admin'), createStudent);

module.exports = router;
