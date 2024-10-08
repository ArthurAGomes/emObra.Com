// routes/user.js
const express = require('express');
const router = express.Router();
const verifyAuthToken = require('../router/auth');
const pool = require('../config/db');

// Rota para renderizar o perfil do contratante
router.get('/perfil-contratante', verifyAuthToken, (req, res) => {
    res.render('perfil-contratante', { user: req.user });
});

// Rota para renderizar o perfil do pedreiro
router.get('/perfil-pedreiro', verifyAuthToken, async (req, res) => {
    

    try {
               
        // Consulta para buscar os parceiros
        const [instituicoes] = await pool.query('SELECT nome_parceiro, descricao, imagem, url FROM parceiros WHERE tipo_parceiro = "institucional"');
        
        // Consulta para buscar os parceiros
        const [lojas] = await pool.query('SELECT nome_parceiro, endereco, contato, imagem, url FROM parceiros WHERE tipo_parceiro = "loja"');

        // Renderiza a página 'index.ejs' e passa os arrays 'servicos' e 'parceiros' para a view
        res.render('perfil-pedreiro', { user: req.user, instituicoes, lojas });

    } catch (error) {
        console.error(error);
        res.status(500).send('Erro ao carregar os tipos de serviços');
    }
});

module.exports = router;


