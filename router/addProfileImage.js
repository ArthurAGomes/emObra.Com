const express = require('express');
const router = express.Router();
const mysql = require('mysql'); // Importa o mysql

// Configuração da conexão com o banco de dados usando variáveis de ambiente
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
});

// Rota para obter a URL da imagem de perfil
router.get('/addProfileImage', (req, res) => {
    const userId = req.session.userId; // ID do usuário logado
    const userType = req.session.userType; // Tipo de usuário (contratante ou pedreiro)

    if (!userId) {
        return res.status(401).send('Usuário não autenticado');
    }

    // Determina a tabela a ser consultada com base no tipo de usuário
    const table = userType === 'contratante' ? 'contratantes' : 'pedreiros';
    
    // Consultar a URL da imagem de perfil na tabela correspondente
    const query = `SELECT img_perfil FROM ${table} WHERE id = ?`;
    db.query(query, [userId], (err, result) => {
        if (err) {
            console.error('Erro ao buscar imagem de perfil:', err);
            return res.status(500).send('Erro ao buscar imagem de perfil');
        }

        console.log('Resultado da consulta:', result); // Log do resultado da consulta

        if (result.length > 0 && result[0].img_perfil) {
            res.json({ profileImageUrl: result[0].img_perfil });
        } else {
            res.json({ profileImageUrl: 'imagensPedreiro/pedreiro-avatar.png' }); // Imagem padrão
        }
    });
});

module.exports = router; // Exporta o roteador
