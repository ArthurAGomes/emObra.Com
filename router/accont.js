const express = require('express');
const mysql = require('mysql2/promise');
const router = express.Router();

// Criação da conexão com o banco de dados
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
});

// Função auxiliar para buscar usuário
async function getUserById(userId) {
    const [user] = await pool.query(`
        SELECT 'pedreiro' AS tipo, id, nome, email, telefone, cep, cpf, img_perfil, 
               tipo_servico_1, tipo_servico_2, tipo_servico_3, tipo_servico_4, tipo_servico_5
        FROM pedreiros 
        WHERE id = ? 
        UNION 
        SELECT 'contratante' AS tipo, id, nome, email, telefone, cep, cpf, img_perfil, NULL, NULL, NULL, NULL, NULL
        FROM contratantes 
        WHERE id = ?`, 
        [userId, userId]);

    return user.length > 0 ? user[0] : null;
}

// Rota para exibir o formulário de edição de serviços
router.get('/editar-servicos', async (req, res) => {
    const userId = req.session.userId; // Obter o ID do usuário da sessão
    if (!userId) {
        return res.status(403).send('Você deve estar logado para editar seus serviços.');
    }

    const user = await getUserById(userId);
    
    if (!user || user.tipo !== 'pedreiro') {
        return res.status(404).send('Usuário não encontrado ou não é um pedreiro.');
    }

    // Busca todos os tipos de serviço disponíveis
    const [servicos] = await pool.query('SELECT * FROM tipo_servicos');

    // Renderiza o formulário de edição de serviços, passando os dados do usuário e os serviços disponíveis
    res.render('editar-servicos', { user, servicos });
});

// Rota para atualizar os tipos de serviço do usuário
router.post('/editar-servicos', async (req, res) => {
    const userId = req.session.userId;
    if (!userId) {
        return res.status(403).send('Você deve estar logado para editar seus serviços.');
    }

    // Obtendo os tipos de serviços selecionados
    const tipos_servicos = req.body.tipos_servicos || []; // Garantir que seja um array
    console.log('Tipos de serviços recebidos:', tipos_servicos); // Log para depuração

    // Garantindo que temos 5 serviços, preenchendo com null se necessário
    const updatedTiposServicos = [
        tipos_servicos[0] || null, 
        tipos_servicos[1] || null, 
        tipos_servicos[2] || null, 
        tipos_servicos[3] || null, 
        tipos_servicos[4] || null
    ];

    console.log('Tipos de serviços atualizados:', updatedTiposServicos); // Log para depuração

    // Atualiza os tipos de serviço do pedreiro no banco de dados
    const [result] = await pool.query(`
        UPDATE pedreiros 
        SET tipo_servico_1 = ?, tipo_servico_2 = ?, tipo_servico_3 = ?, tipo_servico_4 = ?, tipo_servico_5 = ? 
        WHERE id = ?`, 
        [...updatedTiposServicos, userId]);

    // Verificação se a atualização foi realizada
    if (result.affectedRows === 0) {
        return res.status(404).send('Usuário não encontrado ou tipos de serviço não atualizados.');
    }

    res.status(200).send('Tipos de serviço atualizados com sucesso.');
});

// Rota para exibir o formulário de edição
router.get('/editar-conta', async (req, res) => {
    const userId = req.session.userId; // Obter o ID do usuário da sessão
    if (!userId) {
        return res.status(403).send('Você deve estar logado para editar sua conta.');
    }

    const user = await getUserById(userId);
    
    if (!user) {
        return res.status(404).send('Usuário não encontrado.');
    }

    // Renderiza o formulário de edição, passando os dados do usuário
    res.render('editar-conta', { user });
});

// Rota para atualizar os dados do usuário e os tipos de serviço
router.post('/editar', async (req, res) => {
    const userId = req.session.userId;
    if (!userId) {
        return res.status(403).send('Você deve estar logado para editar sua conta.');
    }

    const { nome, email, telefone, cep, cpf, tipos_servicos } = req.body;

    // Atualiza os dados do usuário no banco de dados
    const [result] = await pool.query(`
        UPDATE pedreiros 
        SET nome = ?, email = ?, telefone = ?, cep = ?, cpf = ? 
        WHERE id = ?`, 
        [nome, email, telefone, cep, cpf, userId]);

    // Verifica se nenhum usuário foi encontrado na tabela pedreiros
    if (result.affectedRows === 0) {
        const [contratanteResult] = await pool.query(`
            UPDATE contratantes 
            SET nome = ?, email = ?, telefone = ?, cep = ?, cpf = ? 
            WHERE id = ?`, 
            [nome, email, telefone, cep, cpf, userId]);
        
        if (contratanteResult.affectedRows === 0) {
            return res.status(404).send('Usuário não encontrado em ambas as tabelas.');
        }
    }

    // Atualiza os tipos de serviço se for um pedreiro
    if (tipos_servicos && req.session.userTipo === 'pedreiro') {
        const updatedTiposServicos = [
            tipos_servicos[0] || null, 
            tipos_servicos[1] || null, 
            tipos_servicos[2] || null, 
            tipos_servicos[3] || null, 
            tipos_servicos[4] || null
        ];

        // Atualiza os tipos de serviço do pedreiro no banco de dados
        await pool.query(`
            UPDATE pedreiros 
            SET tipo_servico_1 = ?, tipo_servico_2 = ?, tipo_servico_3 = ?, tipo_servico_4 = ?, tipo_servico_5 = ? 
            WHERE id = ?`, 
            [...updatedTiposServicos, userId]);
    }

    res.status(200).send('Dados atualizados com sucesso.');
});

module.exports = router;
