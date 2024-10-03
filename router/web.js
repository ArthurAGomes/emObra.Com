const express = require('express');
const router = express.Router();

// Exemplo de rota
router.get('/', (req, res) => {
    return  res.render('index',{texto:'Bem vindo a Obra'});
})

module.exports = router; 
