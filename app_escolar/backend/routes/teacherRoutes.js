const express = require('express');
const { createTeacher, listTeachers } = require('../controllers/teacherController');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/professores', authenticate, listTeachers);
router.post('/professores', authenticate, authorize('admin'), createTeacher);

module.exports = router;
