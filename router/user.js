const express = require('express');
const router = express.Router();
const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

router.get('/teste', (req, res) => {
    res.render('teste');
});

router.get('/perfil-contratante', (req, res) => {
    res.render('perfil-contratante');
});

router.get('/perfil-pedreiro', (req, res) => {
    res.render('perfil-pedreiro');
});

module.exports = router;