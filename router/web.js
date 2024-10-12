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

    // Validação de parâmetros obrigatórios
    if (!cep || !tipo || !engine) {
        return res.status(400).json({ 
            mensagem: 'CEP, tipo e engine são obrigatórios.', 
            resultados: [],
            servicos: [],
            instituicoes: [],
            lojas: []
        });
    }

    const tiposPermitidos = ['servico', 'pedreiro'];
    if (!tiposPermitidos.includes(tipo)) {
        return res.status(400).json({ 
            mensagem: 'Tipo de busca inválido. Use "servico" ou "pedreiro".', 
            resultados: [],
            servicos: [],
            instituicoes: [],
            lojas: []
        });
    }

    try {
        // Chama a função buscarPorLocalizacao para fazer a busca de serviços ou pedreiros
        const resultados = await buscarPorLocalizacao(tipo, cep, engine);

        // Consulta para buscar serviços, instituições e lojas adicionais
        const [servicos] = await pool.query('SELECT id, nome_servico, img_servico FROM tipo_servicos');
        const [instituicoes] = await pool.query('SELECT nome_parceiro, descricao, imagem, url FROM parceiros WHERE tipo_parceiro = "institucional"');
        const [lojas] = await pool.query('SELECT nome_parceiro, endereco, contato, imagem, url FROM parceiros WHERE tipo_parceiro = "loja"');

        // Montagem da resposta
        res.json({
            resultados: resultados.length > 0 ? resultados : [],
            servicos: servicos || [],
            instituicoes: instituicoes || [],
            lojas: lojas || [],
            mensagem: resultados.length === 0 ? 'Nenhum resultado encontrado.' : null
        });
    } catch (error) {
        console.error('Erro na busca:', error);
        res.status(500).json({ 
            mensagem: `Erro ao buscar ${tipo}s.`,
            resultados: [], 
            servicos: [],
            instituicoes: [],
            lojas: []
        });
    }
});

router.get('/teste', (req, res) => {
    res.render('teste')
  })


module.exports=router