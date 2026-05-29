const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../database/pool');

async function login(req, res) {
  try {
    const { login, senha } = req.body;

    if (!login || !senha) {
      return res.status(400).json({ message: 'Login e senha são obrigatórios.' });
    }

    const { rows } = await pool.query(
      `
        SELECT id, nome, email, login, senha_hash, perfil
        FROM usuarios
        WHERE email = $1 OR login = $1
        LIMIT 1
      `,
      [login]
    );

    const user = rows[0];

    if (!user) {
      return res.status(401).json({ message: 'Usuário não encontrado.' });
    }

    const passwordMatches = await bcrypt.compare(senha, user.senha_hash);

    if (!passwordMatches) {
      return res.status(401).json({ message: 'Senha inválida.' });
    }

    const token = jwt.sign(
      {
        id: user.id,
        nome: user.nome,
        email: user.email,
        perfil: user.perfil,
      },
      process.env.JWT_SECRET || 'app_scholar_super_secret_key',
      { expiresIn: '8h' }
    );

    return res.json({
      token,
      usuario: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        perfil: user.perfil,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao autenticar usuário.', detail: error.message });
  }
}

module.exports = {
  login,
};
