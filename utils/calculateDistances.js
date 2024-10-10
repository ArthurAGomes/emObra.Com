const axios = require('axios');
const { getDistance } = require('geolib');

async function geocode(cep) {
    const formattedCEP = cep.replace('-', '');

    try {
        console.log(`Iniciando geocodificação para CEP: ${cep}`);
        const viaCepResponse = await axios.get(`https://viacep.com.br/ws/${formattedCEP}/json/`);

        if (viaCepResponse.data.erro) {
            console.warn(`CEP ${cep} não encontrado na base ViaCEP`);
            return null;
        }

        const { logradouro, bairro, localidade, uf } = viaCepResponse.data;
        const address = logradouro && bairro ? 
            `${logradouro}, ${bairro}, ${localidade}, ${uf}` : 
            `${localidade}, ${uf}`; 

        console.log(`Endereço obtido: ${address}`);
        console.log(`Buscando coordenadas para o endereço: ${address}`);
        const nominatimResponse = await axios.get('https://nominatim.openstreetmap.org/search', {
            params: {
                q: address,
                format: 'json',
                limit: 1
            },
            headers: {
                'User-Agent': 'YourAppName/1.0'
            }
        });

        if (nominatimResponse.data.length === 0) {
            console.warn(`Nenhuma coordenada encontrada para o endereço: ${address}`);
            return { address }; // Retorna o endereço mesmo se as coordenadas não forem encontradas
        }

        const { lat, lon } = nominatimResponse.data[0];
        return { 
            latitude: parseFloat(lat), 
            longitude: parseFloat(lon),
            address // Adicionando o endereço completo
        };
    } catch (error) {
        console.error(`Erro na geocodificação do CEP ${cep}:`, error.message);
        return null;
    }
}

async function calculateDistances(originCep, destinationResults) {
    try {
        console.log('Geocodificando CEP de origem...');
        const originCoords = await geocode(originCep);
        if (!originCoords) {
            throw new Error(`Não foi possível geocodificar o CEP de origem: ${originCep}`);
        }

        console.log('Geocodificando CEPs de destino...');
        const destinationsWithCoords = await Promise.all(
            destinationResults.map(async (destination) => {
                const coords = await geocode(destination.cep_obra);
                return { ...destination, coords };
            })
        );

        const validDestinations = destinationsWithCoords.filter(dest => dest.coords !== null);
        if (validDestinations.length === 0) {
            throw new Error('Nenhum CEP de destino válido encontrado para calcular distâncias.');
        }

        console.log('Calculando distâncias...');
        const distances = validDestinations.map(destination => {
            const distance = getDistance(
                { latitude: originCoords.latitude, longitude: originCoords.longitude },
                { latitude: destination.coords.latitude, longitude: destination.coords.longitude }
            ) / 1000; // Convertendo de metros para km

            const maxDistance = destination.premium ? 30 : 15;

            return {
                destinationCep: destination.cep_obra,
                distance: distance,
                status: distance <= maxDistance ? 'OK' : 'DISTANCE_EXCEEDED',
                premium: destination.premium,
                address: destination.coords.address // Incluindo o endereço no resultado
            };
        });

        const filteredDistances = distances.filter(d => d.status === 'OK');
        return filteredDistances;
    } catch (error) {
        console.error('Erro ao calcular distâncias:', error.message);
        throw error;
    }
}

module.exports = { calculateDistances };
