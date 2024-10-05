-- Criação do Banco de Dados
CREATE DATABASE IF NOT EXISTS Em_Obra;

-- Usar o Banco de Dados
USE Em_Obra;

-- Criação da Tabela tipo_servicos
CREATE TABLE tipo_servicos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome_servico VARCHAR(100) NOT NULL,
    desc_servico VARCHAR(255) NOT NULL,
    img_servico VARCHAR(255)
);

-- Criação da Tabela contratantes
CREATE TABLE contratantes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    telefone VARCHAR(15),
    cpf VARCHAR(14) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    img_perfil VARCHAR(255),
    cep VARCHAR(9) NOT NULL,
    ativo TINYINT(1) DEFAULT 0,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX (cpf),
    INDEX (email),
    INDEX (cep)
);

-- Criação da Tabela pedreiros
CREATE TABLE pedreiros (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    telefone VARCHAR(15),
    cpf VARCHAR(14) NOT NULL UNIQUE,
    cep VARCHAR(9) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    img_perfil VARCHAR(255),
    premium TINYINT(1) DEFAULT 0,
    ativo TINYINT(1) DEFAULT 0,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    tipo_servico_1 INT,
    tipo_servico_2 INT,
    tipo_servico_3 INT,
    tipo_servico_4 INT,
    tipo_servico_5 INT,
    FOREIGN KEY (tipo_servico_1) REFERENCES tipo_servicos(id) ON DELETE SET NULL,
    FOREIGN KEY (tipo_servico_2) REFERENCES tipo_servicos(id) ON DELETE SET NULL,
    FOREIGN KEY (tipo_servico_3) REFERENCES tipo_servicos(id) ON DELETE SET NULL,
    FOREIGN KEY (tipo_servico_4) REFERENCES tipo_servicos(id) ON DELETE SET NULL,
    FOREIGN KEY (tipo_servico_5) REFERENCES tipo_servicos(id) ON DELETE SET NULL
);

-- Criação da Tabela parceiros
CREATE TABLE parceiros (
    id INT AUTO_INCREMENT PRIMARY KEY,
    descricao VARCHAR(255) NOT NULL,
    imagem VARCHAR(255),
    contato VARCHAR(50),
    endereco VARCHAR(255),
    tipo_parceiro VARCHAR(20),
    url VARCHAR(255)
);

-- Criação da Tabela servicos_postados
CREATE TABLE servicos_postados (
    id INT AUTO_INCREMENT PRIMARY KEY,
    descricao TEXT NOT NULL,
    contratante_id INT NOT NULL,
    pedreiro_id INT,
    tipo_servico INT,
    data_inicio DATE,
    data_fim DATE,
    prazo_combinar VARCHAR(10),
    valor VARCHAR(20),
    status ENUM('andamento', 'finalizado', 'cancelado') DEFAULT 'andamento',
    data_postagem TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (contratante_id) REFERENCES contratantes(id) ON DELETE CASCADE,
    FOREIGN KEY (pedreiro_id) REFERENCES pedreiros(id) ON DELETE SET NULL,
    FOREIGN KEY (tipo_servico) REFERENCES tipo_servicos(id) ON DELETE SET NULL
);

-- Criação da Tabela historico_servicos
CREATE TABLE historico_servicos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    servico_id INT NOT NULL,
    contratante_id INT NOT NULL,
    pedreiro_id INT,
    tipo_servico VARCHAR(100) NOT NULL,
    data_inicio DATE,
    data_fim DATE,
    status ENUM('finalizado', 'cancelado') NOT NULL,
    FOREIGN KEY (contratante_id) REFERENCES contratantes(id) ON DELETE CASCADE,
    FOREIGN KEY (pedreiro_id) REFERENCES pedreiros(id) ON DELETE SET NULL,
    FOREIGN KEY (servico_id) REFERENCES servicos_postados(id) ON DELETE CASCADE
);

-- Criação da Tabela password_resets
CREATE TABLE password_resets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    verification_code VARCHAR(255) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME NOT NULL,
    status ENUM('pending', 'used', 'expired') DEFAULT 'pending'
);

-- Ativar o agendador de eventos
SET GLOBAL event_scheduler = ON;

