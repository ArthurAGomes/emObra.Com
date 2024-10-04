// routes/user.js
const express = require('express');
const router = express.Router();
const verifyAuthToken = require('../router/auth');

// Rota para renderizar o perfil do contratante
router.get('/perfil-contratante', verifyAuthToken, (req, res) => {
    res.render('perfil-contratante', { user: req.user });
});

// Rota para renderizar o perfil do pedreiro
router.get('/perfil-pedreiro', verifyAuthToken, (req, res) => {
    res.render('perfil-pedreiro', { user: req.user });
});

module.exports = router;
