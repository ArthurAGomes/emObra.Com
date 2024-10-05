const express = require('express');
const router = express.Router();
const { buscarServicosOuPedreiros } = require('../utils/geolocation');

// Rota para busca de pedreiros ou serviços
router.get('/buscar', async (req, res) => {
    const { engine, cep } = req.query;

    try {
        const resultados = await buscarServicosOuPedreiros(engine, cep);
        res.json(resultados);
    } catch (error) {
        console.error(error);
        res.status(500).send('Erro ao buscar pedreiros ou serviços');
    }
});

module.exports = router;
