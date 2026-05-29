const pool = require('../database/pool');

async function upsertFrequency(req, res) {
  try {
    const { aluno_id, disciplina_id, faltas, total_aulas } = req.body;

    if (!aluno_id || !disciplina_id || faltas === undefined || total_aulas === undefined) {
      return res.status(400).json({ message: 'Aluno, disciplina, faltas e total de aulas são obrigatórios.' });
    }

    const { rows } = await pool.query(
      `
        INSERT INTO frequencias (aluno_id, disciplina_id, faltas, total_aulas, updated_at)
        VALUES ($1, $2, $3, $4, NOW())
        ON CONFLICT (aluno_id, disciplina_id)
        DO UPDATE SET
          faltas = EXCLUDED.faltas,
          total_aulas = EXCLUDED.total_aulas,
          updated_at = NOW()
        RETURNING *
      `,
      [aluno_id, disciplina_id, faltas, total_aulas]
    );

    return res.status(201).json({
      message: 'Frequência salva com sucesso.',
      frequencia: rows[0],
    });
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao salvar frequência.', detail: error.message });
  }
}

module.exports = {
  upsertFrequency,
};
