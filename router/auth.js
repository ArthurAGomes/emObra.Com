// routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const findUserByEmailOrCpf = require('../utils/findUser');
const pool = require('../config/db');

// Rota para renderizar a página de login
router.get('/login', (req, res) => {
    res.render('login');
});

// Rota de login
router.post('/auth', async (req, res) => {
    const { identifier, senha } = req.body;

    try {
        const userResult = await findUserByEmailOrCpf(identifier);
        if (!userResult) {
            return res.status(404).send('Usuário não encontrado ou inativo.');
        }

        const { user, type } = userResult;
        const isPasswordValid = await bcrypt.compare(senha, user.senha);
        if (!isPasswordValid) {
            return res.status(400).send('Senha incorreta.');
        }

        // Armazena informações do usuário na sessão
        req.session.userId = user.id;
        req.session.userType = type;

        // Redireciona para o perfil com base no tipo de usuário
        if (type === 'pedreiro') {
            return res.redirect('/perfil-pedreiro');
        } else {
            return res.redirect('/perfil-contratante');
        }

    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).send('Ocorreu um erro ao tentar realizar o login.');
    }
});

// Rota de logout
router.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Erro ao destruir a sessão:', err);
            return res.status(500).send('Erro ao fazer logout.');
        }
        res.clearCookie('connect.sid');  // Limpa o cookie da sessão
        res.redirect('/');          // Redireciona para a página de index
    });
});


// Middleware para verificar se o usuário está autenticado
const isAuthenticated = (req, res, next) => {
    if (req.session.userId) {
        next();  // O usuário está autenticado
    } else {
        res.redirect('/login');  // Redireciona para a página de login
    }
};

// Rota de perfil do contratante
router.get('/perfil-contratante', isAuthenticated, (req, res) => {
    res.render('perfil-contratante', { userId: req.session.userId });
});

// Rota de perfil do pedreiro
router.get('/perfil-pedreiro', isAuthenticated, async (req, res) => {
    try {
        // Consulta para buscar os parceiros institucionais
        const [instituicoes] = await pool.query('SELECT nome_parceiro, descricao, imagem, url FROM parceiros WHERE tipo_parceiro = ?', ['institucional']);
        
        // Consulta para buscar as lojas
        const [lojas] = await pool.query('SELECT nome_parceiro, endereco, contato, imagem, url FROM parceiros WHERE tipo_parceiro = ?', ['loja']);
        
        // Consulta para buscar os dados do pedreiro
        const [pedreiro] = await pool.query('SELECT * FROM pedreiros WHERE id = ?', [req.session.userId]);

        // Renderiza a página 'perfil-pedreiro.ejs' e passa os dados necessários
        res.render('perfil-pedreiro', { userId: req.session.userId, instituicoes, lojas, pedreiro });

    } catch (error) {
        console.error(error);
        res.status(500).send('Erro ao carregar os dados do perfil.');
    }
});

module.exports = router;
