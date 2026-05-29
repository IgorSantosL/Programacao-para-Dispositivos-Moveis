const jwt = require('jsonwebtoken');

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: 'Token não informado.' });
  }

  const [, token] = authHeader.split(' ');

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'app_scholar_super_secret_key');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido.' });
  }
}

function authorize(...profiles) {
  return (req, res, next) => {
    if (!req.user || !profiles.includes(req.user.perfil)) {
      return res.status(403).json({ message: 'Acesso negado para este perfil.' });
    }

    next();
  };
}

module.exports = {
  authenticate,
  authorize,
};
