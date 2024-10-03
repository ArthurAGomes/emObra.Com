const mysql2 = require('mysql2');

const sql = mysql2.createConnection({
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'em_obra'
})

sql.connect((err) => {
    if(err){
        throw err
    } else {
        console.log('Banco de dados conectado')
    }
});

module.exports = sql;