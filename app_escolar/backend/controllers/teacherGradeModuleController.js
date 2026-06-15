const pool = require('../database/pool');

function calculateAverage(nota1, nota2) {
  return Number(((Number(nota1) + Number(nota2)) / 2).toFixed(2));
}

function calculateSituation(media) {
  if (media >= 7) return 'Aprovado';
  if (media >= 5) return 'Recuperação';
  return 'Reprovado';
}

async function ensureSubjectAccess(user, disciplinaId) {
  if (user.perfil === 'admin') return true;

  const { rows } = await pool.query(
    `SELECT id FROM disciplinas WHERE id = $1 AND professor_id = $2 LIMIT 1`,
    [disciplinaId, user.professor_id]
  );

  return rows.length > 0;
}

async function ensureEnrollment(disciplinaId, alunoId) {
  const { rows } = await pool.query(
    `SELECT id FROM matriculas_disciplinas WHERE disciplina_id = $1 AND aluno_id = $2 LIMIT 1`,
    [disciplinaId, alunoId]
  );

  return rows.length > 0;
}

async function buildUpdatedReport(alunoId) {
  const { rows } = await pool.query(
    `SELECT a.nome AS aluno,
            a.matricula,
            a.curso,
            d.nome AS disciplina,
            n.nota1,
            n.nota2,
            n.media,
            n.situacao,
            COALESCE(f.faltas, 0) AS faltas,
            COALESCE(f.total_aulas, 0) AS total_aulas
     FROM alunos a
     INNER JOIN notas n ON n.aluno_id = a.id
     INNER JOIN disciplinas d ON d.id = n.disciplina_id
     LEFT JOIN frequencias f ON f.aluno_id = a.id AND f.disciplina_id = d.id
     WHERE a.id = $1
     ORDER BY d.nome ASC`,
    [alunoId]
  );

  if (!rows.length) {
    return null;
  }

  const first = rows[0];

  return {
    aluno: first.aluno,
    matricula: String(first.matricula),
    curso: first.curso,
    disciplinas: rows.map((item) => ({
      disciplina: item.disciplina,
      nota1: Number(item.nota1),
      nota2: Number(item.nota2),
      media: Number(item.media),
      situacao: item.situacao,
      faltas: Number(item.faltas),
      totalAulas: Number(item.total_aulas),
      percentualFrequencia:
        Number(item.total_aulas) > 0
          ? Number((((Number(item.total_aulas) - Number(item.faltas)) / Number(item.total_aulas)) * 100).toFixed(2))
          : 0,
    })),
  };
}

async function listTeacherSubjects(req, res) {
  try {
    const params = [];
    let filter = '';

    if (req.user.perfil === 'professor') {
      params.push(req.user.professor_id);
      filter = 'WHERE d.professor_id = $1';
    }

    const { rows } = await pool.query(
      `SELECT d.id,
              d.nome,
              d.curso,
              d.semestre,
              d.carga_horaria,
              d.professor_id,
              p.nome AS professor_nome,
              COUNT(DISTINCT md.aluno_id)::int AS total_alunos,
              COALESCE(ROUND(AVG(n.media), 2), 0) AS media_turma
       FROM disciplinas d
       LEFT JOIN professores p ON p.id = d.professor_id
       LEFT JOIN matriculas_disciplinas md ON md.disciplina_id = d.id
       LEFT JOIN notas n ON n.disciplina_id = d.id AND n.aluno_id = md.aluno_id
       ${filter}
       GROUP BY d.id, p.nome
       ORDER BY d.nome ASC`,
      params
    );

    return res.json(rows);
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao listar disciplinas do módulo de notas.', detail: error.message });
  }
}

async function listStudentsBySubject(req, res) {
  try {
    const disciplinaId = Number(req.params.disciplinaId);
    const allowed = await ensureSubjectAccess(req.user, disciplinaId);

    if (!allowed) {
      return res.status(403).json({ message: 'Você não pode acessar alunos desta disciplina.' });
    }

    const { rows } = await pool.query(
      `SELECT a.id,
              a.nome,
              a.matricula,
              a.curso,
              a.email,
              COALESCE(n.nota1, NULL) AS nota1,
              COALESCE(n.nota2, NULL) AS nota2,
              COALESCE(n.media, NULL) AS media,
              COALESCE(n.situacao, NULL) AS situacao,
              COALESCE(f.faltas, 0) AS faltas,
              COALESCE(f.total_aulas, 0) AS total_aulas
       FROM matriculas_disciplinas md
       INNER JOIN alunos a ON a.id = md.aluno_id
       LEFT JOIN notas n ON n.aluno_id = a.id AND n.disciplina_id = md.disciplina_id
       LEFT JOIN frequencias f ON f.aluno_id = a.id AND f.disciplina_id = md.disciplina_id
       WHERE md.disciplina_id = $1
       ORDER BY a.nome ASC`,
      [disciplinaId]
    );

    return res.json(rows);
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao listar alunos da disciplina.', detail: error.message });
  }
}

