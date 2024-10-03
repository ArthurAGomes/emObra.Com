const express = require('express');
const router = express.Router();
const db = require('../config/db'); 

// Rota para renderizar a página de cadastro
router.get('/register', (req, res) => {
    res.render('register'); // Renderiza a view 'register.ejs'
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

        // Verifica os tipos de serviços selecionados
        const tipos = tipos_servicos ? tipos_servicos.slice(0, 3) : [];
        const insertQuery = `INSERT INTO pedreiros (nome, telefone, cpf, email, senha, cep, ativo, tipo_servico_1, tipo_servico_2, tipo_servico_3)
                             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        const values = [nome, telefone, cpf, email, senha, cep, 0, tipos[0] || null, tipos[1] || null, tipos[2] || null];

        // Executa a inserção
        await db.query(insertQuery, values);
        res.status(201).send('Cadastro de pedreiro realizado com sucesso!');
        
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

        const insertQuery = `INSERT INTO contratantes (nome, telefone, cpf, email, senha, cep, ativo)
                             VALUES (?, ?, ?, ?, ?, ?, ?)`;
        const values = [nome, telefone, cpf, email, senha, cep, 0];

        
        await db.query(insertQuery, values);
        res.status(201).send('Cadastro de contratante realizado com sucesso!');
        
    } catch (error) {
        console.error(error); 
        res.status(500).send('Ocorreu um erro ao realizar o cadastro.');
    }
});

module.exports = router; 