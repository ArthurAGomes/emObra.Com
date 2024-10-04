// routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const findUserByEmailOrCpf = require('../utils/findUser');

// Rota de login utilizando GET
router.get('/auth', async (req, res) => {
    const { identifier, senha } = req.query;  // Captura os parâmetros da query string

    try {
        // Chama a função para buscar o usuário por email ou CPF
        const userResult = await findUserByEmailOrCpf(identifier);
        if (!userResult) {
            return res.status(404).send('Usuário não encontrado ou inativo.');
        }

        const { user, type } = userResult;

        // Compara a senha
        const isPasswordValid = await bcrypt.compare(senha, user.senha);
        if (!isPasswordValid) {
            return res.status(400).send('Senha incorreta.');
        }

        // Gera o token JWT
        const token = jwt.sign({ userId: user.id, userType: type }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(200).json({ token, message: 'Login realizado com sucesso!' });

    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).send('Ocorreu um erro ao tentar realizar o login.');
    }
});

module.exports = router;