async function getStudentGradeEntry(req, res) {
  try {
    const disciplinaId = Number(req.params.disciplinaId);
    const alunoId = Number(req.params.alunoId);

    const allowed = await ensureSubjectAccess(req.user, disciplinaId);
    if (!allowed) {
      return res.status(403).json({ message: 'Você não pode acessar esta disciplina.' });
    }

    const enrolled = await ensureEnrollment(disciplinaId, alunoId);
    if (!enrolled) {
      return res.status(404).json({ message: 'Aluno não vinculado à disciplina selecionada.' });
    }

    const { rows } = await pool.query(
      `SELECT a.id AS aluno_id,
              a.nome AS aluno_nome,
              a.matricula,
              a.curso,
              d.id AS disciplina_id,
              d.nome AS disciplina_nome,
              d.semestre,
              d.carga_horaria,
              p.nome AS professor_nome,
              n.nota1,
              n.nota2,
              n.media,
              n.situacao,
              COALESCE(f.faltas, 0) AS faltas,
              COALESCE(f.total_aulas, 0) AS total_aulas
       FROM matriculas_disciplinas md
       INNER JOIN alunos a ON a.id = md.aluno_id
       INNER JOIN disciplinas d ON d.id = md.disciplina_id
       LEFT JOIN professores p ON p.id = d.professor_id
       LEFT JOIN notas n ON n.aluno_id = a.id AND n.disciplina_id = d.id
       LEFT JOIN frequencias f ON f.aluno_id = a.id AND f.disciplina_id = d.id
       WHERE md.disciplina_id = $1 AND md.aluno_id = $2
       LIMIT 1`,
      [disciplinaId, alunoId]
    );

    if (!rows.length) {
      return res.status(404).json({ message: 'Registro não encontrado.' });
    }

    const item = rows[0];
    return res.json({
      aluno: {
        id: item.aluno_id,
        nome: item.aluno_nome,
        matricula: String(item.matricula),
        curso: item.curso,
      },
      disciplina: {
        id: item.disciplina_id,
        nome: item.disciplina_nome,
        semestre: item.semestre,
        carga_horaria: item.carga_horaria,
        professor_nome: item.professor_nome,
      },
      notas: {
        nota1: item.nota1 !== null ? Number(item.nota1) : null,
        nota2: item.nota2 !== null ? Number(item.nota2) : null,
        media: item.media !== null ? Number(item.media) : null,
        situacao: item.situacao || null,
      },
      frequencia: {
        faltas: Number(item.faltas),
        totalAulas: Number(item.total_aulas),
      },
    });
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao carregar lançamento do aluno.', detail: error.message });
  }
}

async function upsertTeacherStudentGrade(req, res) {
  try {
    const disciplinaId = Number(req.params.disciplinaId);
    const alunoId = Number(req.params.alunoId);
    const { nota1, nota2 } = req.body;

    if (nota1 === undefined || nota2 === undefined) {
      return res.status(400).json({ message: 'Nota 1 e nota 2 são obrigatórias.' });
    }

    const n1 = Number(nota1);
    const n2 = Number(nota2);
    if (Number.isNaN(n1) || Number.isNaN(n2) || n1 < 0 || n1 > 10 || n2 < 0 || n2 > 10) {
      return res.status(400).json({ message: 'As notas devem estar entre 0 e 10.' });
    }

    const allowed = await ensureSubjectAccess(req.user, disciplinaId);
    if (!allowed) {
      return res.status(403).json({ message: 'Você não pode lançar notas nesta disciplina.' });
    }

    const enrolled = await ensureEnrollment(disciplinaId, alunoId);
    if (!enrolled) {
      return res.status(404).json({ message: 'Aluno não vinculado à disciplina selecionada.' });
    }

    const media = calculateAverage(n1, n2);
    const situacao = calculateSituation(media);

    const { rows } = await pool.query(
      `INSERT INTO notas (aluno_id, disciplina_id, nota1, nota2, media, situacao, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW())
       ON CONFLICT (aluno_id, disciplina_id)
       DO UPDATE SET nota1 = EXCLUDED.nota1,
                     nota2 = EXCLUDED.nota2,
                     media = EXCLUDED.media,
                     situacao = EXCLUDED.situacao,
                     updated_at = NOW()
       RETURNING *`,
      [alunoId, disciplinaId, n1, n2, media, situacao]
    );

    const boletimAtualizado = await buildUpdatedReport(alunoId);

    return res.json({
      message: 'Notas registradas/atualizadas com sucesso.',
      nota: rows[0],
      boletimAtualizado,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao registrar notas.', detail: error.message });
  }
}

module.exports = {
  listTeacherSubjects,
  listStudentsBySubject,
  getStudentGradeEntry,
  upsertTeacherStudentGrade,
};
