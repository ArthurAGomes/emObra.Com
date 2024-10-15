const express = require('express');
const router = express.Router();
const pool = require('../config/db'); // Importa a pool de conexões do db.js

// Rota para obter a URL da imagem de perfil
router.get('/addProfileImage', async (req, res) => {
    const userId = req.session.userId; // ID do usuário logado
    const userType = req.session.userType; // Tipo de usuário (contratante ou pedreiro)

    if (!userId) {
        return res.status(401).send('Usuário não autenticado');
    }

    // Determina a tabela a ser consultada com base no tipo de usuário
    const table = userType === 'contratante' ? 'contratantes' : 'pedreiros';
    
    try {
        const query = `SELECT img_perfil FROM ${table} WHERE id = ?`;
        const [rows] = await pool.query(query, [userId]); // Usa a pool para fazer a consulta

        if (rows.length > 0 && rows[0].img_perfil) {
            res.json({ profileImageUrl: rows[0].img_perfil });
        } else {
            res.json({ profileImageUrl: 'imagensPedreiro/pedreiro-avatar.png' }); // Imagem padrão
        }
    } catch (err) {
        console.error('Erro ao buscar imagem de perfil:', err);
        return res.status(500).send('Erro ao buscar imagem de perfil');
    }
});

module.exports = router; // Exporta o roteador
