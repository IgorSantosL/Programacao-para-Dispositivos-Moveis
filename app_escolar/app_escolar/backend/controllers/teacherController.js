const bcrypt = require('bcryptjs');
const pool = require('../database/pool');

async function createTeacher(req, res) {
  const client = await pool.connect();
  try {
    const { nome, titulacao, area, tempo_docencia, email, senha, login, disciplina_id } = req.body;

    if (!nome || !titulacao || !area || !tempo_docencia || !email || !senha || !disciplina_id) {
      return res.status(400).json({ message: 'Todos os campos do professor, a senha e a disciplina são obrigatórios.' });
    }

    await client.query('BEGIN');

    const disciplinaResult = await client.query(
      `SELECT id, nome, professor_id FROM disciplinas WHERE id = $1 LIMIT 1`,
      [disciplina_id]
    );

    if (!disciplinaResult.rows.length) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Disciplina selecionada não foi encontrada.' });
    }

    if (disciplinaResult.rows[0].professor_id) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'A disciplina selecionada já possui professor vinculado.' });
    }

    const { rows } = await client.query(
      `INSERT INTO professores (nome, titulacao, area, tempo_docencia, email)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [nome, titulacao, area, tempo_docencia, email]
    );

    const professor = rows[0];
    const senhaHash = await bcrypt.hash(senha, 10);

    await client.query(
      `INSERT INTO usuarios (nome, email, login, senha_hash, perfil, professor_id)
       VALUES ($1, $2, $3, $4, 'professor', $5)`,
      [nome, email, login || email, senhaHash, professor.id]
    );

    await client.query(
      `UPDATE disciplinas SET professor_id = $1 WHERE id = $2`,
      [professor.id, disciplina_id]
    );

    await client.query('COMMIT');
    return res.status(201).json({
      message: 'Professor cadastrado com sucesso.',
      professor,
      disciplina_vinculada: disciplinaResult.rows[0].nome,
    });
  } catch (error) {
    await client.query('ROLLBACK');
    return res.status(500).json({ message: 'Erro ao cadastrar professor.', detail: error.message });
  } finally {
    client.release();
  }
}

async function listTeachers(req, res) {
  try {
    const { rows } = await pool.query(
      `SELECT p.*, 
              COALESCE(STRING_AGG(DISTINCT d.nome, ', ' ORDER BY d.nome), '') AS disciplinas
       FROM professores p
       LEFT JOIN disciplinas d ON d.professor_id = p.id
       GROUP BY p.id
       ORDER BY p.nome ASC`
    );
    return res.json(rows);
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao listar professores.', detail: error.message });
  }
}

module.exports = { createTeacher, listTeachers };
