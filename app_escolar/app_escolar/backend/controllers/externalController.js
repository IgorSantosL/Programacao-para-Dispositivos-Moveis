const axios = require('axios');

async function getCep(req, res) {
  try {
    const { cep } = req.params;
    const cleanCep = String(cep).replace(/\D/g, '');

    const { data } = await axios.get(`https://viacep.com.br/ws/${cleanCep}/json/`);

    if (data.erro) {
      return res.status(404).json({ message: 'CEP não encontrado.' });
    }

    return res.json({
      cep: data.cep?.replace(/\D/g, '') || cleanCep,
      endereco: `${data.logradouro || ''}${data.bairro ? ` - ${data.bairro}` : ''}`.trim(),
      cidade: data.localidade,
      estado: data.uf,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao consultar ViaCEP.', detail: error.message });
  }
}

async function getStates(req, res) {
  try {
    const { data } = await axios.get('https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome');
    return res.json(data.map((item) => ({ id: item.id, nome: item.nome, sigla: item.sigla })));
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao consultar estados no IBGE.', detail: error.message });
  }
}

async function getCitiesByState(req, res) {
  try {
    const { uf } = req.params;
    const { data } = await axios.get(
      `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${String(uf).toUpperCase()}/municipios`
    );
    return res.json(data.map((item) => item.nome));
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao consultar cidades no IBGE.', detail: error.message });
  }
}

module.exports = {
  getCep,
  getStates,
  getCitiesByState,
};
