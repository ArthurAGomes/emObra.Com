const express = require('express');
const router = express.Router();
const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sendActivationEmail = require('../utils/sendActivationEmail');
require('dotenv').config();

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

        // Verifica os tipos de serviços selecionados (máximo 3)
        const tipos = tipos_servicos ? tipos_servicos.slice(0, 3) : [];
        const insertQuery = `INSERT INTO pedreiros (nome, telefone, cpf, email, senha, cep, ativo, tipo_servico_1, tipo_servico_2, tipo_servico_3)
                             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        const values = [nome, telefone, cpf, email, hashedPassword, cep, 0, tipos[0] || null, tipos[1] || null, tipos[2] || null];

        // Executa a inserção e captura o resultado para obter o ID gerado
        const [result] = await db.query(insertQuery, values);
        console.log('ID do pedreiro inserido:', result.insertId);

        // Gera um token de ativação usando o ID gerado no banco
        const token = jwt.sign({ pedreiroId: result.insertId }, process.env.JWT_SECRET, { expiresIn: '1h' });
        console.log('Token gerado para ativação do pedreiro:', token); // Log do token gerado

        // Envia o e-mail de ativação
        await sendActivationEmail(email, nome, token, 'pedreiros'); // Alterado para 'pedreiros'

        res.status(201).send('Cadastro de pedreiro realizado com sucesso! Verifique seu e-mail para ativar sua conta.');
    } catch (error) {
        console.error('Erro ao realizar o cadastro de pedreiro:', error);
        res.status(500).send('Ocorreu um erro ao realizar o cadastro.');
    }
});

// Rota para ativar a conta de pedreiro
router.get('/pedreiros/activate/:token', async (req, res) => {
    const { token } = req.params;

    try {
        // Verifica e decodifica o token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Decoded token do pedreiro:', decoded); // Log do token decodificado
        const pedreiroId = decoded.pedreiroId;

        // Verifica se o pedreiroId está definido
        if (!pedreiroId) {
            console.error('pedreiroId não encontrado no token');
            return res.status(400).send('Token inválido');
        }

        // Atualiza o status de ativo do pedreiro
        const updateQuery = 'UPDATE pedreiros SET ativo = 1 WHERE id = ?';
        const [updateResult] = await db.query(updateQuery, [pedreiroId]);

        if (updateResult.affectedRows === 0) {
            console.error(`Nenhum pedreiro atualizado para o ID: ${pedreiroId}`);
            return res.status(404).send('Pedreiro não encontrado ou já ativado.');
        }

        console.log(`Pedreiro ativado com sucesso. ID: ${pedreiroId}`);
        res.redirect(`${process.env.HOST}:3000/register?activation=success`);
    } catch (error) {
        // Verifica se o erro é de token expirado
        if (error.name === 'TokenExpiredError') {
            console.error('Erro ao ativar a conta de pedreiro: Token expirado', error);
            return res.status(400).send('Erro ao ativar a conta. O token expirou.');
        }

        console.error('Erro ao ativar a conta de pedreiro:', error);
        res.status(400).send('Erro ao ativar a conta. O token pode ser inválido.');
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

        // Executa a inserção e captura o resultado para obter o ID gerado
        const [result] = await db.query(insertQuery, values);
        console.log('ID do contratante inserido:', result.insertId);

        // Gera um token de ativação
        const token = jwt.sign({ contratanteId: result.insertId }, process.env.JWT_SECRET, { expiresIn: '1h' });
        console.log('Token gerado para ativação do contratante:', token); // Log do token gerado

        // Envia o e-mail de ativação
        await sendActivationEmail(email, nome, token, 'contratantes'); // Alterado para 'contratantes'

        res.status(201).send('Cadastro de contratante realizado com sucesso! Verifique seu e-mail para ativar sua conta.');
    } catch (error) {
        console.error('Erro ao realizar o cadastro de contratante:', error);
        res.status(500).send('Ocorreu um erro ao realizar o cadastro.');
    }
});

// Rota para ativar a conta de contratante
router.get('/contratantes/activate/:token', async (req, res) => {
    const { token } = req.params;

    try {
        // Verifica e decodifica o token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Decoded token do contratante:', decoded); // Log do token decodificado
        const contratanteId = decoded.contratanteId; // Verifique se a propriedade está correta

        // Atualiza o status de ativo do contratante
        const updateQuery = 'UPDATE contratantes SET ativo = 1 WHERE id = ?';
        const [updateResult] = await db.query(updateQuery, [contratanteId]);

        if (updateResult.affectedRows === 0) {
            console.error(`Nenhum contratante atualizado para o ID: ${contratanteId}`);
            return res.status(404).send('Contratante não encontrado ou já ativado.');
        }

        console.log(`Contratante ativado com sucesso. ID: ${contratanteId}`);
        res.redirect(`${process.env.HOST}:3000/register?activation=success`);
    } catch (error) {
        console.error('Erro ao ativar a conta de contratante:', error);
        res.status(400).send('Erro ao ativar a conta. O token pode ser inválido ou ter expirado.');
    }
});

module.exports = router;
