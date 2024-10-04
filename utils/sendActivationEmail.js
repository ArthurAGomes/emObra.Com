const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');

// Função para enviar email de ativação
const sendActivationEmail = async (email, nome, token, userType) => {
    const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    // Define a URL de ativação com base no tipo de usuário
    const activationUrl = `http://10.24.89.23:3000/${userType}/activate/${token}`;
    
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Ativação de Conta - Em Obra',
        text: `Olá ${nome},\n\nObrigado por se cadastrar! Para ativar sua conta, clique no link abaixo:\n\n${activationUrl}\n\nAtenciosamente,\nEquipe Em Obra`,
    };

    await transporter.sendMail(mailOptions);
};

module.exports = sendActivationEmail;
