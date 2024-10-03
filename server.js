const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const routerWeb = require('./router/web.js')
const routerPostagem = require('./router/postagem.js')
const routerConsultas = require('./router/consultas.js')
const routerRegister = require('./router/register.js')
require('dotenv').config();

app.set('view engine', 'ejs');
app.use(express.static('./public'))


const app = express();

app.use(cors({
    origin:"*",
    methods:"get, put, post, delete"
}));
app.use(bodyParser.json());

// rotas
app.use(routerWeb);
app.use(routerRegister)
app.use(routerConsultas);
app.use(routerPostagem);



const PORT = process.env.PORT 
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});