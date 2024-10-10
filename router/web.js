const express = require('express');
const router = express.Router();
const pool = require('../config/db'); 
const { buscarPorLocalizacao } = require('../utils/geolocation');

// Rota que carrega a página com o formulário
router.get('/', async (req, res) => {
    try {
        // Consulta para buscar os tipos de serviços
        const [servicos] = await pool.query('SELECT id, nome_servico, img_servico FROM tipo_servicos');
        
        // Consulta para buscar os parceiros institucionais
        const [instituicoes] = await pool.query('SELECT nome_parceiro, descricao, imagem, url FROM parceiros WHERE tipo_parceiro = "institucional"');
        
        // Consulta para buscar os parceiros de loja
        const [lojas] = await pool.query('SELECT nome_parceiro, endereco, contato, imagem, url FROM parceiros WHERE tipo_parceiro = "loja"');

        // Renderiza a página 'index.ejs' e passa os arrays 'servicos', 'instituicoes', 'lojas', e 'resultados'
        res.render('index', { 
            servicos: servicos || [], 
            instituicoes: instituicoes || [], 
            lojas: lojas || [],
            resultados: [] // Garante que a variável resultados sempre seja definida
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Erro ao carregar os tipos de serviços e parceiros.');
    }
});


// Rota de busca
router.get('/buscar', async (req, res) => {
    const { cep, tipo, engine } = req.query;

    // Verificação básica dos parâmetros
    if (!cep || !tipo || !engine) {
        return res.status(400).send('CEP, tipo e engine (tipo de obra) são obrigatórios.');
    }

    // Verificação se o tipo de busca é válido
    if (tipo !== 'servico' && tipo !== 'pedreiro') {
        return res.status(400).send('Tipo de busca inválido. Use "servico" ou "pedreiro".');
    }

    try {
        // Chama a função buscarPorLocalizacao para obter os resultados
        const resultados = await buscarPorLocalizacao(tipo, cep, engine);

        // Busca novamente os serviços, instituições e lojas para preencher a página
        const [servicos] = await pool.query('SELECT id, nome_servico, img_servico FROM tipo_servicos');
        const [instituicoes] = await pool.query('SELECT nome_parceiro, descricao, imagem, url FROM parceiros WHERE tipo_parceiro = "institucional"');
        const [lojas] = await pool.query('SELECT nome_parceiro, endereco, contato, imagem, url FROM parceiros WHERE tipo_parceiro = "loja"');

        // Verifica se os resultados da busca estão vazios
        if (!Array.isArray(resultados) || resultados.length === 0) {
            return res.render('index', {
                servicos: servicos || [], 
                instituicoes: instituicoes || [], 
                lojas: lojas || [], 
                resultados: [], 
                mensagem: 'Nenhum resultado encontrado.'
            });
        }

        // Renderiza o template EJS, passando os resultados da busca e demais dados
        res.render('index', {
            servicos: servicos || [],
            instituicoes: instituicoes || [],
            lojas: lojas || [],
            resultados, // Passando os resultados da busca
            mensagem: null // Sem mensagem de erro
        });
    } catch (error) {
        console.error('Erro na busca:', error);
        res.status(500).render('index', {
            servicos: [],
            instituicoes: [],
            lojas: [],
            resultados: [],
            mensagem: `Erro ao buscar ${tipo}s.`
        });
    }
});


router.get('/teste', (req, res) => {
    res.render('teste');
});

module.exports = router;
