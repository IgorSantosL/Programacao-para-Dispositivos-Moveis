const bcrypt = require('bcryptjs');
const pool = require('./pool');

async function initDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS alunos (
      id SERIAL PRIMARY KEY,
      nome VARCHAR(150) NOT NULL,
      matricula INTEGER UNIQUE NOT NULL,
      curso VARCHAR(120) NOT NULL,
      email VARCHAR(150) UNIQUE NOT NULL,
      telefone VARCHAR(20) NOT NULL,
      cep VARCHAR(8) NOT NULL,
      endereco VARCHAR(255) NOT NULL,
      cidade VARCHAR(120) NOT NULL,
      estado VARCHAR(2) NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS professores (
      id SERIAL PRIMARY KEY,
      nome VARCHAR(150) NOT NULL,
      titulacao VARCHAR(120) NOT NULL,
      area VARCHAR(120) NOT NULL,
      tempo_docencia INTEGER NOT NULL,
      email VARCHAR(150) UNIQUE NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS disciplinas (
      id SERIAL PRIMARY KEY,
      nome VARCHAR(150) NOT NULL,
      carga_horaria INTEGER NOT NULL,
      professor_id INTEGER REFERENCES professores(id) ON DELETE SET NULL,
      curso VARCHAR(120) NOT NULL,
      semestre VARCHAR(40) NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS notas (
      id SERIAL PRIMARY KEY,
      aluno_id INTEGER NOT NULL REFERENCES alunos(id) ON DELETE CASCADE,
      disciplina_id INTEGER NOT NULL REFERENCES disciplinas(id) ON DELETE CASCADE,
      nota1 NUMERIC(4,2) NOT NULL,
      nota2 NUMERIC(4,2) NOT NULL,
      media NUMERIC(4,2) NOT NULL,
      situacao VARCHAR(20) NOT NULL,
      updated_at TIMESTAMP DEFAULT NOW(),
      UNIQUE (aluno_id, disciplina_id)
    );

    CREATE TABLE IF NOT EXISTS frequencias (
      id SERIAL PRIMARY KEY,
      aluno_id INTEGER NOT NULL REFERENCES alunos(id) ON DELETE CASCADE,
      disciplina_id INTEGER NOT NULL REFERENCES disciplinas(id) ON DELETE CASCADE,
      faltas INTEGER NOT NULL DEFAULT 0,
      total_aulas INTEGER NOT NULL DEFAULT 0,
      updated_at TIMESTAMP DEFAULT NOW(),
      UNIQUE (aluno_id, disciplina_id)
    );

    CREATE TABLE IF NOT EXISTS usuarios (
      id SERIAL PRIMARY KEY,
      nome VARCHAR(150) NOT NULL,
      email VARCHAR(150) UNIQUE NOT NULL,
      login VARCHAR(150) UNIQUE NOT NULL,
      senha_hash VARCHAR(255) NOT NULL,
      perfil VARCHAR(20) NOT NULL CHECK (perfil IN ('admin', 'professor', 'aluno')),
      professor_id INTEGER REFERENCES professores(id) ON DELETE SET NULL,
      aluno_id INTEGER REFERENCES alunos(id) ON DELETE SET NULL,
      created_at TIMESTAMP DEFAULT NOW()
    );
  `);

  // Seed professor sample
  const professorResult = await pool.query(
    `
      INSERT INTO professores (nome, titulacao, area, tempo_docencia, email)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (email) DO UPDATE SET
        nome = EXCLUDED.nome
      RETURNING id
    `,
    ['Prof. Mobile Scholar', 'Mestre', 'Programação Mobile', 8, 'prof.mobile@appscholar.com']
  );

  const professorId = professorResult.rows[0].id;

  // Seed sample student
  const studentResult = await pool.query(
    `
      INSERT INTO alunos (nome, matricula, curso, email, telefone, cep, endereco, cidade, estado)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (matricula) DO UPDATE SET
        nome = EXCLUDED.nome
      RETURNING id
    `,
    [
      'Maria Souza',
      2024001,
      'Análise e Desenvolvimento de Sistemas',
      'maria.souza@appscholar.com',
      '11999999999',
      '12246000',
      'Av. São João, 1000',
      'São José dos Campos',
      'SP',
    ]
  );

  const studentId = studentResult.rows[0].id;

  // Seed sample subject
  const subjectResult = await pool.query(
    `
      INSERT INTO disciplinas (nome, carga_horaria, professor_id, curso, semestre)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT DO NOTHING
      RETURNING id
    `,
    ['Programação Mobile', 80, professorId, 'Análise e Desenvolvimento de Sistemas', '2º Semestre']
  );

  let subjectId;
  if (subjectResult.rows.length) {
    subjectId = subjectResult.rows[0].id;
  } else {
    const existing = await pool.query(`SELECT id FROM disciplinas WHERE nome = $1 LIMIT 1`, ['Programação Mobile']);
    subjectId = existing.rows[0].id;
  }

  const adminPasswordHash = await bcrypt.hash('123456', 10);
  const professorPasswordHash = await bcrypt.hash('123456', 10);

  await pool.query(
    `
      INSERT INTO usuarios (nome, email, login, senha_hash, perfil)
      VALUES ($1, $2, $3, $4, 'admin')
      ON CONFLICT (email) DO NOTHING
    `,
    ['Administrador Scholar', 'admin@appscholar.com', 'admin@appscholar.com', adminPasswordHash]
  );

  await pool.query(
    `
      INSERT INTO usuarios (nome, email, login, senha_hash, perfil, professor_id)
      VALUES ($1, $2, $3, $4, 'professor', $5)
      ON CONFLICT (email) DO NOTHING
    `,
    ['Professor Scholar', 'prof.mobile@appscholar.com', 'prof.mobile@appscholar.com', professorPasswordHash, professorId]
  );

  await pool.query(
    `
      INSERT INTO notas (aluno_id, disciplina_id, nota1, nota2, media, situacao)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (aluno_id, disciplina_id)
      DO NOTHING
    `,
    [studentId, subjectId, 8.5, 7.5, 8.0, 'Aprovado']
  );

  await pool.query(
    `
      INSERT INTO frequencias (aluno_id, disciplina_id, faltas, total_aulas)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (aluno_id, disciplina_id)
      DO NOTHING
    `,
    [studentId, subjectId, 2, 40]
  );
}

module.exports = initDatabase;
