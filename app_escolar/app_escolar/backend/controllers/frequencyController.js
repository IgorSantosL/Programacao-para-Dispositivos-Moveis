const pool = require('../database/pool');

async function validateTeacherAccess(user, alunoId, disciplinaId) {
  if (user.perfil !== 'professor') return true;

  const { rows } = await pool.query(
    `SELECT d.id
     FROM disciplinas d
     INNER JOIN matriculas_disciplinas md ON md.disciplina_id = d.id
     WHERE d.id = $1 AND d.professor_id = $2 AND md.aluno_id = $3
     LIMIT 1`,
    [disciplinaId, user.professor_id, alunoId]
  );

  return rows.length > 0;
}

async function upsertFrequency(req, res) {
  try {
    const { aluno_id, disciplina_id, faltas, total_aulas } = req.body;

    if (!aluno_id || !disciplina_id || faltas === undefined || total_aulas === undefined) {
      return res.status(400).json({ message: 'Aluno, disciplina, faltas e total de aulas são obrigatórios.' });
    }

    const allowed = await validateTeacherAccess(req.user, aluno_id, disciplina_id);
    if (!allowed) {
      return res.status(403).json({ message: 'Professor sem permissão para lançar frequência nesta disciplina/aluno.' });
    }

    const { rows } = await pool.query(
      `INSERT INTO frequencias (aluno_id, disciplina_id, faltas, total_aulas, updated_at)
       VALUES ($1, $2, $3, $4, NOW())
       ON CONFLICT (aluno_id, disciplina_id)
       DO UPDATE SET faltas = EXCLUDED.faltas, total_aulas = EXCLUDED.total_aulas, updated_at = NOW()
       RETURNING *`,
      [aluno_id, disciplina_id, faltas, total_aulas]
    );

    return res.status(201).json({ message: 'Frequência salva com sucesso.', frequencia: rows[0] });
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao salvar frequência.', detail: error.message });
  }
}

module.exports = { upsertFrequency };
