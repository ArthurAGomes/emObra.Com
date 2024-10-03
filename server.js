const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const ejs = require('ejs');
require('dotenv').config();


const routerWeb = require('./router/web');
const routerPostagem = require('./router/postagem');
const routerConsultas = require('./router/consultas');
const routerRegister = require('./router/register');
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

// Rotas
app.use(routerWeb);         // Rotas principais do site
app.use(routerRegister);    // Rotas de cadastro
// app.use(routerConsultas);   // Rotas de consulta
// app.use(routerPostagem);    // Rotas de postagens
// app.use(routerUser);        // Rotas de user (perfil, login, etc.)

// Porta do servidor
const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
