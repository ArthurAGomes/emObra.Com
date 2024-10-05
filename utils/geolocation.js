// utils/geolocation.js
const { calculateDistances } = require('./calculateDistances');
const pool = require('../config/db');

async function buscarPorLocalizacao(tipo, cep) {
    try {
        let query;

        if (tipo === 'servico') {
            query = `
                SELECT sp.id, sp.descricao, sp.valor, c.cep
                FROM servicos_postados sp
                JOIN contratantes c ON sp.contratante_id = c.id
                WHERE sp.status = 'finalizado';
            `;
        } else if (tipo === 'pedreiro') {
            query = `
                SELECT p.id, p.nome, p.premium, p.cep
                FROM pedreiros p
                LEFT JOIN servicos_postados sp ON p.id = sp.pedreiro_id
                WHERE sp.status = 'finalizado';
            `;
        } else {
            throw new Error('Tipo de busca inválido.');
        }

        const [results] = await pool.query(query);

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
