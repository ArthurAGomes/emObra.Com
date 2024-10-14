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
        req.session.userId = user.id;  // Certifique-se de que isso está sendo executado
        req.session.userType = type;

        console.log('Sessão após login:', req.session);  // Adicione este log para verificar a sessão

        // Redireciona com base no tipo de usuário
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
    console.log('Verificando autenticação...', req.session.userId);
    if (req.session.userId) {
        next();  // O usuário está autenticado
    } else {
        console.log('Usuário não autenticado, redirecionando para login...');
        res.redirect('/login');  // Redireciona para a página de login
    }
};


router.get('/isAuthenticated', async (req, res) => {
    if (req.session.userId) {
        try {
            const [result] = await pool.query('SELECT cep FROM contratantes WHERE id = ?', [req.session.userId]);

            if (result.length > 0) {
                const { cep } = result[0];
                res.json({ authenticated: true, cep });
            } else {
                res.json({ authenticated: true, cep: null });
            }
        } catch (error) {
            console.error('Erro ao buscar o CEP do usuário:', error);
            res.status(500).json({ authenticated: false });
        }
    } else {
        res.json({ authenticated: false });
    }
});

// Rota de perfil do contratante
router.get('/perfil-contratante', isAuthenticated, async (req, res) => {
    try {
        const [tiposServicos] = await pool.query('SELECT id, nome_servico FROM tipo_servicos');

        const [solicitacoes] = await pool.query('SELECT * FROM servicos_postados');

        // Consulta para buscar os dados do pedreiro
        const [contratante] = await pool.query('SELECT * FROM contratantes WHERE id = ?', [req.session.userId]);

        // Consulta para buscar os parceiros institucionais
        const [instituicoes] = await pool.query('SELECT nome_parceiro, descricao, imagem, url FROM parceiros WHERE tipo_parceiro = ?', ['institucional']);

        // Consulta para buscar as lojas
        const [lojas] = await pool.query('SELECT nome_parceiro, endereco, contato, imagem, url FROM parceiros WHERE tipo_parceiro = ?', ['loja']);

        res.render('perfil-contratante', { userId: req.session.userId, tipos_servicos: tiposServicos, solicitacoes, contratante, lojas, instituicoes });
    } catch (err) {
        console.error('Erro ao carregar os tipos de serviço:', err);
        res.status(500).send('Erro ao carregar os tipos de serviço.');
    }
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

        const [servicos] = await pool.query('SELECT id, nome_servico, img_servico FROM tipo_servicos');

        // Renderiza a página 'perfil-pedreiro.ejs' e passa os dados necessários
        res.render('perfil-pedreiro', { userId: req.session.userId, instituicoes, lojas, pedreiro, servicos });

    } catch (error) {
        console.error(error);
        res.status(500).send('Erro ao carregar os dados do perfil.');
    }
});

// routes/contratante.js
router.get('/solicitacoes', isAuthenticated, async (req, res) => {
    const contratante_id = req.session.userId;

    const query = `
        SELECT cp.id, sp.descricao, p.nome AS nome_pedreiro, cp.status
        FROM candidaturas_pedreiros cp
        JOIN servicos_postados sp ON cp.servico_id = sp.id
        JOIN pedreiros p ON cp.pedreiro_id = p.id
        WHERE sp.contratante_id = ? AND sp.status = 'pendente'
    `;

    try {
        const [rows] = await pool.query(query, [contratante_id]);
        res.render('perfil-contratante', { solicitacoes: rows });
    } catch (err) {
        console.error('Erro ao buscar solicitações:', err);
        res.status(500).send('Erro ao buscar solicitações.');
    }
});

module.exports=router