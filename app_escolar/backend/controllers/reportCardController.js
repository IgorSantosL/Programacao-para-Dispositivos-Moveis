const pool = require('../database/pool');

async function getReportCard(req, res) {
  try {
    const targetMatricula = req.user?.perfil === 'aluno' ? String(req.user.matricula) : String(req.params.matricula || '');

    if (!targetMatricula) {
      return res.status(400).json({ message: 'Matrícula não informada.' });
    }

    const params = [targetMatricula];
    let teacherFilter = '';

    if (req.user?.perfil === 'professor') {
      params.push(req.user.professor_id);
      teacherFilter = 'AND d.professor_id = $2';
    }

    const { rows } = await pool.query(
      `SELECT a.nome AS aluno, a.matricula, a.curso, d.nome AS disciplina,
              n.nota1, n.nota2, n.media, n.situacao,
              COALESCE(f.faltas, 0) AS faltas,
              COALESCE(f.total_aulas, 0) AS total_aulas
       FROM alunos a
       INNER JOIN notas n ON n.aluno_id = a.id
       INNER JOIN disciplinas d ON d.id = n.disciplina_id
       LEFT JOIN frequencias f ON f.aluno_id = a.id AND f.disciplina_id = d.id
       WHERE a.matricula = $1 ${teacherFilter}
       ORDER BY d.nome ASC`,
      params
    );

    if (!rows.length) {
      return res.status(404).json({ message: 'Boletim não encontrado.' });
    }

    const first = rows[0];
    return res.json({
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
        percentualFrequencia: item.total_aulas > 0 ? Number((((item.total_aulas - item.faltas) / item.total_aulas) * 100).toFixed(2)) : 0,
      })),
    });
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao consultar boletim.', detail: error.message });
  }
}

module.exports = { getReportCard };
