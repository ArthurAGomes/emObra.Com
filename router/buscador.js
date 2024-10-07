const express = require('express');
const router = express.Router();
const { buscarPorLocalizacao } = require('../utils/geolocation');

router.get('/buscar', async (req, res) => {
    const { cep, tipo, engine } = req.query;

    // Verificação básica dos parâmetros
    if (!cep || !tipo || !engine) {
        return res.status(400).send('CEP, tipo e engine (tipo de obra) são obrigatórios.');
    }

    if (tipo !== 'servico' && tipo !== 'pedreiro') {
        return res.status(400).send('Tipo de busca inválido. Use "servico" ou "pedreiro".');
    }

    try {
        const resultados = await buscarPorLocalizacao(tipo, cep, engine);
        console.log(resultados); // Log dos resultados
        if (resultados.length === 0) {
            return res.status(404).send('Nenhum resultado encontrado.');
        }
        res.json(resultados);
    } catch (error) {
        console.error(error);
        res.status(500).send(`Erro ao buscar ${tipo}s.`);
    }
});

module.exports = router;
