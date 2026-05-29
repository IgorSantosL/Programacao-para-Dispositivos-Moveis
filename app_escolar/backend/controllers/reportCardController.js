const pool = require('../database/pool');

async function getReportCard(req, res) {
  try {
    const { matricula } = req.params;

    const studentQuery = await pool.query(
      `SELECT * FROM alunos WHERE matricula = $1 LIMIT 1`,
      [matricula]
    );

    const student = studentQuery.rows[0];

    if (!student) {
      return res.status(404).json({ message: 'Aluno não encontrado para a matrícula informada.' });
    }

    const { rows } = await pool.query(
      `
        SELECT
          d.nome AS disciplina,
          n.nota1,
          n.nota2,
          n.media,
          n.situacao,
          COALESCE(f.faltas, 0) AS faltas,
          COALESCE(f.total_aulas, 0) AS total_aulas
        FROM notas n
        INNER JOIN disciplinas d ON d.id = n.disciplina_id
        LEFT JOIN frequencias f ON f.aluno_id = n.aluno_id AND f.disciplina_id = n.disciplina_id
        WHERE n.aluno_id = $1
        ORDER BY d.nome ASC
      `,
      [student.id]
    );

    return res.json({
      aluno: student.nome,
      matricula: String(student.matricula),
      curso: student.curso,
      disciplinas: rows.map((item) => {
        const totalAulas = Number(item.total_aulas);
        const faltas = Number(item.faltas);
        const percentualFrequencia =
          totalAulas > 0 ? Number((((totalAulas - faltas) / totalAulas) * 100).toFixed(2)) : 0;

        return {
          disciplina: item.disciplina,
          nota1: Number(item.nota1),
          nota2: Number(item.nota2),
          media: Number(item.media),
          situacao: item.situacao,
          faltas,
          totalAulas,
          percentualFrequencia,
        };
      }),
    });
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao consultar boletim.', detail: error.message });
  }
}

async function listAcademicRecords(req, res) {
  try {
    const { rows } = await pool.query(
      `
        SELECT
          a.id AS aluno_id,
          a.nome AS aluno_nome,
          a.matricula,
          d.id AS disciplina_id,
          d.nome AS disciplina_nome,
          p.nome AS professor_nome,
          n.nota1,
          n.nota2,
          n.media,
          n.situacao,
          COALESCE(f.faltas, 0) AS faltas,
          COALESCE(f.total_aulas, 0) AS total_aulas
        FROM notas n
        INNER JOIN alunos a ON a.id = n.aluno_id
        INNER JOIN disciplinas d ON d.id = n.disciplina_id
        LEFT JOIN professores p ON p.id = d.professor_id
        LEFT JOIN frequencias f ON f.aluno_id = n.aluno_id AND f.disciplina_id = n.disciplina_id
        ORDER BY a.nome ASC, d.nome ASC
      `
    );

    return res.json(rows.map((item) => ({
      ...item,
      nota1: Number(item.nota1),
      nota2: Number(item.nota2),
      media: Number(item.media),
      faltas: Number(item.faltas),
      total_aulas: Number(item.total_aulas),
    })));
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao listar registros acadêmicos.', detail: error.message });
  }
}

module.exports = {
  getReportCard,
  listAcademicRecords,
};
