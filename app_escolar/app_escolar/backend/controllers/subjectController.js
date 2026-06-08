const pool = require('../database/pool');

async function createSubject(req, res) {
  try {
    const { nome, carga_horaria, professor_id, curso, semestre } = req.body;

    if (!nome || !carga_horaria || !curso || !semestre) {
      return res.status(400).json({ message: 'Nome, carga horária, curso e semestre são obrigatórios.' });
    }

    const { rows } = await pool.query(
      `INSERT INTO disciplinas (nome, carga_horaria, professor_id, curso, semestre)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [nome, carga_horaria, professor_id || null, curso, semestre]
    );

    return res.status(201).json({ message: 'Disciplina cadastrada com sucesso.', disciplina: rows[0] });
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao cadastrar disciplina.', detail: error.message });
  }
}

async function listSubjects(req, res) {
  try {
    const params = [];
    let filter = '';

    if (req.user?.perfil === 'professor') {
      params.push(req.user.professor_id);
      filter = 'WHERE d.professor_id = $1';
    } else if (req.user?.perfil === 'aluno') {
      params.push(req.user.aluno_id);
      filter = 'INNER JOIN matriculas_disciplinas md ON md.disciplina_id = d.id WHERE md.aluno_id = $1';
    }

    const { rows } = await pool.query(
      `SELECT d.*, p.nome AS professor_nome
       FROM disciplinas d
       LEFT JOIN professores p ON p.id = d.professor_id
       ${filter}
       ORDER BY d.nome ASC`,
      params
    );

    return res.json(rows);
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao listar disciplinas.', detail: error.message });
  }
}

async function listSubjectsWithoutTeacher(req, res) {
  try {
    const params = [];
    let where = 'WHERE d.professor_id IS NULL';

    if (req.query.curso) {
      params.push(req.query.curso);
      where += ` AND LOWER(d.curso) = LOWER($${params.length})`;
    }

    const { rows } = await pool.query(
      `SELECT d.*
       FROM disciplinas d
       ${where}
       ORDER BY d.nome ASC`,
      params
    );

    return res.json(rows);
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao listar disciplinas sem professor.', detail: error.message });
  }
}

module.exports = { createSubject, listSubjects, listSubjectsWithoutTeacher };
