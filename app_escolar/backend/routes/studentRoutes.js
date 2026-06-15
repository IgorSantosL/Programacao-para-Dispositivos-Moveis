const express = require('express');
const { createStudent, listStudents, getStudentSubjects, updateStudentSubjects } = require('../controllers/studentController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/alunos', authenticate, listStudents);
router.get('/alunos/:id/disciplinas', authenticate, authorize('admin'), getStudentSubjects);
router.put('/alunos/:id/disciplinas', authenticate, authorize('admin'), updateStudentSubjects);
router.post('/alunos', authenticate, authorize('admin'), createStudent);

module.exports = router;
