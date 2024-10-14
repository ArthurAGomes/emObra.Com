const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const session = require('express-session');
require('dotenv').config();

const routerWeb = require('./router/web');
const routerPostagem = require('./router/postagem');
const routerRegister = require('./router/register');
const routerAuth = require('./router/auth');
const routerUpload = require('./router/upload'); 
const routerExcluir = require('./router/excluir'); 
const routerAccont = require('./router/accont');

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
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { 
        httpOnly: true, 
        secure: process.env.NODE_ENV === 'production', // Mantenha esta linha
        maxAge: 3600000  // 1 hora
    }    
}));

// Middleware para disponibilizar a variável isAuthenticated nas views EJS
app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.userId ? true : false;
    next();
});

// Rotas
app.use(routerWeb);         // Rotas principais do site
app.use(routerPostagem);    // Rotas de postar serviço
app.use(routerAuth);        // Rotas de autenticação
app.use(routerRegister);    // Rotas de cadastro
app.use(routerUpload);      // Rotas de upload de arquivos
app.use(routerExcluir);     // Rotas de excluir arquivos
app.use(routerAccont);      // Rotas de editar arquivos

// Porta do servidor
const PORT = process.env.PORT;  // Fallback para porta 3000 se não houver variável de ambiente
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
