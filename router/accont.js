const express = require('express');
const mysql = require('mysql2/promise');
const router = express.Router();

// Criação da conexão com o banco de dados
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
});

// Função auxiliar para buscar usuário
async function getUserById(userId) {
    const [user] = await pool.query(`
        SELECT 'pedreiro' AS tipo, id, nome, email, telefone, cep, cpf, img_perfil, 
               tipo_servico_1, tipo_servico_2, tipo_servico_3, tipo_servico_4, tipo_servico_5
        FROM pedreiros 
        WHERE id = ? 
        UNION 
        SELECT 'contratante' AS tipo, id, nome, email, telefone, cep, cpf, img_perfil, NULL, NULL, NULL, NULL, NULL
        FROM contratantes 
        WHERE id = ?`, 
        [userId, userId]);

    return user.length > 0 ? user[0] : null;
}

// Rota para exibir o formulário de edição
router.get('/editar-conta', async (req, res) => {
    const userId = req.session.userId; // Obter o ID do usuário da sessão
    if (!userId) {
        return res.status(403).send('Você deve estar logado para editar sua conta.');
    }

    const user = await getUserById(userId);
    
    if (!user) {
        return res.status(404).send('Usuário não encontrado.');
    }

    // Verifica o tipo de usuário e redireciona para a página correspondente
    if (user.tipo === 'pedreiro') {
        res.render('editar-conta', { user });
    } else if (user.tipo === 'contratante') {
        res.render('editar-contratante', { user });
    } else {
        return res.status(400).send('Tipo de usuário desconhecido.');
    }
});

// Rota para atualizar os dados do pedreiro
router.post('/editar', async (req, res) => {
    const userId = req.session.userId;
    if (!userId) {
        return res.status(403).send('Você deve estar logado para editar sua conta.');
    }

    const { nome, email, telefone, cep, cpf, tipos_servicos } = req.body;

    // Atualiza os tipos de serviços, garantindo que sejam números ou nulos
    const updatedTiposServicos = [
        parseInt(tipos_servicos[0], 10) || null, 
        parseInt(tipos_servicos[1], 10) || null, 
        parseInt(tipos_servicos[2], 10) || null, 
        parseInt(tipos_servicos[3], 10) || null, 
        parseInt(tipos_servicos[4], 10) || null
    ];

    // Atualiza os dados do pedreiro
    const [result] = await pool.query(`
        UPDATE pedreiros 
        SET nome = ?, email = ?, telefone = ?, cep = ?, cpf = ?, 
            tipo_servico_1 = ?, tipo_servico_2 = ?, tipo_servico_3 = ?, tipo_servico_4 = ?, tipo_servico_5 = ? 
        WHERE id = ?`, 
        [
            nome, email, telefone, cep, cpf, 
            ...updatedTiposServicos, 
            userId
        ]);

    if (result.affectedRows === 0) {
        return res.status(404).send('Usuário não encontrado.');
    }

    // Redireciona para o perfil do pedreiro
    res.redirect('/perfil-pedreiro');
});

// Rota para atualizar os dados do contratante
router.post('/editar-contratante', async (req, res) => {
    const userId = req.session.userId;
    if (!userId) {
        return res.status(403).send('Você deve estar logado para editar sua conta.');
    }

    const { nome, email, telefone, cep, cpf } = req.body;

    // Atualiza os dados do contratante
    const [result] = await pool.query(`
        UPDATE contratantes 
        SET nome = ?, email = ?, telefone = ?, cep = ?, cpf = ? 
        WHERE id = ?`, 
        [nome, email, telefone, cep, cpf, userId]);

    if (result.affectedRows === 0) {
        return res.status(404).send('Usuário não encontrado.');
    }

    // Redireciona para o perfil do contratante
    res.redirect('/perfil-contratante');
});

module.exports = router;
