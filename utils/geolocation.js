const axios = require('axios');
const pool = require('../config/db');

// Função para converter CEP em coordenadas (latitude, longitude) usando a API OpenCage
async function convertCepToCoordinates(cep) {
    const apiKey = process.env.OPENCAGE_KEY; // Certifique-se de definir a chave da API no .env
    const url = `https://api.opencagedata.com/geocode/v1/json?q=${cep}&key=${apiKey}`;

    try {
        const response = await axios.get(url);
        const { lat, lng } = response.data.results[0].geometry;
        return { lat, lng };
    } catch (error) {
        console.error('Erro ao converter CEP para coordenadas:', error);
        throw new Error('Não foi possível converter o CEP para coordenadas.');
    }
}

// Função para buscar pedreiros com base no tipo de serviço e localização
async function buscarServicosOuPedreiros(engine, cep) {
    try {
        // Tente buscar as coordenadas diretamente da API OpenCage
        const { lat, lng } = await convertCepToCoordinates(cep);

        // Query para buscar pedreiros dentro do raio de 15 km (ou 30 km para premium)
        const query = `
            SELECT p.id, p.nome, p.cep, p.premium, ts.nome_servico,
                   (6371 * acos(cos(radians(?)) * cos(radians(p.latitude)) * cos(radians(p.longitude) - radians(?)) + sin(radians(?)) * sin(radians(p.latitude)))) AS distance
            FROM pedreiros p
            LEFT JOIN tipo_servicos ts ON p.tipo_servico_1 = ts.id OR p.tipo_servico_2 = ts.id OR p.tipo_servico_3 = ts.id
            HAVING distance <= IF(p.premium = 1, 30, 15)
            ORDER BY p.premium DESC, distance ASC;
        `;

        const [results] = await pool.query(query, [lat, lng, lat]);
        return results;
    } catch (error) {
        console.error('Erro ao buscar pedreiros:', error);
        throw new Error('Erro ao buscar pedreiros ou serviços.');
    }
}

module.exports = {
    convertCepToCoordinates,
    buscarServicosOuPedreiros
};
