const express = require('express');
const { getCep, getStates, getCitiesByState } = require('../controllers/externalController');

const router = express.Router();

router.get('/external/cep/:cep', getCep);
router.get('/external/estados', getStates);
router.get('/external/cidades/:uf', getCitiesByState);

module.exports = router;
