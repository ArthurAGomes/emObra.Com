// router/upload.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const mysql = require('mysql2'); // Importando mysql2
require('dotenv').config(); // Importando variáveis de ambiente
 
const router = express.Router();
 
// Configuração do multer para armazenamento de arquivos.
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const userType = req.session.userType; // Supondo que você tenha o tipo de usuário na sessão
        let uploadPath;
 
        // Define o caminho de upload com base no tipo de usuário
        if (userType === 'contratante') {
            uploadPath = 'public/imagensContratante/';
        } else if (userType === 'pedreiro') {
            uploadPath = 'public/imagensPedreiro/';
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
 
// Configuração da conexão com o banco de dados usando variáveis de ambiente
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
});
 
// Rota para upload da foto de perfil
router.post('/upload-foto', upload.single('fotoPerfil'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('Nenhum arquivo foi enviado.');
    }
 
    const userId = req.session.userId; // Obtém o ID do usuário da sessão
    const imgPerfilUrl = `${req.file.filename}`; // Caminho da imagem
 
    // Atualiza a URL da imagem no banco de dados com base no tipo de usuário
    const userType = req.session.userType;
    let updateQuery;
 
    if (userType === 'contratante') {
        updateQuery = 'UPDATE contratantes SET img_perfil = ? WHERE id = ?';
    } else if (userType === 'pedreiro') {
        updateQuery = 'UPDATE pedreiros SET img_perfil = ? WHERE id = ?';
    } else {
        return res.status(400).send('Tipo de usuário inválido');
    }
 
    db.query(updateQuery, [imgPerfilUrl, userId], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Erro ao atualizar a foto de perfil no banco de dados.');
        }
        res.send('Foto de perfil alterada com sucesso!');
    });
});
 
module.exports = router;