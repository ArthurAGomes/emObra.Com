const express = require('express');
const mysql = require('mysql2/promise'); // Use mysql2 para suporte a promessas
const router = express.Router();

// Criação da conexão com o banco de dados usando as variáveis de ambiente
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
});

router.get('/excluir', async (req, res) => {
    try {
        // Verifica se o usuário está autenticado
        const userId = req.session.userId; // Obter o ID do usuário da sessão

        if (!userId) {
            return res.status(403).send('Você deve estar logado para excluir sua conta.');
        }

        // Lógica para excluir o usuário das tabelas
        const [resultPedreiro] = await pool.query('DELETE FROM pedreiros WHERE id = ?', [userId]);
        const [resultContratante] = await pool.query('DELETE FROM contratantes WHERE id = ?', [userId]);

        // Verifica se o usuário foi encontrado e excluído em pelo menos uma das tabelas
        if (resultPedreiro.affectedRows === 0 && resultContratante.affectedRows === 0) {
            return res.status(404).send('Usuário não encontrado em nenhuma das tabelas.');
        }

        // Limpa a sessão após a exclusão
        req.session = null; // Remove os dados da sessão do usuário

        // Redireciona para a página de cadastro
        res.redirect('/web'); // Altere para a URL da página de cadastro
    } catch (error) {
        console.error(error);
        res.status(500).send('Ocorreu um erro ao tentar excluir a conta.');
    }
});

module.exports = router;
