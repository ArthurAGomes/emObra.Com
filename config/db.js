const mysql2 = require('mysql2/promise'); // Importa a versão de Promises

const dbConfig = {
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'em_obra'
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
