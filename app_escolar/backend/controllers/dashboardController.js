const pool = require('../database/pool');

async function getSummary(req, res) {
  try {
    if (req.user?.perfil === 'professor') {
      const [students, subjects, records] = await Promise.all([
        pool.query(`SELECT COUNT(DISTINCT md.aluno_id)::int AS count FROM matriculas_disciplinas md INNER JOIN disciplinas d ON d.id = md.disciplina_id WHERE d.professor_id = $1`, [req.user.professor_id]),
        pool.query(`SELECT COUNT(*)::int AS count FROM disciplinas WHERE professor_id = $1`, [req.user.professor_id]),
        pool.query(`SELECT COUNT(*)::int AS count FROM notas n INNER JOIN disciplinas d ON d.id = n.disciplina_id WHERE d.professor_id = $1`, [req.user.professor_id]),
      ]);

      return res.json({ students: students.rows[0].count, teachers: 1, subjects: subjects.rows[0].count, records: records.rows[0].count });
    }

    if (req.user?.perfil === 'aluno') {
      const [subjects, records] = await Promise.all([
        pool.query(`SELECT COUNT(*)::int AS count FROM matriculas_disciplinas WHERE aluno_id = $1`, [req.user.aluno_id]),
        pool.query(`SELECT COUNT(*)::int AS count FROM notas WHERE aluno_id = $1`, [req.user.aluno_id]),
      ]);

      return res.json({ students: 1, teachers: 0, subjects: subjects.rows[0].count, records: records.rows[0].count });
    }

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

module.exports = { getSummary };
