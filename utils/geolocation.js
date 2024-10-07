// utils/geolocation.js
const { calculateDistances } = require('./calculateDistances');
const pool = require('../config/db');

async function buscarPorLocalizacao(tipo, cep, engine) {
    try {
        let query;
        let params = [];

        if (tipo === 'servico') {
            query = `
                SELECT sp.id, sp.descricao, sp.valor, c.cep
                FROM servicos_postados sp
                JOIN contratantes c ON sp.contratante_id = c.id
                WHERE sp.status = 'finalizado' AND sp.tipo_servico = ?;
            `;
            params.push(engine); // Adiciona o tipo de serviço para a busca
        } else if (tipo === 'pedreiro') {
            query = `
                SELECT p.id, p.nome, p.premium, p.cep
                FROM pedreiros p
                WHERE p.ativo = 1 AND (
                    p.tipo_servico_1 = ? OR
                    p.tipo_servico_2 = ? OR
                    p.tipo_servico_3 = ? OR
                    p.tipo_servico_4 = ? OR
                    p.tipo_servico_5 = ?
                );
            `;
            // Adiciona o tipo de serviço para filtrar pedreiros
            params.push(engine, engine, engine, engine, engine);
        } else {
            throw new Error('Tipo de busca inválido.');
        }

        // Executa a consulta passando os parâmetros necessários
        const [results] = await pool.query(query, params);

        if (results.length === 0) {
            return [];
        }

        const destinationCeps = results.map(result => result.cep);
        const distances = await calculateDistances(cep, destinationCeps);

        const resultsWithDistance = results.map((result, index) => ({
            ...result,
            distancia: distances[index].distance,
            status: distances[index].status
        }));

        const filteredResults = resultsWithDistance
            .filter(result => result.distancia !== null && result.distancia <= 15)
            .sort((a, b) => {
                if (tipo === 'pedreiro' && a.premium !== b.premium) {
                    return b.premium - a.premium;
                }
                return a.distancia - b.distancia;
            });

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

module.exports = { buscarPorLocalizacao };
