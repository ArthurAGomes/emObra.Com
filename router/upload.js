// router/upload.js
const express = require('express');
const multer = require('multer');
const path = require('path');

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

// Rota para upload da foto de perfil
router.post('/upload-foto', upload.single('fotoPerfil'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('Nenhum arquivo foi enviado.');
    }

    // Aqui você pode armazenar a nova foto de perfil no banco de dados, se necessário
    res.send('Foto de perfil alterada com sucesso!');
});

module.exports = router;
