const express = require('express');
const router = express.Router();
const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sendActivationEmail = require('../utils/sendActivationEmail');

// Rota para renderizar a página de cadastro
router.get('/register', (req, res) => {
    res.render('register');
});

// Rota de cadastro para Pedreiro
router.post('/register/pedreiro', async (req, res) => {
    const { nome, telefone, cpf, email, senha, cep, tipos_servicos } = req.body;

    try {
        // Verifica se já existe um cadastro para o mesmo CPF ou email
        const [existingUser] = await db.query(`SELECT * FROM pedreiros WHERE cpf = ? OR email = ?`, [cpf, email]);

        if (existingUser.length > 0) {
            return res.status(400).send('Já existe um cadastro com esse CPF ou Email. Faça login');
        }

        // Criptografa a senha
        const hashedPassword = await bcrypt.hash(senha, 10);

        // Verifica os tipos de serviços selecionados
        const tipos = tipos_servicos ? tipos_servicos.slice(0, 3) : [];
        const insertQuery = `INSERT INTO pedreiros (nome, telefone, cpf, email, senha, cep, ativo, tipo_servico_1, tipo_servico_2, tipo_servico_3)
                             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        const values = [nome, telefone, cpf, email, hashedPassword, cep, 0, tipos[0] || null, tipos[1] || null, tipos[2] || null];

        // Executa a inserção
        const result = await db.query(insertQuery, values);

        // Gera um token de ativação
        const token = jwt.sign({ pedreiroId: result.insertId }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Envia o e-mail de ativação
        await sendActivationEmail(email, nome, token);

        res.status(201).send('Cadastro de pedreiro realizado com sucesso! Verifique seu e-mail para ativar sua conta.');
        
    } catch (error) {
        console.error(error); 
        res.status(500).send('Ocorreu um erro ao realizar o cadastro.');
    }
});

// Rota de cadastro para Contratante
router.post('/register/contratante', async (req, res) => {
    const { nome, telefone, cpf, email, senha, cep } = req.body;

    try {
        // Verifica se já existe um cadastro para o mesmo CPF ou email
        const [existingUser] = await db.query(`SELECT * FROM contratantes WHERE cpf = ? OR email = ?`, [cpf, email]);

        if (existingUser.length > 0) {
            return res.status(400).send('Já existe um cadastro com esse CPF ou Email. Faça login');
        }

        // Criptografa a senha
        const hashedPassword = await bcrypt.hash(senha, 10);

        const insertQuery = `INSERT INTO contratantes (nome, telefone, cpf, email, senha, cep, ativo)
                             VALUES (?, ?, ?, ?, ?, ?, ?)`;
        const values = [nome, telefone, cpf, email, hashedPassword, cep, 0];

        const result = await db.query(insertQuery, values);

        // Gera um token de ativação
        const token = jwt.sign({ contratanteId: result.insertId }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Envia o e-mail de ativação
        await sendActivationEmail(email, nome, token);

        res.status(201).send('Cadastro de contratante realizado com sucesso! Verifique seu e-mail para ativar sua conta.');
        
    } catch (error) {
        console.error(error); 
        res.status(500).send('Ocorreu um erro ao realizar o cadastro.');
    }
});

// Rota para ativar a conta de pedreiro
router.get('/pedreiros/activate/:token', async (req, res) => {
    const { token } = req.params;

    try {
        // Verifica e decodifica o token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const pedreiroId = decoded.pedreiroId;

        // Atualiza o status de ativo do pedreiro
        await db.query('UPDATE pedreiros SET ativo = 1 WHERE id = ?', [pedreiroId]);

        res.redirect('http://10.24.89.23:3000/login');  // Redireciona para a página de login
    } catch (error) {
        res.status(400).send('Erro ao ativar a conta.');
    }
});

// Rota para ativar a conta de contratante
router.get('/contratantes/activate/:token', async (req, res) => {
    const { token } = req.params;

    try {
        // Verifica e decodifica o token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const contratanteId = decoded.contratanteId;

        // Atualiza o status de ativo do contratante
        await db.query('UPDATE contratantes SET ativo = 1 WHERE id = ?', [contratanteId]);

        res.redirect('http://10.24.89.23:3000/login');  // Redireciona para a página de login
    } catch (error) {
        res.status(400).send('Erro ao ativar a conta.');
    }
});

module.exports = router;
