const pool = require('../config/db');
const { calculateDistances } = require('./calculateDistances');

async function buscarPorLocalizacao(tipo, cep, engine) {
    try {
        console.log(`Iniciando busca por ${tipo}s com CEP ${cep} e tipo de serviço ${engine}.`);

        let query;
        let params = [];

        // Definir a query de acordo com o tipo de busca
        if (tipo === 'servico') {
            query = `
                SELECT sp.id, sp.descricao, sp.valor, sp.prazo_combinar, sp.cep_obra AS cep_obra
                FROM servicos_postados sp
                WHERE sp.status = 'andamento' AND sp.tipo_servico = ?; 
            `;
            params.push(engine);
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
        const [results] = await pool.query(query, params);

        // Verifica se há resultados
        if (results.length === 0) {
            console.log(`Nenhum ${tipo} encontrado.`);
            return []; // Retorna um array vazio se nenhum resultado for encontrado
        }

        console.log(`${results.length} ${tipo}(s) encontrado(s). Validando CEPs e calculando distâncias...`);

        // Filtrar apenas resultados com CEPs válidos
        const validResults = results.filter(result => result.cep_obra && typeof result.cep_obra === 'string');
        if (validResults.length === 0) {
            console.log('Nenhum CEP válido encontrado nos resultados.');
            return [];
        }

        console.log('Resultados válidos encontrados:', validResults);

        // Calcular distâncias usando os CEPs válidos
        const distances = await calculateDistances(cep, validResults);

        const resultsWithDistance = validResults.map((result, index) => ({
            ...result,
            distancia: distances[index]?.distance || null,
            status: distances[index]?.status || 'UNKNOWN',
            address: distances[index]?.address || null // Incluindo o endereço aqui
        }));

        // Filtrar resultados com base na distância (15km para padrão, 30km para premium)
        const filteredResults = resultsWithDistance
            .filter(result => result.distancia !== null)
            .filter(result => {
                const isPremium = result.premium || false; // Define como false se undefined
                return (isPremium && result.distancia <= 30) || (!isPremium && result.distancia <= 15);
            });

        console.log('Resultados após filtragem:', filteredResults);

        if (filteredResults.length === 0) {
            console.log(`Nenhum ${tipo} encontrado após filtragem.`);
            return []; // Retorna array vazio se nenhum resultado for encontrado após filtragem
        }

        // Retornar os resultados formatados
        return filteredResults.map(result => {
            const addressParts = result.address ? result.address.split(',') : []; // Dividir o endereço
            const street = addressParts[0] || ''; // Rua
            const neighborhood = addressParts[1] ? addressParts[1].trim() : ''; // Bairro

            return {
                ...result,
                distancia: result.distancia.toFixed(2),
                mensagem: `${tipo === 'servico' ? 'Serviço' : 'Pedreiro'} a ${result.distancia.toFixed(2)} km de distância!`,
                endereco: `${street}, ${neighborhood}` // Retorna apenas rua e bairro
            };
        });
    } catch (error) {
        console.error(`Erro ao buscar ${tipo}s:`, error.message);
        throw new Error(`Erro ao buscar ${tipo}s.`);
    }
}

module.exports = {
    buscarPorLocalizacao
};
