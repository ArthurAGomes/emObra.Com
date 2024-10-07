// utils/calculateDistances.js
const axios = require('axios');
require('dotenv').config();

async function calculateDistances(originCep, destinationCeps) {
    const apiKey = process.env.GOOGLE_MAPS_KEY;
    const url = 'https://maps.googleapis.com/maps/api/distancematrix/json';

    try {
        const response = await axios.get(url, {
            params: {
                origins: originCep,
                destinations: destinationCeps.join('|'),
                units: 'metric',
                key: apiKey
            }
        });

        if (response.data.status !== 'OK') {
            throw new Error(`API error: ${response.data.status}`);
        }

        return response.data.rows[0].elements.map((element, index) => ({
            destinationCep: destinationCeps[index],
            distance: element.distance ? element.distance.value / 1000 : null, // Converter para km
            status: element.status
        }));
    } catch (error) {
        console.error('Erro ao calcular distâncias:', error.message);
        throw new Error('Falha ao calcular distâncias');
    }
}

module.exports = { calculateDistances };
