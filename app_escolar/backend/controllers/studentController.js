const pool = require('../database/pool');

async function createStudent(req, res) {
  try {
    const { nome, matricula, curso, email, telefone, cep, endereco, cidade, estado } = req.body;

    if (!nome || !matricula || !curso || !email || !telefone || !cep || !endereco || !cidade || !estado) {
      return res.status(400).json({ message: 'Todos os campos do aluno são obrigatórios.' });
    }

    const { rows } = await pool.query(
      `
        INSERT INTO alunos (nome, matricula, curso, email, telefone, cep, endereco, cidade, estado)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
      `,
      [nome, matricula, curso, email, telefone, cep, endereco, cidade, estado]
    );

    return res.status(201).json({
      message: 'Aluno cadastrado com sucesso.',
      aluno: rows[0],
    });
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao cadastrar aluno.', detail: error.message });
  }
}

async function listStudents(req, res) {
  try {
    const { rows } = await pool.query(`SELECT * FROM alunos ORDER BY nome ASC`);
    return res.json(rows);
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao listar alunos.', detail: error.message });
  }
}

module.exports = {
  createStudent,
  listStudents,
};
