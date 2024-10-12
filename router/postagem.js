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

// Rota para o pedreiro se candidatar a um serviço
router.post('/candidatar-servico', isAuthenticated, async (req, res) => {
    const { servico_id } = req.body; // Id do serviço ao qual o pedreiro está se candidatando
    const pedreiro_id = req.session.userId; // O id do pedreiro logado
    
    if (!servico_id) {
        return res.status(400).send('Serviço não encontrado.');
    }

    const query = `
        UPDATE servicos_postados
        SET pedreiro_id = ?
        WHERE id = ? AND status = 'pendente'
    `;

    try {
        const result = await pool.query(query, [pedreiro_id, servico_id]);
        if (result.affectedRows > 0) {
            res.status(200).send('Candidatura realizada com sucesso.');
        } else {
            res.status(400).send('Serviço não encontrado ou já aceito.');
        }
    } catch (err) {
        console.error('Erro ao candidatar ao serviço:', err);
        res.status(500).send('Erro ao candidatar ao serviço.');
    }
});

router.post('/aceitar-servico', isAuthenticated, async (req, res) => {
    const { servico_id } = req.body;
    const contratante_id = req.session.userId;

    const query = `
        UPDATE servicos_postados
        SET status = 'aceito'
        WHERE id = ? AND contratante_id = ?
    `;

    try {
        const result = await pool.query(query, [servico_id, contratante_id]);
        if (result.affectedRows > 0) {
            res.status(200).send('Solicitação aceita com sucesso.');
        } else {
            res.status(400).send('Solicitação não encontrada.');
        }
    } catch (err) {
        console.error('Erro ao aceitar solicitação:', err);
        res.status(500).send('Erro ao aceitar solicitação.');
    }
});


module.exports = router;
