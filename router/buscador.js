// routes/buscar.js
const express = require('express');
const router = express.Router();
const { buscarPorLocalizacao } = require('../utils/geolocation');

router.get('/buscar', async (req, res) => {
    const { cep, tipo } = req.query;

    if (!cep || !tipo) {
        return res.status(400).send('CEP e tipo de busca são obrigatórios.');
    }

    if (tipo !== 'servico' && tipo !== 'pedreiro') {
        return res.status(400).send('Tipo de busca inválido. Use "servico" ou "pedreiro".');
    }

    try {
        const resultados = await buscarPorLocalizacao(tipo, cep);
        res.json(resultados);
    } catch (error) {
        console.error(error);
        res.status(500).send(`Erro ao buscar ${tipo}s.`);
    }
});

module.exports = router;
