const pool = require('../database/pool');

async function createSubject(req, res) {
  try {
    const { nome, carga_horaria, professor_id, curso, semestre } = req.body;

    if (!nome || !carga_horaria || !professor_id || !curso || !semestre) {
      return res.status(400).json({ message: 'Todos os campos da disciplina são obrigatórios.' });
    }

    const { rows } = await pool.query(
      `
        INSERT INTO disciplinas (nome, carga_horaria, professor_id, curso, semestre)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `,
      [nome, carga_horaria, professor_id, curso, semestre]
    );

    return res.status(201).json({
      message: 'Disciplina cadastrada com sucesso.',
      disciplina: rows[0],
    });
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao cadastrar disciplina.', detail: error.message });
  }
}

async function listSubjects(req, res) {
  try {
    const { rows } = await pool.query(
      `
        SELECT d.*, p.nome AS professor_nome
        FROM disciplinas d
        LEFT JOIN professores p ON p.id = d.professor_id
        ORDER BY d.nome ASC
      `
    );

    return res.json(rows);
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao listar disciplinas.', detail: error.message });
  }
}

module.exports = {
  createSubject,
  listSubjects,
};
