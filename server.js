// app.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');  // Importa o cookie-parser
const session = require('express-session');  // Importa express-session
require('dotenv').config();

const routerWeb = require('./router/web');
const routerPostagem = require('./router/postagem');
const routerBuscar = require('./router/buscador');
const routerRegister = require('./router/register');
const routerAuth = require('./router/auth');
const routerUser = require('./router/user');

const app = express();

// Configuração da view engine para EJS
app.set('view engine', 'ejs');
app.use(express.static('./public'));

app.use(cors({
    origin: "*",
    methods: "GET, PUT, POST, DELETE"
}));

app.use(express.json()); // Para fazer parsing do corpo JSON
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());  // Habilita o uso de cookies

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

// Rotas
app.use(routerWeb);         // Rotas principais do site
app.use(routerAuth);        // Rotas de autenticação
app.use(routerRegister);    // Rotas de cadastro
app.use(routerUser);        // Rotas de user (perfil, login, etc.)
app.use(routerBuscar)
// Porta do servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
