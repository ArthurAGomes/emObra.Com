const express = require('express');
const router = express.Router();
const pool = require('../config/db'); 
const { buscarPorLocalizacao } = require('../utils/geolocation');

// Rota que carrega a página com o formulário
router.get('/', async (req, res) => {
    try {
        const [servicos] = await pool.query('SELECT id, nome_servico, img_servico FROM tipo_servicos');
        const [instituicoes] = await pool.query('SELECT nome_parceiro, descricao, imagem, url FROM parceiros WHERE tipo_parceiro = "institucional"');
        const [lojas] = await pool.query('SELECT nome_parceiro, endereco, contato, imagem, url FROM parceiros WHERE tipo_parceiro = "loja"');

        res.render('index', { 
            servicos: servicos || [], 
            instituicoes: instituicoes || [], 
            lojas: lojas || [],
            resultados: [] 
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Erro ao carregar os tipos de serviços e parceiros.');
    }
});

router.get('/buscar', async (req, res) => {
    const { cep, tipo, engine } = req.query;

    if (!cep || !tipo || !engine) {
        return res.status(400).render('index', { 
            mensagem: 'CEP, tipo e engine são obrigatórios.', 
            resultados: [], 
            servicos: [],
            instituicoes: [],
            lojas: []
        });
    }

    if (tipo !== 'servico' && tipo !== 'pedreiro') {
        return res.status(400).render('index', { 
            mensagem: 'Tipo de busca inválido. Use "servico" ou "pedreiro".', 
            resultados: [], 
            servicos: [],
            instituicoes: [],
            lojas: []
        });
    }

    try {
        const resultados = await buscarPorLocalizacao(tipo, cep, engine);

        const [servicos] = await pool.query('SELECT id, nome_servico, img_servico FROM tipo_servicos');
        const [instituicoes] = await pool.query('SELECT nome_parceiro, descricao, imagem, url FROM parceiros WHERE tipo_parceiro = "institucional"');
        const [lojas] = await pool.query('SELECT nome_parceiro, endereco, contato, imagem, url FROM parceiros WHERE tipo_parceiro = "loja"');

        res.render('index', {
            servicos: servicos || [],
            instituicoes: instituicoes || [],
            lojas: lojas || [],
            resultados: resultados.length > 0 ? resultados : [],
            mensagem: resultados.length === 0 ? 'Nenhum resultado encontrado.' : null
        });
    } catch (error) {
        console.error('Erro na busca:', error);
        res.status(500).render('index', { 
            mensagem: `Erro ao buscar ${tipo}s.`,
            resultados: [], 
            servicos: [],
            instituicoes: [],
            lojas: []
        });
    }
});

module.exports=router