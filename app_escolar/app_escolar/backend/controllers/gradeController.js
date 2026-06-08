const pool = require('../database/pool');

function calculateAverage(nota1, nota2) {
  return Number(((Number(nota1) + Number(nota2)) / 2).toFixed(2));
}

function calculateSituation(media) {
  if (media >= 7) return 'Aprovado';
  if (media >= 5) return 'Recuperação';
  return 'Reprovado';
}

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

async function upsertGrades(req, res) {
  try {
    const { aluno_id, disciplina_id, nota1, nota2 } = req.body;

    if (!aluno_id || !disciplina_id || nota1 === undefined || nota2 === undefined) {
      return res.status(400).json({ message: 'Aluno, disciplina, nota1 e nota2 são obrigatórios.' });
    }

    const allowed = await validateTeacherAccess(req.user, aluno_id, disciplina_id);
    if (!allowed) {
      return res.status(403).json({ message: 'Professor sem permissão para lançar notas nesta disciplina/aluno.' });
    }

    const media = calculateAverage(nota1, nota2);
    const situacao = calculateSituation(media);

    const { rows } = await pool.query(
      `INSERT INTO notas (aluno_id, disciplina_id, nota1, nota2, media, situacao, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())
       ON CONFLICT (aluno_id, disciplina_id)
       DO UPDATE SET nota1 = EXCLUDED.nota1, nota2 = EXCLUDED.nota2, media = EXCLUDED.media, situacao = EXCLUDED.situacao, updated_at = NOW()
       RETURNING *`,
      [aluno_id, disciplina_id, nota1, nota2, media, situacao]
    );

    return res.status(201).json({ message: 'Notas salvas com sucesso.', nota: rows[0] });
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao salvar notas.', detail: error.message });
  }
}

async function listAcademicRecords(req, res) {
  try {
    const params = [];
    let filter = '';

    if (req.user.perfil === 'professor') {
      params.push(req.user.professor_id);
      filter = 'WHERE d.professor_id = $1';
    } else if (req.user.perfil === 'aluno') {
      params.push(req.user.aluno_id);
      filter = 'WHERE a.id = $1';
    }

    const { rows } = await pool.query(
      `SELECT a.id AS aluno_id, a.nome AS aluno_nome, a.matricula, d.id AS disciplina_id, d.nome AS disciplina_nome,
              p.nome AS professor_nome, n.nota1, n.nota2, n.media, n.situacao,
              COALESCE(f.faltas, 0) AS faltas, COALESCE(f.total_aulas, 0) AS total_aulas
       FROM notas n
       INNER JOIN alunos a ON a.id = n.aluno_id
       INNER JOIN disciplinas d ON d.id = n.disciplina_id
       LEFT JOIN professores p ON p.id = d.professor_id
       LEFT JOIN frequencias f ON f.aluno_id = n.aluno_id AND f.disciplina_id = n.disciplina_id
       ${filter}
       ORDER BY a.nome ASC, d.nome ASC`,
      params
    );

    return res.json(rows);
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao listar lançamentos.', detail: error.message });
  }
}

module.exports = { upsertGrades, listAcademicRecords };
