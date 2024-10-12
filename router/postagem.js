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
router.post('/candidatar-servico', async (req, res) => {
    const { id } = req.body;  // Alterado de servico_id para id
    const pedreiro_id = req.session.userId;

    if (!id) {
        return res.status(400).send('Serviço não encontrado.');
    }

    const query = `
        INSERT INTO candidaturas_pedreiros (servico_id, pedreiro_id)
        VALUES (?, ?)
    `;

    try {
        await pool.query(query, [id, pedreiro_id]);  // Passa o id
        res.status(200).send('Candidatura realizada com sucesso.');
    } catch (err) {
        console.error('Erro ao candidatar ao serviço:', err);
        res.status(500).send('Erro ao candidatar ao serviço.');
    }
});



router.post('/aceitar-pedreiro', isAuthenticated, async (req, res) => {
    const { candidatura_id, id } = req.body;  // Alterado de servico_id para id
    const contratante_id = req.session.userId; 

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // Verificar se a candidatura pertence ao serviço e ao contratante
        const verifyQuery = `
            SELECT cp.id, sp.contratante_id
            FROM candidaturas_pedreiros cp
            JOIN servicos_postados sp ON cp.servico_id = sp.id
            WHERE cp.id = ? AND sp.id = ? AND sp.contratante_id = ?
        `;
        const [rows] = await connection.query(verifyQuery, [candidatura_id, id, contratante_id]);

        if (rows.length === 0) {
            await connection.rollback();
            return res.status(403).send('Candidatura ou serviço inválido.');
        }

        // Atualizar a candidatura escolhida para 'aceito'
        const updateChosen = `
            UPDATE candidaturas_pedreiros
            SET status = 'aceito'
            WHERE id = ?
        `;
        await connection.query(updateChosen, [candidatura_id]);

        // Atualizar as outras candidaturas para 'recusado', mas apenas para o mesmo serviço
        const updateOthers = `
            UPDATE candidaturas_pedreiros
            SET status = 'recusado'
            WHERE servico_id = ? AND id != ?
        `;
        await connection.query(updateOthers, [id, candidatura_id]);

        // Atualizar o serviço com o pedreiro escolhido e o status do serviço
        const updateService = `
            UPDATE servicos_postados
            SET pedreiro_id = (
                SELECT pedreiro_id FROM candidaturas_pedreiros WHERE id = ?
            ), status = 'aceito'
            WHERE id = ? AND contratante_id = ?
        `;
        await connection.query(updateService, [candidatura_id, id, contratante_id]);

        await connection.commit();
        res.status(200).send('Pedreiro aceito com sucesso.');
    } catch (err) {
        await connection.rollback();
        console.error('Erro ao aceitar o pedreiro:', err);
        res.status(500).send('Erro ao aceitar o pedreiro.');
    } finally {
        connection.release();
    }
});




module.exports = router;
