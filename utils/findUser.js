// utils/findUser.js

const db = require('../config/db');

async function findUserByEmailOrCpf(identifier) {
    try {
        // Tenta buscar o usuário nas tabelas de pedreiros e contratantes
        const [pedreiro] = await db.query(`SELECT * FROM pedreiros WHERE email = ? OR cpf = ? AND ativo = 1`, [identifier, identifier]);
        if (pedreiro.length > 0) {
            return { user: pedreiro[0], type: 'pedreiro' };
        }

        const [contratante] = await db.query(`SELECT * FROM contratantes WHERE email = ? OR cpf = ? AND ativo = 1`, [identifier, identifier]);
        if (contratante.length > 0) {
            return { user: contratante[0], type: 'contratante' };
        }

        return null;
    } catch (error) {
        console.error('Erro ao buscar o usuário:', error);
        throw error;
    }
}

module.exports = findUserByEmailOrCpf;
