const express = require('express');
const {
  listTeacherSubjects,
  listStudentsBySubject,
  getStudentGradeEntry,
  upsertTeacherStudentGrade,
} = require('../controllers/teacherGradeModuleController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/professor/disciplinas', authenticate, authorize('admin', 'professor'), listTeacherSubjects);
router.get('/professor/disciplinas/:disciplinaId/alunos', authenticate, authorize('admin', 'professor'), listStudentsBySubject);
router.get('/professor/disciplinas/:disciplinaId/alunos/:alunoId/notas', authenticate, authorize('admin', 'professor'), getStudentGradeEntry);
router.put('/professor/disciplinas/:disciplinaId/alunos/:alunoId/notas', authenticate, authorize('admin', 'professor'), upsertTeacherStudentGrade);

module.exports = router;