-- Criação de Evento para Remover Cadastros Inativos
DELIMITER //
CREATE EVENT IF NOT EXISTS remover_cadastros_inativos
ON SCHEDULE EVERY 1 MINUTE
DO
BEGIN
    DELETE FROM contratantes WHERE ativo = 0 AND TIMESTAMPDIFF(MINUTE, data_criacao, NOW()) >= 2;
    DELETE FROM pedreiros WHERE ativo = 0 AND TIMESTAMPDIFF(MINUTE, data_criacao, NOW()) >= 2;
END //
DELIMITER ;

-- Inserção de dados na tabela tipo_servicos
INSERT INTO tipo_servicos (nome_servico, desc_servico, img_servico) VALUES
('Pintura', 'Serviço de pintura de paredes e superfícies', 'icon_pintura.png'),
('Reforma', 'Reformas e ajustes estruturais em imóveis', 'icon_reforma.png'),
('Elétrica', 'Instalação e manutenção de sistemas elétricos', 'icon_eletrica.png'),
('Hidráulica', 'Serviços de encanamento e reparos hidráulicos', 'icon_hidraulica.png'),
('Alvenaria', 'Construção e reparo com tijolos e concreto', 'icon_alvenaria.png'),
('Jardinagem', 'Serviços de jardinagem e paisagismo', 'icon_jardinagem.png'),
('Marcenaria', 'Serviços de construção e reparos em madeira', 'icon_marcenaria.png'),
('Gesso', 'Instalação de forros e acabamentos de gesso', 'icon_gesso.png'),
('Telhado', 'Instalação e reparo de telhados e coberturas', 'icon_telhado.png'),
('Instalações de Ar-Condicionado', 'Instalação e manutenção de ar-condicionado', 'icon_ar_condicionado.png'),
('Pisos e Revestimentos', 'Instalação e reparos de pisos e revestimentos', 'icon_pisos.png'),
('Limpeza Pós-Obra', 'Serviços de limpeza e remoção de resíduos após obras', 'icon_limpeza_obra.png'),
('Vidraçaria', 'Instalação e reparo de vidros e janelas', 'icon_vidraca.png'),
('Impermeabilização', 'Serviços de impermeabilização de superfícies', 'icon_impermeabilizacao.png'),
('Serralheria', 'Serviços de fabricação e reparo de estruturas metálicas', 'icon_serralheria.png'),
('Dedetização', 'Serviços de controle de pragas e dedetização', 'icon_dedetizacao.png'),
('Solda', 'Serviços de soldagem e reparos metálicos', 'icon_solda.png'),
('CFTV e Segurança', 'Instalação de câmeras de segurança e sistemas de vigilância', 'icon_cftv.png'),
('Encanamento de Gás', 'Instalação e manutenção de sistemas de gás', 'icon_encanamento_gas.png'),
('Construção de Piscinas', 'Construção e manutenção de piscinas', 'icon_piscinas.png'),
('Instalações de Energia Solar', 'Instalação de painéis solares e sistemas de energia solar', 'icon_energia_solar.png');

-- Inserção de dados na tabela contratantes
INSERT INTO contratantes (nome, cpf, email, senha, cep, ativo) VALUES
('Ana Souza', '123.456.789-00', 'ana.souza@email.com', 'senha123', '12345-678', 0),
('Pedro Lima', '987.654.321-00', 'pedro.lima@email.com', 'senha456', '87654-321', 1),
('Maria Ferreira', '111.222.333-44', 'maria.ferreira@email.com', 'senha789', '54321-678', 1),
('Lucas Martins', '444.555.666-77', 'lucas.martins@email.com', 'senha012', '98765-432', 1),
('Juliana Santos', '888.999.000-11', 'juliana.santos@email.com', 'senha345', '67890-123', 0);

-- Inserção de dados na tabela pedreiros
INSERT INTO pedreiros (nome, cep, email, senha, premium, tipo_servico_1, tipo_servico_2, cpf, ativo) VALUES
('Carlos Silva', '12345-678', 'carlos.silva@email.com', 'senha789', 1, 1, 2, '000.111.222-33', 0),
('Maria Oliveira', '87654-321', 'maria.oliveira@email.com', 'senha012', 0, 3, 4, '222.333.444-55', 0),
('Fernando Costa', '13579-246', 'fernando.costa@email.com', 'senha123', 1, 1, 5, '444.555.666-77', 1),
('Tatiane Almeida', '97531-864', 'tatiane.almeida@email.com', 'senha456', 1, 6, 7, '777.888.999-00', 1);
