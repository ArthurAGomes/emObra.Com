// routes/user.js
const express = require('express');
const router = express.Router();
const isAuthenticated = require('../router/auth');
const pool = require('../config/db');

// Rota para renderizar o perfil do contratante
router.get('/perfil-contratante', isAuthenticated, (req, res) => {
    res.render('perfil-contratante', { user: req.user });
});

// Rota para renderizar o perfil do pedreiro


module.exports = router;


