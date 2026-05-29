const pool = require('../database/pool');

async function createTeacher(req, res) {
  try {
    const { nome, titulacao, area, tempo_docencia, email } = req.body;

    if (!nome || !titulacao || !area || !tempo_docencia || !email) {
      return res.status(400).json({ message: 'Todos os campos do professor são obrigatórios.' });
    }

    const { rows } = await pool.query(
      `
        INSERT INTO professores (nome, titulacao, area, tempo_docencia, email)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `,
      [nome, titulacao, area, tempo_docencia, email]
    );

    return res.status(201).json({
      message: 'Professor cadastrado com sucesso.',
      professor: rows[0],
    });
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao cadastrar professor.', detail: error.message });
  }
}

async function listTeachers(req, res) {
  try {
    const { rows } = await pool.query(`SELECT * FROM professores ORDER BY nome ASC`);
    return res.json(rows);
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao listar professores.', detail: error.message });
  }
}

module.exports = {
  createTeacher,
  listTeachers,
};
