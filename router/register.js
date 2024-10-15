const express = require('express');
const router = express.Router();
const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sendActivationEmail = require('../utils/sendActivationEmail');
require('dotenv').config();


// Rota para renderizar a página de cadastro
router.get('/register', async (req, res) => {

    try{
        const [servicos] = await db.query('SELECT id, nome_servico, img_servico, desc_servico FROM tipo_servicos ORDER BY nome_servico ASC');

        res.render('register', { servicos });
    } catch (err){
        console.error('Erro ao carregar os tipos de serviço:', err);
    }
    
});

// Rota de cadastro para Pedreiro
router.post('/register/pedreiro', async (req, res) => {
    const { nome, telefone, cpf, email, senha, cep, tipos_servicos } = req.body;

    try {
        const [existingUser] = await db.query(`SELECT * FROM pedreiros WHERE cpf = ? OR email = ?`, [cpf, email]);

        if (existingUser.length > 0) {
            return res.status(400).send('Já existe um cadastro com esse CPF ou Email. Faça login');
        }

        const hashedPassword = await bcrypt.hash(senha, 10);
        const tipos = tipos_servicos ? tipos_servicos.slice(0, 3) : [];
        
        const insertQuery = `INSERT INTO pedreiros (nome, telefone, cpf, email, senha, cep, ativo, tipo_servico_1, tipo_servico_2, tipo_servico_3)
                             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        const values = [nome, telefone, cpf, email, hashedPassword, cep, 0, tipos[0] || null, tipos[1] || null, tipos[2] || null];

        const [result] = await db.query(insertQuery, values);
        const token = jwt.sign({ pedreiroId: result.insertId }, process.env.JWT_SECRET, { expiresIn: '1h' });

        await sendActivationEmail(email, nome, token, 'pedreiros');

        res.status(201).send('Cadastro de pedreiro realizado com sucesso! Verifique seu e-mail para ativar sua conta.');
    } catch (error) {
        console.error('Erro ao realizar o cadastro de pedreiro:', error);
        res.status(500).send('Ocorreu um erro ao realizar o cadastro.');
    }
});

// Rota de cadastro para Contratante
router.post('/register/contratante', async (req, res) => {
    const { nome, telefone, cpf, email, senha, cep } = req.body;

    try {
        const [existingUser] = await db.query(`SELECT * FROM contratantes WHERE cpf = ? OR email = ?`, [cpf, email]);

        if (existingUser.length > 0) {
            return res.status(400).send('Já existe um cadastro com esse CPF ou Email. Faça login');
        }

        const hashedPassword = await bcrypt.hash(senha, 10);
        
        const insertQuery = `INSERT INTO contratantes (nome, telefone, cpf, email, senha, cep, ativo)
                             VALUES (?, ?, ?, ?, ?, ?, ?)`;
        const values = [nome, telefone, cpf, email, hashedPassword, cep, 0];

        const [result] = await db.query(insertQuery, values);
        const token = jwt.sign({ contratanteId: result.insertId }, process.env.JWT_SECRET, { expiresIn: '1h' });

        await sendActivationEmail(email, nome, token, 'contratantes');

        res.status(201).send('Cadastro de contratante realizado com sucesso! Verifique seu e-mail para ativar sua conta.');
    } catch (error) {
        console.error('Erro ao realizar o cadastro de contratante:', error);
        res.status(500).send('Ocorreu um erro ao realizar o cadastro.');
    }
});

// Rota para ativar a conta de pedreiro
router.get('/pedreiros/activate/:token', async (req, res) => {
    const { token } = req.params;

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const pedreiroId = decoded.pedreiroId;

        if (!pedreiroId) {
            return res.status(400).send('Token inválido');
        }

        const updateQuery = 'UPDATE pedreiros SET ativo = 1 WHERE id = ?';
        const [updateResult] = await db.query(updateQuery, [pedreiroId]);

        if (updateResult.affectedRows === 0) {
            return res.status(404).send('Pedreiro não encontrado ou já ativado.');
        }

        res.redirect(`/login?message=Conta ativade com sucesso, faça login!`);
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(400).send('Erro ao ativar a conta. O token expirou.');
        }

        console.error('Erro ao ativar a conta de pedreiro:', error);
        res.status(400).send('Erro ao ativar a conta. O token pode ser inválido.');
    }
});

// Rota para ativar a conta de contratante
router.get('/contratantes/activate/:token', async (req, res) => {
    const { token } = req.params;

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const contratanteId = decoded.contratanteId;

        const updateQuery = 'UPDATE contratantes SET ativo = 1 WHERE id = ?';
        const [updateResult] = await db.query(updateQuery, [contratanteId]);

        if (updateResult.affectedRows === 0) {
            return res.status(404).send('Contratante não encontrado ou já ativado.');
        }

        res.redirect(`/login?message=Conta ativade com sucesso, faça login!`);
    } catch (error) {
        console.error('Erro ao ativar a conta de contratante:', error);
        res.status(400).send('Erro ao ativar a conta. O token pode ser inválido ou ter expirado.');
    }
});

module.exports = router;
