require('dotenv').config();
const express = require('express');
const cors = require('cors');
const initDatabase = require('./database/init');

const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');
const teacherRoutes = require('./routes/teacherRoutes');
const subjectRoutes = require('./routes/subjectRoutes');
const gradeRoutes = require('./routes/gradeRoutes');
const reportCardRoutes = require('./routes/reportCardRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const externalRoutes = require('./routes/externalRoutes');
const teacherGradeModuleRoutes = require('./routes/teacherGradeModuleRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  return res.json({
    ok: true,
    service: 'app-scholar-backend',
    message: 'Backend ativo. Use /api/health para teste de API.'
  });
});

app.get('/api/health', (req, res) => {
  return res.json({ ok: true, service: 'app-scholar-backend' });
});

app.use('/api', authRoutes);
app.use('/api', studentRoutes);
app.use('/api', teacherRoutes);
app.use('/api', subjectRoutes);
app.use('/api', gradeRoutes);
app.use('/api', reportCardRoutes);
app.use('/api', dashboardRoutes);
app.use('/api', externalRoutes);
app.use('/api', teacherGradeModuleRoutes);

const port = Number(process.env.PORT || 3001);

initDatabase()
  .then(() => {
    app.listen(port, () => {
      console.log(`Backend App Scholar rodando em http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error('Falha ao inicializar banco de dados:', error.message);
    process.exit(1);
  });
