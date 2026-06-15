const bcrypt = require('bcryptjs');
const pool = require('../database/pool');

function normalizeCourse(course) {
  return String(course || '').trim().toLowerCase();
}

function courseMatches(a, b) {
  const left = normalizeCourse(a);
  const right = normalizeCourse(b);
  return left === right || left.includes(right) || right.includes(left);
}

async function validateSubjectsForCourse(client, curso, disciplinaIds) {
  if (!Array.isArray(disciplinaIds) || !disciplinaIds.length) {
    return { ok: false, message: 'O aluno precisa ser vinculado a pelo menos uma disciplina do seu curso.' };
  }

  const { rows } = await client.query(
    `SELECT id, curso, nome FROM disciplinas WHERE id = ANY($1::int[])`,
    [disciplinaIds]
  );

  if (rows.length !== disciplinaIds.length) {
    return { ok: false, message: 'Uma ou mais disciplinas selecionadas não foram encontradas.' };
  }

  const invalid = rows.find((item) => !courseMatches(item.curso, curso));
  if (invalid) {
    return {
      ok: false,
      message: `A disciplina "${invalid.nome}" não pertence ao curso do aluno informado.`,
    };
  }

  return { ok: true, rows };
}

async function createStudent(req, res) {
  const client = await pool.connect();
  try {
    const { nome, matricula, curso, email, telefone, cep, endereco, cidade, estado, senha, login, disciplina_ids = [] } = req.body;

    if (!nome || !matricula || !curso || !email || !telefone || !cep || !endereco || !cidade || !estado || !senha) {
      return res.status(400).json({ message: 'Todos os campos do aluno e a senha são obrigatórios.' });
    }

    const validation = await validateSubjectsForCourse(client, curso, disciplina_ids);
    if (!validation.ok) {
      return res.status(400).json({ message: validation.message });
    }

    await client.query('BEGIN');

    const { rows } = await client.query(
      `INSERT INTO alunos (nome, matricula, curso, email, telefone, cep, endereco, cidade, estado)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       RETURNING *`,
      [nome, matricula, curso, email, telefone, cep, endereco, cidade, estado]
    );

    const aluno = rows[0];
    const senhaHash = await bcrypt.hash(senha, 10);

    await client.query(
      `INSERT INTO usuarios (nome, email, login, senha_hash, perfil, aluno_id)
       VALUES ($1, $2, $3, $4, 'aluno', $5)`,
      [nome, email, login || email, senhaHash, aluno.id]
    );

    for (const disciplinaId of disciplina_ids) {
      await client.query(
        `INSERT INTO matriculas_disciplinas (aluno_id, disciplina_id)
         VALUES ($1, $2)
         ON CONFLICT (aluno_id, disciplina_id) DO NOTHING`,
        [aluno.id, disciplinaId]
      );
    }

    await client.query('COMMIT');
    return res.status(201).json({ message: 'Aluno cadastrado com sucesso.', aluno });
  } catch (error) {
    await client.query('ROLLBACK');
    return res.status(500).json({ message: 'Erro ao cadastrar aluno.', detail: error.message });
  } finally {
    client.release();
  }
}

async function listStudents(req, res) {
  try {
    const params = [];
    let whereClause = '';

    if (req.user?.perfil === 'professor') {
      params.push(req.user.professor_id);
      whereClause = `WHERE EXISTS (
        SELECT 1
        FROM matriculas_disciplinas md2
        INNER JOIN disciplinas d2 ON d2.id = md2.disciplina_id
        WHERE md2.aluno_id = a.id
          AND d2.professor_id = $1
      )`;
    }

    const { rows } = await pool.query(
      `SELECT a.*,
              COALESCE(ARRAY_REMOVE(ARRAY_AGG(DISTINCT md.disciplina_id), NULL), '{}') AS disciplina_ids,
              COALESCE(STRING_AGG(DISTINCT d.nome, ', '), '') AS disciplinas
       FROM alunos a
       LEFT JOIN matriculas_disciplinas md ON md.aluno_id = a.id
       LEFT JOIN disciplinas d ON d.id = md.disciplina_id
       ${whereClause}
       GROUP BY a.id
       ORDER BY a.nome ASC`,
      params
    );
    return res.json(rows);
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao listar alunos.', detail: error.message });
  }
}

async function getStudentSubjects(req, res) {
  try {
    const studentId = Number(req.params.id);
    const { rows } = await pool.query(
      `SELECT d.id, d.nome, d.curso, d.semestre, d.carga_horaria, d.professor_id
       FROM matriculas_disciplinas md
       INNER JOIN disciplinas d ON d.id = md.disciplina_id
       WHERE md.aluno_id = $1
       ORDER BY d.nome ASC`,
      [studentId]
    );

    return res.json(rows);
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao carregar disciplinas do aluno.', detail: error.message });
  }
}

async function updateStudentSubjects(req, res) {
  const client = await pool.connect();
  try {
    const studentId = Number(req.params.id);
    const { disciplina_ids = [] } = req.body;

    const studentResult = await client.query(`SELECT id, curso FROM alunos WHERE id = $1 LIMIT 1`, [studentId]);
    if (!studentResult.rows.length) {
      return res.status(404).json({ message: 'Aluno não encontrado.' });
    }

    const validation = await validateSubjectsForCourse(client, studentResult.rows[0].curso, disciplina_ids);
    if (!validation.ok) {
      return res.status(400).json({ message: validation.message });
    }

    await client.query('BEGIN');
    await client.query(`DELETE FROM matriculas_disciplinas WHERE aluno_id = $1`, [studentId]);

    for (const disciplinaId of disciplina_ids) {
      await client.query(
        `INSERT INTO matriculas_disciplinas (aluno_id, disciplina_id)
         VALUES ($1, $2)
         ON CONFLICT (aluno_id, disciplina_id) DO NOTHING`,
        [studentId, disciplinaId]
      );
    }

    await client.query('COMMIT');
    return res.json({ message: 'Disciplinas do aluno atualizadas com sucesso.' });
  } catch (error) {
    await client.query('ROLLBACK');
    return res.status(500).json({ message: 'Erro ao atualizar disciplinas do aluno.', detail: error.message });
  } finally {
    client.release();
  }
}

module.exports = { createStudent, listStudents, getStudentSubjects, updateStudentSubjects };
