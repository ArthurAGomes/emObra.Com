// routes/postagem.js
const express = require('express');
const router = express.Router();
const isAuthenticated = require('../router/auth'); // Ajuste correto do caminho
const pool = require('../config/db');

// Rota para receber a postagem de serviço
router.post('/postar-servico', isAuthenticated, async (req, res) => {
    const { descricao, tipo_servico, cep, prazo_combinar, valor } = req.body;
    const contratante_id = req.session.userId;

    console.log('User ID:', contratante_id);  // Verifique se o userId está presente

    const cep_final = cep && cep.trim() !== '' ? cep : req.session.cep;

    if (!descricao || !tipo_servico || !valor || !prazo_combinar) {
        return res.status(400).send('Preencha todos os campos obrigatórios.');
    }

    const query = `
        INSERT INTO servicos_postados (descricao, contratante_id, tipo_servico, prazo_combinar, valor, cep_obra) 
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    try {
        await pool.query(query, [descricao, contratante_id, tipo_servico, prazo_combinar, valor, cep_final]);
        res.status(201).send('Serviço postado');
    } catch (err) {
        console.error('Erro ao postar o serviço:', err);
        res.status(500).send('Erro ao postar o serviço.');
    }
});

module.exports = router;
