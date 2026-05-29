const initDatabase = require('./init');
const pool = require('./pool');

(async () => {
  try {
    await initDatabase();
    console.log('Banco inicializado e seed aplicado com sucesso.');
  } catch (error) {
    console.error('Falha ao executar seed:', error.message);
  } finally {
    await pool.end();
  }
})();
