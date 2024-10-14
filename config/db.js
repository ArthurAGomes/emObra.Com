const mysql2 = require('mysql2/promise'); // Importa a versão de Promises
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
};

// Cria uma conexão com Promises
const pool = mysql2.createPool(dbConfig); // Usa um pool de conexões para melhor desempenho

// Verifica a conexão
pool.getConnection()
    .then(connection => {
        console.log('Banco de dados conectado');
        connection.release(); // Libera a conexão após a verificação
    })
    .catch(err => {
        console.error('Erro ao conectar ao banco de dados:', err);
    });

module.exports = pool;
