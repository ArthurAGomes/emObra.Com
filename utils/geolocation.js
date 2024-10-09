const pool = require('../config/db');
const { calculateDistances } = require('./calculateDistances');

async function buscarPorLocalizacao(tipo, cep, engine) {
    try {
        console.log(`Iniciando busca por ${tipo}s com CEP ${cep} e tipo de serviço ${engine}.`);

        let query;
        let params = [];

        if (tipo === 'servico') {
            query = `
                SELECT sp.id, sp.descricao, sp.valor, sp.prazo_combinar, sp.cep_obra AS cep_obra
                FROM servicos_postados sp
                WHERE sp.status = 'andamento' AND sp.tipo_servico = ?; 
            `;
            params.push(engine); // Adiciona o tipo de serviço para a busca
        } else if (tipo === 'pedreiro') {
            query = `
                SELECT p.id, p.nome, p.premium, p.cep AS cep_obra
                FROM pedreiros p
                WHERE p.ativo = 1 AND (
                    p.tipo_servico_1 = ? OR
                    p.tipo_servico_2 = ? OR
                    p.tipo_servico_3 = ? OR
                    p.tipo_servico_4 = ? OR
                    p.tipo_servico_5 = ?
                );
            `;
            params.push(engine, engine, engine, engine, engine);
        } else {
            throw new Error('Tipo de busca inválido.');
        }

        console.log('Executando consulta ao banco de dados...');
        console.log(`Consulta: ${query}`); // Log da consulta
        console.log(`Parâmetros: ${JSON.stringify(params)}`); // Log dos parâmetros

        const [results] = await pool.query(query, params);

        console.log('Resultados da consulta:', results); // Log dos resultados retornados

        if (results.length === 0) {
            console.log(`Nenhum ${tipo} encontrado.`);
            return [];
        }

        console.log(`${results.length} ${tipo}(s) encontrado(s). Validando CEPs e calculando distâncias...`);

        // Filtra apenas os resultados que têm CEPs válidos
        const validResults = results.filter(result => result.cep_obra && typeof result.cep_obra === 'string');
        if (validResults.length === 0) {
            console.log('Nenhum CEP válido encontrado nos resultados.');
            return [];
        }

        // Faz o cálculo das distâncias usando os CEPs válidos
        const distances = await calculateDistances(cep, validResults);

        const resultsWithDistance = validResults.map((result, index) => ({
            ...result,
            distancia: distances[index]?.distance || null,
            status: distances[index]?.status || 'UNKNOWN'
        }));

        // Filtra os serviços dentro do raio de 15 km, ou até 30 km se forem premium
        const filteredResults = resultsWithDistance
            .filter(result => result.distancia !== null)
            .filter(result => (result.premium && result.distancia <= 30) || result.distancia <= 15)
            .sort((a, b) => {
                if (tipo === 'pedreiro' && a.premium !== b.premium) {
                    return b.premium - a.premium; // Pedreiros premium têm prioridade
                }
                return a.distancia - b.distancia; // Ordena pela distância mais próxima
            });

        console.log(`${filteredResults.length} ${tipo}(s) dentro do raio limite de exibição.`);

        return filteredResults.map(result => ({
            ...result,
            distancia: result.distancia.toFixed(2),
            mensagem: `${tipo === 'servico' ? 'Serviço' : 'Pedreiro'} a ${result.distancia.toFixed(2)} km de distância!`
        }));
    } catch (error) {
        console.error(`Erro ao buscar ${tipo}s:`, error.message);
        throw new Error(`Erro ao buscar ${tipo}s.`);
    }
}

// Exemplo de exportação de função
module.exports = {
    buscarPorLocalizacao
};
