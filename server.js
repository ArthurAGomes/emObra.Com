const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');  // Importa o cookie-parser
const session = require('express-session');  // Importa express-session
const multer = require('multer'); // Importa o multer
const path = require('path'); // Importa path
const fs = require('fs'); // Para manipular o sistema de arquivos
require('dotenv').config();

const routerWeb = require('./router/web');
const routerPostagem = require('./router/postagem');
const routerRegister = require('./router/register');
const routerAuth = require('./router/auth');

const app = express();

// Configuração da view engine para EJS
app.set('view engine', 'ejs');
app.use(express.static('./public'));

app.use(cors({
    origin: "*",
    methods: "GET, PUT, POST, DELETE"
}));

app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); 

// Configuração da sessão
app.use(session({
    secret: process.env.SESSION_SECRET || 'seu_segredo_aqui',  // Chave secreta para assinatura do cookie da sessão
    resave: false,  // Não re-salvar a sessão se não houve alterações
    saveUninitialized: false,  // Não salvar a sessão até que algo seja armazenado
    cookie: {
        httpOnly: true,  // O cookie não pode ser acessado pelo JavaScript
        secure: process.env.NODE_ENV === 'production',  // Enviar cookie apenas por HTTPS em produção
        maxAge: 3600000  // Tempo de expiração do cookie (1 hora)
    }
}));

// Configuração do multer para armazenamento de arquivos
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Verifica o tipo de usuário na sessão
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

        // Removeu a função createDirectoryIfNotExists
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
app.post('/upload-foto', upload.single('fotoPerfil'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('Nenhum arquivo foi enviado.');
    }

    // Aqui você pode armazenar a nova foto de perfil no banco de dados, se necessário
    res.send('Foto de perfil alterada com sucesso!');
});

// Middleware para disponibilizar a variável isAuthenticated nas views EJS
app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.userId ? true : false;  // Define isAuthenticated com base na sessão
    next();
});

// Rotas
app.use(routerWeb);         // Rotas principais do site
app.use(routerPostagem)     //Rotas de postar serviço
app.use(routerAuth);        // Rotas de autenticação
app.use(routerRegister);    // Rotas de cadastro


// Porta do servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
