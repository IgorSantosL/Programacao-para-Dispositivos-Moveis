const pool = require('../database/pool');

async function getSummary(req, res) {
  try {
    const [students, teachers, subjects, records] = await Promise.all([
      pool.query(`SELECT COUNT(*)::int AS count FROM alunos`),
      pool.query(`SELECT COUNT(*)::int AS count FROM professores`),
      pool.query(`SELECT COUNT(*)::int AS count FROM disciplinas`),
      pool.query(`SELECT COUNT(*)::int AS count FROM notas`),
    ]);

    return res.json({
      students: students.rows[0].count,
      teachers: teachers.rows[0].count,
      subjects: subjects.rows[0].count,
      records: records.rows[0].count,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao carregar resumo do dashboard.', detail: error.message });
  }
}

module.exports = {
  getSummary,
};
