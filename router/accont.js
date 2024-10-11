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

    // Log para depuração: verificar os dados recebidos
    console.log('Dados recebidos para atualização:', req.body);

    const { nome, email, telefone, cep, cpf, tipos_servicos } = req.body;

    // Atualiza os tipos de serviços, garantindo que sejam números ou nulos
    const updatedTiposServicos = [
        parseInt(tipos_servicos[0], 10) || null, 
        parseInt(tipos_servicos[1], 10) || null, 
        parseInt(tipos_servicos[2], 10) || null, 
        parseInt(tipos_servicos[3], 10) || null, 
        parseInt(tipos_servicos[4], 10) || null
    ];

    // Log para depuração: verificar os tipos de serviços que estão sendo atualizados
    console.log('Tipos de serviços a serem atualizados:', updatedTiposServicos);

    // Atualiza os dados do usuário e os tipos de serviço em uma única consulta
    const [result] = await pool.query(`
        UPDATE pedreiros 
        SET nome = ?, email = ?, telefone = ?, cep = ?, cpf = ?, 
            tipo_servico_1 = ?, tipo_servico_2 = ?, tipo_servico_3 = ?, tipo_servico_4 = ?, tipo_servico_5 = ? 
        WHERE id = ?`, 
        [
            nome, email, telefone, cep, cpf, 
            ...updatedTiposServicos, 
            userId
        ]);

    // Log para depuração: verificar o resultado da atualização
    console.log('Resultado da atualização do pedreiro:', result);

    // Verifica se nenhum usuário foi encontrado na tabela pedreiros
    if (result.affectedRows === 0) {
        const [contratanteResult] = await pool.query(`
            UPDATE contratantes 
            SET nome = ?, email = ?, telefone = ?, cep = ?, cpf = ? 
            WHERE id = ?`, 
            [nome, email, telefone, cep, cpf, userId]);
        
        // Log para depuração: verificar o resultado da atualização do contratante
        console.log('Resultado da atualização do contratante:', contratanteResult);
        
        if (contratanteResult.affectedRows === 0) {
            return res.status(404).send('Usuário não encontrado em ambas as tabelas.');
        }
    }

    res.status(200).send('Dados atualizados com sucesso.');
});

module.exports = router;
