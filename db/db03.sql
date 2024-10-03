CREATE DATABASE IF NOT EXISTS Em_Obra;
 
USE Em_Obra;
 
CREATE TABLE tipo_servicos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome_servico VARCHAR(100) NOT NULL,
    desc_servico VARCHAR(100) NOT NULL,
    img_servico VARCHAR(100)
);

 
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
 
CREATE TABLE parceiros (
    id INT AUTO_INCREMENT PRIMARY KEY,
    descricao VARCHAR(255) NOT NULL,
    imagem VARCHAR(255),
    contato VARCHAR(50),
    endereco VARCHAR(255),
    tipo_parceiro VARCHAR(20),
    url VARCHAR(255)
);
 
CREATE TABLE servicos_postados (
    id INT AUTO_INCREMENT PRIMARY KEY,
    descricao TEXT NOT NULL,
    contratante_id INT NOT NULL,
    pedreiro_id INT,
    tipo_servico INT,
    data_inicio DATE,
    data_fim DATE,
    prazo_combinar VARCHAR(10),
    valor VARCHAR (20),
    status ENUM('andamento', 'finalizado', 'cancelado') DEFAULT 'andamento',
    data_postagem TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (contratante_id) REFERENCES contratantes(id) ON DELETE CASCADE,
    FOREIGN KEY (pedreiro_id) REFERENCES pedreiros(id) ON DELETE SET NULL,
    FOREIGN KEY (tipo_servico) REFERENCES tipo_servicos(id) ON DELETE SET NULL
);
 
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

CREATE TABLE password_resets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    verification_code VARCHAR(255) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME NOT NULL,
    status ENUM('pending', 'used', 'expired') DEFAULT 'pending'
);

 
SET GLOBAL event_scheduler = ON;
--------
show events;
--------
DELIMITER //
CREATE EVENT IF NOT EXISTS remover_cadastros_inativos
ON SCHEDULE EVERY 1 MINUTE
DO
BEGIN
 
  DELETE FROM contratantes
  WHERE ativo = 0
  AND TIMESTAMPDIFF(MINUTE, data_criacao, NOW()) >= 2;
 
  DELETE FROM pedreiros
  WHERE ativo = 0
  AND TIMESTAMPDIFF(MINUTE, data_criacao, NOW()) >= 2;
END //
 
DELIMITER ;

-- Inserir dados na tabela tipo_servicos
INSERT INTO tipo_servicos (nome_servico, desc_servico, img_servico) VALUES
('Pintura', 'Serviço de pintura de paredes e superfícies', 'icon_pintura.png'),
('Reforma', 'Reformas e ajustes estruturais em imóveis', 'icon_reforma.png'),
('Elétrica', 'Instalação e manutenção de sistemas elétricos', 'icon_eletrica.png'),
('Hidráulica', 'Serviços de encanamento e reparos hidráulicos', 'icon_hidraulica.png'),
('Alvenaria', 'Construção e reparo com tijolos e concreto', 'alvenaria.png');
 
-- Inserir dados na tabela contratantes
INSERT INTO contratantes (nome, cpf, email, senha, cep, ativo) VALUES
('Ana Souza', '123.456.789-00', 'ana.souza@email.com', 'senha123', '12345-678',0),
('Pedro Lima', '987.654.321-00', 'pedro.lima@email.com', 'senha456', '87654-321',1),
('Maria Ferreira', '111.222.333-44', 'maria.ferreira@email.com', 'senha789', '54321-678',1),
('Lucas Martins', '444.555.666-77', 'lucas.martins@email.com', 'senha012', '98765-432',1),
('Juliana Santos', '888.999.000-11', 'juliana.santos@email.com', 'senha345', '67890-123',0);
 
