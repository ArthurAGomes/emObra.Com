const mysql2 = require('mysql2/promise'); // Importa a versão de Promises
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
};

// Cria uma conexão com Promises usando um pool de conexões para melhor desempenho
const pool = mysql2.createPool(dbConfig);

// Função para verificar a conexão
async function verificarConexao() {
    try {
        const connection = await pool.getConnection();
        console.log('Banco de dados conectado');
        connection.release(); // Libera a conexão após a verificação
    } catch (err) {
        console.error('Erro ao conectar ao banco de dados:', err);
    }
}

// Chama a função para verificar a conexão ao iniciar
verificarConexao();

module.exports = pool;
