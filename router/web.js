const express = require('express');
const router = express.Router();
const pool = require('../config/db'); // Certifique-se de que este caminho está correto para seu projeto

// Rota que carrega a página com o formulário
router.get('/', async (req, res) => {
    try {
        // Consulta para buscar os tipos de serviços
        const [servicos] = await pool.query('SELECT id, nome_servico, img_servico FROM tipo_servicos');
        
        // Consulta para buscar os parceiros
        const [instituicoes] = await pool.query('SELECT nome_parceiro, descricao, imagem, url FROM parceiros WHERE tipo_parceiro = "institucional"');
        
        // Consulta para buscar os parceiros
        const [lojas] = await pool.query('SELECT nome_parceiro, endereco, contato, imagem, url FROM parceiros WHERE tipo_parceiro = "loja"');

        // Renderiza a página 'index.ejs' e passa os arrays 'servicos' e 'parceiros' para a view
        res.render('index', { servicos, instituicoes, lojas });
    } catch (error) {
        console.error(error);
        res.status(500).send('Erro ao carregar os tipos de serviços');
    }
});

router.get('/teste', (req, res) => {
    res.render('teste');
});

module.exports = router;