-- Inserir dados na tabela pedreiros
INSERT INTO pedreiros (nome, cep, email, senha, premium, tipo_servico_1, tipo_servico_2, tipo_servico_3, tipo_servico_4, tipo_servico_5, cpf, ativo) VALUES
('Carlos Silva', '12345-678', 'carlos.silva@email.com', 'senha789', 1, 1, 2, NULL, NULL, NULL, '000.111.222-33',0),  -- Pintura, Reforma
('Maria Oliveira', '87654-321', 'maria.oliveira@email.com', 'senha012', 0, 3, 4, NULL, NULL, NULL, '222.333.444-55',0),  -- Elétrica, Hidráulica
('Fernando Costa', '13579-246', 'fernando.costa@email.com', 'senha123', 1, 1, 5, NULL, NULL, NULL, '444.555.666-77',1),  -- Pintura, Alvenaria
('Tatiane Almeida', '24680-135', 'tatiane.almeida@email.com', 'senha456', 0, 2, 3, 5, NULL, NULL, '666.777.888-99',1),  -- Reforma, Elétrica, Alvenaria
('Bruno Pereira', '54321-678', 'bruno.pereira@email.com', 'senha789', 1, 4, NULL, NULL, NULL, NULL, '888.999.000-11',1);  -- Hidráulica
 
-- Inserir dados na tabela parceiros
INSERT INTO parceiros (descricao, imagem, contato, endereco, url) VALUES
('Loja de Materiais de Construção', 'imagem1.jpg', '1234-5678', 'Rua A, 123', 'http://materiais.com'),
('Serviços de Engenharia', 'imagem2.jpg', '2345-6789', 'Rua B, 456', 'http://engenharia.com'),
('Construtora ABC', 'imagem3.jpg', '3456-7890', 'Rua C, 789', 'http://construtoraabc.com'),
('Reformas e Construções', 'imagem4.jpg', '4567-8901', 'Rua D, 101', 'http://reformas.com'),
('Consultoria de Obras', 'imagem5.jpg', '5678-9012', 'Rua E, 202', 'http://consultoria.com');
 
-- Inserir dados na tabela servicos_postados
INSERT INTO servicos_postados (descricao, contratante_id, pedreiro_id, tipo_servico, status) VALUES
('Pintura de sala', 1, NULL, 1, 'andamento'),
('Reforma de cozinha', 2, NULL, 2, 'aguardando'),
('Instalação elétrica', 3, NULL, 3, 'andamento'),
('Hidráulica em banheiro', 4, NULL, 4, 'aguardando'),
('Construção de muro', 5, NULL, 5, 'andamento');
 
-- Inserir dados na tabela historico_servicos
INSERT INTO historico_servicos (servico_id, contratante_id, pedreiro_id, tipo_servico, data_inicio, data_fim, status) VALUES
(1, 1, 1, 'Pintura', '2024-09-01', '2024-09-05', 'finalizado'),
(2, 2, 2, 'Reforma', '2024-09-10', NULL, 'andamento'),
(3, 3, 3, 'Elétrica', '2024-09-15', '2024-09-20', 'finalizado'),
(4, 4, 4, 'Hidráulica', '2024-09-18', NULL, 'andamento'),
(5, 5, 5, 'Alvenaria', '2024-09-20', NULL, 'andamento');
 
-----------
 
-- Consulta
SELECT
    p.id AS pedreiro_id,
    p.nome AS pedreiro_nome,
    ts1.nome_servico AS tipo_servico_1,
    ts2.nome_servico AS tipo_servico_2,
    ts3.nome_servico AS tipo_servico_3,
    ts4.nome_servico AS tipo_servico_4,
    ts5.nome_servico AS tipo_servico_5
FROM
    pedreiros p
LEFT JOIN tipo_servicos ts1 ON p.tipo_servico_1 = ts1.id
LEFT JOIN tipo_servicos ts2 ON p.tipo_servico_2 = ts2.id
LEFT JOIN tipo_servicos ts3 ON p.tipo_servico_3 = ts3.id
LEFT JOIN tipo_servicos ts4 ON p.tipo_servico_4 = ts4.id
LEFT JOIN tipo_servicos ts5 ON p.tipo_servico_5 = ts5.id;
 


 
