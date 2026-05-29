const pool = require('../database/pool');

function calculateAverage(nota1, nota2) {
  return Number(((Number(nota1) + Number(nota2)) / 2).toFixed(2));
}

function calculateSituation(media) {
  if (media >= 7) return 'Aprovado';
  if (media >= 5) return 'Recuperação';
  return 'Reprovado';
}

async function upsertGrades(req, res) {
  try {
    const { aluno_id, disciplina_id, nota1, nota2 } = req.body;

    if (!aluno_id || !disciplina_id || nota1 === undefined || nota2 === undefined) {
      return res.status(400).json({ message: 'Aluno, disciplina, nota1 e nota2 são obrigatórios.' });
    }

    const media = calculateAverage(nota1, nota2);
    const situacao = calculateSituation(media);

    const { rows } = await pool.query(
      `
        INSERT INTO notas (aluno_id, disciplina_id, nota1, nota2, media, situacao, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, NOW())
        ON CONFLICT (aluno_id, disciplina_id)
        DO UPDATE SET
          nota1 = EXCLUDED.nota1,
          nota2 = EXCLUDED.nota2,
          media = EXCLUDED.media,
          situacao = EXCLUDED.situacao,
          updated_at = NOW()
        RETURNING *
      `,
      [aluno_id, disciplina_id, nota1, nota2, media, situacao]
    );

    return res.status(201).json({
      message: 'Notas salvas com sucesso.',
      nota: rows[0],
    });
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao salvar notas.', detail: error.message });
  }
}

module.exports = {
  upsertGrades,
};
