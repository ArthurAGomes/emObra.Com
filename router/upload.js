const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const pool = require('../config/db');
const isAuthenticated = require('../router/auth').isAuthenticated;

// Configuração do multer para armazenamento de arquivos
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Verifica o tipo de usuário na sessão
        const userType = req.session.userType; // Supondo que você tenha o tipo de usuário na sessão
        let uploadPath;

        // Define o caminho de upload com base no tipo de usuário
        if (userType === 'contratante') {
            uploadPath = 'imagensContratante/'; // Pasta para contratantes
        } else if (userType === 'pedreiro') {
            uploadPath = 'imagensPedreiro/'; // Pasta para pedreiros
        } else {
            return cb(new Error('Tipo de usuário inválido')); // Tratamento de erro caso o tipo não seja reconhecido
        }

        cb(null, uploadPath); // Define a pasta de destino
    },
    filename: (req, file, cb) => {
        const userId = req.session.userId; // Obtém o ID do usuário da sessão
        const fileExt = path.extname(file.originalname); // Obtém a extensão do arquivo
        cb(null, `${userId}${fileExt}`); // Nomeia o arquivo como ID do usuário
    }
});

const upload = multer({ storage });

// Rota para upload da foto de perfil
// Rota para upload da foto de perfil
router.post('/upload-foto', isAuthenticated, upload.single('fotoPerfil'), async (req, res) => {
    if (!req.file) {
        return res.status(400).send('Nenhum arquivo foi enviado.');
    }

    const userId = req.session.userId; // Obtém o ID do usuário da sessão
    const fileName = req.file.filename; // O nome do arquivo com o ID do usuário

    try {
        // Atualiza a coluna img_perfil no banco de dados
        const [result] = await pool.query('UPDATE pedreiros SET img_perfil = ? WHERE id = ?', [fileName, userId]);
        
        // Verifica se a atualização foi bem-sucedida
        if (result.affectedRows === 0) {
            return res.status(404).send('Usuário não encontrado para atualizar.');
        }

        // Redireciona para a página de perfil do pedreiro
        return res.redirect('/perfil-pedreiro');
    } catch (error) {
        console.error('Erro ao atualizar a foto de perfil:', error);
        return res.status(500).send('Erro ao atualizar a foto de perfil.');
    }
});



module.exports = router;
